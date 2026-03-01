'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { requireUnitAccess } from '@/lib/auth/guards'

export interface DayCloseReport {
  date: string
  totalManifests: number
  completedManifests: number
  totalStops: number
  visitedStops: number
  skippedStops: number
  pendingStops: number
  ruptureRate: number
  ruptures: {
    clientName: string
    driverName: string
    reason: string
  }[]
}

export async function getDayCloseReport(
  unitId: string,
  date?: string
): Promise<DayCloseReport> {
  await requireUnitAccess(unitId, ['unit_manager', 'director'])

  const supabase = createAdminClient()
  const targetDate = date ?? new Date().toISOString().split('T')[0]

  // Buscar romaneios do dia
  const { data: manifests } = await supabase
    .from('daily_manifests')
    .select(`
      id, status, driver_id,
      driver:profiles!daily_manifests_driver_id_fkey(full_name),
      stops:manifest_stops(
        id, status, skip_reason, notes,
        client:clients(name)
      )
    `)
    .eq('unit_id', unitId)
    .eq('date', targetDate)

  if (!manifests || manifests.length === 0) {
    return {
      date: targetDate,
      totalManifests: 0,
      completedManifests: 0,
      totalStops: 0,
      visitedStops: 0,
      skippedStops: 0,
      pendingStops: 0,
      ruptureRate: 0,
      ruptures: [],
    }
  }

  let totalStops = 0
  let visitedStops = 0
  let skippedStops = 0
  let pendingStops = 0
  const ruptures: DayCloseReport['ruptures'] = []

  for (const m of manifests) {
    const stops = (m.stops ?? []) as unknown as {
      id: string
      status: string
      skip_reason: string | null
      notes: string | null
      client: { name: string } | null
    }[]
    const driverName = (m.driver as unknown as { full_name: string } | null)?.full_name ?? 'Motorista'

    for (const stop of stops) {
      totalStops++
      if (stop.status === 'visited') visitedStops++
      else if (stop.status === 'skipped') {
        skippedStops++
        ruptures.push({
          clientName: stop.client?.name ?? 'Cliente',
          driverName,
          reason: stop.skip_reason || stop.notes?.replace(/\[FOTO:.*?\]/g, '').trim() || 'Sem motivo',
        })
      } else {
        pendingStops++
      }
    }
  }

  const completedManifests = manifests.filter(
    (m) => m.status === 'completed'
  ).length

  return {
    date: targetDate,
    totalManifests: manifests.length,
    completedManifests,
    totalStops,
    visitedStops,
    skippedStops,
    pendingStops,
    ruptureRate: totalStops > 0 ? Math.round((skippedStops / totalStops) * 100) : 0,
    ruptures,
  }
}
