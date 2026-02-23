'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import type { ActionResult } from '@/actions/staff/invite'
import type { PieceType } from '@/types/order'

export interface SortingItem {
  itemId: string
  recipeId: string | null
  quantity?: number
}

export interface ExtraItem {
  piece_type: PieceType
  quantity: number
}

export async function completeSorting(
  orderId: string,
  unitId: string,
  items: SortingItem[],
  notes?: string,
  extraItems?: ExtraItem[]
): Promise<ActionResult> {
  const admin = createAdminClient()
  const supabase = createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Atualizar status da comanda
  const { error: orderError } = await admin
    .from('orders')
    .update({ status: 'washing' })
    .eq('id', orderId)
    .eq('unit_id', unitId)

  if (orderError) {
    return { success: false, error: `Erro ao atualizar comanda: ${orderError.message}` }
  }

  // Atualizar receitas e quantidades dos itens existentes
  for (const item of items) {
    const updates: Record<string, unknown> = {}
    if (item.recipeId) updates.recipe_id = item.recipeId
    if (item.quantity !== undefined) updates.quantity = item.quantity

    if (Object.keys(updates).length > 0) {
      await admin
        .from('order_items')
        .update(updates)
        .eq('id', item.itemId)
    }
  }

  // Inserir itens extras
  if (extraItems && extraItems.length > 0) {
    await admin.from('order_items').insert(
      extraItems.map((e) => ({
        order_id: orderId,
        piece_type: e.piece_type,
        piece_type_label: null,
        quantity: e.quantity,
        recipe_id: null,
        notes: null,
      }))
    )
  }

  // Registrar evento
  await admin.from('order_events').insert({
    order_id: orderId,
    unit_id: unitId,
    sector: 'sorting',
    event_type: 'exit',
    operator_id: user?.id ?? null,
    notes: notes || 'Triagem concluída — enviado para Lavagem',
  })

  revalidatePath(`/sector/sorting`)
  return { success: true, data: undefined }
}
