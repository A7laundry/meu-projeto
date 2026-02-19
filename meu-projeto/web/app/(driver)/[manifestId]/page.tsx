'use client'

import { useEffect, useState, useTransition } from 'react'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { updateManifestStatus } from '@/actions/manifests/crud'
import { DriverStopCard } from '@/components/domain/logistics/driver-stop-card'
import { ROUTE_SHIFT_LABELS } from '@/types/logistics'
import { MANIFEST_STATUS_LABELS, type DailyManifest } from '@/types/manifest'
import { createClient } from '@/lib/supabase/client'

export default function DriverManifestPage({
  params,
}: {
  params: Promise<{ manifestId: string }>
}) {
  const [manifest, setManifest] = useState<DailyManifest | null | undefined>(undefined)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    let manifestId: string
    params.then((p) => {
      manifestId = p.manifestId
      loadManifest(manifestId)
    })

    async function loadManifest(id: string) {
      const supabase = createClient()
      const { data } = await supabase
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
        .eq('id', id)
        .single()

      if (!data) {
        setManifest(null)
        return
      }

      setManifest({
        ...data,
        route_name: data.route?.name ?? null,
        route_shift: data.route?.shift ?? null,
        driver_name: data.driver?.name ?? null,
        stops: (data.stops ?? [])
          .sort((a: { position: number }, b: { position: number }) => a.position - b.position)
          .map((s: {
            id: string
            position: number
            status: string
            notes: string | null
            visited_at: string | null
            client_id: string
            client: { name: string; address_street: string | null; address_number: string | null; address_city: string | null } | null
            created_at?: string
          }) => ({
            id: s.id,
            manifest_id: id,
            client_id: s.client_id,
            client_name: s.client?.name ?? null,
            client_address:
              [s.client?.address_street, s.client?.address_number, s.client?.address_city]
                .filter(Boolean)
                .join(', ') || null,
            position: s.position,
            status: s.status,
            notes: s.notes,
            visited_at: s.visited_at,
            created_at: s.created_at ?? '',
          })),
      } as DailyManifest)
    }
  }, [params])

  if (manifest === undefined) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        Carregando...
      </div>
    )
  }

  if (manifest === null) {
    notFound()
  }

  const stops = manifest.stops ?? []
  const treatedCount = stops.filter((s) => s.status !== 'pending').length
  const visitedCount = stops.filter((s) => s.status === 'visited').length
  const allTreated = stops.length > 0 && treatedCount === stops.length
  const progress = stops.length > 0 ? Math.round((treatedCount / stops.length) * 100) : 0

  function handleComplete() {
    if (!manifest) return
    startTransition(async () => {
      await updateManifestStatus(manifest.id, manifest.unit_id, 'completed')
    })
  }

  return (
    <div className="space-y-4">
      {/* Cabeçalho */}
      <div className="rounded-xl border bg-blue-50 border-blue-200 p-4">
        <h1 className="text-xl font-bold text-blue-900">{manifest.route_name}</h1>
        <p className="text-sm text-blue-700 mt-1">
          {ROUTE_SHIFT_LABELS[manifest.route_shift as keyof typeof ROUTE_SHIFT_LABELS] ??
            manifest.route_shift}
          {manifest.driver_name && ` · ${manifest.driver_name}`}
        </p>
        <div className="mt-3">
          <div className="flex items-center justify-between text-sm text-blue-800 mb-1">
            <span>
              {visitedCount} de {stops.length} visitadas
            </span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-blue-200 overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <p className="text-xs text-blue-600 mt-2">
          Status: {MANIFEST_STATUS_LABELS[manifest.status]}
        </p>
      </div>

      {/* Paradas */}
      <div className="space-y-3">
        {stops.map((stop, idx) => (
          <DriverStopCard
            key={stop.id}
            stop={stop}
            unitId={manifest.unit_id}
            index={idx}
          />
        ))}
      </div>

      {/* Concluir rota */}
      {allTreated && manifest.status !== 'completed' && (
        <Button
          className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-base"
          disabled={isPending}
          onClick={handleComplete}
        >
          Concluir Rota ✓
        </Button>
      )}

      {manifest.status === 'completed' && (
        <div className="rounded-xl border border-green-300 bg-green-50 p-4 text-center">
          <p className="text-green-700 font-semibold text-lg">Rota concluída! ✓</p>
        </div>
      )}
    </div>
  )
}
