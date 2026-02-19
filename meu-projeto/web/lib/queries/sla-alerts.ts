import { createClient } from '@/lib/supabase/server'
import type { OrderStatus } from '@/types/order'

const SLA_MINUTES: Partial<Record<OrderStatus, number>> = {
  sorting: 60,
  washing: 120,
  drying: 60,
  ironing: 120,
  shipped: 30,
}

export interface SlaAlert {
  orderId: string
  orderNumber: string
  clientName: string
  status: OrderStatus
  lastEventAt: string
  minutesInSector: number
  slaMinutes: number
  excessMinutes: number
}

export async function getSlaAlerts(unitId: string): Promise<SlaAlert[]> {
  const supabase = await createClient()

  const sectors = Object.keys(SLA_MINUTES) as OrderStatus[]

  const { data: orders } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      client_name,
      status,
      created_at,
      events:order_events(occurred_at)
    `)
    .eq('unit_id', unitId)
    .in('status', sectors)
    .order('created_at', { ascending: true })

  if (!orders) return []

  const now = Date.now()
  const alerts: SlaAlert[] = []

  for (const order of orders) {
    const sla = SLA_MINUTES[order.status as OrderStatus]
    if (!sla) continue

    const eventsArr = Array.isArray(order.events) ? order.events : []
    const lastEvent = eventsArr[eventsArr.length - 1] as { occurred_at: string } | undefined
    const since = lastEvent
      ? new Date(lastEvent.occurred_at).getTime()
      : new Date(order.created_at).getTime()

    const minutesInSector = Math.floor((now - since) / 60_000)

    if (minutesInSector > sla) {
      alerts.push({
        orderId: order.id,
        orderNumber: order.order_number,
        clientName: order.client_name,
        status: order.status as OrderStatus,
        lastEventAt: lastEvent?.occurred_at ?? order.created_at,
        minutesInSector,
        slaMinutes: sla,
        excessMinutes: minutesInSector - sla,
      })
    }
  }

  // Ordenar pelo maior excesso primeiro
  return alerts.sort((a, b) => b.excessMinutes - a.excessMinutes)
}
