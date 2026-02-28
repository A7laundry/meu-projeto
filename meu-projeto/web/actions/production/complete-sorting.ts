'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { requireRole } from '@/lib/auth/guards'
import { validateTransition } from '@/lib/auth/order-machine'
import { z } from 'zod'
import type { ActionResult } from '@/lib/auth/action-result'
import type { PieceType, OrderStatus } from '@/types/order'

const sortingItemSchema = z.object({
  itemId: z.string().uuid('ID do item inválido'),
  recipeId: z.string().uuid().nullable(),
  quantity: z.number().int().min(1).optional(),
})

const extraItemSchema = z.object({
  piece_type: z.string().min(1, 'Tipo de peça é obrigatório') as z.ZodType<PieceType>,
  quantity: z.number().int().min(1, 'Quantidade deve ser ao menos 1'),
})

const completeSortingSchema = z.object({
  orderId: z.string().uuid('ID da comanda inválido'),
  unitId: z.string().uuid('ID da unidade inválido'),
  items: z.array(sortingItemSchema).min(1, 'Ao menos um item é obrigatório'),
  notes: z.string().optional(),
  extraItems: z.array(extraItemSchema).optional(),
})

export type SortingItem = z.infer<typeof sortingItemSchema>
export type ExtraItem = z.infer<typeof extraItemSchema>

export async function completeSorting(
  orderId: string,
  unitId: string,
  items: SortingItem[],
  notes?: string,
  extraItems?: ExtraItem[]
): Promise<ActionResult> {
  try {
    const { user } = await requireRole(['operator'])

    const parsed = completeSortingSchema.safeParse({ orderId, unitId, items, notes, extraItems })
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }

    const admin = createAdminClient()

    // Buscar status atual da comanda para validar transição
    const { data: currentOrder, error: fetchError } = await admin
      .from('orders')
      .select('status')
      .eq('id', orderId)
      .eq('unit_id', unitId)
      .single()

    if (fetchError || !currentOrder) {
      return { success: false, error: 'Comanda não encontrada.' }
    }

    // Validar transição: sorting -> washing (received -> sorting é o entry, aqui é o exit)
    validateTransition(currentOrder.status as OrderStatus, 'washing' as OrderStatus)

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
      operator_id: user.id,
      notes: notes || 'Triagem concluída — enviado para Lavagem',
    })

    revalidatePath(`/sector/sorting`)
    return { success: true, data: undefined }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' }
  }
}
