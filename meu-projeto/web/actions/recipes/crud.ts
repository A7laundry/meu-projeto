'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'
import type { Recipe, PieceType } from '@/types/recipe'

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

const PIECE_TYPES = ['clothing', 'costume', 'sneaker', 'rug', 'curtain', 'industrial', 'other'] as const

const recipeSchema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  piece_type: z.enum(PIECE_TYPES),
  description: z.string().optional().nullable(),
  temperature_celsius: z.coerce.number().int().min(0).max(200).optional().nullable(),
  duration_minutes: z.coerce.number().int().min(1).max(600).optional().nullable(),
  chemical_notes: z.string().optional().nullable(),
})

export async function listRecipes(unitId: string, pieceType?: PieceType): Promise<Recipe[]> {
  const supabase = createAdminClient()
  let query = supabase
    .from('recipes')
    .select('*')
    .eq('unit_id', unitId)
    .order('active', { ascending: false })
    .order('piece_type')
    .order('name')

  if (pieceType) {
    query = query.eq('piece_type', pieceType)
  }

  const { data, error } = await query
  if (error) throw new Error(`Erro ao listar receitas: ${error.message}`)
  return data as Recipe[]
}

export async function listActiveRecipes(unitId: string, pieceType: PieceType): Promise<Recipe[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('recipes')
    .select('id, name, piece_type, duration_minutes, temperature_celsius')
    .eq('unit_id', unitId)
    .eq('piece_type', pieceType)
    .eq('active', true)
    .order('name')

  if (error) return []
  return data as Recipe[]
}

export async function createRecipe(
  unitId: string,
  formData: FormData
): Promise<ActionResult<Recipe>> {
  const raw = {
    name: formData.get('name'),
    piece_type: formData.get('piece_type'),
    description: formData.get('description') || null,
    temperature_celsius: formData.get('temperature_celsius') || null,
    duration_minutes: formData.get('duration_minutes') || null,
    chemical_notes: formData.get('chemical_notes') || null,
  }

  const parsed = recipeSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('recipes')
    .insert({ ...parsed.data, unit_id: unitId, active: true })
    .select()
    .single()

  if (error) return { success: false, error: `Erro ao criar receita: ${error.message}` }

  revalidatePath(`/unit/${unitId}/recipes`)
  return { success: true, data: data as Recipe }
}

export async function updateRecipe(
  id: string,
  unitId: string,
  formData: FormData
): Promise<ActionResult<Recipe>> {
  const raw = {
    name: formData.get('name'),
    piece_type: formData.get('piece_type'),
    description: formData.get('description') || null,
    temperature_celsius: formData.get('temperature_celsius') || null,
    duration_minutes: formData.get('duration_minutes') || null,
    chemical_notes: formData.get('chemical_notes') || null,
  }

  const parsed = recipeSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('recipes')
    .update(parsed.data)
    .eq('id', id)
    .select()
    .single()

  if (error) return { success: false, error: `Erro ao atualizar receita: ${error.message}` }

  revalidatePath(`/unit/${unitId}/recipes`)
  return { success: true, data: data as Recipe }
}

export async function toggleRecipeActive(
  id: string,
  unitId: string,
  active: boolean
): Promise<ActionResult> {
  const admin = createAdminClient()
  const { error } = await admin
    .from('recipes')
    .update({ active })
    .eq('id', id)

  if (error) return { success: false, error: `Erro ao alterar status: ${error.message}` }

  revalidatePath(`/unit/${unitId}/recipes`)
  return { success: true, data: undefined }
}
