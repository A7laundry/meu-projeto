'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Client } from '@/types/logistics'

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

const clientSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  type: z.enum(['pf', 'pj']),
  document: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  birthday: z.string().optional().or(z.literal('')),
  acquisition_channel: z.string().optional(),
  address_street: z.string().optional(),
  address_number: z.string().optional(),
  address_complement: z.string().optional(),
  address_neighborhood: z.string().optional(),
  address_city: z.string().optional(),
  address_state: z.string().optional(),
  address_zip: z.string().optional(),
  notes: z.string().optional(),
})

export async function listClients(unitId: string): Promise<Client[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('unit_id', unitId)
    .order('active', { ascending: false })
    .order('name')

  if (error) return []
  return data as Client[]
}

export async function listActiveClients(unitId: string): Promise<Client[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('clients')
    .select('id, name, type, address_city')
    .eq('unit_id', unitId)
    .eq('active', true)
    .order('name')

  if (error) return []
  return data as Client[]
}

export async function createClient(
  unitId: string,
  formData: FormData,
): Promise<ActionResult<Client>> {
  const raw = {
    name: formData.get('name') as string,
    type: formData.get('type') as string,
    document: formData.get('document') as string,
    phone: formData.get('phone') as string,
    email: formData.get('email') as string,
    birthday: (formData.get('birthday') as string) || undefined,
    acquisition_channel: (formData.get('acquisition_channel') as string) || undefined,
    address_street: formData.get('address_street') as string,
    address_number: formData.get('address_number') as string,
    address_complement: formData.get('address_complement') as string,
    address_neighborhood: formData.get('address_neighborhood') as string,
    address_city: formData.get('address_city') as string,
    address_state: formData.get('address_state') as string,
    address_zip: formData.get('address_zip') as string,
    notes: formData.get('notes') as string,
  }

  const parsed = clientSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('clients')
    .insert({ ...parsed.data, unit_id: unitId })
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath(`/unit/${unitId}/clients`)
  return { success: true, data: data as Client }
}

export async function updateClient(
  id: string,
  unitId: string,
  formData: FormData,
): Promise<ActionResult<Client>> {
  const raw = {
    name: formData.get('name') as string,
    type: formData.get('type') as string,
    document: formData.get('document') as string,
    phone: formData.get('phone') as string,
    email: formData.get('email') as string,
    birthday: (formData.get('birthday') as string) || undefined,
    acquisition_channel: (formData.get('acquisition_channel') as string) || undefined,
    address_street: formData.get('address_street') as string,
    address_number: formData.get('address_number') as string,
    address_complement: formData.get('address_complement') as string,
    address_neighborhood: formData.get('address_neighborhood') as string,
    address_city: formData.get('address_city') as string,
    address_state: formData.get('address_state') as string,
    address_zip: formData.get('address_zip') as string,
    notes: formData.get('notes') as string,
  }

  const parsed = clientSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('clients')
    .update(parsed.data)
    .eq('id', id)
    .eq('unit_id', unitId)
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath(`/unit/${unitId}/clients`)
  return { success: true, data: data as Client }
}

export async function toggleClientActive(
  id: string,
  unitId: string,
  active: boolean,
): Promise<ActionResult> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('clients')
    .update({ active })
    .eq('id', id)
    .eq('unit_id', unitId)

  if (error) return { success: false, error: error.message }

  revalidatePath(`/unit/${unitId}/clients`)
  return { success: true, data: undefined }
}
