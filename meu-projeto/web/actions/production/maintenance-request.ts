'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { requireRole } from '@/lib/auth/guards'
import { z } from 'zod'
import type { ActionResult } from '@/lib/auth/action-result'

const maintenanceRequestSchema = z.object({
  unitId: z.string().uuid('ID da unidade inválido'),
  equipmentId: z.string().uuid('ID do equipamento inválido').nullable(),
  description: z.string().min(1, 'Descrição é obrigatória'),
  urgency: z.enum(['low', 'medium', 'high'], {
    message: 'Urgência inválida',
  }),
})

export async function createMaintenanceRequest(
  unitId: string,
  data: { equipmentId: string | null; description: string; urgency: 'low' | 'medium' | 'high' }
): Promise<ActionResult> {
  try {
    const { user } = await requireRole(['operator'])

    const parsed = maintenanceRequestSchema.safeParse({
      unitId,
      equipmentId: data.equipmentId,
      description: data.description,
      urgency: data.urgency,
    })
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }

    const admin = createAdminClient()

    const { error: insertError } = await admin
      .from('maintenance_requests')
      .insert({
        unit_id: unitId,
        equipment_id: data.equipmentId || null,
        operator_id: user.id,
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
        operator_id: user.id,
        operator_name: null,
        log_type: 'maintenance',
        cycles: null,
        notes: `Solicitação de manutenção urgente: ${data.description.trim()}`,
        occurred_at: new Date().toISOString(),
      })
    }

    revalidatePath('/sector/washing')
    return { success: true, data: undefined }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' }
  }
}
