'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { requireUnitAccess } from '@/lib/auth/guards'

export interface ShiftCycleCount {
  equipmentId: string
  cycles: number
}

export async function getShiftCycleCounts(unitId: string): Promise<ShiftCycleCount[]> {
  await requireUnitAccess(unitId, ['unit_manager', 'operator'])

  const supabase = createAdminClient()
  const today = new Date().toISOString().split('T')[0]

  const { data } = await supabase
    .from('equipment_logs')
    .select('equipment_id, cycles')
    .eq('unit_id', unitId)
    .eq('log_type', 'use')
    .gte('occurred_at', today)

  if (!data || data.length === 0) return []

  const countsMap = new Map<string, number>()
  for (const row of data) {
    const prev = countsMap.get(row.equipment_id) ?? 0
    countsMap.set(row.equipment_id, prev + (row.cycles ?? 0))
  }

  return Array.from(countsMap.entries()).map(([equipmentId, cycles]) => ({
    equipmentId,
    cycles,
  }))
}
