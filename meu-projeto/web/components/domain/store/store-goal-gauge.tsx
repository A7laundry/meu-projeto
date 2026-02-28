'use client'

import { BigGauge } from '@/components/domain/director/big-gauge'

interface StoreGoalGaugeProps {
  revenue: number
  goal: number | null
  progress: number | null
}

export function StoreGoalGauge({ revenue, goal, progress }: StoreGoalGaugeProps) {
  if (!goal) {
    return (
      <div className="flex flex-col items-center gap-3 py-6">
        <div
          className="w-36 h-36 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(52,211,153,0.06)', border: '2px dashed rgba(52,211,153,0.15)' }}
        >
          <span className="text-white/25 text-sm">Sem meta</span>
        </div>
        <p className="text-xs text-white/30">Defina uma meta diária para acompanhar</p>
      </div>
    )
  }

  const remaining = Math.max(0, goal - revenue)
  const pct = progress ?? 0

  return (
    <div className="flex flex-col items-center gap-1">
      <BigGauge
        percent={pct}
        centerValue={`${Math.round(pct)}%`}
        centerSub={`R$ ${revenue.toFixed(0)}`}
        label="Meta do Dia"
        sublabel={remaining > 0 ? `Faltam R$ ${remaining.toFixed(0)}` : 'Meta atingida!'}
        color="#34d399"
        size={180}
      />
      <p className="text-xs text-white/35 num-stat mt-1">
        de R$ {goal.toFixed(0)}
      </p>
    </div>
  )
}
