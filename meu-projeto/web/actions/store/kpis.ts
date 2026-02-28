'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { requireRole } from '@/lib/auth/guards'

export interface StoreKpis {
  ordersToday: number
  revenueToday: number
  clientsServedToday: number
  avgTicketToday: number
  ordersInQueue: number
  ordersReady: number
  ordersThisWeek: number
  revenueThisWeek: number
  dailyGoal: number | null
  goalProgress: number | null
}

export async function getStoreKpis(unitId: string): Promise<StoreKpis> {
  await requireRole(['store', 'unit_manager', 'director'])
  const supabase = createAdminClient()

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()

  // Start of week (Monday)
  const dayOfWeek = now.getDay()
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - mondayOffset)
  const weekStartStr = weekStart.toISOString()

  const IN_QUEUE_STATUSES = ['received', 'sorting', 'washing', 'drying', 'ironing']

  const todayDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

  const [
    todayOrders,
    weekOrders,
    queueOrders,
    readyOrders,
    todayPrices,
    goalResult,
  ] = await Promise.all([
    // Orders today (include unit_price for historical pricing)
    supabase
      .from('orders')
      .select('id, client_id, items:order_items(piece_type, quantity, unit_price)')
      .eq('unit_id', unitId)
      .gte('created_at', todayStart),

    // Orders this week (include unit_price for historical pricing)
    supabase
      .from('orders')
      .select('id, items:order_items(piece_type, quantity, unit_price)')
      .eq('unit_id', unitId)
      .gte('created_at', weekStartStr),

    // In queue
    supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('unit_id', unitId)
      .in('status', IN_QUEUE_STATUSES),

    // Ready
    supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('unit_id', unitId)
      .eq('status', 'ready'),

    // Price table as fallback for legacy items without unit_price
    supabase
      .from('price_table')
      .select('piece_type, price')
      .eq('unit_id', unitId)
      .eq('active', true),

    // Daily goal
    supabase
      .from('store_goals')
      .select('revenue_goal')
      .eq('unit_id', unitId)
      .eq('date', todayDate)
      .single(),
  ])

  // Build price map (fallback for legacy items without unit_price)
  const priceMap = new Map<string, number>()
  for (const p of todayPrices.data ?? []) {
    if (!priceMap.has(p.piece_type)) priceMap.set(p.piece_type, Number(p.price))
  }

  function calculateRevenue(orders: { items: unknown }[] | null) {
    if (!orders) return 0
    return orders.reduce((sum, order) => {
      const items = (order.items as { piece_type: string; quantity: number; unit_price: number | null }[] | null) ?? []
      return sum + items.reduce((s, item) => {
        // Prefer stored unit_price (historical); fallback to current price_table for legacy items
        const price = item.unit_price != null ? Number(item.unit_price) : (priceMap.get(item.piece_type) ?? 0)
        return s + price * item.quantity
      }, 0)
    }, 0)
  }

  const todayData = todayOrders.data ?? []
  const ordersToday = todayData.length
  const revenueToday = calculateRevenue(todayData)
  const clientsServedToday = new Set(todayData.map(o => o.client_id).filter(Boolean)).size
  const avgTicketToday = ordersToday > 0 ? revenueToday / ordersToday : 0

  const weekData = weekOrders.data ?? []
  const ordersThisWeek = weekData.length
  const revenueThisWeek = calculateRevenue(weekData)

  const dailyGoal = goalResult.data?.revenue_goal
    ? Number(goalResult.data.revenue_goal)
    : null
  const goalProgress = dailyGoal ? Math.min((revenueToday / dailyGoal) * 100, 100) : null

  return {
    ordersToday,
    revenueToday,
    clientsServedToday,
    avgTicketToday,
    ordersInQueue: queueOrders.count ?? 0,
    ordersReady: readyOrders.count ?? 0,
    ordersThisWeek,
    revenueThisWeek,
    dailyGoal,
    goalProgress,
  }
}
