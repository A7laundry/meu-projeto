'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { requireUnitAccess } from '@/lib/auth/guards'

export interface SectorKpi {
  ordersToday: number
  avgMinutes: number
  slaOnTimePercent: number
  overdueCount: number
}

export async function getSectorKpis(
  unitId: string,
  sector: string
): Promise<SectorKpi> {
  await requireUnitAccess(unitId)

  const admin = createAdminClient()
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  // Events completed today in this sector
  const { data: events } = await admin
    .from('order_events')
    .select('order_id, occurred_at, created_at')
    .eq('unit_id', unitId)
    .eq('sector', sector)
    .eq('event_type', 'exit')
    .gte('created_at', todayStart.toISOString())

  const ordersToday = events?.length ?? 0

  // Calculate avg time per order in this sector (entry to exit)
  let totalMinutes = 0
  let countWithTime = 0

  if (events && events.length > 0) {
    const orderIds = events.map((e) => e.order_id)
    const { data: entryEvents } = await admin
      .from('order_events')
      .select('order_id, created_at')
      .eq('unit_id', unitId)
      .eq('sector', sector)
      .eq('event_type', 'entry')
      .in('order_id', orderIds)

    if (entryEvents) {
      for (const exit of events) {
        const entry = entryEvents.find((e) => e.order_id === exit.order_id)
        if (entry) {
          const diff = new Date(exit.created_at).getTime() - new Date(entry.created_at).getTime()
          totalMinutes += diff / 60000
          countWithTime++
        }
      }
    }
  }

  const avgMinutes = countWithTime > 0 ? Math.round(totalMinutes / countWithTime) : 0

  // SLA: orders in this sector's queue that are on-time vs overdue
  const sectorStatuses: Record<string, string> = {
    sorting: 'received',
    washing: 'sorting',
    drying: 'washing',
    ironing: 'drying',
    shipping: 'ready',
  }
  const queueStatus = sectorStatuses[sector] ?? sector

  const { data: queueOrders } = await admin
    .from('orders')
    .select('id, promised_at')
    .eq('unit_id', unitId)
    .eq('status', queueStatus)

  const now = new Date()
  const overdueCount = queueOrders?.filter((o) => new Date(o.promised_at) < now).length ?? 0
  const totalInQueue = queueOrders?.length ?? 0
  const onTime = totalInQueue > 0 ? totalInQueue - overdueCount : 0
  const slaOnTimePercent = totalInQueue > 0 ? Math.round((onTime / totalInQueue) * 100) : 100

  return {
    ordersToday,
    avgMinutes,
    slaOnTimePercent,
    overdueCount,
  }
}
