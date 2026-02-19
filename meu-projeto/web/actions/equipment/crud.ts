'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'
import type { Equipment, EquipmentStatus } from '@/types/equipment'

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

const equipmentSchema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  type: z.enum(['washer', 'dryer', 'iron', 'other']),
  brand: z.string().optional(),
  model: z.string().optional(),
  serial_number: z.string().optional(),
  capacity_kg: z.coerce.number().positive().optional().nullable(),
  status: z.enum(['active', 'maintenance', 'inactive']).default('active'),
})

export async function listEquipment(unitId: string): Promise<Equipment[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('equipment')
    .select('*')
    .eq('unit_id', unitId)
    .order('type')
    .order('name')

  if (error) throw new Error(`Erro ao listar equipamentos: ${error.message}`)
  return data as Equipment[]
}

export async function createEquipment(
  unitId: string,
  formData: FormData
): Promise<ActionResult<Equipment>> {
  const raw = {
    name: formData.get('name'),
    type: formData.get('type'),
    brand: formData.get('brand') || undefined,
    model: formData.get('model') || undefined,
    serial_number: formData.get('serial_number') || undefined,
    capacity_kg: formData.get('capacity_kg') || null,
    status: 'active',
  }

  const parsed = equipmentSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('equipment')
    .insert({ ...parsed.data, unit_id: unitId })
    .select()
    .single()

  if (error) return { success: false, error: `Erro ao criar equipamento: ${error.message}` }

  revalidatePath(`/unit/${unitId}/equipment`)
  return { success: true, data: data as Equipment }
}

export async function updateEquipment(
  id: string,
  unitId: string,
  formData: FormData
): Promise<ActionResult<Equipment>> {
  const raw = {
    name: formData.get('name'),
    type: formData.get('type'),
    brand: formData.get('brand') || undefined,
    model: formData.get('model') || undefined,
    serial_number: formData.get('serial_number') || undefined,
    capacity_kg: formData.get('capacity_kg') || null,
    status: formData.get('status') || 'active',
  }

  const parsed = equipmentSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('equipment')
    .update(parsed.data)
    .eq('id', id)
    .select()
    .single()

  if (error) return { success: false, error: `Erro ao atualizar: ${error.message}` }

  revalidatePath(`/unit/${unitId}/equipment`)
  return { success: true, data: data as Equipment }
}

export async function updateEquipmentStatus(
  id: string,
  unitId: string,
  status: EquipmentStatus
): Promise<ActionResult> {
  const admin = createAdminClient()
  const { error } = await admin
    .from('equipment')
    .update({ status })
    .eq('id', id)

  if (error) return { success: false, error: `Erro ao atualizar status: ${error.message}` }

  revalidatePath(`/unit/${unitId}/equipment`)
  return { success: true, data: undefined }
}
