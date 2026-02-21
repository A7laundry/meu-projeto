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
}

export async function getProductionKpis(unitId: string): Promise<ProductionKpis> {
  const supabase = createAdminClient()

  const today = new Date().toISOString().split('T')[0]

  const [dailyRes, queueRes, sectorHourRes] = await Promise.all([
    // Volume do dia
    supabase
      .from('orders')
      .select('id, status, promised_at, items:order_items(quantity)')
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
  }
}
