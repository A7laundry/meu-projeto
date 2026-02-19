'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import type { LogisticsRoute, RouteStop } from '@/types/logistics'

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

const routeSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  shift: z.enum(['morning', 'afternoon', 'evening']),
  weekdays: z.array(z.number().min(0).max(6)).min(1, 'Selecione ao menos um dia'),
  driver_id: z.string().uuid().optional().nullable(),
})

export async function listRoutes(unitId: string): Promise<LogisticsRoute[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('logistics_routes')
    .select(`
      *,
      driver:staff(id, name),
      stops:route_stops(
        id, position, notes, client_id,
        client:clients(id, name)
      )
    `)
    .eq('unit_id', unitId)
    .order('active', { ascending: false })
    .order('name')

  if (error) return []

  return (data ?? []).map((r) => ({
    ...r,
    driver_name: r.driver?.name ?? null,
    stops: (r.stops ?? [])
      .sort((a: RouteStop, b: RouteStop) => a.position - b.position)
      .map((s: { id: string; position: number; notes: string | null; client_id: string; client: { id: string; name: string } | null; created_at?: string }) => ({
        id: s.id,
        route_id: r.id,
        client_id: s.client_id,
        client_name: s.client?.name ?? null,
        position: s.position,
        notes: s.notes,
        created_at: s.created_at ?? '',
      })),
  })) as LogisticsRoute[]
}

export async function createRoute(
  unitId: string,
  formData: FormData,
): Promise<ActionResult<LogisticsRoute>> {
  const weekdaysRaw = formData.getAll('weekdays').map(Number)

  const raw = {
    name: formData.get('name') as string,
    shift: formData.get('shift') as string,
    weekdays: weekdaysRaw,
    driver_id: (formData.get('driver_id') as string) || null,
  }

  const parsed = routeSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('logistics_routes')
    .insert({ ...parsed.data, unit_id: unitId })
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath(`/unit/${unitId}/routes`)
  return { success: true, data: data as LogisticsRoute }
}

export async function updateRoute(
  id: string,
  unitId: string,
  formData: FormData,
): Promise<ActionResult<LogisticsRoute>> {
  const weekdaysRaw = formData.getAll('weekdays').map(Number)

  const raw = {
    name: formData.get('name') as string,
    shift: formData.get('shift') as string,
    weekdays: weekdaysRaw,
    driver_id: (formData.get('driver_id') as string) || null,
  }

  const parsed = routeSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('logistics_routes')
    .update(parsed.data)
    .eq('id', id)
    .eq('unit_id', unitId)
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath(`/unit/${unitId}/routes`)
  return { success: true, data: data as LogisticsRoute }
}

export async function toggleRouteActive(
  id: string,
  unitId: string,
  active: boolean,
): Promise<ActionResult> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('logistics_routes')
    .update({ active })
    .eq('id', id)
    .eq('unit_id', unitId)

  if (error) return { success: false, error: error.message }

  revalidatePath(`/unit/${unitId}/routes`)
  return { success: true, data: undefined }
}

export async function addRouteStop(
  routeId: string,
  unitId: string,
  clientId: string,
): Promise<ActionResult<RouteStop>> {
  const supabase = createAdminClient()

  // Determina próxima posição
  const { data: existing } = await supabase
    .from('route_stops')
    .select('position')
    .eq('route_id', routeId)
    .order('position', { ascending: false })
    .limit(1)

  const nextPosition = existing && existing.length > 0 ? existing[0].position + 1 : 1

  const { data, error } = await supabase
    .from('route_stops')
    .insert({ route_id: routeId, client_id: clientId, position: nextPosition })
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath(`/unit/${unitId}/routes`)
  return { success: true, data: data as RouteStop }
}

export async function removeRouteStop(
  stopId: string,
  unitId: string,
): Promise<ActionResult> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('route_stops')
    .delete()
    .eq('id', stopId)

  if (error) return { success: false, error: error.message }

  revalidatePath(`/unit/${unitId}/routes`)
  return { success: true, data: undefined }
}
