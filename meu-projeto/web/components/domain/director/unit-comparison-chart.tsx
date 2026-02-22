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

export interface UnitComparisonRow {
  name: string
  onTime: number
  inQueue: number
  late: number
}

interface Props {
  data: UnitComparisonRow[]
  height?: number
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number; fill: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  const total = payload.reduce((s, p) => s + p.value, 0)
  return (
    <div
      className="rounded-lg px-4 py-3 text-xs min-w-[160px]"
      style={{
        background: 'rgba(8,8,14,0.95)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(214,178,94,0.18)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
      }}
    >
      <p className="text-white/60 font-medium mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-6 mb-1">
          <span className="flex items-center gap-1.5" style={{ color: p.fill }}>
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.fill }} />
            {p.name}
          </span>
          <span className="num-stat font-semibold text-white">{p.value}</span>
        </div>
      ))}
      <div className="border-t border-white/08 mt-2 pt-2 flex justify-between text-white/40">
        <span>Total</span>
        <span className="num-stat text-white/70">{total}</span>
      </div>
    </div>
  )
}

export function UnitComparisonChart({ data, height = 220 }: Props) {
  if (!data.length) return null

  return (
    <div className="card-dark rounded-xl p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="section-header">Comparativo por Unidade</h3>
        <div className="flex items-center gap-4 text-xs text-white/35">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> No prazo
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: '#d6b25e' }} /> Em processo
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-400" /> Atrasadas
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 16, bottom: 0, left: 0 }}
          barCategoryGap="28%"
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.04)"
            horizontal={false}
          />
          <XAxis
            type="number"
            tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.25)' }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.55)' }}
            axisLine={false}
            tickLine={false}
            width={90}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
          />
          <Bar dataKey="onTime" name="No prazo" stackId="a" fill="#34d399" radius={[0, 0, 0, 0]} />
          <Bar dataKey="inQueue" name="Em processo" stackId="a" fill="#d6b25e" radius={[0, 0, 0, 0]} />
          <Bar dataKey="late" name="Atrasadas" stackId="a" fill="#f87171" radius={[3, 3, 3, 3]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
