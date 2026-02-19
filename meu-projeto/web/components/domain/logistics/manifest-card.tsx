'use client'

import Link from 'next/link'
import { useTransition } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { updateManifestStatus, updateStopStatus } from '@/actions/manifests/crud'
import {
  MANIFEST_STATUS_LABELS,
  type DailyManifest,
  type ManifestStatus,
} from '@/types/manifest'
import { ROUTE_SHIFT_LABELS as SHIFT_LABELS } from '@/types/logistics'

const STATUS_COLORS: Record<ManifestStatus, string> = {
  pending: 'bg-gray-100 text-gray-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
}

interface ManifestCardProps {
  manifest: DailyManifest
  unitId: string
  onPrint?: () => void
}

export function ManifestCard({ manifest, unitId }: ManifestCardProps) {
  const [isPending, startTransition] = useTransition()

  function handleStatusChange(status: ManifestStatus) {
    startTransition(async () => {
      await updateManifestStatus(manifest.id, unitId, status)
    })
  }

  function handleStopStatus(stopId: string, status: 'visited' | 'skipped') {
    startTransition(async () => {
      await updateStopStatus(stopId, unitId, status)
    })
  }

  const stops = manifest.stops ?? []
  const visitedCount = stops.filter((s) => s.status === 'visited').length
  const progress = stops.length > 0 ? Math.round((visitedCount / stops.length) * 100) : 0

  return (
    <div className="rounded-lg border bg-white p-4 space-y-3 print:border-gray-400 print:shadow-none">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900">{manifest.route_name}</h3>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[manifest.status]}`}
            >
              {MANIFEST_STATUS_LABELS[manifest.status]}
            </span>
            <Badge variant="outline">
              {SHIFT_LABELS[manifest.route_shift as keyof typeof SHIFT_LABELS] ?? manifest.route_shift}
            </Badge>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            {manifest.driver_name ? `Motorista: ${manifest.driver_name}` : 'Sem motorista'}
            {stops.length > 0 && ` · ${visitedCount}/${stops.length} paradas (${progress}%)`}
          </p>
        </div>
        <div className="flex gap-2 print:hidden shrink-0">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/driver/${manifest.id}`} target="_blank">
              Ver (motorista)
            </Link>
          </Button>
          {manifest.status === 'pending' && (
            <Button
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() => handleStatusChange('in_progress')}
            >
              Iniciar
            </Button>
          )}
          {manifest.status === 'in_progress' && (
            <Button
              size="sm"
              disabled={isPending}
              onClick={() => handleStatusChange('completed')}
            >
              Concluir
            </Button>
          )}
        </div>
      </div>

      {/* Paradas */}
      {stops.length === 0 && (
        <p className="text-sm text-gray-400">Nenhuma parada nesta rota.</p>
      )}
      <div className="space-y-1.5">
        {stops.map((stop, idx) => (
          <div
            key={stop.id}
            className={`flex items-center justify-between rounded px-3 py-2 ${
              stop.status === 'visited'
                ? 'bg-green-50 border border-green-200'
                : stop.status === 'skipped'
                  ? 'bg-gray-50 border border-gray-200 opacity-60'
                  : 'bg-white border border-gray-100'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-mono text-xs text-gray-400 shrink-0">{idx + 1}.</span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {stop.client_name ?? stop.client_id}
                </p>
                {stop.client_address && (
                  <p className="text-xs text-gray-500 truncate">{stop.client_address}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 print:hidden shrink-0 ml-2">
              {stop.status === 'pending' && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleStopStatus(stop.id, 'visited')}
                    className="text-green-600 hover:text-green-800 h-7 px-2 text-xs"
                  >
                    Visitar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleStopStatus(stop.id, 'skipped')}
                    className="text-gray-400 hover:text-gray-600 h-7 px-2 text-xs"
                  >
                    Pular
                  </Button>
                </>
              )}
              {stop.status !== 'pending' && (
                <span
                  className={`text-xs font-medium ${
                    stop.status === 'visited' ? 'text-green-600' : 'text-gray-400'
                  }`}
                >
                  {stop.status === 'visited' ? '✓ Visitado' : '— Pulado'}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
