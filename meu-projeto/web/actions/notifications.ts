'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getUser } from '@/lib/auth/get-user'

export type NotificationType = 'new_lead' | 'follow_up' | 'ready_order'

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
  const supabase = createAdminClient()
  const user = await getUser()
  if (!user) return []

  const notifications: NotificationItem[] = []
  const isCommercial = ['sdr', 'closer', 'director', 'unit_manager'].includes(user.role)
  const isOperations = ['director', 'unit_manager'].includes(user.role)

  if (isCommercial) {
    // Leads novos nas últimas 24h
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data: newLeads } = await supabase
      .from('leads')
      .select('id, name, source, created_at')
      .gte('created_at', yesterday)
      .order('created_at', { ascending: false })
      .limit(5)

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
    const { data: staleProposals } = await supabase
      .from('leads')
      .select('id, name, updated_at')
      .eq('stage', 'proposal')
      .lte('updated_at', threeDaysAgo)
      .order('updated_at', { ascending: true })
      .limit(5)

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
    const { data: readyOrders } = await supabase
      .from('orders')
      .select('id, order_number, client:clients(name), unit_id, updated_at')
      .eq('status', 'ready')
      .order('updated_at', { ascending: true })
      .limit(5)

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
  }

  return notifications
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 10)
}

export async function getNotificationCount(): Promise<number> {
  const items = await getNotifications()
  return items.length
}
