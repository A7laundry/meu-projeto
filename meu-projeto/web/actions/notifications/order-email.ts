'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email'
import { orderStatusEmail } from '@/lib/email-templates'
import { dispatchNpsAfterDelivery } from '@/actions/notifications/nps-dispatch'

const NOTIFY_STATUSES = ['ready', 'shipped', 'delivered'] as const

/**
 * Envia email de notificação quando o status de uma comanda muda.
 * Apenas para statuses relevantes (ready, shipped, delivered).
 * Após delivered, também envia NPS request.
 */
export async function sendOrderStatusEmail(
  orderId: string,
  unitId: string,
  newStatus: string
): Promise<void> {
  if (!NOTIFY_STATUSES.includes(newStatus as typeof NOTIFY_STATUSES[number])) return
  if (!process.env.RESEND_API_KEY) return

  const supabase = createAdminClient()

  // Buscar dados necessários
  const [orderRes, unitRes] = await Promise.all([
    supabase
      .from('orders')
      .select('order_number, client_id, client_name, items:order_items(quantity)')
      .eq('id', orderId)
      .eq('unit_id', unitId)
      .single(),
    supabase
      .from('units')
      .select('name')
      .eq('id', unitId)
      .single(),
  ])

  if (!orderRes.data) return

  const order = orderRes.data
  const unitName = (unitRes.data as { name: string } | null)?.name ?? 'A7x Lavanderia'
  const totalPieces = (order.items as { quantity: number }[] | null)?.reduce((s, i) => s + i.quantity, 0) ?? 0

  // Buscar email do cliente
  if (!order.client_id) return

  const { data: client } = await supabase
    .from('clients')
    .select('email')
    .eq('id', order.client_id)
    .single()

  const clientEmail = (client as { email?: string | null } | null)?.email
  if (!clientEmail) return

  // Enviar email de status
  const { subject, html } = orderStatusEmail({
    clientName: order.client_name ?? 'Cliente',
    orderNumber: order.order_number,
    newStatus,
    unitName,
    totalPieces,
  })

  await sendEmail({ to: clientEmail, subject, html })

  // Se entregue, despachar NPS via SMS (com fallback email)
  if (newStatus === 'delivered') {
    dispatchNpsAfterDelivery(orderId, unitId).catch((err) =>
      console.error('[nps-dispatch] Falha:', err)
    )
  }
}
