'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Unit } from '@/types/unit'
import { z } from 'zod'

const unitSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  slug: z.string()
    .min(2, 'Slug deve ter ao menos 2 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Slug: apenas letras minúsculas, números e hífens'),
  address: z.string().optional(),
  city: z.string().min(2, 'Cidade obrigatória'),
  state: z.string().length(2, 'Estado: 2 letras (ex: SP)').toUpperCase(),
  phone: z.string().optional(),
  active: z.boolean().default(true),
})

export type UnitFormData = z.infer<typeof unitSchema>
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function listUnits(): Promise<Unit[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('units')
    .select('*')
    .order('name')

  if (error) throw new Error(`Erro ao listar unidades: ${error.message}`)
  return data as Unit[]
}

export async function getUnit(id: string): Promise<Unit | null> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('units')
    .select('*')
    .eq('id', id)
    .single()

  return data as Unit | null
}

export async function createUnit(formData: FormData): Promise<ActionResult<Unit>> {
  const raw = {
    name: formData.get('name') as string,
    slug: formData.get('slug') as string,
    address: formData.get('address') as string || undefined,
    city: formData.get('city') as string,
    state: formData.get('state') as string,
    phone: formData.get('phone') as string || undefined,
    active: true,
  }

  const parsed = unitSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  // Admin client para bypass de RLS na criação
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('units')
    .insert(parsed.data)
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'Já existe uma unidade com este slug.' }
    }
    return { success: false, error: `Erro ao criar unidade: ${error.message}` }
  }

  revalidatePath('/director/units')
  return { success: true, data: data as Unit }
}

export async function updateUnit(id: string, formData: FormData): Promise<ActionResult<Unit>> {
  const raw = {
    name: formData.get('name') as string,
    slug: formData.get('slug') as string,
    address: formData.get('address') as string || undefined,
    city: formData.get('city') as string,
    state: formData.get('state') as string,
    phone: formData.get('phone') as string || undefined,
    active: formData.get('active') === 'true',
  }

  const parsed = unitSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('units')
    .update(parsed.data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { success: false, error: `Erro ao atualizar unidade: ${error.message}` }
  }

  revalidatePath('/director/units')
  return { success: true, data: data as Unit }
}

export async function toggleUnitStatus(id: string, active: boolean): Promise<ActionResult> {
  const admin = createAdminClient()
  const { error } = await admin
    .from('units')
    .update({ active })
    .eq('id', id)

  if (error) {
    return { success: false, error: `Erro ao alterar status: ${error.message}` }
  }

  revalidatePath('/director/units')
  return { success: true, data: undefined }
}
