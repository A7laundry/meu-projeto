'use client'

import { useState, useCallback } from 'react'
import { format, differenceInMinutes } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useQRScanner } from '@/hooks/use-qr-scanner'
import { useSectorQueue } from '@/hooks/use-sector-queue'
import { NetworkIndicator } from '@/components/layout/network-indicator'
import type { Order, OrderStatus, PieceType } from '@/types/order'

function getSlaStatus(promisedAt: string): {
  label: string
  bg: string
  border: string
  color: string
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
      label: `${h > 0 ? `${h}h ` : ''}${m}min atrasada`,
      bg: 'rgba(248,113,113,0.08)',
      border: 'rgba(248,113,113,0.30)',
      color: '#f87171',
      urgent: true,
    }
  }
  if (minutesLeft <= 60) {
    return {
      label: `${minutesLeft}min restantes`,
      bg: 'rgba(251,191,36,0.08)',
      border: 'rgba(251,191,36,0.28)',
      color: '#fbbf24',
      urgent: true,
    }
  }
  if (minutesLeft <= 240) {
    return {
      label: `${Math.floor(minutesLeft / 60)}h${minutesLeft % 60 > 0 ? ` ${minutesLeft % 60}min` : ''}`,
      bg: 'rgba(255,255,255,0.03)',
      border: 'rgba(255,255,255,0.08)',
      color: 'rgba(255,255,255,0.40)',
      urgent: false,
    }
  }
  return {
    label: format(promised, "dd/MM 'às' HH:mm", { locale: ptBR }),
    bg: 'rgba(255,255,255,0.03)',
    border: 'rgba(255,255,255,0.07)',
    color: 'rgba(255,255,255,0.30)',
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

  const sortedFiltered = [...filtered].sort(
    (a, b) => new Date(a.promised_at).getTime() - new Date(b.promised_at).getTime()
  )

  const overdueCount = filtered.filter(o => differenceInMinutes(new Date(o.promised_at), new Date()) < 0).length
  const urgentCount = filtered.filter(o => {
    const m = differenceInMinutes(new Date(o.promised_at), new Date())
    return m >= 0 && m <= 60
  }).length

  return (
    <div
      className="flex flex-col h-full text-white"
      style={{ background: 'linear-gradient(180deg, #060609 0%, #07070a 100%)' }}
    >
      {/* Header interno do setor */}
      <div
        className="flex items-center justify-between px-5 py-4 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div>
          <h1 className="text-xl font-bold text-white leading-tight">{sectorName}</h1>
          <p className="text-xs text-white/35 mt-0.5">{operatorName}</p>
        </div>
        <div className="flex items-center gap-3">
          <NetworkIndicator />
          <span
            className="text-xs px-3 py-1 rounded-full font-semibold"
            style={{
              background: filtered.length > 0 ? 'rgba(214,178,94,0.12)' : 'rgba(52,211,153,0.10)',
              color: filtered.length > 0 ? '#d6b25e' : '#34d399',
              border: `1px solid ${filtered.length > 0 ? 'rgba(214,178,94,0.22)' : 'rgba(52,211,153,0.22)'}`,
            }}
          >
            {filtered.length} comanda{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Barra de SLA urgentes */}
      {!isLoading && (overdueCount > 0 || urgentCount > 0) && (
        <div
          className="px-5 py-2 flex gap-2 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(248,113,113,0.04)' }}
        >
          {overdueCount > 0 && (
            <span
              className="text-[11px] px-2.5 py-1 rounded-full font-semibold flex items-center gap-1"
              style={{ background: 'rgba(248,113,113,0.14)', color: '#f87171', border: '1px solid rgba(248,113,113,0.28)' }}
            >
              ⚠ {overdueCount} atrasada{overdueCount > 1 ? 's' : ''}
            </span>
          )}
          {urgentCount > 0 && (
            <span
              className="text-[11px] px-2.5 py-1 rounded-full font-semibold flex items-center gap-1"
              style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.25)' }}
            >
              ⏱ {urgentCount} urgente{urgentCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}

      {/* Scanner + Busca */}
      <div className="px-5 py-3 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        {showScanner ? (
          <div className="space-y-2">
            <div className="relative rounded-xl overflow-hidden bg-black w-full aspect-video max-w-sm mx-auto"
              style={{ border: '2px solid rgba(52,211,153,0.50)' }}
            >
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                muted
                playsInline
              />
              <div className="absolute inset-0 pointer-events-none" style={{ border: '2px solid rgba(52,211,153,0.45)', borderRadius: 10 }} />
            </div>
            {scanError && <p className="text-xs text-[#f87171] text-center">{scanError}</p>}
            <button
              onClick={() => { stopScanning(); setShowScanner(false) }}
              className="w-full py-2 text-sm text-white/35 hover:text-white/65 transition-colors"
            >
              Cancelar scan
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por número ou cliente..."
              className="flex-1 input-premium text-base"
              style={{ padding: '12px 16px', borderRadius: 10, fontSize: 15 }}
            />
            <button
              onClick={() => { setShowScanner(true); startScanning() }}
              className="rounded-xl px-4 text-xl hover:opacity-80 transition-opacity"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.10)',
              }}
              title="Escanear QR Code"
            >
              📷
            </button>
          </div>
        )}
      </div>

      {/* Grid de comandas */}
      <div className="flex-1 overflow-auto p-5">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div
              className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
              style={{ borderColor: 'rgba(214,178,94,0.40)', borderTopColor: 'transparent' }}
            />
          </div>
        ) : sortedFiltered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-4"
              style={{ background: 'rgba(52,211,153,0.10)', border: '1px solid rgba(52,211,153,0.20)' }}
            >
              ✓
            </div>
            <p className="text-lg font-semibold text-white/75">Fila vazia</p>
            <p className="text-sm text-white/30 mt-1">Nenhuma comanda aguardando neste setor</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {sortedFiltered.map((order) => {
              const sla = getSlaStatus(order.promised_at)
              const totalPieces = order.items?.reduce((s, i) => s + i.quantity, 0) ?? 0
              const piecesSummary = order.items
                ?.map((i) => `${i.quantity}× ${i.piece_type === 'other' ? (i.piece_type_label ?? 'Outro') : PIECE_LABEL[i.piece_type]}`)
                .join(', ')

              return (
                <button
                  key={order.id}
                  onClick={() => onSelectOrder(order)}
                  className="text-left rounded-2xl p-4 transition-all group hover:scale-[1.01] active:scale-[0.99]"
                  style={{
                    background: sla.urgent ? sla.bg : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${sla.border}`,
                    boxShadow: sla.urgent
                      ? `0 0 0 1px ${sla.border}, 0 4px 16px rgba(0,0,0,0.3)`
                      : '0 2px 8px rgba(0,0,0,0.2)',
                  }}
                >
                  {/* Número + contagem */}
                  <div className="flex items-start justify-between mb-2">
                    <span
                      className="font-mono text-2xl font-black tracking-tight leading-none transition-colors"
                      style={{ color: sla.urgent ? sla.color : '#d6b25e' }}
                    >
                      {order.order_number}
                    </span>
                    <span
                      className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        color: 'rgba(255,255,255,0.45)',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      {totalPieces} peça{totalPieces !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Cliente */}
                  <p className="text-white/80 font-semibold text-base mb-2 truncate group-hover:text-white transition-colors">
                    {order.client_name}
                  </p>

                  {/* Peças */}
                  {piecesSummary && (
                    <p className="text-xs text-white/30 truncate mb-2">{piecesSummary}</p>
                  )}

                  {/* SLA */}
                  <div className="flex items-center gap-1.5">
                    {sla.urgent && (
                      <span style={{ color: sla.color, fontSize: 11 }}>{sla.color === '#f87171' ? '⚠' : '⏱'}</span>
                    )}
                    <span
                      className="text-xs font-medium"
                      style={{ color: sla.urgent ? sla.color : 'rgba(255,255,255,0.28)' }}
                    >
                      {sla.label}
                    </span>
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
