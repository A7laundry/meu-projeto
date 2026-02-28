'use client'

import type { CashflowWeek } from '@/actions/financial/cashflow'

interface StoreCashflowTableProps {
  weeks: CashflowWeek[]
  totalInflows: number
  totalOutflows: number
  net: number
}

export function StoreCashflowTable({ weeks, totalInflows, totalOutflows, net }: StoreCashflowTableProps) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-white/30 font-semibold">Período</th>
            <th className="text-right px-4 py-3 text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'rgba(52,211,153,0.50)' }}>Entradas</th>
            <th className="text-right px-4 py-3 text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'rgba(248,113,113,0.50)' }}>Saídas</th>
            <th className="text-right px-4 py-3 text-[10px] uppercase tracking-wider text-white/30 font-semibold">Saldo</th>
          </tr>
        </thead>
        <tbody>
          {weeks.map(w => (
            <tr key={w.week} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <td className="px-4 py-3 text-white/60">{w.label}</td>
              <td className="px-4 py-3 text-right num-stat" style={{ color: '#34d399' }}>
                {w.inflows > 0 ? `R$ ${w.inflows.toFixed(0)}` : '—'}
              </td>
              <td className="px-4 py-3 text-right num-stat" style={{ color: '#f87171' }}>
                {w.outflows > 0 ? `R$ ${w.outflows.toFixed(0)}` : '—'}
              </td>
              <td
                className="px-4 py-3 text-right font-semibold num-stat"
                style={{ color: w.net >= 0 ? '#34d399' : '#f87171' }}
              >
                R$ {w.net.toFixed(0)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr
            className="font-semibold"
            style={{ borderTop: '2px solid rgba(52,211,153,0.15)' }}
          >
            <td className="px-4 py-3 text-white/80">Total</td>
            <td className="px-4 py-3 text-right num-stat" style={{ color: '#34d399' }}>
              R$ {totalInflows.toFixed(0)}
            </td>
            <td className="px-4 py-3 text-right num-stat" style={{ color: '#f87171' }}>
              R$ {totalOutflows.toFixed(0)}
            </td>
            <td
              className="px-4 py-3 text-right num-stat"
              style={{ color: net >= 0 ? '#34d399' : '#f87171' }}
            >
              R$ {net.toFixed(0)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
