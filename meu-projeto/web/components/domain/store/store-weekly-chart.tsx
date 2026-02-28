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
import type { DailyRevenue } from '@/actions/store/goals'

interface Props {
  data: DailyRevenue[]
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
        border: '1px solid rgba(52,211,153,0.20)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}
    >
      <p className="text-white/40 mb-1">{label}</p>
      <p className="text-white font-semibold num-stat">
        R$ {payload[0].value.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
      </p>
    </div>
  )
}

export function StoreWeeklyChart({ data, height = 160 }: Props) {
  const hasData = data.some((d) => d.revenue > 0)
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1)

  return (
    <div className="card-emerald rounded-xl p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-header" style={{ color: 'rgba(52,211,153,0.50)' }}>Receita — Últimos 7 dias</h3>
        <span className="text-xs text-white/25 num-stat">
          R$ {data.reduce((s, d) => s + d.revenue, 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
        </span>
      </div>
      {!hasData ? (
        <div className="flex items-center justify-center flex-1 text-white/20 text-sm italic" style={{ minHeight: height }}>
          Sem dados no período
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
            <defs>
              <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34d399" stopOpacity={0.30} />
                <stop offset="60%" stopColor="#34d399" stopOpacity={0.06} />
                <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.30)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.25)' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
              domain={[0, Math.ceil(maxRevenue * 1.2)]}
              tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(52,211,153,0.15)', strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#34d399"
              strokeWidth={2}
              fill="url(#emeraldGradient)"
              dot={false}
              activeDot={{ r: 4, fill: '#34d399', stroke: 'rgba(52,211,153,0.3)', strokeWidth: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
