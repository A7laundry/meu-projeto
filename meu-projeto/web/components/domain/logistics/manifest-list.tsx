'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { generateManifest } from '@/actions/manifests/crud'
import { ManifestCard } from '@/components/domain/logistics/manifest-card'
import { ROUTE_SHIFT_LABELS, type LogisticsRoute } from '@/types/logistics'
import type { DailyManifest } from '@/types/manifest'

interface ManifestListProps {
  unitId: string
  date: string
  initialManifests: DailyManifest[]
  todayRoutes: LogisticsRoute[]
}

export function ManifestList({
  unitId,
  date,
  initialManifests,
  todayRoutes,
}: ManifestListProps) {
  const [shiftFilter, setShiftFilter] = useState('all')
  const [generatingRouteId, setGeneratingRouteId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const existingRouteIds = initialManifests.map((m) => m.route_id)
  const pendingRoutes = todayRoutes.filter((r) => !existingRouteIds.includes(r.id))

  const filtered =
    shiftFilter === 'all'
      ? initialManifests
      : initialManifests.filter((m) => m.route_shift === shiftFilter)

  function handleGenerate(routeId: string) {
    setError(null)
    setGeneratingRouteId(routeId)
    startTransition(async () => {
      const result = await generateManifest(unitId, routeId, date)
      if (!result.success) setError(result.error)
      setGeneratingRouteId(null)
    })
  }

  function handlePrint() {
    window.print()
  }

  return (
    <div className="space-y-4">
      {/* Barra de filtros e ações */}
      <div className="flex flex-wrap items-center gap-3 print:hidden">
        <Select value={shiftFilter} onValueChange={setShiftFilter}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos turnos</SelectItem>
            {(Object.keys(ROUTE_SHIFT_LABELS) as Array<keyof typeof ROUTE_SHIFT_LABELS>).map(
              (key) => (
                <SelectItem key={key} value={key}>
                  {ROUTE_SHIFT_LABELS[key]}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={handlePrint}>
          Imprimir
        </Button>
      </div>

      {/* Gerar romaneios pendentes */}
      {pendingRoutes.length > 0 && (
        <div className="rounded-lg border border-dashed border-white/10 bg-[rgba(255,255,255,0.03)] p-4 space-y-2 print:hidden">
          <p className="text-sm font-medium text-gray-600">
            Rotas sem romaneio hoje:
          </p>
          <div className="flex flex-wrap gap-2">
            {pendingRoutes.map((route) => (
              <Button
                key={route.id}
                variant="outline"
                size="sm"
                disabled={isPending && generatingRouteId === route.id}
                onClick={() => handleGenerate(route.id)}
              >
                {isPending && generatingRouteId === route.id
                  ? 'Gerando...'
                  : `+ ${route.name} (${ROUTE_SHIFT_LABELS[route.shift]})`}
              </Button>
            ))}
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      )}

      {/* Lista de romaneios */}
      {filtered.length === 0 && pendingRoutes.length === 0 && (
        <p className="text-center text-gray-400 py-12">Nenhum romaneio para hoje.</p>
      )}
      {filtered.length === 0 && pendingRoutes.length > 0 && (
        <p className="text-center text-gray-400 py-8">
          Nenhum romaneio gerado ainda. Clique em uma rota acima para gerar.
        </p>
      )}

      <div className="space-y-4">
        {filtered.map((manifest) => (
          <ManifestCard key={manifest.id} manifest={manifest} unitId={unitId} />
        ))}
      </div>
    </div>
  )
}
