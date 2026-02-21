'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export interface DailyTrend {
  date: string   // 'dd/MM'
  orders: number
}

export async function getWeeklyTrend(unitIds: string[]): Promise<DailyTrend[]> {
  if (unitIds.length === 0) return []

  const supabase = createAdminClient()

  const since = new Date()
  since.setDate(since.getDate() - 6)
  since.setHours(0, 0, 0, 0)

  const { data } = await supabase
    .from('orders')
    .select('created_at')
    .in('unit_id', unitIds)
    .gte('created_at', since.toISOString())

  const byDay: Record<string, number> = {}
  for (const row of data ?? []) {
    const day = (row.created_at as string).split('T')[0]
    byDay[day] = (byDay[day] ?? 0) + 1
  }

  const result: DailyTrend[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    result.push({
      date: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      orders: byDay[key] ?? 0,
    })
  }

  return result
}
