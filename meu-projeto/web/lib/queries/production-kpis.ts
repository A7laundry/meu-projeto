import { createAdminClient } from '@/lib/supabase/admin'
import type { OrderStatus } from '@/types/order'

export interface SectorKpi {
  sector: string
  events_count: number
  pieces: number
}

export interface QueueStatus {
  status: OrderStatus
  count: number
}

export interface DailyVolume {
  total_orders: number
  total_items: number
  completed_orders: number
}

export interface ProductionKpis {
  dailyVolume: DailyVolume
  queueByStatus: QueueStatus[]
  piecesPerSectorLastHour: SectorKpi[]
  onTimeVsLate: { on_time: number; late: number }
  avgCycleTimeMinutes: number | null
  trend: { ordersChange: number; itemsChange: number } | null
}

export async function getProductionKpis(unitId: string, dateFrom?: string): Promise<ProductionKpis> {
  const supabase = createAdminClient()

  const today = dateFrom ?? new Date().toISOString().split('T')[0]

  const [dailyRes, queueRes, sectorHourRes] = await Promise.all([
    // Volume do dia
    supabase
      .from('orders')
      .select('id, status, promised_at, created_at, items:order_items(quantity)')
      .eq('unit_id', unitId)
      .gte('created_at', `${today}T00:00:00`),

    // Fila atual por status
    supabase
      .from('orders')
      .select('status')
      .eq('unit_id', unitId)
      .not('status', 'in', '(delivered)'),

    // Eventos da última hora (peças por setor)
    supabase
      .from('order_events')
      .select('sector, quantity_processed')
      .eq('unit_id', unitId)
      .eq('event_type', 'exit')
      .gte('occurred_at', new Date(Date.now() - 3600_000).toISOString()),
  ])

  const orders = dailyRes.data ?? []
  const totalItems = orders.reduce(
    (sum, o) => sum + (o.items?.reduce((s: number, i: { quantity: number }) => s + i.quantity, 0) ?? 0),
    0
  )
  const completedOrders = orders.filter(
    (o) => o.status === 'shipped' || o.status === 'delivered'
  ).length
  const now = Date.now()
  const lateOrders = orders.filter(
    (o) => new Date(o.promised_at).getTime() < now && !['shipped', 'delivered'].includes(o.status)
  ).length

  // Fila agrupada por status
  const statusMap: Record<string, number> = {}
  for (const row of queueRes.data ?? []) {
    statusMap[row.status] = (statusMap[row.status] ?? 0) + 1
  }
  const queueByStatus: QueueStatus[] = Object.entries(statusMap).map(([status, count]) => ({
    status: status as OrderStatus,
    count,
  }))

  // Peças por setor na última hora
  const sectorMap: Record<string, { events: number; pieces: number }> = {}
  for (const row of sectorHourRes.data ?? []) {
    const s = sectorMap[row.sector] ?? { events: 0, pieces: 0 }
    s.events++
    s.pieces += row.quantity_processed ?? 0
    sectorMap[row.sector] = s
  }
  const piecesPerSectorLastHour: SectorKpi[] = Object.entries(sectorMap).map(([sector, v]) => ({
    sector,
    events_count: v.events,
    pieces: v.pieces,
  }))

  // Tempo médio de ciclo: média do tempo entre created_at e último evento 'exit'
  const completedIds = orders
    .filter((o) => ['shipped', 'delivered', 'ready'].includes(o.status))
    .map((o) => o.id)

  let avgCycleTimeMinutes: number | null = null
  if (completedIds.length > 0) {
    const { data: events } = await supabase
      .from('order_events')
      .select('order_id, occurred_at')
      .in('order_id', completedIds)
      .eq('event_type', 'exit')
      .order('occurred_at', { ascending: false })

    if (events && events.length > 0) {
      const orderCreatedMap = new Map<string, number>()
      for (const o of orders) {
        if (completedIds.includes(o.id)) {
          orderCreatedMap.set(o.id, new Date((o as unknown as { created_at: string }).created_at).getTime())
        }
      }

      const latestExitByOrder = new Map<string, number>()
      for (const e of events) {
        if (!latestExitByOrder.has(e.order_id)) {
          latestExitByOrder.set(e.order_id, new Date(e.occurred_at).getTime())
        }
      }

      let totalMinutes = 0
      let count = 0
      for (const [orderId, exitTime] of latestExitByOrder) {
        const createdTime = orderCreatedMap.get(orderId)
        if (createdTime) {
          totalMinutes += (exitTime - createdTime) / 60000
          count++
        }
      }
      if (count > 0) avgCycleTimeMinutes = Math.round(totalMinutes / count)
    }
  }

  // Tendência: comparar com dia anterior
  let trend: { ordersChange: number; itemsChange: number } | null = null
  const yesterday = new Date(new Date(today).getTime() - 86400_000).toISOString().split('T')[0]
  const { data: yesterdayOrders } = await supabase
    .from('orders')
    .select('id, items:order_items(quantity)')
    .eq('unit_id', unitId)
    .gte('created_at', `${yesterday}T00:00:00`)
    .lt('created_at', `${today}T00:00:00`)

  if (yesterdayOrders && yesterdayOrders.length > 0) {
    const yItems = yesterdayOrders.reduce(
      (sum, o) => sum + (o.items?.reduce((s: number, i: { quantity: number }) => s + i.quantity, 0) ?? 0),
      0
    )
    const ordersChange = yesterdayOrders.length > 0
      ? Math.round(((orders.length - yesterdayOrders.length) / yesterdayOrders.length) * 100)
      : 0
    const itemsChange = yItems > 0
      ? Math.round(((totalItems - yItems) / yItems) * 100)
      : 0
    trend = { ordersChange, itemsChange }
  }

  return {
    dailyVolume: {
      total_orders: orders.length,
      total_items: totalItems,
      completed_orders: completedOrders,
    },
    queueByStatus,
    piecesPerSectorLastHour,
    onTimeVsLate: {
      on_time: orders.length - lateOrders,
      late: lateOrders,
    },
    avgCycleTimeMinutes,
    trend,
  }
}
