'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Order, OrderStatus } from '@/types/order'

// SLA por setor em minutos (Wave 1 — hardcoded)
const SLA_MINUTES: Record<OrderStatus, number> = {
  received: 30,
  sorting: 60,
  washing: 120,
  drying: 60,
  ironing: 120,
  ready: 30,
  shipped: 0,
  delivered: 0,
}

const SECTOR_LABELS: Record<OrderStatus, string> = {
  received: 'Recepção',
  sorting: 'Triagem',
  washing: 'Lavagem',
  drying: 'Secagem',
  ironing: 'Passadoria',
  ready: 'Pronto',
  shipped: 'Expedição',
  delivered: 'Entregue',
}

const SECTOR_ICONS: Record<OrderStatus, string> = {
  received: '📥',
  sorting: '🔀',
  washing: '🫧',
  drying: '💨',
  ironing: '👔',
  ready: '✅',
  shipped: '🚛',
  delivered: '🏠',
}

function isOverSLA(order: Order, status: OrderStatus): boolean {
  const sla = SLA_MINUTES[status]
  if (!sla) return false
  const lastEvent = order.events?.[order.events.length - 1]
  const since = lastEvent ? new Date(lastEvent.occurred_at) : new Date(order.created_at)
  return Date.now() - since.getTime() > sla * 60_000
}

interface SectorColumnProps {
  status: OrderStatus
  orders: Order[]
}

export function SectorColumn({ status, orders }: SectorColumnProps) {
  const alertCount = orders.filter((o) => isOverSLA(o, status)).length
  const hasAlert = alertCount > 0

  return (
    <div
      className={`flex flex-col bg-[#1a1a2e] overflow-hidden ${
        hasAlert ? 'border-t-4 border-red-500' : 'border-t-4 border-transparent'
      }`}
    >
      {/* Header da coluna */}
      <div className="px-3 py-3 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-lg">{SECTOR_ICONS[status]}</span>
          <span
            className={`text-2xl font-bold tabular-nums ${
              hasAlert ? 'text-red-400' : 'text-white'
            }`}
          >
            {orders.length}
          </span>
        </div>
        <p className="text-sm font-semibold text-gray-300 mt-1">{SECTOR_LABELS[status]}</p>
        {hasAlert && (
          <p className="text-xs text-red-400 mt-0.5">{alertCount} com SLA excedido</p>
        )}
      </div>

      {/* Lista de comandas */}
      <div className="flex-1 overflow-auto px-2 py-2 space-y-2">
        {orders.length === 0 ? (
          <p className="text-xs text-gray-600 text-center py-4">Fila vazia</p>
        ) : (
          orders.map((order) => {
            const overSla = isOverSLA(order, status)
            const totalPieces = order.items?.reduce((s, i) => s + i.quantity, 0) ?? 0

            return (
              <div
                key={order.id}
                className={`rounded-lg px-3 py-2 text-xs ${
                  overSla
                    ? 'bg-red-900/40 border border-red-500/40'
                    : 'bg-gray-800/60 border border-gray-700/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-white text-sm">
                    {order.order_number}
                  </span>
                  {overSla && <span className="text-red-400 text-xs">⚠</span>}
                </div>
                <p className="text-gray-400 truncate">{order.client_name}</p>
                <p className="text-gray-500 mt-0.5">
                  {totalPieces} peças · {format(new Date(order.promised_at), 'HH:mm', { locale: ptBR })}
                </p>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
