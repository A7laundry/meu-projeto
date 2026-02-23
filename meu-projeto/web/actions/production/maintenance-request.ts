'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import type { ActionResult } from '@/actions/staff/invite'

interface MaintenanceRequestData {
  equipmentId: string | null
  description: string
  urgency: 'low' | 'medium' | 'high'
}

export async function createMaintenanceRequest(
  unitId: string,
  operatorId: string,
  data: MaintenanceRequestData
): Promise<ActionResult> {
  if (!data.description.trim()) {
    return { success: false, error: 'Descrição é obrigatória.' }
  }

  const admin = createAdminClient()

  const { error: insertError } = await admin
    .from('maintenance_requests')
    .insert({
      unit_id: unitId,
      equipment_id: data.equipmentId || null,
      operator_id: operatorId || null,
      description: data.description.trim(),
      urgency: data.urgency,
      status: 'open',
    })

  if (insertError) {
    return { success: false, error: `Erro ao registrar solicitação: ${insertError.message}` }
  }

  // Se urgência alta: marcar equipamento como em manutenção e registrar log
  if (data.urgency === 'high' && data.equipmentId) {
    await admin
      .from('equipment')
      .update({ status: 'maintenance' })
      .eq('id', data.equipmentId)

    await admin.from('equipment_logs').insert({
      equipment_id: data.equipmentId,
      unit_id: unitId,
      operator_id: operatorId || null,
      operator_name: null,
      log_type: 'maintenance',
      cycles: null,
      notes: `Solicitação de manutenção urgente: ${data.description.trim()}`,
      occurred_at: new Date().toISOString(),
    })
  }

  revalidatePath('/sector/washing')
  return { success: true, data: undefined }
}
