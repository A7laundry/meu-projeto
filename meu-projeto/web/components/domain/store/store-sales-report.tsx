'use client'

import type { SalesReportSummary } from '@/actions/store/reports'

interface StoreSalesReportProps {
  report: SalesReportSummary
}

export function StoreSalesReport({ report }: StoreSalesReportProps) {
  if (report.rows.length === 0) {
    return (
      <div
        className="rounded-xl p-8 text-center"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <p className="text-sm text-white/30">Nenhuma venda no período selecionado</p>
      </div>
    )
  }

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-white/30 font-semibold">Data</th>
            <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-white/30 font-semibold">Comanda</th>
            <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-white/30 font-semibold">Cliente</th>
            <th className="text-right px-4 py-3 text-[10px] uppercase tracking-wider text-white/30 font-semibold">Peças</th>
            <th className="text-right px-4 py-3 text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'rgba(52,211,153,0.50)' }}>Valor</th>
          </tr>
        </thead>
        <tbody>
          {report.rows.map((row, idx) => {
            const [y, m, d] = row.date.split('-')
            return (
              <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td className="px-4 py-3 text-white/50">{d}/{m}</td>
                <td className="px-4 py-3 text-white/70 font-medium">{row.order_number}</td>
                <td className="px-4 py-3 text-white/60 truncate max-w-[160px]">{row.client_name}</td>
                <td className="px-4 py-3 text-right text-white/50 num-stat">{row.pieces}</td>
                <td className="px-4 py-3 text-right font-semibold num-stat" style={{ color: '#34d399' }}>
                  R$ {row.revenue.toFixed(2)}
                </td>
              </tr>
            )
          })}
        </tbody>
        <tfoot>
          <tr
            className="font-semibold"
            style={{ borderTop: '2px solid rgba(52,211,153,0.15)' }}
          >
            <td className="px-4 py-3 text-white/80" colSpan={3}>
              TOTAL: {report.totalOrders} comandas
            </td>
            <td className="px-4 py-3 text-right text-white/50 num-stat">
              {report.rows.reduce((s, r) => s + r.pieces, 0)}
            </td>
            <td className="px-4 py-3 text-right num-stat text-lg" style={{ color: '#34d399' }}>
              R$ {report.totalRevenue.toFixed(2)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
