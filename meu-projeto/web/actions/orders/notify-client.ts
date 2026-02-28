'use server'

import { requireRole } from '@/lib/auth/guards'
import { createAdminClient } from '@/lib/supabase/admin'
import type { ActionResult } from '@/lib/auth/action-result'

interface NotifyClientResult {
  whatsappUrl: string | null
  clientName: string
  phone: string | null
}

export async function notifyClientOrderReady(
  orderId: string,
  unitId: string
): Promise<ActionResult<NotifyClientResult>> {
  try {
    await requireRole(['operator', 'unit_manager', 'director'])

    const supabase = createAdminClient()

    // Buscar dados da comanda + cliente + unidade
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, order_number, total_pieces, client_id, clients(id, name, phone), units(name)')
      .eq('id', orderId)
      .eq('unit_id', unitId)
      .single()

    if (orderError || !order) {
      return { success: false, error: 'Comanda n\u00e3o encontrada.' }
    }

    const client = order.clients as unknown as { id: string; name: string; phone: string | null } | null
    const unit = order.units as unknown as { name: string } | null

    if (!client) {
      return { success: false, error: 'Comanda sem cliente associado.' }
    }

    // Gerar link de tracking
    const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL || ''}/client/orders`

    // Montar mensagem WhatsApp
    const totalPieces = order.total_pieces ?? ''
    const message = encodeURIComponent(
      `Ol\u00e1 ${client.name}! 🧺\n\n` +
      `Sua comanda #${order.order_number} est\u00e1 *pronta*!\n\n` +
      `📍 ${unit?.name || 'Nossa unidade'}\n` +
      `${totalPieces ? `📦 ${totalPieces} pe\u00e7as\n\n` : '\n'}` +
      `Acompanhe: ${trackingUrl}\n\n` +
      `Aguardamos voc\u00ea! 😊`
    )

    const phone = client.phone?.replace(/\D/g, '') || null
    const whatsappUrl = phone ? `https://wa.me/55${phone}?text=${message}` : null

    // Registrar evento de notificacao
    await supabase.from('order_events').insert({
      order_id: orderId,
      unit_id: unitId,
      sector: 'shipping',
      event_type: 'exit',
      notes: `Notifica\u00e7\u00e3o de comanda pronta ${phone ? 'via WhatsApp' : '(sem telefone)'}`,
    })

    return {
      success: true,
      data: {
        whatsappUrl,
        clientName: client.name,
        phone,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}
