'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { requireUnitAccess } from '@/lib/auth/guards'

export interface WashingKpis {
  ordersWashed: number
  totalCycles: number
  workTimeMinutes: number
  litersConsumed: number
  topEquipment: { name: string; count: number }[]
  topRecipes: { name: string; count: number }[]
}

const DEFAULT_KPIS: WashingKpis = {
  ordersWashed: 0,
  totalCycles: 0,
  workTimeMinutes: 0,
  litersConsumed: 0,
  topEquipment: [],
  topRecipes: [],
}

export async function getWashingKpis(
  unitId: string,
  operatorId: string
): Promise<WashingKpis> {
  await requireUnitAccess(unitId, ['operator', 'unit_manager'])

  const admin = createAdminClient()

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  // Buscar eventos de lavagem do operador no dia de hoje
  const { data: events, error } = await admin
    .from('order_events')
    .select(`
      id,
      occurred_at,
      equipment_id,
      washing_records (
        cycles,
        weight_kg,
        started_at,
        finished_at,
        chemical_usage
      )
    `)
    .eq('unit_id', unitId)
    .eq('operator_id', operatorId)
    .eq('sector', 'washing')
    .eq('event_type', 'exit')
    .gte('occurred_at', todayStart.toISOString())

  if (error || !events || events.length === 0) {
    return DEFAULT_KPIS
  }

  let totalCycles = 0
  let workTimeMinutes = 0
  let litersConsumed = 0
  const equipmentCount: Record<string, { name: string; count: number }> = {}

  for (const event of events) {
    const record = Array.isArray(event.washing_records)
      ? event.washing_records[0]
      : event.washing_records

    if (!record) continue

    totalCycles += record.cycles ?? 1

    if (record.started_at && record.finished_at) {
      const diff = (new Date(record.finished_at).getTime() - new Date(record.started_at).getTime()) / 60000
      workTimeMinutes += Math.round(diff)
    }

    // Somar produtos químicos do JSONB
    const chemicals = record.chemical_usage as Array<{ product_name: string; quantity_used: number }> | null
    if (Array.isArray(chemicals)) {
      for (const c of chemicals) {
        litersConsumed += c.quantity_used ?? 0
      }
    }

    // Contar uso por equipamento
    if (event.equipment_id) {
      if (!equipmentCount[event.equipment_id]) {
        equipmentCount[event.equipment_id] = { name: event.equipment_id, count: 0 }
      }
      equipmentCount[event.equipment_id].count++
    }
  }

  // Resolver nomes dos equipamentos
  const equipmentIds = Object.keys(equipmentCount)
  if (equipmentIds.length > 0) {
    const { data: eqData } = await admin
      .from('equipment')
      .select('id, name')
      .in('id', equipmentIds)

    if (eqData) {
      for (const eq of eqData) {
        if (equipmentCount[eq.id]) {
          equipmentCount[eq.id].name = eq.name
        }
      }
    }
  }

  const topEquipment = Object.values(equipmentCount)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)

  return {
    ordersWashed: events.length,
    totalCycles,
    workTimeMinutes,
    litersConsumed: Math.round(litersConsumed * 10) / 10,
    topEquipment,
    topRecipes: [],
  }
}
