'use client'

import { useState, useTransition } from 'react'
import { Download, ShoppingBag, DollarSign, TrendingUp } from 'lucide-react'
import { getSalesReport, type SalesReportSummary } from '@/actions/store/reports'
import { StoreSalesReport } from '@/components/domain/store/store-sales-report'

interface RelatoriosPageClientProps {
  initialReport: SalesReportSummary
  unitId: string
  initialFrom: string
  initialTo: string
}

export function RelatoriosPageClient({ initialReport, unitId, initialFrom, initialTo }: RelatoriosPageClientProps) {
  const [from, setFrom] = useState(initialFrom)
  const [to, setTo] = useState(initialTo)
  const [report, setReport] = useState(initialReport)
  const [isPending, startTransition] = useTransition()

  function handleFilter() {
    startTransition(async () => {
      const result = await getSalesReport(unitId, from, to)
      setReport(result)
    })
  }

  function handleExport() {
    const header = 'Data,Comanda,Cliente,Peças,Valor (R$)'
    const csvRows = report.rows.map(r => {
      const [y, m, d] = r.date.split('-')
      return `${d}/${m}/${y},${r.order_number},"${r.client_name}",${r.pieces},${r.revenue.toFixed(2)}`
    })
    const footer = `\nTOTAL,${report.totalOrders} comandas,,${report.rows.reduce((s, r) => s + r.pieces, 0)},${report.totalRevenue.toFixed(2)}`
    const csv = [header, ...csvRows, footer].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `relatorio-vendas-${from}-a-${to}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div>
        <p
          className="text-[10px] uppercase tracking-widest font-semibold mb-1"
          style={{ color: 'rgba(52,211,153,0.40)' }}
        >
          Relatórios
        </p>
        <h1 className="text-xl font-bold text-white tracking-tight">Relatório de Vendas</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-white/45">De</label>
          <input
            type="date"
            value={from}
            onChange={e => setFrom(e.target.value)}
            className="input-premium"
            style={{ padding: '10px 14px', borderRadius: 10, fontSize: 14, colorScheme: 'dark' }}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-white/45">Até</label>
          <input
            type="date"
            value={to}
            onChange={e => setTo(e.target.value)}
            className="input-premium"
            style={{ padding: '10px 14px', borderRadius: 10, fontSize: 14, colorScheme: 'dark' }}
          />
        </div>
        <button
          onClick={handleFilter}
          disabled={isPending}
          className="px-5 py-2.5 rounded-lg text-xs font-bold btn-emerald disabled:opacity-40"
          style={{ height: 42 }}
        >
          {isPending ? 'Buscando...' : 'Filtrar'}
        </button>
        {report.rows.length > 0 && (
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.10)',
              color: 'rgba(255,255,255,0.55)',
              height: 42,
            }}
          >
            <Download size={14} />
            Exportar CSV
          </button>
        )}
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card-emerald rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingBag size={14} style={{ color: '#34d399' }} />
            <p className="text-[10px] uppercase tracking-wider text-white/35 font-semibold">Total</p>
          </div>
          <p className="text-xl font-bold num-stat text-white">{report.totalOrders} <span className="text-xs text-white/40 font-normal">comandas</span></p>
        </div>
        <div className="card-emerald rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={14} style={{ color: '#34d399' }} />
            <p className="text-[10px] uppercase tracking-wider text-white/35 font-semibold">Receita</p>
          </div>
          <p className="text-xl font-bold num-stat" style={{ color: '#34d399' }}>
            R$ {report.totalRevenue.toFixed(0)}
          </p>
        </div>
        <div className="card-emerald rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={14} style={{ color: '#34d399' }} />
            <p className="text-[10px] uppercase tracking-wider text-white/35 font-semibold">Ticket Médio</p>
          </div>
          <p className="text-xl font-bold num-stat text-white">
            R$ {report.avgTicket.toFixed(0)}
          </p>
        </div>
      </div>

      {/* Report table */}
      <StoreSalesReport report={report} />
    </div>
  )
}
