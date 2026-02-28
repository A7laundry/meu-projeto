'use client'

import { useState } from 'react'
import type { Order } from '@/types/order'

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  received: { label: 'Recebida',  color: '#60a5fa', bg: 'rgba(96,165,250,0.10)' },
  sorting:  { label: 'Separação', color: '#fbbf24', bg: 'rgba(251,191,36,0.10)' },
  washing:  { label: 'Lavagem',   color: '#818cf8', bg: 'rgba(129,140,248,0.10)' },
  drying:   { label: 'Secagem',   color: '#fb923c', bg: 'rgba(251,146,60,0.10)' },
  ironing:  { label: 'Passadoria', color: '#f472b6', bg: 'rgba(244,114,182,0.10)' },
  ready:    { label: 'Pronta',    color: '#34d399', bg: 'rgba(52,211,153,0.10)' },
  shipped:  { label: 'Enviada',   color: '#a78bfa', bg: 'rgba(167,139,250,0.10)' },
  delivered:{ label: 'Entregue',  color: '#94a3b8', bg: 'rgba(148,163,184,0.10)' },
}

const FILTER_OPTIONS = [
  { value: 'all', label: 'Todas' },
  { value: 'received', label: 'Recebidas' },
  { value: 'in_production', label: 'Em Produção' },
  { value: 'ready', label: 'Prontas' },
  { value: 'delivered', label: 'Entregues' },
]

interface ComandasClientProps {
  orders: Order[]
}

export function ComandasClient({ orders }: ComandasClientProps) {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const IN_PRODUCTION = ['sorting', 'washing', 'drying', 'ironing']

  const filtered = orders.filter(o => {
    // Status filter
    if (filter === 'in_production' && !IN_PRODUCTION.includes(o.status)) return false
    if (filter !== 'all' && filter !== 'in_production' && o.status !== filter) return false

    // Search filter
    if (search) {
      const q = search.toLowerCase()
      if (
        !o.client_name.toLowerCase().includes(q) &&
        !o.order_number.toLowerCase().includes(q)
      ) return false
    }

    return true
  })

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1 flex-wrap">
          {FILTER_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={filter === opt.value ? {
                background: 'rgba(52,211,153,0.14)',
                border: '1px solid rgba(52,211,153,0.30)',
                color: '#34d399',
              } : {
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.45)',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none" style={{ color: 'rgba(255,255,255,0.30)' }}>
            🔍
          </span>
          <input
            placeholder="Buscar por cliente ou número..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-premium w-full"
            style={{ padding: '9px 14px 9px 36px', borderRadius: 10, fontSize: 13 }}
          />
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-white/30">
        {filtered.length} comanda{filtered.length !== 1 ? 's' : ''}
      </p>

      {/* Orders list */}
      {filtered.length === 0 ? (
        <div
          className="rounded-2xl p-12 text-center"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-3xl mb-3">📋</p>
          <p className="font-medium text-white/50">Nenhuma comanda encontrada.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(order => {
            const statusInfo = STATUS_LABELS[order.status] ?? { label: order.status, color: '#94a3b8', bg: 'rgba(148,163,184,0.10)' }
            const piecesCount = (order.items ?? []).reduce((sum, i) => sum + i.quantity, 0)
            const promisedDate = new Date(order.promised_at)
            const isOverdue = promisedDate < new Date() && !['delivered', 'shipped'].includes(order.status)

            return (
              <div
                key={order.id}
                className="rounded-xl p-4 flex items-center gap-4 transition-all"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: isOverdue
                    ? '1px solid rgba(248,113,113,0.20)'
                    : '1px solid rgba(255,255,255,0.07)',
                }}
              >
                {/* Order number */}
                <div className="flex-shrink-0">
                  <p className="text-sm font-bold text-white/80 num-stat">{order.order_number}</p>
                  <p className="text-[10px] text-white/30 mt-0.5">
                    {new Date(order.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>

                {/* Client */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white/75 truncate">{order.client_name}</p>
                  <p className="text-[11px] text-white/30">
                    {piecesCount} peça{piecesCount !== 1 ? 's' : ''}
                    {isOverdue && (
                      <span className="text-red-400 ml-2">Atrasada</span>
                    )}
                  </p>
                </div>

                {/* Promised date */}
                <div className="text-right flex-shrink-0 hidden sm:block">
                  <p className="text-[10px] text-white/25">Entrega</p>
                  <p className={`text-xs num-stat ${isOverdue ? 'text-red-400' : 'text-white/50'}`}>
                    {promisedDate.toLocaleDateString('pt-BR')}
                  </p>
                </div>

                {/* Status badge */}
                <span
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                  style={{
                    background: statusInfo.bg,
                    color: statusInfo.color,
                    border: `1px solid ${statusInfo.color}30`,
                  }}
                >
                  {statusInfo.label}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
