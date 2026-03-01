'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { requireAuth } from '@/lib/auth/guards'

export type NotificationType = 'new_lead' | 'follow_up' | 'ready_order' | 'sla_alert' | 'maintenance_due'

export interface NotificationItem {
  id: string
  type: NotificationType
  icon: string
  title: string
  description: string
  href: string
  createdAt: string
}

export async function getNotifications(): Promise<NotificationItem[]> {
  const { profile } = await requireAuth()
  const supabase = createAdminClient()

  const notifications: NotificationItem[] = []
  const isCommercial = ['sdr', 'closer', 'director', 'unit_manager'].includes(profile.role)
  const isOperations = ['director', 'unit_manager'].includes(profile.role)
  const isDirector = profile.role === 'director'

  if (isCommercial) {
    // Leads novos nas últimas 24h
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    let leadsQuery = supabase
      .from('leads')
      .select('id, name, source, created_at')
      .gte('created_at', yesterday)
      .order('created_at', { ascending: false })
      .limit(5)

    if (!isDirector && profile.unit_id) {
      leadsQuery = leadsQuery.eq('unit_id', profile.unit_id)
    }

    const { data: newLeads } = await leadsQuery

    for (const lead of newLeads ?? []) {
      notifications.push({
        id: `lead-new-${lead.id}`,
        type: 'new_lead',
        icon: '🎯',
        title: 'Novo lead',
        description: lead.name,
        href: `/commercial/leads/${lead.id}`,
        createdAt: lead.created_at,
      })
    }

    // Propostas sem resposta há 3+ dias
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    let staleQuery = supabase
      .from('leads')
      .select('id, name, updated_at')
      .eq('stage', 'proposal')
      .lte('updated_at', threeDaysAgo)
      .order('updated_at', { ascending: true })
      .limit(5)

    if (!isDirector && profile.unit_id) {
      staleQuery = staleQuery.eq('unit_id', profile.unit_id)
    }

    const { data: staleProposals } = await staleQuery

    for (const lead of staleProposals ?? []) {
      notifications.push({
        id: `lead-follow-${lead.id}`,
        type: 'follow_up',
        icon: '⏰',
        title: 'Follow-up pendente',
        description: lead.name,
        href: `/commercial/leads/${lead.id}`,
        createdAt: lead.updated_at,
      })
    }
  }

  if (isOperations) {
    // Comandas prontas para entrega
    let ordersQuery = supabase
      .from('orders')
      .select('id, order_number, client:clients(name), unit_id, updated_at')
      .eq('status', 'ready')
      .order('updated_at', { ascending: true })
      .limit(5)

    if (!isDirector && profile.unit_id) {
      ordersQuery = ordersQuery.eq('unit_id', profile.unit_id)
    }

    const { data: readyOrders } = await ordersQuery

    for (const order of readyOrders ?? []) {
      const clientName = Array.isArray(order.client)
        ? (order.client[0] as { name: string } | null)?.name
        : (order.client as { name: string } | null)?.name
      notifications.push({
        id: `order-ready-${order.id}`,
        type: 'ready_order',
        icon: '✅',
        title: 'Comanda pronta',
        description: `#${order.order_number}${clientName ? ` · ${clientName}` : ''}`,
        href: `/unit/${order.unit_id}/production/orders`,
        createdAt: order.updated_at,
      })
    }

    // SLA alerts — comandas que excederam o tempo máximo no setor
    const slaStatuses = ['sorting', 'washing', 'drying', 'ironing']
    const slaMinutes: Record<string, number> = { sorting: 60, washing: 120, drying: 60, ironing: 120 }
    const cutoff = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()

    let slaQuery = supabase
      .from('orders')
      .select('id, order_number, client_name, status, unit_id, updated_at')
      .in('status', slaStatuses)
      .lte('updated_at', cutoff)
      .order('updated_at', { ascending: true })
      .limit(5)

    if (!isDirector && profile.unit_id) {
      slaQuery = slaQuery.eq('unit_id', profile.unit_id)
    }

    const { data: slaOrders } = await slaQuery

    for (const order of slaOrders ?? []) {
      const mins = Math.floor((Date.now() - new Date(order.updated_at).getTime()) / 60_000)
      const limit = slaMinutes[order.status] ?? 120
      if (mins > limit) {
        notifications.push({
          id: `sla-${order.id}`,
          type: 'sla_alert',
          icon: '🚨',
          title: 'SLA excedido',
          description: `#${order.order_number} · ${order.client_name} · ${mins}min`,
          href: `/unit/${order.unit_id}/alerts`,
          createdAt: order.updated_at,
        })
      }
    }

    // Maintenance due — equipamentos com manutenção vencida ou próxima
    let maintQuery = supabase
      .from('maintenance_schedules')
      .select('id, equipment:equipment(name, unit_id), next_due_at')
      .lte('next_due_at', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString())
      .eq('status', 'active')
      .order('next_due_at', { ascending: true })
      .limit(5)

    if (!isDirector && profile.unit_id) {
      maintQuery = maintQuery.eq('equipment.unit_id', profile.unit_id)
    }

    const { data: dueSchedules } = await maintQuery

    for (const sched of dueSchedules ?? []) {
      const eq = Array.isArray(sched.equipment)
        ? sched.equipment[0] as { name: string; unit_id: string } | null
        : sched.equipment as { name: string; unit_id: string } | null
      if (!eq) continue
      const isOverdue = new Date(sched.next_due_at) < new Date()
      notifications.push({
        id: `maint-${sched.id}`,
        type: 'maintenance_due',
        icon: isOverdue ? '🔧' : '⚙️',
        title: isOverdue ? 'Manutenção atrasada' : 'Manutenção próxima',
        description: eq.name,
        href: `/unit/${eq.unit_id}/equipment`,
        createdAt: sched.next_due_at,
      })
    }
  }

  return notifications
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 10)
}

export async function getNotificationCount(): Promise<number> {
  const items = await getNotifications()
  return items.length
}
