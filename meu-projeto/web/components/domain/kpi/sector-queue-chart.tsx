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

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded-lg px-3 py-2 text-xs"
      style={{
        background: 'rgba(8,8,14,0.92)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(214,178,94,0.18)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}
    >
      <p className="text-white/40 mb-1.5">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-semibold num-stat text-[#d6b25e]">
          {p.value} <span className="text-white/50 font-normal">{p.name}</span>
        </p>
      ))}
    </div>
  )
}

export function SectorQueueChart({ data }: SectorQueueChartProps) {
  const chartData = data.map((d) => ({
    name: SECTOR_LABEL[d.sector] ?? d.sector,
    peças: d.pieces,
    eventos: d.events_count,
  }))

  return (
    <div className="card-dark rounded-xl p-5">
      <h3 className="section-header mb-1">Peças Processadas — Última Hora</h3>
      <p className="text-xs text-white/25 mb-4">Eventos de saída por setor</p>
      {chartData.length === 0 ? (
        <div className="flex items-center justify-center h-[160px] text-white/20 text-sm italic">
          Nenhum evento na última hora
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: -24 }}>
            <defs>
              <linearGradient id="goldBar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d6b25e" stopOpacity={0.95} />
                <stop offset="100%" stopColor="#b98a2c" stopOpacity={0.70} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.30)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.25)' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(214,178,94,0.04)', radius: 4 }} />
            <Bar dataKey="peças" fill="url(#goldBar)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
