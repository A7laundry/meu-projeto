'use client'

import { useState, useTransition } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { addRouteStop, removeRouteStop, toggleRouteActive } from '@/actions/routes/crud'
import { RouteFormDialog } from '@/components/domain/logistics/route-form-dialog'
import {
  ROUTE_SHIFT_LABELS,
  WEEKDAY_LABELS,
  type Client,
  type LogisticsRoute,
} from '@/types/logistics'

interface RouteListProps {
  unitId: string
  initialRoutes: LogisticsRoute[]
  activeClients: Client[]
}

export function RouteList({ unitId, initialRoutes, activeClients }: RouteListProps) {
  const [isPending, startTransition] = useTransition()
  const [addingClientFor, setAddingClientFor] = useState<string | null>(null)
  const [selectedClientId, setSelectedClientId] = useState<string>('')

  function handleToggle(route: LogisticsRoute) {
    startTransition(async () => {
      await toggleRouteActive(route.id, unitId, !route.active)
    })
  }

  function handleAddStop(routeId: string) {
    if (!selectedClientId) return
    startTransition(async () => {
      await addRouteStop(routeId, unitId, selectedClientId)
      setAddingClientFor(null)
      setSelectedClientId('')
    })
  }

  function handleRemoveStop(stopId: string) {
    startTransition(async () => {
      await removeRouteStop(stopId, unitId)
    })
  }

  function weekdaysLabel(days: number[]) {
    if (days.length === 7) return 'Todos os dias'
    if (days.length === 0) return 'Nenhum'
    return days.map((d) => WEEKDAY_LABELS[d]).join(', ')
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <RouteFormDialog unitId={unitId} />
      </div>

      {initialRoutes.length === 0 && (
        <p className="text-center text-gray-400 py-12">Nenhuma rota cadastrada.</p>
      )}

      {initialRoutes.map((route) => {
        const stopsInRoute = (route.stops ?? []).map((s) => s.client_id)
        const availableClients = activeClients.filter(
          (c) => !stopsInRoute.includes(c.id),
        )

        return (
          <div
            key={route.id}
            className={`rounded-lg border bg-white p-4 space-y-3 ${
              !route.active ? 'opacity-50' : ''
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-gray-900">{route.name}</h3>
                  <Badge variant="outline">
                    {ROUTE_SHIFT_LABELS[route.shift]}
                  </Badge>
                  <Badge variant={route.active ? 'default' : 'secondary'}>
                    {route.active ? 'Ativa' : 'Inativa'}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {weekdaysLabel(route.weekdays)}
                  {route.driver_name && ` · Motorista: ${route.driver_name}`}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <RouteFormDialog
                  unitId={unitId}
                  route={route}
                  trigger={
                    <Button variant="ghost" size="sm">
                      Editar
                    </Button>
                  }
                />
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isPending}
                  onClick={() => handleToggle(route)}
                >
                  {route.active ? 'Desativar' : 'Ativar'}
                </Button>
              </div>
            </div>

            {/* Paradas */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Paradas ({(route.stops ?? []).length})
              </p>
              {(route.stops ?? []).length === 0 && (
                <p className="text-sm text-gray-400">Nenhuma parada adicionada.</p>
              )}
              {(route.stops ?? []).map((stop, idx) => (
                <div
                  key={stop.id}
                  className="flex items-center justify-between rounded bg-gray-50 px-3 py-1.5"
                >
                  <span className="text-sm text-gray-700">
                    <span className="font-mono text-gray-400 mr-2">{idx + 1}.</span>
                    {stop.client_name ?? stop.client_id}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleRemoveStop(stop.id)}
                    className="text-red-500 hover:text-red-700 h-6 px-2 text-xs"
                  >
                    Remover
                  </Button>
                </div>
              ))}
            </div>

            {/* Adicionar parada */}
            {route.active && (
              <div className="flex items-center gap-2">
                {addingClientFor === route.id ? (
                  <>
                    <Select
                      value={selectedClientId}
                      onValueChange={setSelectedClientId}
                    >
                      <SelectTrigger className="w-56 h-8 text-sm">
                        <SelectValue placeholder="Selecionar cliente..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableClients.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      disabled={!selectedClientId || isPending}
                      onClick={() => handleAddStop(route.id)}
                    >
                      Adicionar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setAddingClientFor(null)
                        setSelectedClientId('')
                      }}
                    >
                      Cancelar
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={availableClients.length === 0}
                    onClick={() => setAddingClientFor(route.id)}
                  >
                    + Adicionar parada
                  </Button>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
