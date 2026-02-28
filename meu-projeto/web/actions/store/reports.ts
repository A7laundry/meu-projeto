'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { requireRole } from '@/lib/auth/guards'

export interface SalesReportRow {
  date: string
  order_number: string
  client_name: string
  pieces: number
  revenue: number
}

export interface SalesReportSummary {
  totalOrders: number
  totalRevenue: number
  avgTicket: number
  rows: SalesReportRow[]
}

export async function getSalesReport(
  unitId: string,
  from: string,
  to: string,
): Promise<SalesReportSummary> {
  await requireRole(['store', 'unit_manager', 'director'])
  const supabase = createAdminClient()

  const [{ data: orders }, { data: prices }] = await Promise.all([
    supabase
      .from('orders')
      .select('id, order_number, client_name, created_at, items:order_items(piece_type, quantity)')
      .eq('unit_id', unitId)
      .gte('created_at', from + 'T00:00:00')
      .lte('created_at', to + 'T23:59:59')
      .order('created_at', { ascending: false }),
    supabase
      .from('price_table')
      .select('piece_type, price')
      .eq('unit_id', unitId)
      .eq('active', true),
  ])

  const priceMap = new Map<string, number>()
  for (const p of prices ?? []) {
    if (!priceMap.has(p.piece_type)) priceMap.set(p.piece_type, Number(p.price))
  }

  const rows: SalesReportRow[] = (orders ?? []).map(order => {
    const items = (order.items as { piece_type: string; quantity: number }[] | null) ?? []
    const pieces = items.reduce((s, i) => s + i.quantity, 0)
    const revenue = items.reduce(
      (s, i) => s + (priceMap.get(i.piece_type) ?? 0) * i.quantity,
      0,
    )
    return {
      date: order.created_at.split('T')[0],
      order_number: order.order_number,
      client_name: order.client_name,
      pieces,
      revenue,
    }
  })

  const totalOrders = rows.length
  const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0)
  const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0

  return { totalOrders, totalRevenue, avgTicket, rows }
}

