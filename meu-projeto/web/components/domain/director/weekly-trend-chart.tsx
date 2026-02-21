'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { DailyTrend } from '@/actions/director/trends'

interface Props {
  data: DailyTrend[]
  height?: number
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded-lg px-3 py-2 text-xs"
      style={{
        background: 'rgba(8,8,14,0.92)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(214,178,94,0.20)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}
    >
      <p className="text-white/40 mb-1">{label}</p>
      <p className="text-white font-semibold num-stat">{payload[0].value.toLocaleString('pt-BR')} <span className="text-white/50 font-normal">comandas</span></p>
    </div>
  )
}

export function WeeklyTrendChart({ data, height = 140 }: Props) {
  const hasData = data.some((d) => d.orders > 0)
  const maxOrders = Math.max(...data.map((d) => d.orders), 1)

  return (
    <div className="card-dark rounded-xl p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-header">Tendência — Últimos 7 dias</h3>
        <span className="text-xs text-white/25 num-stat">{data.reduce((s, d) => s + d.orders, 0).toLocaleString('pt-BR')} total</span>
      </div>
      {!hasData ? (
        <div className="flex items-center justify-center flex-1 text-white/20 text-sm italic" style={{ minHeight: height }}>
          Sem dados no período
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
            <defs>
              <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d6b25e" stopOpacity={0.30} />
                <stop offset="60%" stopColor="#d6b25e" stopOpacity={0.06} />
                <stop offset="100%" stopColor="#d6b25e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.30)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.25)' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
              domain={[0, Math.ceil(maxOrders * 1.2)]}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(214,178,94,0.15)', strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey="orders"
              stroke="#d6b25e"
              strokeWidth={2}
              fill="url(#goldGradient)"
              dot={false}
              activeDot={{ r: 4, fill: '#d6b25e', stroke: 'rgba(214,178,94,0.3)', strokeWidth: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
