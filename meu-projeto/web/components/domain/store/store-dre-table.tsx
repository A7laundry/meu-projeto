'use client'

import type { DreRow } from '@/actions/financial/cashflow'

interface StoreDreTableProps {
  rows: DreRow[]
}

export function StoreDreTable({ rows }: StoreDreTableProps) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-white/30 font-semibold">Linha</th>
            <th className="text-right px-4 py-3 text-[10px] uppercase tracking-wider text-white/30 font-semibold">Valor (R$)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr
              key={idx}
              style={{
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                ...(row.isTotal ? { background: 'rgba(52,211,153,0.04)' } : {}),
              }}
            >
              <td
                className="px-4 py-3"
                style={{
                  color: row.isTotal ? 'rgba(255,255,255,0.90)' : 'rgba(255,255,255,0.55)',
                  fontWeight: row.isTotal ? 600 : 400,
                }}
              >
                {row.label}
              </td>
              <td
                className="px-4 py-3 text-right num-stat"
                style={{
                  color: row.isPositive ? '#34d399' : '#f87171',
                  fontWeight: row.isTotal ? 700 : 500,
                  fontSize: row.isTotal ? 16 : 14,
                }}
              >
                R$ {Math.abs(row.amount).toFixed(0)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
