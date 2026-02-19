'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'
import type { EquipmentLog } from '@/types/equipment-log'

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

const LOG_TYPES = ['use', 'maintenance', 'incident', 'repair_completed'] as const

const logSchema = z.object({
  log_type: z.enum(LOG_TYPES),
  cycles: z.coerce.number().int().min(1).optional().nullable(),
  notes: z.string().default(''),
  occurred_at: z.string().optional(),
})

export async function listEquipmentLogs(equipmentId: string): Promise<EquipmentLog[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('equipment_logs')
    .select('*')
    .eq('equipment_id', equipmentId)
    .order('occurred_at', { ascending: false })
    .limit(50)

  if (error) throw new Error(`Erro ao listar logs: ${error.message}`)
  return data as EquipmentLog[]
}

export async function getTotalCycles(equipmentId: string): Promise<number> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('equipment_logs')
    .select('cycles')
    .eq('equipment_id', equipmentId)
    .eq('log_type', 'use')

  if (!data) return 0
  return data.reduce((sum, row) => sum + (row.cycles ?? 0), 0)
}

export async function createEquipmentLog(
  equipmentId: string,
  unitId: string,
  formData: FormData,
  operatorName: string | null
): Promise<ActionResult<EquipmentLog>> {
  const raw = {
    log_type: formData.get('log_type'),
    cycles: formData.get('cycles') || null,
    notes: formData.get('notes') ?? '',
    occurred_at: formData.get('occurred_at') || undefined,
  }

  const parsed = logSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const admin = createAdminClient()

  // Se manutenção, atualizar status do equipamento
  let equipmentStatus: string | undefined
  if (parsed.data.log_type === 'maintenance') equipmentStatus = 'maintenance'
  if (parsed.data.log_type === 'repair_completed') equipmentStatus = 'active'

  if (equipmentStatus) {
    await admin.from('equipment').update({ status: equipmentStatus }).eq('id', equipmentId)
  }

  const { data, error } = await admin
    .from('equipment_logs')
    .insert({
      equipment_id: equipmentId,
      unit_id: unitId,
      operator_name: operatorName,
      log_type: parsed.data.log_type,
      cycles: parsed.data.cycles ?? null,
      notes: parsed.data.notes,
      occurred_at: parsed.data.occurred_at ?? new Date().toISOString(),
    })
    .select()
    .single()

  if (error) return { success: false, error: `Erro ao registrar: ${error.message}` }

  revalidatePath(`/unit/${unitId}/equipment/${equipmentId}`)
  revalidatePath(`/unit/${unitId}/equipment`)
  return { success: true, data: data as EquipmentLog }
}
