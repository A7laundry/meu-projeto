'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { sendSms } from '@/lib/sms'
import { sendEmail } from '@/lib/email'
import { npsRequestEmail } from '@/lib/email-templates'

/**
 * Despacha NPS automaticamente após entrega.
 * Tenta SMS primeiro, fallback para email.
 * Chamado como fire-and-forget.
 */
export async function dispatchNpsAfterDelivery(
  orderId: string,
  unitId: string
): Promise<void> {
  const supabase = createAdminClient()

  // Buscar dados
  const { data: order } = await supabase
    .from('orders')
    .select('order_number, client_id, client_name')
    .eq('id', orderId)
    .eq('unit_id', unitId)
    .single()

  if (!order?.client_id) return

  const { data: client } = await supabase
    .from('clients')
    .select('name, phone, email')
    .eq('id', order.client_id)
    .single()

  if (!client) return

  const { data: unit } = await supabase
    .from('units')
    .select('name')
    .eq('id', unitId)
    .single()

  const unitName = (unit as { name: string } | null)?.name ?? 'A7x Lavanderia'

  // Criar NPS survey
  const { data: survey } = await supabase
    .from('nps_surveys')
    .insert({ unit_id: unitId, client_id: order.client_id })
    .select('id')
    .single()

  if (!survey) return

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://a7-lavanderia-app.vercel.app'
  const npsUrl = `${baseUrl}/nps/${survey.id}`
  const clientName = (client as { name: string }).name ?? order.client_name ?? 'Cliente'

  // Tentar SMS primeiro
  const phone = (client as { phone?: string | null }).phone
  if (phone) {
    const message =
      `Ola ${clientName}! Como foi sua experiencia com a ${unitName}? ` +
      `Avalie em 30 segundos: ${npsUrl}`

    const smsResult = await sendSms(phone, message)
    if (smsResult.success) return // SMS enviado, não precisa de email
  }

  // Fallback para email
  const email = (client as { email?: string | null }).email
  if (email) {
    const npsEmail = npsRequestEmail({
      clientName,
      orderNumber: order.order_number,
      npsUrl,
      unitName,
    })
    await sendEmail({ to: email, subject: npsEmail.subject, html: npsEmail.html })
  }
}
