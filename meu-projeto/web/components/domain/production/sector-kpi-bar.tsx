'use client'

import type { SectorKpi } from '@/actions/production/sector-kpis'

interface SectorKpiBarProps {
  kpis: SectorKpi
  accentColor: string
  accentBg: string
}

export function SectorKpiBar({ kpis, accentColor, accentBg }: SectorKpiBarProps) {
  const items = [
    {
      label: 'Hoje',
      value: String(kpis.ordersToday),
      icon: '\u2714',
    },
    {
      label: 'Tempo medio',
      value: kpis.avgMinutes > 0 ? `${kpis.avgMinutes}min` : '--',
      icon: '\u23F1',
    },
    {
      label: 'SLA',
      value: `${kpis.slaOnTimePercent}%`,
      icon: kpis.slaOnTimePercent >= 90 ? '\u2705' : kpis.slaOnTimePercent >= 70 ? '\u26A0' : '\u274C',
      warn: kpis.slaOnTimePercent < 90,
    },
    ...(kpis.overdueCount > 0
      ? [
          {
            label: 'Atrasadas',
            value: String(kpis.overdueCount),
            icon: '\u23F0',
            warn: true,
          },
        ]
      : []),
  ]

  return (
    <div
      className="grid gap-2 px-5 py-3 flex-shrink-0"
      style={{
        gridTemplateColumns: `repeat(${items.length}, 1fr)`,
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(255,255,255,0.015)',
      }}
    >
      {items.map((item) => (
        <div
          key={item.label}
          className="flex flex-col items-center py-2 rounded-xl"
          style={{
            background: item.warn ? 'rgba(248,113,113,0.06)' : accentBg,
          }}
        >
          <span className="text-lg font-black tabular-nums leading-none" style={{ color: item.warn ? '#f87171' : accentColor }}>
            {item.value}
          </span>
          <span className="text-[10px] text-white/35 mt-1 uppercase tracking-wide font-medium">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  )
}
