'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import type { QueueStatus } from '@/lib/queries/production-kpis'
import type { OrderStatus } from '@/types/order'

const STATUS_LABEL: Record<OrderStatus, string> = {
  received: 'Recebido',
  sorting: 'Triagem',
  washing: 'Lavagem',
  drying: 'Secagem',
  ironing: 'Passad.',
  ready: 'Pronto',
  shipped: 'Enviado',
  delivered: 'Entregue',
}

const STATUS_COLOR: Record<OrderStatus, string> = {
  received: '#94a3b8',
  sorting: '#f59e0b',
  washing: '#3b82f6',
  drying: '#f97316',
  ironing: '#8b5cf6',
  ready: '#10b981',
  shipped: '#06b6d4',
  delivered: '#6b7280',
}

interface ProductionChartProps {
  data: QueueStatus[]
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; payload: { color: string } }>; label?: string }) {
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
      <p className="text-white/40 mb-1">{label}</p>
      <p className="font-semibold num-stat" style={{ color: payload[0].payload.color }}>
        {payload[0].value} <span className="text-white/50 font-normal">comanda(s)</span>
      </p>
    </div>
  )
}

export function ProductionChart({ data }: ProductionChartProps) {
  const chartData = data.map((d) => ({
    name: STATUS_LABEL[d.status] ?? d.status,
    count: d.count,
    color: STATUS_COLOR[d.status] ?? '#94a3b8',
  }))

  return (
    <div className="card-dark rounded-xl p-5">
      <h3 className="section-header mb-4">Fila por Status — Agora</h3>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: -24 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.30)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.25)' }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 4 }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={index} fill={entry.color} fillOpacity={0.80} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
