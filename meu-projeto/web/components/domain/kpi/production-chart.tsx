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
  ironing: 'Passadoria',
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

export function ProductionChart({ data }: ProductionChartProps) {
  const chartData = data.map((d) => ({
    name: STATUS_LABEL[d.status] ?? d.status,
    count: d.count,
    color: STATUS_COLOR[d.status] ?? '#94a3b8',
  }))

  return (
    <div className="card-dark rounded-xl p-5">
      <h3 className="section-header mb-4">
        Fila por Status — Agora
      </h3>
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
            formatter={(v) => [`${v} comanda(s)`, 'Fila']}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={index} fill={entry.color} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
