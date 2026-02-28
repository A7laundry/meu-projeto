'use client'

import { useState, useRef, useTransition } from 'react'
import { Camera, Navigation, SkipForward, X, Check, Loader2, ImageIcon } from 'lucide-react'
import { markStopVisitedWithEvidence, skipStop } from '@/actions/manifests/driver'
import type { DailyManifest, ManifestStop } from '@/types/manifest'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SHIFT_LABELS: Record<string, string> = {
  morning: 'Manha',
  afternoon: 'Tarde',
  night: 'Noite',
}

const STOP_STATUS_STYLE: Record<string, { bg: string; border: string; color: string; label: string }> = {
  pending: { bg: 'rgba(251,191,36,0.10)', border: 'rgba(251,191,36,0.25)', color: '#fbbf24', label: 'Pendente' },
  visited: { bg: 'rgba(52,211,153,0.10)', border: 'rgba(52,211,153,0.25)', color: '#34d399', label: 'Visitado' },
  skipped: { bg: 'rgba(248,113,113,0.10)', border: 'rgba(248,113,113,0.25)', color: '#f87171', label: 'Pulado' },
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface RouteClientProps {
  firstName: string
  today: string
  manifests: DailyManifest[]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function openNavigation(address: string) {
  const encoded = encodeURIComponent(address)
  window.open(`https://www.google.com/maps/search/?api=1&query=${encoded}`, '_blank')
}

// ---------------------------------------------------------------------------
// StopCard Component
// ---------------------------------------------------------------------------

function StopCard({ stop, idx, totalStops }: { stop: ManifestStop; idx: number; totalStops: number }) {
  const style = STOP_STATUS_STYLE[stop.status] ?? STOP_STATUS_STYLE.pending
  const [isPending, startTransition] = useTransition()
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [showSkipForm, setShowSkipForm] = useState(false)
  const [skipReason, setSkipReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setPhotoFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => {
      setPhotoPreview(ev.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const removePhoto = () => {
    setPhotoPreview(null)
    setPhotoFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleVisit = () => {
    setError(null)
    startTransition(async () => {
      const formData = new FormData()
      if (photoFile) {
        formData.append('photo', photoFile)
      }
      const result = await markStopVisitedWithEvidence(stop.id, formData)
      if (!result.success) {
        setError(result.error ?? 'Erro ao registrar visita')
      }
    })
  }

  const handleSkip = () => {
    if (!skipReason.trim()) {
      setError('Informe o motivo para pular')
      return
    }
    setError(null)
    startTransition(async () => {
      const result = await skipStop(stop.id, skipReason)
      if (!result.success) {
        setError(result.error ?? 'Erro ao pular parada')
      } else {
        setShowSkipForm(false)
        setSkipReason('')
      }
    })
  }

  const navigationAddress = stop.client_address_full || stop.client_address

  return (
    <div
      className="px-4 py-3"
      style={{ borderBottom: idx < totalStops - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
    >
      <div className="flex items-start gap-3">
        {/* Stop number badge */}
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
          style={{
            background: style.bg,
            border: `1px solid ${style.border}`,
            color: style.color,
          }}
        >
          {stop.status === 'visited' ? <Check size={14} /> : stop.status === 'skipped' ? <X size={14} /> : idx + 1}
        </div>

        {/* Stop data */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white/80 truncate">
            {stop.client_name ?? 'Cliente desconhecido'}
          </p>
          {stop.client_address && (
            <p className="text-xs text-white/30 truncate mt-0.5">
              {stop.client_address}
            </p>
          )}
          <div className="flex items-center gap-2 mt-1">
            <span
              className="inline-block text-[10px] px-1.5 py-0.5 rounded"
              style={{ background: style.bg, color: style.color, border: `1px solid ${style.border}` }}
            >
              {style.label}
            </span>
            {/* Show photo indicator for visited stops with evidence */}
            {stop.status === 'visited' && stop.photo_url && (
              <span
                className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded"
                style={{
                  background: 'rgba(96,165,250,0.10)',
                  color: '#60a5fa',
                  border: '1px solid rgba(96,165,250,0.25)',
                }}
              >
                <ImageIcon size={10} />
                Foto
              </span>
            )}
          </div>
        </div>

        {/* Action buttons for pending stops */}
        {stop.status === 'pending' && (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Navigate button */}
            {navigationAddress && (
              <button
                type="button"
                onClick={() => openNavigation(navigationAddress)}
                className="p-2 rounded-lg transition-all"
                style={{
                  background: 'rgba(96,165,250,0.10)',
                  border: '1px solid rgba(96,165,250,0.20)',
                  color: '#60a5fa',
                }}
                title="Navegar"
              >
                <Navigation size={16} />
              </button>
            )}

            {/* Camera button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-lg transition-all"
              style={{
                background: photoPreview
                  ? 'rgba(52,211,153,0.14)'
                  : 'rgba(255,255,255,0.05)',
                border: photoPreview
                  ? '1px solid rgba(52,211,153,0.30)'
                  : '1px solid rgba(255,255,255,0.10)',
                color: photoPreview ? '#34d399' : 'rgba(255,255,255,0.45)',
              }}
              title="Tirar foto"
            >
              <Camera size={16} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoCapture}
              className="hidden"
            />

            {/* Visit button */}
            <button
              type="button"
              onClick={handleVisit}
              disabled={isPending}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
              style={{
                background: 'rgba(59,130,246,0.14)',
                color: '#60a5fa',
                border: '1px solid rgba(59,130,246,0.28)',
              }}
            >
              {isPending ? <Loader2 size={14} className="animate-spin" /> : 'Visitar'}
            </button>
          </div>
        )}
      </div>

      {/* Photo preview */}
      {stop.status === 'pending' && photoPreview && (
        <div className="mt-2 ml-10 flex items-center gap-2">
          <div
            className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0"
            style={{ border: '2px solid rgba(59,130,246,0.30)' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoPreview}
              alt="Evidencia de entrega"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={removePhoto}
              className="absolute top-0 right-0 p-0.5 rounded-bl-md"
              style={{ background: 'rgba(0,0,0,0.7)' }}
            >
              <X size={12} className="text-white/70" />
            </button>
          </div>
          <span className="text-[11px] text-white/35">Foto capturada</span>
        </div>
      )}

      {/* Skip button & form for pending stops */}
      {stop.status === 'pending' && (
        <div className="mt-2 ml-10">
          {!showSkipForm ? (
            <button
              type="button"
              onClick={() => setShowSkipForm(true)}
              className="flex items-center gap-1 text-[11px] text-white/25 hover:text-white/45 transition-colors"
            >
              <SkipForward size={12} />
              Pular parada
            </button>
          ) : (
            <div
              className="rounded-lg p-3 space-y-2"
              style={{
                background: 'rgba(248,113,113,0.05)',
                border: '1px solid rgba(248,113,113,0.15)',
              }}
            >
              <p className="text-[11px] text-white/40 font-medium">Motivo para pular:</p>
              <input
                type="text"
                value={skipReason}
                onChange={(e) => setSkipReason(e.target.value)}
                placeholder="Ex: Cliente ausente, endereco errado..."
                className="w-full text-xs rounded-md px-2.5 py-1.5 outline-none"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  color: '#fff',
                }}
                autoFocus
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSkip}
                  disabled={isPending || !skipReason.trim()}
                  className="text-[11px] font-semibold px-3 py-1 rounded-md transition-all disabled:opacity-40"
                  style={{
                    background: 'rgba(248,113,113,0.14)',
                    color: '#f87171',
                    border: '1px solid rgba(248,113,113,0.28)',
                  }}
                >
                  {isPending ? <Loader2 size={12} className="animate-spin" /> : 'Confirmar'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSkipForm(false)
                    setSkipReason('')
                    setError(null)
                  }}
                  className="text-[11px] text-white/30 hover:text-white/50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Skip reason display for skipped stops */}
      {stop.status === 'skipped' && stop.notes && (
        <div className="mt-1.5 ml-10">
          <p className="text-[11px] text-white/25 italic">
            {stop.notes.replace(/\[FOTO:.*?\]/g, '').trim()}
          </p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mt-2 ml-10">
          <p className="text-[11px] text-red-400">{error}</p>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main RouteClient Component
// ---------------------------------------------------------------------------

export default function RouteClient({ firstName, today, manifests }: RouteClientProps) {
  const totalStops = manifests.reduce((acc, m) => acc + (m.stops?.length ?? 0), 0)
  const visitedStops = manifests.reduce(
    (acc, m) => acc + (m.stops?.filter((s) => s.status === 'visited').length ?? 0),
    0,
  )
  const skippedStops = manifests.reduce(
    (acc, m) => acc + (m.stops?.filter((s) => s.status === 'skipped').length ?? 0),
    0,
  )
  const progress = totalStops > 0 ? Math.round(((visitedStops + skippedStops) / totalStops) * 100) : 0

  return (
    <div className="p-4 space-y-4">
      {/* Greeting */}
      <div className="pt-1">
        <p className="text-[10px] uppercase tracking-widest text-[#60a5fa]/40 font-semibold mb-1 capitalize">{today}</p>
        <h1 className="text-xl font-bold text-white">Ola, {firstName}</h1>
        <p className="text-sm text-white/40 mt-0.5">
          {visitedStops} de {totalStops} paradas concluidas
          {skippedStops > 0 && ` (${skippedStops} pulada${skippedStops > 1 ? 's' : ''})`}
        </p>
      </div>

      {/* Progress card */}
      <div
        className="rounded-2xl p-4"
        style={{
          background: 'linear-gradient(135deg, rgba(59,130,246,0.07) 0%, rgba(5,5,8,0.9) 100%)',
          border: '1px solid rgba(59,130,246,0.12)',
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-white/55">Progresso do dia</span>
          <span className="text-lg font-bold tabular-nums" style={{ color: '#60a5fa' }}>{progress}%</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${progress}%`,
              background: progress === 100
                ? 'linear-gradient(90deg, #34d399, #10b981)'
                : 'linear-gradient(90deg, #60a5fa, #2563eb)',
            }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] text-white/25">{visitedStops} visitadas</span>
          <span className="text-[10px] text-white/25">{totalStops - visitedStops - skippedStops} restantes</span>
        </div>
      </div>

      {/* Manifests */}
      {manifests.map((manifest) => {
        const stops = manifest.stops ?? []
        const visitedCount = stops.filter((s) => s.status === 'visited').length
        const isCompleted = manifest.status === 'completed'
        const isInProgress = manifest.status === 'in_progress'

        return (
          <div
            key={manifest.id}
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            {/* Manifest header */}
            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
            >
              <div>
                <p className="text-sm font-semibold text-white/85">
                  {manifest.route_name ?? 'Rota sem nome'}
                </p>
                <p className="text-xs text-white/30 mt-0.5">
                  Turno {SHIFT_LABELS[manifest.route_shift ?? ''] ?? manifest.route_shift ?? '\u2014'}
                  {' \u00B7 '}
                  {visitedCount}/{stops.length} paradas
                </p>
              </div>
              <span
                className="text-[11px] px-2.5 py-1 rounded-full font-medium"
                style={
                  isCompleted
                    ? { background: 'rgba(52,211,153,0.12)', color: '#34d399', border: '1px solid rgba(52,211,153,0.25)' }
                    : isInProgress
                      ? { background: 'rgba(96,165,250,0.12)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.25)' }
                      : { background: 'rgba(251,191,36,0.10)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.22)' }
                }
              >
                {isCompleted ? 'Concluido' : isInProgress ? 'Em andamento' : 'Pendente'}
              </span>
            </div>

            {/* Stops list */}
            <div>
              {stops.map((stop: ManifestStop, idx: number) => (
                <StopCard key={stop.id} stop={stop} idx={idx} totalStops={stops.length} />
              ))}

              {stops.length === 0 && (
                <p className="px-4 py-4 text-sm text-white/25 text-center">
                  Nenhuma parada neste romaneio.
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
