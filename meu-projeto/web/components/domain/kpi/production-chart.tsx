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
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">
        Fila por Status — Agora
      </h3>
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
            formatter={(v) => [`${v} comanda(s)`, 'Fila']}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
