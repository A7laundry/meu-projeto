'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireRole } from '@/lib/auth/guards'
import type { DailyManifest } from '@/types/manifest'

export async function getDriverManifestsToday(): Promise<DailyManifest[]> {
  const { user, profile } = await requireRole(['driver'])

  const today = new Date().toISOString().split('T')[0]
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('daily_manifests')
    .select(`
      *,
      route:logistics_routes(id, name, shift),
      stops:manifest_stops(
        id, position, status, notes, visited_at, client_id,
        client:clients(id, name, address_street, address_number, address_complement, address_neighborhood, address_city, address_state, address_zip)
      )
    `)
    .eq('driver_id', profile.id)
    .eq('date', today)
    .order('created_at')

  if (error) return []

  return (data ?? []).map((m) => ({
    ...m,
    route_name: m.route?.name ?? null,
    route_shift: m.route?.shift ?? null,
    driver_name: profile.full_name,
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
        client: {
          id: string
          name: string
          address_street: string | null
          address_number: string | null
          address_complement: string | null
          address_neighborhood: string | null
          address_city: string | null
          address_state: string | null
          address_zip: string | null
        } | null
      }) => {
        // Short address for display
        const shortAddress = [s.client?.address_street, s.client?.address_number, s.client?.address_city]
          .filter(Boolean)
          .join(', ') || null

        // Full address for GPS navigation
        const fullAddress = [
          s.client?.address_street,
          s.client?.address_number,
          s.client?.address_complement,
          s.client?.address_neighborhood,
          s.client?.address_city,
          s.client?.address_state,
          s.client?.address_zip,
        ]
          .filter(Boolean)
          .join(', ') || null

        // Extract photo URL from notes (format: [FOTO:url])
        const photoMatch = s.notes?.match(/\[FOTO:(.*?)\]/)
        const photoUrl = photoMatch ? photoMatch[1] : null

        return {
          id: s.id,
          manifest_id: m.id,
          client_id: s.client_id,
          client_name: s.client?.name ?? null,
          client_address: shortAddress,
          client_address_full: fullAddress,
          position: s.position,
          status: s.status,
          notes: s.notes,
          photo_url: photoUrl,
          visited_at: s.visited_at,
          created_at: s.created_at ?? '',
        }
      }),
  })) as DailyManifest[]
}

export async function markStopVisited(
  stopId: string,
  status: 'visited' | 'skipped' = 'visited',
): Promise<{ success: boolean; error?: string }> {
  const { profile } = await requireRole(['driver'])
  const supabase = createAdminClient()

  // Verificar que o stop pertence a um manifesto do motorista logado
  const { data: stop } = await supabase
    .from('manifest_stops')
    .select('manifest_id, manifest:daily_manifests(driver_id)')
    .eq('id', stopId)
    .single()

  if (!stop || (stop.manifest as unknown as { driver_id: string })?.driver_id !== profile.id) {
    return { success: false, error: 'Parada não pertence a um romaneio seu' }
  }
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

/**
 * Marca uma parada como visitada com evidência fotográfica.
 * A foto é enviada via FormData e armazenada no Supabase Storage.
 * A URL da foto é salva no campo notes da manifest_stop.
 */
export async function markStopVisitedWithEvidence(
  stopId: string,
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  const { profile } = await requireRole(['driver'])
  const supabase = createAdminClient()

  // Verificar ownership do stop
  const { data: stop } = await supabase
    .from('manifest_stops')
    .select('manifest_id, notes, manifest:daily_manifests(driver_id)')
    .eq('id', stopId)
    .single()

  if (!stop || (stop.manifest as unknown as { driver_id: string })?.driver_id !== profile.id) {
    return { success: false, error: 'Parada não pertence a um romaneio seu' }
  }

  // Upload da foto se existir
  const photo = formData.get('photo') as File | null
  let photoUrl: string | null = null

  if (photo && photo.size > 0) {
    const ext = photo.name.split('.').pop() || 'jpg'
    const path = `deliveries/${stopId}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('delivery-photos')
      .upload(path, photo, { contentType: photo.type })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      // Continue even if upload fails - still mark as visited
    } else {
      const { data } = supabase.storage.from('delivery-photos').getPublicUrl(path)
      photoUrl = data.publicUrl
    }
  }

  // Build notes with photo URL if available
  let updatedNotes = stop.notes || ''
  if (photoUrl) {
    // Append photo reference to notes
    updatedNotes = updatedNotes
      ? `${updatedNotes} [FOTO:${photoUrl}]`
      : `[FOTO:${photoUrl}]`
  }

  // Marcar como visitado
  const { error } = await supabase
    .from('manifest_stops')
    .update({
      status: 'visited',
      visited_at: new Date().toISOString(),
      notes: updatedNotes || null,
    })
    .eq('id', stopId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/driver/route')
  return { success: true }
}

/**
 * Pula uma parada com motivo obrigatório.
 * O motivo é salvo no campo notes da manifest_stop.
 */
export async function skipStop(
  stopId: string,
  reason: string,
): Promise<{ success: boolean; error?: string }> {
  if (!reason.trim()) {
    return { success: false, error: 'Motivo é obrigatório para pular uma parada' }
  }

  const { profile } = await requireRole(['driver'])
  const supabase = createAdminClient()

  // Verificar ownership do stop
  const { data: stop } = await supabase
    .from('manifest_stops')
    .select('manifest_id, notes, manifest:daily_manifests(driver_id)')
    .eq('id', stopId)
    .single()

  if (!stop || (stop.manifest as unknown as { driver_id: string })?.driver_id !== profile.id) {
    return { success: false, error: 'Parada não pertence a um romaneio seu' }
  }

  // Build notes with skip reason
  const existingNotes = stop.notes || ''
  const skipNote = `[PULADO] ${reason.trim()}`
  const updatedNotes = existingNotes ? `${existingNotes} | ${skipNote}` : skipNote

  const { error } = await supabase
    .from('manifest_stops')
    .update({
      status: 'skipped',
      notes: updatedNotes,
    })
    .eq('id', stopId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/driver/route')
  return { success: true }
}

export async function completeManifest(
  manifestId: string,
): Promise<{ success: boolean; error?: string }> {
  const { profile } = await requireRole(['driver'])
  const supabase = createAdminClient()

  const { data: manifest } = await supabase
    .from('daily_manifests')
    .select('id, driver_id, status')
    .eq('id', manifestId)
    .single()

  if (!manifest || manifest.driver_id !== profile.id) {
    return { success: false, error: 'Romaneio não pertence a você' }
  }

  if (manifest.status === 'completed') {
    return { success: false, error: 'Romaneio já concluído' }
  }

  const { error } = await supabase
    .from('daily_manifests')
    .update({ status: 'completed' })
    .eq('id', manifestId)
    .eq('driver_id', profile.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/driver/route')
  return { success: true }
}
