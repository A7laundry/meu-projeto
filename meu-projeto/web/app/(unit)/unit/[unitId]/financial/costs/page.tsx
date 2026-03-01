export const revalidate = 0

import Link from 'next/link'
import { getOperationalCostReport } from '@/actions/financial/operational-cost'

interface Props {
  params: Promise<{ unitId: string }>
  searchParams: Promise<{ days?: string }>
}

const fmtCurrency = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default async function OperationalCostsPage({ params, searchParams }: Props) {
  const { unitId } = await params
  const sp = await searchParams
  const days = Number(sp.days ?? 30)
  const report = await getOperationalCostReport(unitId, days)

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Custo Operacional</h1>
          <p className="text-sm text-white/40 mt-1">{report.period}</p>
        </div>
        <div className="flex gap-2">
          {[7, 30, 90].map((d) => (
            <Link
              key={d}
              href={`?days=${d}`}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                days === d
                  ? 'btn-gold rounded-full'
                  : 'border-white/15 bg-white/04 text-white/60 hover:text-white'
              }`}
            >
              {d}d
            </Link>
          ))}
        </div>
      </div>

      {/* DRE resumido */}
      <div className="card-dark rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/08">
          <h2 className="font-semibold text-white">Demonstrativo de Resultado</h2>
        </div>
        <div className="divide-y divide-white/05">
          {[
            { label: 'Receita bruta', value: report.totalRevenue, color: 'text-emerald-400' },
            { label: '(-) Insumos químicos', value: -report.chemicalCost, color: 'text-red-400' },
            { label: '(-) Mão de obra', value: -report.laborCost, color: 'text-red-400' },
            { label: '(-) Overhead', value: -report.overheadCost, color: 'text-red-400' },
            { label: 'Custo total', value: -report.totalCost, color: 'text-red-300', bold: true },
            { label: 'Margem líquida', value: report.netMargin, color: report.netMargin >= 0 ? 'text-emerald-400' : 'text-red-400', bold: true },
          ].map((row) => (
            <div key={row.label} className={`px-5 py-3 flex items-center justify-between ${row.bold ? 'bg-white/02' : ''}`}>
              <span className={`text-sm ${row.bold ? 'font-semibold text-white' : 'text-white/60'}`}>{row.label}</span>
              <span className={`text-sm font-medium ${row.color}`}>
                {fmtCurrency(Math.abs(row.value))}
                {row.label === 'Margem líquida' && ` (${report.marginPercent}%)`}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Margem por tipo de peça */}
      <div className="card-dark rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/08">
          <h2 className="font-semibold text-white">Margem por Tipo de Peça</h2>
        </div>
        {report.marginByPieceType.length === 0 ? (
          <p className="px-5 py-6 text-sm text-white/30 italic text-center">Sem dados no período.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/08">
                <tr>
                  <th className="text-left px-4 py-3 section-header">Tipo</th>
                  <th className="text-right px-4 py-3 section-header">Qtd</th>
                  <th className="text-right px-4 py-3 section-header">Receita</th>
                  <th className="text-right px-4 py-3 section-header">Custo</th>
                  <th className="text-right px-4 py-3 section-header">Margem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/05">
                {report.marginByPieceType.map((row) => (
                  <tr key={row.pieceType} className="hover:bg-white/03">
                    <td className="px-4 py-2.5 text-white/70 capitalize">{row.pieceType}</td>
                    <td className="px-4 py-2.5 text-right text-white/50">{row.quantity}</td>
                    <td className="px-4 py-2.5 text-right text-emerald-400">{fmtCurrency(row.revenue)}</td>
                    <td className="px-4 py-2.5 text-right text-red-400/70">{fmtCurrency(row.cost)}</td>
                    <td className="px-4 py-2.5 text-right">
                      <span className={row.marginPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                        {row.marginPercent}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Margem por cliente */}
      <div className="card-dark rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/08">
          <h2 className="font-semibold text-white">Margem por Cliente (Top 20)</h2>
        </div>
        {report.marginByClient.length === 0 ? (
          <p className="px-5 py-6 text-sm text-white/30 italic text-center">Sem dados no período.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/08">
                <tr>
                  <th className="text-left px-4 py-3 section-header">Cliente</th>
                  <th className="text-right px-4 py-3 section-header">Comandas</th>
                  <th className="text-right px-4 py-3 section-header">Receita</th>
                  <th className="text-right px-4 py-3 section-header">Margem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/05">
                {report.marginByClient.map((row) => (
                  <tr key={row.clientName} className="hover:bg-white/03">
                    <td className="px-4 py-2.5 text-white/70">{row.clientName}</td>
                    <td className="px-4 py-2.5 text-right text-white/50">{row.orderCount}</td>
                    <td className="px-4 py-2.5 text-right text-emerald-400">{fmtCurrency(row.revenue)}</td>
                    <td className="px-4 py-2.5 text-right">
                      <span className={row.marginPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                        {fmtCurrency(row.margin)} ({row.marginPercent}%)
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
