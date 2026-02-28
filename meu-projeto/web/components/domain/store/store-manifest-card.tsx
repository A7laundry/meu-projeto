'use client'

import { useTransition } from 'react'
import { MapPin, CheckCircle, SkipForward, Play, Check } from 'lucide-react'
import { updateManifestStatus, updateStopStatus } from '@/actions/manifests/crud'
import { MANIFEST_STATUS_LABELS } from '@/types/manifest'
import type { DailyManifest, ManifestStop } from '@/types/manifest'
import { ROUTE_SHIFT_LABELS } from '@/types/logistics'

interface StoreManifestCardProps {
  manifest: DailyManifest
  unitId: string
}

const STATUS_STYLES: Record<string, { bg: string; border: string; color: string }> = {
  pending: { bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.20)', color: '#fbbf24' },
  in_progress: { bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.20)', color: '#60a5fa' },
  completed: { bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.20)', color: '#34d399' },
}

export function StoreManifestCard({ manifest, unitId }: StoreManifestCardProps) {
  const [isPending, startTransition] = useTransition()
  const stops = manifest.stops ?? []
  const visitedCount = stops.filter(s => s.status === 'visited').length
  const totalStops = stops.length
  const statusStyle = STATUS_STYLES[manifest.status] ?? STATUS_STYLES.pending
  const shiftLabel = manifest.route_shift
    ? ROUTE_SHIFT_LABELS[manifest.route_shift as keyof typeof ROUTE_SHIFT_LABELS] ?? manifest.route_shift
    : ''

  function handleStartRoute() {
    startTransition(async () => {
      await updateManifestStatus(manifest.id, unitId, 'in_progress')
    })
  }

  function handleCompleteRoute() {
    startTransition(async () => {
      await updateManifestStatus(manifest.id, unitId, 'completed')
    })
  }

  function handleStopAction(stop: ManifestStop, action: 'visited' | 'skipped') {
    startTransition(async () => {
      await updateStopStatus(stop.id, unitId, action)
    })
  }

  return (
    <div
      className="rounded-xl overflow-hidden transition-all"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${statusStyle.border}`,
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div>
          <p className="text-sm font-semibold text-white/85">
            {manifest.route_name ?? 'Rota'}
            {shiftLabel && (
              <span className="text-white/30 font-normal ml-2 text-xs">({shiftLabel})</span>
            )}
          </p>
          <p className="text-[11px] text-white/40">
            {manifest.driver_name ? `Motorista: ${manifest.driver_name}` : 'Sem motorista'}
            {' · '}
            {visitedCount}/{totalStops} paradas
          </p>
        </div>
        <span
          className="text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider"
          style={{ background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}` }}
        >
          {MANIFEST_STATUS_LABELS[manifest.status]}
        </span>
      </div>

      {/* Stops */}
      {stops.length > 0 && (
        <div className="px-4 py-2">
          {stops.map((stop, idx) => (
            <div
              key={stop.id}
              className="flex items-center gap-3 py-2"
              style={idx < stops.length - 1 ? { borderBottom: '1px solid rgba(255,255,255,0.04)' } : {}}
            >
              <span className="text-xs text-white/25 w-5 text-center">{idx + 1}.</span>
              {stop.status === 'visited' ? (
                <CheckCircle size={14} style={{ color: '#34d399', flexShrink: 0 }} />
              ) : stop.status === 'skipped' ? (
                <SkipForward size={14} style={{ color: '#fbbf24', flexShrink: 0 }} />
              ) : (
                <MapPin size={14} style={{ color: 'rgba(255,255,255,0.25)', flexShrink: 0 }} />
              )}
              <div className="flex-1 min-w-0">
                <p
                  className="text-xs font-medium truncate"
                  style={{
                    color: stop.status === 'visited' ? '#34d399' : 'rgba(255,255,255,0.65)',
                    textDecoration: stop.status === 'skipped' ? 'line-through' : 'none',
                  }}
                >
                  {stop.client_name ?? 'Cliente'}
                </p>
                {stop.client_address && (
                  <p className="text-[10px] text-white/30 truncate">{stop.client_address}</p>
                )}
              </div>
              {stop.status === 'pending' && manifest.status === 'in_progress' && (
                <div className="flex gap-1">
                  <button
                    onClick={() => handleStopAction(stop, 'visited')}
                    disabled={isPending}
                    className="w-7 h-7 rounded flex items-center justify-center transition-all disabled:opacity-30"
                    style={{ background: 'rgba(52,211,153,0.12)', color: '#34d399' }}
                    title="Visitado"
                  >
                    <Check size={12} />
                  </button>
                  <button
                    onClick={() => handleStopAction(stop, 'skipped')}
                    disabled={isPending}
                    className="w-7 h-7 rounded flex items-center justify-center transition-all disabled:opacity-30"
                    style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24' }}
                    title="Pular"
                  >
                    <SkipForward size={12} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Action */}
      <div className="px-4 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        {manifest.status === 'pending' && (
          <button
            onClick={handleStartRoute}
            disabled={isPending}
            className="w-full py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 btn-emerald disabled:opacity-40"
          >
            <Play size={14} />
            Iniciar Rota
          </button>
        )}
        {manifest.status === 'in_progress' && visitedCount === totalStops && (
          <button
            onClick={handleCompleteRoute}
            disabled={isPending}
            className="w-full py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 btn-emerald disabled:opacity-40"
          >
            <CheckCircle size={14} />
            Concluir Rota
          </button>
        )}
        {manifest.status === 'in_progress' && visitedCount < totalStops && (
          <p className="text-[11px] text-white/30 text-center">
            {totalStops - visitedCount} parada{totalStops - visitedCount !== 1 ? 's' : ''} restante{totalStops - visitedCount !== 1 ? 's' : ''}
          </p>
        )}
        {manifest.status === 'completed' && (
          <p className="text-[11px] text-center" style={{ color: '#34d399' }}>
            Rota concluída ✓
          </p>
        )}
      </div>
    </div>
  )
}
