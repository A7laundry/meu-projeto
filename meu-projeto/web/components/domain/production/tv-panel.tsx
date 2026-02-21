'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useProductionRealtime } from '@/hooks/use-production-realtime'
import { SectorColumn } from '@/components/domain/production/sector-column'
import type { OrderStatus } from '@/types/order'

const TV_SECTORS: OrderStatus[] = ['sorting', 'washing', 'drying', 'ironing', 'shipped']

interface TVPanelProps {
  unitId: string
  unitName: string
}

export function TVPanel({ unitId, unitName }: TVPanelProps) {
  const { sectorData, lastUpdated, isConnected } = useProductionRealtime(unitId)

  const tvSectorData = sectorData.filter((s) => TV_SECTORS.includes(s.status))

  const totalInProcess = sectorData
    .filter((s) => !['delivered'].includes(s.status))
    .reduce((sum, s) => sum + s.orders.length, 0)

  const completedToday = sectorData
    .find((s) => s.status === 'shipped')?.orders.length ?? 0

  return (
    <div className="flex flex-col h-screen bg-[#111] text-white overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 bg-[#0d0d1a] border-b border-gray-800 flex-shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-xl font-bold tracking-tight">A7x OS</span>
          <span className="text-gray-500">|</span>
          <span className="text-lg font-medium text-gray-300">{unitName}</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-gray-500">
          <span>
            <span
              className={`inline-block h-2 w-2 rounded-full mr-1.5 ${
                isConnected ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            {isConnected ? 'Realtime' : 'Polling'}
          </span>
          <span>Atualizado {format(lastUpdated, 'HH:mm:ss', { locale: ptBR })}</span>
        </div>
      </header>

      {/* Colunas de setor */}
      <div
        className="flex-1 grid overflow-hidden"
        style={{
          gridTemplateColumns: `repeat(${TV_SECTORS.length}, 1fr)`,
          gap: '2px',
          background: '#111',
        }}
      >
        {tvSectorData.map(({ status, orders }) => (
          <SectorColumn key={status} status={status} orders={orders} />
        ))}
      </div>

      {/* Rodapé */}
      <footer className="flex items-center justify-between px-6 py-2 bg-[#0d0d1a] border-t border-gray-800 flex-shrink-0 text-sm text-gray-500">
        <span>Total em processo: <strong className="text-white text-base">{totalInProcess}</strong> comanda(s)</span>
        <span>Enviadas hoje: <strong className="text-emerald-400 text-base">{completedToday}</strong></span>
        <span className="text-xs">{format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}</span>
      </footer>
    </div>
  )
}
