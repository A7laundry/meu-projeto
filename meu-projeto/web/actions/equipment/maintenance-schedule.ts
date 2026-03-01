'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { requireUnitAccess } from '@/lib/auth/guards'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import type { ActionResult } from '@/lib/auth/action-result'

export interface MaintenanceSchedule {
  id: string
  unit_id: string
  equipment_id: string
  equipment_name?: string
  schedule_type: 'cycles' | 'days'
  cycle_interval: number | null
  day_interval: number | null
  description: string
  last_maintenance_at: string | null
  last_maintenance_cycles: number
  active: boolean
  created_at: string
}

export interface MaintenanceAlert {
  scheduleId: string
  equipmentId: string
  equipmentName: string
  description: string
  reason: string
  urgency: 'warning' | 'overdue'
}

const scheduleSchema = z.object({
  equipmentId: z.string().uuid(),
  scheduleType: z.enum(['cycles', 'days']),
  cycleInterval: z.number().int().min(1).optional().nullable(),
  dayInterval: z.number().int().min(1).optional().nullable(),
  description: z.string().min(2, 'Descrição obrigatória'),
})

export async function listMaintenanceSchedules(unitId: string): Promise<MaintenanceSchedule[]> {
  await requireUnitAccess(unitId, ['unit_manager', 'director', 'operator'])
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('maintenance_schedules')
    .select('*, equipment:equipment(name)')
    .eq('unit_id', unitId)
    .eq('active', true)
    .order('created_at', { ascending: false })

  return (data ?? []).map((s) => ({
    ...s,
    equipment_name: (s.equipment as unknown as { name: string } | null)?.name ?? 'Equipamento',
  })) as MaintenanceSchedule[]
}

export async function createMaintenanceSchedule(
  unitId: string,
  input: z.infer<typeof scheduleSchema>
): Promise<ActionResult<MaintenanceSchedule>> {
  await requireUnitAccess(unitId, ['unit_manager', 'director'])
  const parsed = scheduleSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('maintenance_schedules')
    .insert({
      unit_id: unitId,
      equipment_id: parsed.data.equipmentId,
      schedule_type: parsed.data.scheduleType,
      cycle_interval: parsed.data.scheduleType === 'cycles' ? parsed.data.cycleInterval : null,
      day_interval: parsed.data.scheduleType === 'days' ? parsed.data.dayInterval : null,
      description: parsed.data.description,
    })
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath(`/unit/${unitId}/equipment`)
  return { success: true, data: data as MaintenanceSchedule }
}

export async function markMaintenanceDone(
  scheduleId: string,
  unitId: string
): Promise<ActionResult> {
  await requireUnitAccess(unitId, ['unit_manager', 'operator'])
  const supabase = createAdminClient()

  // Buscar ciclos atuais do equipamento
  const { data: schedule } = await supabase
    .from('maintenance_schedules')
    .select('equipment_id')
    .eq('id', scheduleId)
    .eq('unit_id', unitId)
    .single()

  if (!schedule) return { success: false, error: 'Agendamento não encontrado' }

  // Contar ciclos totais do equipamento
  const { data: logs } = await supabase
    .from('equipment_logs')
    .select('cycles')
    .eq('equipment_id', schedule.equipment_id)
    .eq('log_type', 'use')

  const totalCycles = (logs ?? []).reduce((s, l) => s + (l.cycles ?? 0), 0)

  const { error } = await supabase
    .from('maintenance_schedules')
    .update({
      last_maintenance_at: new Date().toISOString(),
      last_maintenance_cycles: totalCycles,
    })
    .eq('id', scheduleId)
    .eq('unit_id', unitId)

  if (error) return { success: false, error: error.message }

  // Voltar equipamento para ativo
  await supabase
    .from('equipment')
    .update({ status: 'active' })
    .eq('id', schedule.equipment_id)
    .eq('unit_id', unitId)

  revalidatePath(`/unit/${unitId}/equipment`)
  return { success: true, data: undefined }
}

/**
 * Verifica todos os agendamentos de uma unidade e retorna alertas
 * para equipamentos com manutenção vencida ou próxima.
 */
export async function getMaintenanceAlerts(unitId: string): Promise<MaintenanceAlert[]> {
  await requireUnitAccess(unitId, ['unit_manager', 'director', 'operator'])
  const supabase = createAdminClient()

  const { data: schedules } = await supabase
    .from('maintenance_schedules')
    .select('*, equipment:equipment(name)')
    .eq('unit_id', unitId)
    .eq('active', true)

  if (!schedules || schedules.length === 0) return []

  const alerts: MaintenanceAlert[] = []
  const now = Date.now()

  for (const s of schedules) {
    const eqName = (s.equipment as unknown as { name: string } | null)?.name ?? 'Equipamento'

    if (s.schedule_type === 'days' && s.day_interval) {
      const lastAt = s.last_maintenance_at ? new Date(s.last_maintenance_at).getTime() : new Date(s.created_at).getTime()
      const daysSince = Math.floor((now - lastAt) / 86400_000)
      const threshold = Math.floor(s.day_interval * 0.8) // alerta a 80%

      if (daysSince >= s.day_interval) {
        alerts.push({
          scheduleId: s.id,
          equipmentId: s.equipment_id,
          equipmentName: eqName,
          description: s.description,
          reason: `${daysSince} dias desde última manutenção (intervalo: ${s.day_interval} dias)`,
          urgency: 'overdue',
        })
      } else if (daysSince >= threshold) {
        alerts.push({
          scheduleId: s.id,
          equipmentId: s.equipment_id,
          equipmentName: eqName,
          description: s.description,
          reason: `${daysSince}/${s.day_interval} dias — manutenção em breve`,
          urgency: 'warning',
        })
      }
    }

    if (s.schedule_type === 'cycles' && s.cycle_interval) {
      // Buscar ciclos desde a última manutenção
      const { data: logs } = await supabase
        .from('equipment_logs')
        .select('cycles')
        .eq('equipment_id', s.equipment_id)
        .eq('log_type', 'use')

      const totalCycles = (logs ?? []).reduce((sum, l) => sum + (l.cycles ?? 0), 0)
      const cyclesSince = totalCycles - (s.last_maintenance_cycles ?? 0)
      const threshold = Math.floor(s.cycle_interval * 0.8)

      if (cyclesSince >= s.cycle_interval) {
        alerts.push({
          scheduleId: s.id,
          equipmentId: s.equipment_id,
          equipmentName: eqName,
          description: s.description,
          reason: `${cyclesSince} ciclos desde última manutenção (intervalo: ${s.cycle_interval})`,
          urgency: 'overdue',
        })
      } else if (cyclesSince >= threshold) {
        alerts.push({
          scheduleId: s.id,
          equipmentId: s.equipment_id,
          equipmentName: eqName,
          description: s.description,
          reason: `${cyclesSince}/${s.cycle_interval} ciclos — manutenção em breve`,
          urgency: 'warning',
        })
      }
    }
  }

  return alerts.sort((a, b) => (a.urgency === 'overdue' ? -1 : 1) - (b.urgency === 'overdue' ? -1 : 1))
}
