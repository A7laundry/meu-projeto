'use client'

import { useState, useCallback } from 'react'
import { format, differenceInMinutes } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { useQRScanner } from '@/hooks/use-qr-scanner'
import { useSectorQueue } from '@/hooks/use-sector-queue'
import { NetworkIndicator } from '@/components/layout/network-indicator'
import type { Order, OrderStatus, PieceType } from '@/types/order'

function getSlaStatus(promisedAt: string): {
  label: string
  color: string
  ring: string
  urgent: boolean
} {
  const now = new Date()
  const promised = new Date(promisedAt)
  const minutesLeft = differenceInMinutes(promised, now)

  if (minutesLeft < 0) {
    const overdue = Math.abs(minutesLeft)
    const h = Math.floor(overdue / 60)
    const m = overdue % 60
    return {
      label: `⚠ ${h > 0 ? `${h}h ` : ''}${m}min atrasada`,
      color: 'border-red-500 bg-red-950',
      ring: 'hover:border-red-400',
      urgent: true,
    }
  }
  if (minutesLeft <= 60) {
    return {
      label: `⏱ ${minutesLeft}min restantes`,
      color: 'border-yellow-500 bg-yellow-950/40',
      ring: 'hover:border-yellow-400',
      urgent: true,
    }
  }
  if (minutesLeft <= 240) {
    return {
      label: `⏱ ${Math.floor(minutesLeft / 60)}h${minutesLeft % 60 > 0 ? ` ${minutesLeft % 60}min` : ''} restantes`,
      color: 'border-gray-700 bg-gray-800',
      ring: 'hover:border-emerald-500',
      urgent: false,
    }
  }
  return {
    label: format(promised, "dd/MM 'às' HH:mm", { locale: ptBR }),
    color: 'border-gray-700 bg-gray-800',
    ring: 'hover:border-emerald-500',
    urgent: false,
  }
}

const PIECE_LABEL: Record<PieceType, string> = {
  clothing: 'Roupa',
  costume: 'Fantasia',
  sneaker: 'Tênis',
  rug: 'Tapete',
  curtain: 'Cortina',
  industrial: 'Industrial',
  other: 'Outro',
}

interface SectorQueueProps {
  unitId: string
  sectorName: string
  operatorName: string
  statuses: OrderStatus[]
  onSelectOrder: (order: Order) => void
}

export function SectorQueue({
  unitId,
  sectorName,
  operatorName,
  statuses,
  onSelectOrder,
}: SectorQueueProps) {
  const { orders, isLoading } = useSectorQueue(unitId, statuses)
  const [search, setSearch] = useState('')
  const [showScanner, setShowScanner] = useState(false)

  const handleScan = useCallback(
    (value: string) => {
      setShowScanner(false)
      const found = orders.find((o) => o.id === value || o.order_number === value)
      if (found) {
        onSelectOrder(found)
      } else {
        setSearch(value)
      }
    },
    [orders, onSelectOrder]
  )

  const { error: scanError, videoRef, startScanning, stopScanning } = useQRScanner(handleScan)

  const filtered = search
    ? orders.filter(
        (o) =>
          o.order_number.toLowerCase().includes(search.toLowerCase()) ||
          o.client_name.toLowerCase().includes(search.toLowerCase())
      )
    : orders

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Header do setor */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-700 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold">{sectorName}</h1>
          <p className="text-sm text-gray-400">{operatorName}</p>
        </div>
        <div className="flex items-center gap-6">
          <NetworkIndicator />
          <span className="text-sm text-gray-300 bg-gray-800 px-3 py-1 rounded-full">
            {filtered.length} comanda{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </header>

      {/* Scanner + Busca */}
      <div className="px-6 py-4 border-b border-gray-700 flex-shrink-0 space-y-3">
        {showScanner ? (
          <div className="space-y-2">
            <div className="relative rounded-xl overflow-hidden bg-black w-full aspect-video max-w-sm mx-auto">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                muted
                playsInline
              />
              <div className="absolute inset-0 border-2 border-emerald-400 rounded-xl pointer-events-none" />
            </div>
            {scanError && <p className="text-xs text-red-400 text-center">{scanError}</p>}
            <button
              onClick={() => { stopScanning(); setShowScanner(false) }}
              className="w-full py-2 text-sm text-gray-400 hover:text-white"
            >
              Cancelar scan
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por número ou cliente..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={() => { setShowScanner(true); startScanning() }}
              className="bg-gray-800 border border-gray-700 rounded-lg px-5 py-3 text-2xl hover:bg-gray-700 transition-colors"
              title="Escanear QR Code"
            >
              📷
            </button>
          </div>
        )}
      </div>

      {/* Contadores SLA */}
      {!isLoading && filtered.length > 0 && (() => {
        const overdueCount = filtered.filter(o => differenceInMinutes(new Date(o.promised_at), new Date()) < 0).length
        const urgentCount = filtered.filter(o => {
          const m = differenceInMinutes(new Date(o.promised_at), new Date())
          return m >= 0 && m <= 60
        }).length
        return (overdueCount > 0 || urgentCount > 0) ? (
          <div className="px-6 py-2 flex gap-3 text-sm border-b border-gray-700 flex-shrink-0">
            {overdueCount > 0 && (
              <span className="bg-red-900/60 text-red-300 px-3 py-1 rounded-full font-medium">
                🚨 {overdueCount} atrasada{overdueCount > 1 ? 's' : ''}
              </span>
            )}
            {urgentCount > 0 && (
              <span className="bg-yellow-900/60 text-yellow-300 px-3 py-1 rounded-full font-medium">
                ⏱ {urgentCount} urgente{urgentCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
        ) : null
      })()}

      {/* Lista de comandas */}
      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <p className="text-4xl mb-3">✓</p>
            <p className="text-xl font-medium">Fila vazia</p>
            <p className="text-sm mt-1">Nenhuma comanda aguardando neste setor</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...filtered].sort((a, b) =>
              new Date(a.promised_at).getTime() - new Date(b.promised_at).getTime()
            ).map((order) => {
              const sla = getSlaStatus(order.promised_at)
              const totalPieces = order.items?.reduce((s, i) => s + i.quantity, 0) ?? 0
              return (
                <button
                  key={order.id}
                  onClick={() => onSelectOrder(order)}
                  className={`text-left border rounded-xl p-5 transition-all group ${sla.color} ${sla.ring}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-mono text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {order.order_number}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {totalPieces} peça{totalPieces !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <p className="text-gray-300 font-medium text-lg mb-2 truncate">{order.client_name}</p>
                  <div className="text-sm text-gray-500 space-y-1">
                    <p className="truncate">
                      {order.items
                        ?.map((i) => `${i.quantity}× ${i.piece_type === 'other' ? (i.piece_type_label ?? 'Outro') : PIECE_LABEL[i.piece_type]}`)
                        .join(', ')}
                    </p>
                    <p className={sla.urgent ? 'text-yellow-400 font-medium' : 'text-gray-500'}>
                      {sla.label}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
