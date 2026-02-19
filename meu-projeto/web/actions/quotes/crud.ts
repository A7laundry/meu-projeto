'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Quote, QuoteItem, QuoteStatus } from '@/types/pricing'

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

const quoteItemSchema = z.object({
  piece_type: z.string().min(1),
  quantity: z.coerce.number().int().min(1),
  unit_price: z.coerce.number().min(0),
})

export async function listQuotes(unitId: string): Promise<Quote[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('quotes')
    .select(`
      *,
      client:clients(id, name),
      items:quote_items(*)
    `)
    .eq('unit_id', unitId)
    .order('created_at', { ascending: false })

  return (data ?? []).map((q) => ({
    ...q,
    client_name: q.client?.name ?? null,
    items: (q.items ?? []) as QuoteItem[],
  })) as Quote[]
}

export async function createQuote(
  unitId: string,
  formData: FormData,
): Promise<ActionResult<Quote>> {
  const clientId = formData.get('client_id') as string
  const notes = formData.get('notes') as string

  if (!clientId) return { success: false, error: 'Selecione um cliente' }

  // Parsear itens (vêm como JSON)
  let items: Array<{ piece_type: string; quantity: number; unit_price: number }> = []
  try {
    items = JSON.parse(formData.get('items') as string)
  } catch {
    return { success: false, error: 'Itens inválidos' }
  }

  if (items.length === 0) {
    return { success: false, error: 'Adicione ao menos um item ao orçamento' }
  }

  const parsedItems = items.map((item) => quoteItemSchema.safeParse(item))
  const invalid = parsedItems.find((r) => !r.success)
  if (invalid && !invalid.success) {
    return { success: false, error: invalid.error.issues[0].message }
  }

  const validItems = parsedItems.map((r) => (r.success ? r.data : null)).filter(Boolean) as Array<{
    piece_type: string
    quantity: number
    unit_price: number
  }>

  const total = validItems.reduce((sum, i) => sum + i.quantity * i.unit_price, 0)

  const supabase = createAdminClient()
  const { data: quote, error: quoteErr } = await supabase
    .from('quotes')
    .insert({ unit_id: unitId, client_id: clientId, notes: notes || null, total })
    .select()
    .single()

  if (quoteErr) return { success: false, error: quoteErr.message }

  const itemRows = validItems.map((i) => ({
    quote_id: quote.id,
    piece_type: i.piece_type,
    quantity: i.quantity,
    unit_price: i.unit_price,
  }))

  const { error: itemsErr } = await supabase.from('quote_items').insert(itemRows)
  if (itemsErr) return { success: false, error: itemsErr.message }

  revalidatePath(`/unit/${unitId}/quotes`)
  return { success: true, data: quote as Quote }
}

export async function updateQuoteStatus(
  id: string,
  unitId: string,
  status: QuoteStatus,
): Promise<ActionResult<{ orderId?: string }>> {
  const supabase = createAdminClient()

  if (status === 'approved') {
    // Busca o orçamento com itens e cliente
    const { data: quote } = await supabase
      .from('quotes')
      .select(`*, items:quote_items(*), client:clients(name)`)
      .eq('id', id)
      .single()

    if (!quote) return { success: false, error: 'Orçamento não encontrado' }

    // Cria comanda a partir do primeiro item (simplificado para Wave 2)
    const firstItem = (quote.items ?? [])[0]
    if (firstItem) {
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert({
          unit_id: unitId,
          client_name: quote.client?.name ?? 'Cliente',
          piece_type: firstItem.piece_type,
          piece_count: firstItem.quantity,
          status: 'received',
          notes: `Gerado do orçamento #${id.slice(0, 8)}`,
        })
        .select('id')
        .single()

      if (!orderErr && order) {
        await supabase.from('quotes').update({ status, order_id: order.id }).eq('id', id)
        revalidatePath(`/unit/${unitId}/quotes`)
        return { success: true, data: { orderId: order.id } }
      }
    }
  }

  const { error } = await supabase.from('quotes').update({ status }).eq('id', id).eq('unit_id', unitId)
  if (error) return { success: false, error: error.message }

  revalidatePath(`/unit/${unitId}/quotes`)
  return { success: true, data: {} }
}
