'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ActionResult } from '@/actions/staff/invite'

export interface SortingItem {
  itemId: string
  recipeId: string | null
  weightKg?: number
}

export async function completeSorting(
  orderId: string,
  unitId: string,
  items: SortingItem[],
  notes?: string
): Promise<ActionResult> {
  const admin = createAdminClient()
  const supabase = await createClient()
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

  // Atualizar receitas dos itens
  for (const item of items) {
    if (item.recipeId) {
      await admin
        .from('order_items')
        .update({ recipe_id: item.recipeId })
        .eq('id', item.itemId)
    }
  }

  // Registrar evento
  await admin.from('order_events').insert({
    order_id: orderId,
    unit_id: unitId,
    sector: 'sorting',
    event_type: 'exit',
    operator_id: user?.id ?? null,
    notes: notes ?? 'Triagem concluída — enviado para Lavagem',
  })

  revalidatePath(`/sector/sorting`)
  return { success: true, data: undefined }
}
