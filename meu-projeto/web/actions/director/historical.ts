'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export interface DayKpi {
  date: string
  totalOrders: number
  totalRevenue: number
  lateOrders: number
  breakageRate: number
}

export async function getHistoricalKpis(
  unitIds: string[],
  days: number,
): Promise<DayKpi[]> {
  if (unitIds.length === 0) return []

  const supabase = createAdminClient()
  const since = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString().split('T')[0]

  const [{ data: orders }, { data: receivables }] = await Promise.all([
    supabase
      .from('orders')
      .select('created_at, status, due_date')
      .in('unit_id', unitIds)
      .gte('created_at', since),
    supabase
      .from('receivables')
      .select('amount, created_at, status')
      .in('unit_id', unitIds)
      .eq('status', 'paid')
      .gte('created_at', since),
  ])

  // Agrupa por dia
  const byDay: Record<string, { orders: typeof orders; revenue: number }> = {}

  for (const order of orders ?? []) {
    const day = order.created_at.split('T')[0]
    if (!byDay[day]) byDay[day] = { orders: [], revenue: 0 }
    byDay[day].orders!.push(order)
  }

  for (const rec of receivables ?? []) {
    const day = rec.created_at.split('T')[0]
    if (!byDay[day]) byDay[day] = { orders: [], revenue: 0 }
    byDay[day].revenue += Number(rec.amount)
  }

  const now = new Date().toISOString()

  return Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, { orders: dayOrders, revenue }]) => {
      const total = dayOrders?.length ?? 0
      const late = (dayOrders ?? []).filter(
        (o) => o.status !== 'completed' && o.due_date && o.due_date < now,
      ).length
      return {
        date,
        totalOrders: total,
        totalRevenue: revenue,
        lateOrders: late,
        breakageRate: total > 0 ? Math.round((late / total) * 100) : 0,
      }
    })
}
