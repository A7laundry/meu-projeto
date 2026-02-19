'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'
import type { ChemicalMovement } from '@/types/chemical'

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

const movementSchema = z.object({
  movement_type: z.enum(['in', 'out']),
  quantity: z.coerce.number().positive('Quantidade deve ser maior que zero'),
  notes: z.string().optional().nullable(),
})

export async function listMovements(
  unitId: string,
  productId: string,
  limit = 30
): Promise<ChemicalMovement[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('chemical_movements')
    .select('*')
    .eq('unit_id', unitId)
    .eq('product_id', productId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return []
  return data as ChemicalMovement[]
}

export async function registerMovement(
  productId: string,
  unitId: string,
  formData: FormData
): Promise<ActionResult<ChemicalMovement>> {
  const raw = {
    movement_type: formData.get('movement_type'),
    quantity: formData.get('quantity'),
    notes: formData.get('notes') || null,
  }

  const parsed = movementSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('chemical_movements')
    .insert({
      product_id: productId,
      unit_id: unitId,
      movement_type: parsed.data.movement_type,
      quantity: parsed.data.quantity,
      notes: parsed.data.notes ?? null,
    })
    .select()
    .single()

  if (error) return { success: false, error: `Erro ao registrar movimentação: ${error.message}` }

  revalidatePath(`/unit/${unitId}/supplies`)
  return { success: true, data: data as ChemicalMovement }
}
