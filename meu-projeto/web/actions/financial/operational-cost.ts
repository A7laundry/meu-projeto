'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { requireUnitAccess } from '@/lib/auth/guards'

export interface OperationalCostReport {
  period: string
  totalRevenue: number
  chemicalCost: number
  laborCost: number
  overheadCost: number
  totalCost: number
  netMargin: number
  marginPercent: number
  marginByPieceType: {
    pieceType: string
    revenue: number
    cost: number
    margin: number
    marginPercent: number
    quantity: number
  }[]
  marginByClient: {
    clientName: string
    revenue: number
    orderCount: number
    margin: number
    marginPercent: number
  }[]
}

export async function getOperationalCostReport(
  unitId: string,
  days: number = 30
): Promise<OperationalCostReport> {
  await requireUnitAccess(unitId, ['unit_manager', 'director'])

  const supabase = createAdminClient()
  const since = new Date(Date.now() - days * 86400_000).toISOString()
  const period = `Últimos ${days} dias`

  // Buscar dados em paralelo
  const [unitRes, receivablesRes, payablesRes, ordersRes] = await Promise.all([
    supabase.from('units').select('labor_cost_monthly, overhead_monthly').eq('id', unitId).single(),
    supabase
      .from('financial_receivables')
      .select('amount, paid_amount')
      .eq('unit_id', unitId)
      .gte('created_at', since),
    supabase
      .from('financial_payables')
      .select('amount')
      .eq('unit_id', unitId)
      .eq('category', 'supplies')
      .gte('created_at', since),
    supabase
      .from('orders')
      .select(`
        id, client_name, client_id,
        items:order_items(piece_type, quantity, unit_price)
      `)
      .eq('unit_id', unitId)
      .gte('created_at', since),
  ])

  const unitData = unitRes.data as { labor_cost_monthly: number; overhead_monthly: number } | null
  const monthFraction = days / 30

  // Custos
  const chemicalCost = (payablesRes.data ?? []).reduce((s, p) => s + Number(p.amount ?? 0), 0)
  const laborCost = Number(unitData?.labor_cost_monthly ?? 0) * monthFraction
  const overheadCost = Number(unitData?.overhead_monthly ?? 0) * monthFraction
  const totalCost = chemicalCost + laborCost + overheadCost

  // Receita
  const totalRevenue = (receivablesRes.data ?? []).reduce(
    (s, r) => s + Number(r.paid_amount ?? r.amount ?? 0), 0
  )

  const netMargin = totalRevenue - totalCost
  const marginPercent = totalRevenue > 0 ? Math.round((netMargin / totalRevenue) * 100) : 0

  // Margem por tipo de peça
  const pieceTypeMap = new Map<string, { revenue: number; quantity: number }>()
  const clientMap = new Map<string, { name: string; revenue: number; orderCount: number }>()

  const orders = ordersRes.data ?? []
  for (const order of orders) {
    const items = (order.items ?? []) as { piece_type: string; quantity: number; unit_price: number }[]
    let orderRevenue = 0

    for (const item of items) {
      const itemRevenue = (item.quantity ?? 0) * (item.unit_price ?? 0)
      orderRevenue += itemRevenue

      const entry = pieceTypeMap.get(item.piece_type) ?? { revenue: 0, quantity: 0 }
      entry.revenue += itemRevenue
      entry.quantity += item.quantity ?? 0
      pieceTypeMap.set(item.piece_type, entry)
    }

    const clientKey = order.client_id ?? order.client_name ?? 'Avulso'
    const clientEntry = clientMap.get(clientKey) ?? {
      name: order.client_name ?? 'Avulso',
      revenue: 0,
      orderCount: 0,
    }
    clientEntry.revenue += orderRevenue
    clientEntry.orderCount += 1
    clientMap.set(clientKey, clientEntry)
  }

  // Distribuir custo proporcionalmente pela receita
  const totalItemRevenue = Array.from(pieceTypeMap.values()).reduce((s, v) => s + v.revenue, 0)

  const marginByPieceType = Array.from(pieceTypeMap.entries())
    .map(([pieceType, { revenue, quantity }]) => {
      const proportionalCost = totalItemRevenue > 0
        ? (revenue / totalItemRevenue) * totalCost
        : 0
      const margin = revenue - proportionalCost
      return {
        pieceType,
        revenue,
        cost: Math.round(proportionalCost * 100) / 100,
        margin: Math.round(margin * 100) / 100,
        marginPercent: revenue > 0 ? Math.round((margin / revenue) * 100) : 0,
        quantity,
      }
    })
    .sort((a, b) => b.revenue - a.revenue)

  const marginByClient = Array.from(clientMap.entries())
    .map(([, { name, revenue, orderCount }]) => {
      const proportionalCost = totalItemRevenue > 0
        ? (revenue / totalItemRevenue) * totalCost
        : 0
      const margin = revenue - proportionalCost
      return {
        clientName: name,
        revenue,
        orderCount,
        margin: Math.round(margin * 100) / 100,
        marginPercent: revenue > 0 ? Math.round((margin / revenue) * 100) : 0,
      }
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 20)

  return {
    period,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    chemicalCost: Math.round(chemicalCost * 100) / 100,
    laborCost: Math.round(laborCost * 100) / 100,
    overheadCost: Math.round(overheadCost * 100) / 100,
    totalCost: Math.round(totalCost * 100) / 100,
    netMargin: Math.round(netMargin * 100) / 100,
    marginPercent,
    marginByPieceType,
    marginByClient,
  }
}
