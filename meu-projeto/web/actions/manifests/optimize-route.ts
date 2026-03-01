'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { requireUnitAccess } from '@/lib/auth/guards'
import { revalidatePath } from 'next/cache'
import type { ActionResult } from '@/lib/auth/action-result'

interface OptimizedStop {
  stopId: string
  newPosition: number
}

/**
 * Otimiza a sequência de paradas de um romaneio usando Google Routes API.
 * Reordena as paradas pela distância mais curta entre elas.
 * Requer GOOGLE_ROUTES_API_KEY no .env.
 */
export async function optimizeManifestRoute(
  manifestId: string,
  unitId: string
): Promise<ActionResult<OptimizedStop[]>> {
  await requireUnitAccess(unitId, ['unit_manager', 'director'])

  const apiKey = process.env.GOOGLE_ROUTES_API_KEY
  if (!apiKey) {
    return { success: false, error: 'GOOGLE_ROUTES_API_KEY não configurada. Configure no painel de variáveis de ambiente.' }
  }

  const supabase = createAdminClient()

  // Buscar paradas com endereços
  const { data: stops } = await supabase
    .from('manifest_stops')
    .select(`
      id, position, status,
      client:clients(
        address_street, address_number, address_neighborhood, address_city, address_state
      )
    `)
    .eq('manifest_id', manifestId)
    .eq('status', 'pending')
    .order('position')

  if (!stops || stops.length < 2) {
    return { success: false, error: 'Mínimo de 2 paradas pendentes para otimizar.' }
  }

  // Montar endereços completos
  const addresses = stops.map((s) => {
    const c = s.client as unknown as {
      address_street: string | null
      address_number: string | null
      address_neighborhood: string | null
      address_city: string | null
      address_state: string | null
    } | null
    return [c?.address_street, c?.address_number, c?.address_neighborhood, c?.address_city, c?.address_state]
      .filter(Boolean)
      .join(', ')
  })

  // Chamar Google Routes API — Compute Routes com otimização
  // Usamos a Directions API (mais simples e disponível)
  const waypoints = addresses.slice(1, -1).map((a) => `via:${encodeURIComponent(a)}`).join('|')
  const origin = encodeURIComponent(addresses[0])
  const destination = encodeURIComponent(addresses[addresses.length - 1])

  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&waypoints=optimize:true${waypoints ? `|${waypoints}` : ''}&key=${apiKey}`

  try {
    const response = await fetch(url)
    const data = await response.json()

    if (data.status !== 'OK' || !data.routes?.[0]) {
      return { success: false, error: `Google API retornou: ${data.status ?? 'Erro desconhecido'}` }
    }

    const optimizedOrder = data.routes[0].waypoint_order as number[] | undefined

    // Se não houver waypoint_order (apenas 2 stops), manter ordem original
    if (!optimizedOrder || optimizedOrder.length === 0) {
      return { success: true, data: stops.map((s, i) => ({ stopId: s.id, newPosition: i + 1 })) }
    }

    // Reconstruir a ordem: primeiro stop (origin) fica na posição 1
    // os waypoints intermediários são reordenados conforme waypoint_order
    // último stop (destination) fica no final
    const middleStops = stops.slice(1, -1)
    const reordered: OptimizedStop[] = [
      { stopId: stops[0].id, newPosition: 1 },
      ...optimizedOrder.map((originalIdx, newIdx) => ({
        stopId: middleStops[originalIdx].id,
        newPosition: newIdx + 2,
      })),
      { stopId: stops[stops.length - 1].id, newPosition: stops.length },
    ]

    // Atualizar posições no banco
    for (const item of reordered) {
      await supabase
        .from('manifest_stops')
        .update({ position: item.newPosition })
        .eq('id', item.stopId)
    }

    revalidatePath(`/unit/${unitId}/manifests`)
    return { success: true, data: reordered }
  } catch (err) {
    return { success: false, error: `Erro ao chamar Google Routes: ${err instanceof Error ? err.message : 'Erro desconhecido'}` }
  }
}
