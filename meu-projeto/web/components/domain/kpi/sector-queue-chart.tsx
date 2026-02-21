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
    <div className="card-dark rounded-xl p-5">
      <h3 className="section-header mb-1">
        Peças Processadas — Última Hora por Setor
      </h3>
      <p className="text-xs text-white/30 mb-4">Eventos de saída registrados</p>
      {chartData.length === 0 ? (
        <div className="flex items-center justify-center h-40 text-white/25 text-sm italic">
          Nenhum evento na última hora
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.35)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.35)' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                fontSize: 12,
                borderRadius: 8,
                border: '1px solid rgba(214,178,94,0.2)',
                background: '#12121a',
                color: '#fff',
              }}
              cursor={{ fill: 'rgba(255,255,255,0.04)' }}
            />
            <Bar dataKey="peças" fill="#d6b25e" fillOpacity={0.85} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
