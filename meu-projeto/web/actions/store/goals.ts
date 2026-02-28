'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireRole } from '@/lib/auth/guards'
import type { StoreGoal } from '@/types/store-goal'

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function getGoalForDate(
  unitId: string,
  date: string,
): Promise<StoreGoal | null> {
  await requireRole(['store', 'unit_manager', 'director'])
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('store_goals')
    .select('*')
    .eq('unit_id', unitId)
    .eq('date', date)
    .single()

  return data as StoreGoal | null
}

export async function upsertGoal(
  unitId: string,
  date: string,
  revenueGoal: number,
  notes?: string,
): Promise<ActionResult<StoreGoal>> {
  const { user } = await requireRole(['store', 'unit_manager', 'director'])

  if (revenueGoal <= 0) {
    return { success: false, error: 'Meta deve ser maior que zero' }
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('store_goals')
    .upsert(
      {
        unit_id: unitId,
        date,
        revenue_goal: revenueGoal,
        notes: notes || null,
        created_by: user.id,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'unit_id,date' },
    )
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/store/dashboard')
  return { success: true, data: data as StoreGoal }
}

export interface DailyRevenue {
  date: string
  label: string
  revenue: number
}

export async function getWeeklyRevenueTrend(
  unitId: string,
): Promise<DailyRevenue[]> {
  await requireRole(['store', 'unit_manager', 'director'])
  const supabase = createAdminClient()

  const now = new Date()
  const days: DailyRevenue[] = []
  const dayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  // Últimos 7 dias
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
    days.push({
      date: d.toISOString().split('T')[0],
      label: dayLabels[d.getDay()],
      revenue: 0,
    })
  }

  const startDate = days[0].date + 'T00:00:00'

  const [{ data: orders }, { data: prices }] = await Promise.all([
    supabase
      .from('orders')
      .select('created_at, items:order_items(piece_type, quantity)')
      .eq('unit_id', unitId)
      .gte('created_at', startDate),
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

  for (const order of orders ?? []) {
    const orderDate = order.created_at.split('T')[0]
    const day = days.find(d => d.date === orderDate)
    if (!day) continue
    const items = (order.items as { piece_type: string; quantity: number }[] | null) ?? []
    day.revenue += items.reduce(
      (sum, item) => sum + (priceMap.get(item.piece_type) ?? 0) * item.quantity,
      0,
    )
  }

  return days
}
