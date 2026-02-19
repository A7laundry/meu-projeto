'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export interface AdvancedKpis {
  costPerKg: number | null
  piecesPerHourByUnit: PiecesPerHour[]
  deliveryBreakageRate: number
  chemicalPerOrder: number | null
}

export interface PiecesPerHour {
  unitId: string
  piecesPerHour: number | null
  totalItems: number
}

// FR-E7-03: Custo por kg = total pago no mês / total itens processados no mês
export async function getNetworkCostPerKg(unitIds: string[]): Promise<number | null> {
  if (unitIds.length === 0) return null

  const supabase = createAdminClient()
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [{ data: payables }, { data: orderItems }] = await Promise.all([
    supabase
      .from('payables')
      .select('amount')
      .in('unit_id', unitIds)
      .eq('status', 'paid')
      .gte('paid_at', monthStart),
    supabase
      .from('order_items')
      .select('quantity')
      .in('order_id', await getOrderIdsThisMonth(unitIds, monthStart)),
  ])

  const totalCost = (payables ?? []).reduce((s, p) => s + Number(p.amount), 0)
  const totalItems = (orderItems ?? []).reduce((s, i) => s + Number(i.quantity), 0)

  if (totalItems === 0) return null
  return totalCost / totalItems
}

async function getOrderIdsThisMonth(unitIds: string[], monthStart: string): Promise<string[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('orders')
    .select('id')
    .in('unit_id', unitIds)
    .gte('created_at', monthStart)
  return (data ?? []).map((o) => o.id)
}

// FR-E7-04: Peças/hora por unidade (setor_records: total_items / horas hoje)
export async function getNetworkPiecesPerHour(unitIds: string[]): Promise<PiecesPerHour[]> {
  if (unitIds.length === 0) return []

  const supabase = createAdminClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: records } = await supabase
    .from('sector_records')
    .select('unit_id, total_items, created_at')
    .in('unit_id', unitIds)
    .gte('created_at', today)

  return unitIds.map((unitId) => {
    const unitRecords = (records ?? []).filter((r) => r.unit_id === unitId)
    const totalItems = unitRecords.reduce((s, r) => s + Number(r.total_items ?? 0), 0)

    if (unitRecords.length < 2) {
      return { unitId, piecesPerHour: null, totalItems }
    }

    const times = unitRecords
      .map((r) => new Date(r.created_at).getTime())
      .sort((a, b) => a - b)
    const spanHours = (times[times.length - 1] - times[0]) / 3600000

    if (spanHours < 0.1) return { unitId, piecesPerHour: null, totalItems }
    return { unitId, piecesPerHour: Math.round(totalItems / spanHours), totalItems }
  })
}

// FR-E7-05: Taxa de ruptura = comandas atrasadas hoje / total comandas hoje
export async function getNetworkDeliveryBreakage(unitIds: string[]): Promise<number> {
  if (unitIds.length === 0) return 0

  const supabase = createAdminClient()
  const today = new Date().toISOString().split('T')[0]
  const now = new Date().toISOString()

  const [{ data: total }, { data: late }] = await Promise.all([
    supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .in('unit_id', unitIds)
      .gte('created_at', today),
    supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .in('unit_id', unitIds)
      .gte('created_at', today)
      .not('status', 'eq', 'completed')
      .lt('due_date', now),
  ])

  const totalCount = (total as unknown as { count: number } | null)?.count ?? 0
  const lateCount = (late as unknown as { count: number } | null)?.count ?? 0

  if (totalCount === 0) return 0
  return Math.round((lateCount / totalCount) * 100)
}

// FR-E7-08: Consumo de insumo por lavagem = total movimentos (saídas) / ordens hoje
export async function getNetworkChemicalPerOrder(unitIds: string[]): Promise<number | null> {
  if (unitIds.length === 0) return null

  const supabase = createAdminClient()
  const today = new Date().toISOString().split('T')[0]

  const [{ data: movements }, { data: orders }] = await Promise.all([
    supabase
      .from('chemical_movements')
      .select('quantity')
      .in('unit_id', unitIds)
      .eq('type', 'out')
      .gte('created_at', today),
    supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .in('unit_id', unitIds)
      .gte('created_at', today),
  ])

  const totalOut = (movements ?? []).reduce((s, m) => s + Number(m.quantity), 0)
  const orderCount = (orders as unknown as { count: number } | null)?.count ?? 0

  if (orderCount === 0) return null
  return Math.round((totalOut / orderCount) * 10) / 10
}

// Agrega todos os KPIs avançados em uma chamada
export async function getAdvancedKpis(unitIds: string[]): Promise<AdvancedKpis> {
  const [costPerKg, piecesPerHourByUnit, deliveryBreakageRate, chemicalPerOrder] =
    await Promise.all([
      getNetworkCostPerKg(unitIds),
      getNetworkPiecesPerHour(unitIds),
      getNetworkDeliveryBreakage(unitIds),
      getNetworkChemicalPerOrder(unitIds),
    ])

  return { costPerKg, piecesPerHourByUnit, deliveryBreakageRate, chemicalPerOrder }
}
