'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { getUser } from '@/lib/auth/get-user'
import type { DailyManifest } from '@/types/manifest'

export async function getDriverManifestsToday(): Promise<DailyManifest[]> {
  const user = await getUser()
  if (!user || user.role !== 'driver') return []

  const today = new Date().toISOString().split('T')[0]
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('daily_manifests')
    .select(`
      *,
      route:logistics_routes(id, name, shift),
      stops:manifest_stops(
        id, position, status, notes, visited_at, client_id,
        client:clients(id, name, address_street, address_number, address_city)
      )
    `)
    .eq('driver_id', user.id)
    .eq('date', today)
    .order('created_at')

  if (error) return []

  return (data ?? []).map((m) => ({
    ...m,
    route_name: m.route?.name ?? null,
    route_shift: m.route?.shift ?? null,
    driver_name: user.full_name,
    stops: (m.stops ?? [])
      .sort((a: { position: number }, b: { position: number }) => a.position - b.position)
      .map((s: {
        id: string
        position: number
        status: string
        notes: string | null
        visited_at: string | null
        client_id: string
        created_at?: string
        client: { id: string; name: string; address_street: string | null; address_number: string | null; address_city: string | null } | null
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
}

export async function markStopVisited(
  stopId: string,
  status: 'visited' | 'skipped' = 'visited',
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('manifest_stops')
    .update({
      status,
      visited_at: status === 'visited' ? new Date().toISOString() : null,
    })
    .eq('id', stopId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/driver/route')
  return { success: true }
}
