'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'
import type { ChemicalProduct } from '@/types/chemical'

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

const CATEGORIES = ['detergent', 'bleach', 'softener', 'starch', 'other'] as const
const MEASURE_UNITS = ['ml', 'g', 'unit'] as const

const productSchema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  category: z.enum(CATEGORIES),
  measure_unit: z.enum(MEASURE_UNITS),
  cost_per_unit: z.coerce.number().positive().optional().nullable(),
  minimum_stock: z.coerce.number().min(0).default(0),
  supplier: z.string().optional().nullable(),
})

export async function listChemicalProducts(unitId: string): Promise<ChemicalProduct[]> {
  const supabase = await createClient()
  const { data: products, error } = await supabase
    .from('chemical_products')
    .select('*')
    .eq('unit_id', unitId)
    .order('active', { ascending: false })
    .order('category')
    .order('name')

  if (error) throw new Error(`Erro ao listar insumos: ${error.message}`)

  // Calcular saldo atual via movimentações
  const { data: movements } = await supabase
    .from('chemical_movements')
    .select('product_id, movement_type, quantity')
    .eq('unit_id', unitId)

  const stockMap: Record<string, number> = {}
  for (const m of movements ?? []) {
    if (!stockMap[m.product_id]) stockMap[m.product_id] = 0
    stockMap[m.product_id] += m.movement_type === 'in' ? m.quantity : -m.quantity
  }

  return (products as ChemicalProduct[]).map((p) => ({
    ...p,
    current_stock: stockMap[p.id] ?? 0,
  }))
}

export async function createChemicalProduct(
  unitId: string,
  formData: FormData
): Promise<ActionResult<ChemicalProduct>> {
  const raw = {
    name: formData.get('name'),
    category: formData.get('category'),
    measure_unit: formData.get('measure_unit'),
    cost_per_unit: formData.get('cost_per_unit') || null,
    minimum_stock: formData.get('minimum_stock') ?? 0,
    supplier: formData.get('supplier') || null,
  }

  const parsed = productSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('chemical_products')
    .insert({ ...parsed.data, unit_id: unitId, active: true })
    .select()
    .single()

  if (error) return { success: false, error: `Erro ao criar insumo: ${error.message}` }

  revalidatePath(`/unit/${unitId}/supplies`)
  return { success: true, data: data as ChemicalProduct }
}

export async function updateChemicalProduct(
  id: string,
  unitId: string,
  formData: FormData
): Promise<ActionResult<ChemicalProduct>> {
  const raw = {
    name: formData.get('name'),
    category: formData.get('category'),
    measure_unit: formData.get('measure_unit'),
    cost_per_unit: formData.get('cost_per_unit') || null,
    minimum_stock: formData.get('minimum_stock') ?? 0,
    supplier: formData.get('supplier') || null,
  }

  const parsed = productSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('chemical_products')
    .update(parsed.data)
    .eq('id', id)
    .select()
    .single()

  if (error) return { success: false, error: `Erro ao atualizar: ${error.message}` }

  revalidatePath(`/unit/${unitId}/supplies`)
  return { success: true, data: data as ChemicalProduct }
}
