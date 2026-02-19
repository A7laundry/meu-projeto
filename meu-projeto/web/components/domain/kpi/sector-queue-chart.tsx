'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { SectorKpi } from '@/lib/queries/production-kpis'

const SECTOR_LABEL: Record<string, string> = {
  sorting: 'Triagem',
  washing: 'Lavagem',
  drying: 'Secagem',
  ironing: 'Passadoria',
  shipping: 'Expedição',
}

interface SectorQueueChartProps {
  data: SectorKpi[]
}

export function SectorQueueChart({ data }: SectorQueueChartProps) {
  const chartData = data.map((d) => ({
    name: SECTOR_LABEL[d.sector] ?? d.sector,
    peças: d.pieces,
    eventos: d.events_count,
  }))

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-1">
        Peças Processadas — Última Hora por Setor
      </h3>
      <p className="text-xs text-gray-400 mb-4">Eventos de saída registrados</p>
      {chartData.length === 0 ? (
        <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
          Nenhum evento na última hora
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
            />
            <Bar dataKey="peças" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
