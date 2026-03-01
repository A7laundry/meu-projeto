'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { requireRole } from '@/lib/auth/guards'
import { z } from 'zod'
import type { ActionResult } from '@/lib/auth/action-result'

const serviceRequestSchema = z.object({
  unitId: z.string().uuid(),
  clientId: z.string().uuid(),
  pieceTypes: z.array(z.object({
    piece_type: z.string().min(1),
    quantity: z.number().int().min(1),
  })).min(1, 'Adicione pelo menos um tipo de peça'),
  pickupAddress: z.string().min(5, 'Endereço obrigatório'),
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  notes: z.string().optional(),
})

export type ServiceRequestInput = z.infer<typeof serviceRequestSchema>

/**
 * Cria uma solicitação de serviço pelo portal do cliente.
 * Gera um orçamento (quote) em status 'draft' para o gerente aprovar.
 */
export async function createServiceRequest(input: ServiceRequestInput): Promise<ActionResult<{ quoteId: string }>> {
  try {
    const { user } = await requireRole(['customer'])

    const parsed = serviceRequestSchema.safeParse(input)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }

    const data = parsed.data
    const supabase = createAdminClient()

    // Buscar nome do cliente
    const { data: client } = await supabase
      .from('clients')
      .select('name')
      .eq('id', data.clientId)
      .eq('profile_id', user.id)
      .single()

    if (!client) return { success: false, error: 'Cliente não encontrado' }

    // Buscar preços para estimar valor
    const { data: prices } = await supabase
      .from('price_table')
      .select('piece_type, price')
      .eq('unit_id', data.unitId)
      .eq('active', true)

    const priceMap = new Map<string, number>()
    for (const p of prices ?? []) {
      priceMap.set(p.piece_type, Number(p.price))
    }

    const totalPieces = data.pieceTypes.reduce((s, p) => s + p.quantity, 0)
    const estimatedTotal = data.pieceTypes.reduce(
      (s, p) => s + (priceMap.get(p.piece_type) ?? 0) * p.quantity,
      0
    )

    const itemsSummary = data.pieceTypes
      .map((p) => `${p.quantity}x ${p.piece_type}`)
      .join(', ')

    // Criar quote
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .insert({
        unit_id: data.unitId,
        client_id: data.clientId,
        client_name: client.name,
        status: 'draft',
        total_estimated: estimatedTotal,
        notes: [
          `Solicitação via portal do cliente`,
          `Peças: ${itemsSummary} (${totalPieces} total)`,
          `Coleta: ${data.preferredDate}`,
          `Endereço: ${data.pickupAddress}`,
          data.notes ? `Obs: ${data.notes}` : '',
        ].filter(Boolean).join('\n'),
      })
      .select('id')
      .single()

    if (quoteError) {
      return { success: false, error: `Erro ao criar solicitação: ${quoteError.message}` }
    }

    return { success: true, data: { quoteId: quote.id } }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Erro desconhecido' }
  }
}
