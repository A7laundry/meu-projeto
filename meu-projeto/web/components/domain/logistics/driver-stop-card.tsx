'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { updateStopStatus } from '@/actions/manifests/crud'
import type { ManifestStop } from '@/types/manifest'

interface DriverStopCardProps {
  stop: ManifestStop
  unitId: string
  index: number
}

export function DriverStopCard({ stop, unitId, index }: DriverStopCardProps) {
  const [isPending, startTransition] = useTransition()

  function handle(status: 'visited' | 'skipped') {
    startTransition(async () => {
      await updateStopStatus(stop.id, unitId, status)
    })
  }

  const isDone = stop.status !== 'pending'

  return (
    <div
      className={`rounded-xl border p-4 space-y-3 transition-opacity ${
        stop.status === 'visited'
          ? 'bg-green-50 border-green-300'
          : stop.status === 'skipped'
            ? 'bg-gray-50 border-gray-200 opacity-60'
            : 'bg-white border-gray-200 shadow-sm'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-900 leading-tight">
            {stop.client_name ?? 'Cliente'}
          </p>
          {stop.client_address && (
            <p className="text-sm text-gray-500 mt-0.5">{stop.client_address}</p>
          )}
        </div>
        {isDone && (
          <span
            className={`text-sm font-medium shrink-0 ${
              stop.status === 'visited' ? 'text-green-600' : 'text-gray-400'
            }`}
          >
            {stop.status === 'visited' ? '✓' : '—'}
          </span>
        )}
      </div>

      {!isDone && (
        <div className="flex gap-2 pt-1">
          <Button
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            disabled={isPending}
            onClick={() => handle('visited')}
          >
            Visitei ✓
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            disabled={isPending}
            onClick={() => handle('skipped')}
          >
            Pular
          </Button>
        </div>
      )}
    </div>
  )
}
