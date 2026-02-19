'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import type { DailyManifest, ManifestStatus } from '@/types/manifest'

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function listManifests(
  unitId: string,
  date: string,
  shift?: string,
): Promise<DailyManifest[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('daily_manifests')
    .select(`
      *,
      route:logistics_routes(id, name, shift),
      driver:staff(id, name),
      stops:manifest_stops(
        id, position, status, notes, visited_at, client_id,
        client:clients(id, name, address_street, address_number, address_city)
      )
    `)
    .eq('unit_id', unitId)
    .eq('date', date)
    .order('created_at')
  if (error) return []

  const results = (data ?? []).map((m) => ({
    ...m,
    route_name: m.route?.name ?? null,
    route_shift: m.route?.shift ?? null,
    driver_name: m.driver?.name ?? null,
    stops: (m.stops ?? [])
      .sort((a: { position: number }, b: { position: number }) => a.position - b.position)
      .map((s: {
        id: string
        position: number
        status: string
        notes: string | null
        visited_at: string | null
        client_id: string
        client: { id: string; name: string; address_street: string | null; address_number: string | null; address_city: string | null } | null
        manifest_id?: string
        created_at?: string
      }) => ({
        id: s.id,
        manifest_id: m.id,
        client_id: s.client_id,
        client_name: s.client?.name ?? null,
        client_address: [s.client?.address_street, s.client?.address_number, s.client?.address_city]
          .filter(Boolean)
          .join(', ') || null,
        position: s.position,
        status: s.status,
        notes: s.notes,
        visited_at: s.visited_at,
        created_at: s.created_at ?? '',
      })),
  })) as DailyManifest[]

  if (shift && shift !== 'all') {
    return results.filter((m) => m.route_shift === shift)
  }

  return results
}

export async function generateManifest(
  unitId: string,
  routeId: string,
  date: string,
): Promise<ActionResult<DailyManifest>> {
  const supabase = createAdminClient()

  // Busca rota com paradas
  const { data: route, error: routeErr } = await supabase
    .from('logistics_routes')
    .select(`
      id, driver_id,
      stops:route_stops(
        id, position, client_id
      )
    `)
    .eq('id', routeId)
    .eq('unit_id', unitId)
    .single()

  if (routeErr || !route) {
    return { success: false, error: 'Rota não encontrada' }
  }

  // Cria romaneio (upsert para evitar duplicata)
  const { data: manifest, error: manifestErr } = await supabase
    .from('daily_manifests')
    .upsert(
      { unit_id: unitId, route_id: routeId, date, driver_id: route.driver_id ?? null },
      { onConflict: 'route_id,date', ignoreDuplicates: false },
    )
    .select()
    .single()

  if (manifestErr || !manifest) {
    return { success: false, error: manifestErr?.message ?? 'Erro ao criar romaneio' }
  }

  // Insere paradas (ignora duplicatas)
  if (route.stops && route.stops.length > 0) {
    const stops = route.stops.map((s: { client_id: string; position: number }) => ({
      manifest_id: manifest.id,
      client_id: s.client_id,
      position: s.position,
    }))
    await supabase.from('manifest_stops').upsert(stops, { ignoreDuplicates: true })
  }

  revalidatePath(`/unit/${unitId}/manifests`)
  return { success: true, data: manifest as DailyManifest }
}

export async function updateManifestStatus(
  id: string,
  unitId: string,
  status: ManifestStatus,
): Promise<ActionResult> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('daily_manifests')
    .update({ status })
    .eq('id', id)
    .eq('unit_id', unitId)

  if (error) return { success: false, error: error.message }

  revalidatePath(`/unit/${unitId}/manifests`)
  return { success: true, data: undefined }
}

export async function updateStopStatus(
  stopId: string,
  unitId: string,
  status: 'visited' | 'skipped',
): Promise<ActionResult> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('manifest_stops')
    .update({
      status,
      visited_at: status === 'visited' ? new Date().toISOString() : null,
    })
    .eq('id', stopId)

  if (error) return { success: false, error: error.message }

  revalidatePath(`/unit/${unitId}/manifests`)
  return { success: true, data: undefined }
}
