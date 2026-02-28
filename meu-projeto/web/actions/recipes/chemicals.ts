'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireUnitAccess } from '@/lib/auth/guards'
import { z } from 'zod'

export interface RecipeChemical {
  id: string
  recipe_id: string
  product_id: string
  quantity_per_cycle: number
  product_name: string
  measure_unit: string
}

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function listRecipeChemicals(
  recipeId: string,
  unitId: string
): Promise<RecipeChemical[]> {
  await requireUnitAccess(unitId, ['unit_manager', 'operator'])
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('recipe_chemicals')
    .select('id, recipe_id, product_id, quantity_per_cycle, chemical_products(name, measure_unit)')
    .eq('recipe_id', recipeId)

  if (error) return []

  return (data ?? []).map((row) => ({
    id: row.id,
    recipe_id: row.recipe_id,
    product_id: row.product_id,
    quantity_per_cycle: row.quantity_per_cycle as number,
    product_name: (row.chemical_products as unknown as { name: string } | null)?.name ?? 'Produto',
    measure_unit: (row.chemical_products as unknown as { measure_unit: string } | null)?.measure_unit ?? 'ml',
  }))
}

const addSchema = z.object({
  product_id: z.string().uuid('Selecione um produto'),
  quantity_per_cycle: z.coerce.number().positive('Quantidade deve ser maior que zero'),
})

export async function addChemicalToRecipe(
  recipeId: string,
  unitId: string,
  formData: FormData
): Promise<ActionResult<RecipeChemical>> {
  await requireUnitAccess(unitId, ['unit_manager', 'operator'])

  const parsed = addSchema.safeParse({
    product_id: formData.get('product_id'),
    quantity_per_cycle: formData.get('quantity_per_cycle'),
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('recipe_chemicals')
    .insert({
      recipe_id: recipeId,
      product_id: parsed.data.product_id,
      quantity_per_cycle: parsed.data.quantity_per_cycle,
    })
    .select('id, recipe_id, product_id, quantity_per_cycle, chemical_products(name, measure_unit)')
    .single()

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'Este produto já está vinculado a esta receita.' }
    }
    return { success: false, error: `Erro ao vincular: ${error.message}` }
  }

  revalidatePath(`/unit/${unitId}/recipes`)
  return {
    success: true,
    data: {
      id: data.id,
      recipe_id: data.recipe_id,
      product_id: data.product_id,
      quantity_per_cycle: data.quantity_per_cycle as number,
      product_name: (data.chemical_products as unknown as { name: string } | null)?.name ?? 'Produto',
      measure_unit: (data.chemical_products as unknown as { measure_unit: string } | null)?.measure_unit ?? 'ml',
    },
  }
}

export async function updateRecipeChemical(
  id: string,
  unitId: string,
  quantity: number
): Promise<ActionResult> {
  await requireUnitAccess(unitId, ['unit_manager', 'operator'])

  if (quantity <= 0) {
    return { success: false, error: 'Quantidade deve ser maior que zero' }
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from('recipe_chemicals')
    .update({ quantity_per_cycle: quantity })
    .eq('id', id)

  if (error) return { success: false, error: `Erro ao atualizar: ${error.message}` }

  revalidatePath(`/unit/${unitId}/recipes`)
  return { success: true, data: undefined }
}

export async function removeChemicalFromRecipe(
  id: string,
  unitId: string
): Promise<ActionResult> {
  await requireUnitAccess(unitId, ['unit_manager', 'operator'])

  const admin = createAdminClient()
  const { error } = await admin
    .from('recipe_chemicals')
    .delete()
    .eq('id', id)

  if (error) return { success: false, error: `Erro ao remover: ${error.message}` }

  revalidatePath(`/unit/${unitId}/recipes`)
  return { success: true, data: undefined }
}
