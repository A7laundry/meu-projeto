'use client'

import { useState, useTransition } from 'react'
import { StoreManifestCard } from '@/components/domain/store/store-manifest-card'
import { generateManifest } from '@/actions/manifests/crud'
import { Plus } from 'lucide-react'
import type { DailyManifest } from '@/types/manifest'
import type { LogisticsRoute } from '@/types/logistics'
import { ROUTE_SHIFT_LABELS } from '@/types/logistics'

interface ColetasPageClientProps {
  manifests: DailyManifest[]
  routes: LogisticsRoute[]
  unitId: string
  date: string
}

type ShiftFilter = 'all' | 'morning' | 'afternoon' | 'evening'

const SHIFT_FILTERS: { value: ShiftFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'morning', label: 'Manhã' },
  { value: 'afternoon', label: 'Tarde' },
  { value: 'evening', label: 'Noite' },
]

export function ColetasPageClient({ manifests, routes, unitId, date }: ColetasPageClientProps) {
  const [shiftFilter, setShiftFilter] = useState<ShiftFilter>('all')
  const [isPending, startTransition] = useTransition()

  const filteredManifests = shiftFilter === 'all'
    ? manifests
    : manifests.filter(m => m.route_shift === shiftFilter)

  // Rotas ativas sem romaneio para hoje
  const manifestRouteIds = new Set(manifests.map(m => m.route_id))
  const routesWithoutManifest = routes.filter(r => r.active && !manifestRouteIds.has(r.id))

  function handleGenerate(routeId: string) {
    startTransition(async () => {
      await generateManifest(unitId, routeId, date)
    })
  }

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div>
        <p
          className="text-[10px] uppercase tracking-widest font-semibold mb-1"
          style={{ color: 'rgba(52,211,153,0.40)' }}
        >
          Coletas & Entregas
        </p>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white tracking-tight">
            {new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h1>
        </div>
      </div>

      {/* Shift filter pills */}
      <div className="flex gap-2">
        {SHIFT_FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setShiftFilter(value)}
            className="px-4 py-2 rounded-lg text-xs font-semibold transition-all"
            style={shiftFilter === value ? {
              background: 'rgba(52,211,153,0.12)',
              border: '1px solid rgba(52,211,153,0.25)',
              color: '#34d399',
            } : {
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.45)',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Manifest cards */}
      {filteredManifests.length > 0 ? (
        <div className="space-y-4">
          {filteredManifests.map(manifest => (
            <StoreManifestCard key={manifest.id} manifest={manifest} unitId={unitId} />
          ))}
        </div>
      ) : (
        <div
          className="rounded-xl p-8 text-center"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-sm text-white/30">
            {shiftFilter === 'all'
              ? 'Nenhum romaneio gerado para hoje'
              : `Nenhum romaneio para o turno da ${SHIFT_FILTERS.find(f => f.value === shiftFilter)?.label}`}
          </p>
        </div>
      )}

      {/* Routes without manifest */}
      {routesWithoutManifest.length > 0 && (
        <div>
          <p className="section-title mb-3" style={{ color: 'rgba(52,211,153,0.40)' }}>
            Rotas sem romaneio hoje
          </p>
          <div className="space-y-2">
            {routesWithoutManifest.map(route => (
              <div
                key={route.id}
                className="flex items-center justify-between px-4 py-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div>
                  <p className="text-sm font-medium text-white/70">{route.name}</p>
                  <p className="text-[11px] text-white/30">
                    {ROUTE_SHIFT_LABELS[route.shift]} · {route.stops?.length ?? 0} paradas
                    {route.driver_name && ` · ${route.driver_name}`}
                  </p>
                </div>
                <button
                  onClick={() => handleGenerate(route.id)}
                  disabled={isPending}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-40"
                  style={{
                    background: 'rgba(52,211,153,0.10)',
                    border: '1px solid rgba(52,211,153,0.20)',
                    color: '#34d399',
                  }}
                >
                  <Plus size={14} />
                  Gerar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
