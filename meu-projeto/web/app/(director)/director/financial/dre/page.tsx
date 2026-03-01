export const revalidate = 0

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getConsolidatedDre } from '@/actions/director/consolidated-dre'

const fmtCurrency = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

interface Props {
  searchParams: Promise<{ year?: string; month?: string }>
}

export default async function ConsolidatedDrePage({ searchParams }: Props) {
  const sp = await searchParams
  const now = new Date()
  const year = Number(sp.year ?? now.getFullYear())
  const month = Number(sp.month ?? now.getMonth() + 1)

  const report = await getConsolidatedDre(year, month)

  const prevMonth = month === 1 ? 12 : month - 1
  const prevYear = month === 1 ? year - 1 : year
  const nextMonth = month === 12 ? 1 : month + 1
  const nextYear = month === 12 ? year + 1 : year

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Breadcrumb */}
      <Link
        href="/director/financial"
        className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors"
      >
        <ArrowLeft size={14} />
        Financeiro
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">DRE Consolidado</h1>
          <p className="text-sm text-white/40 mt-1">
            Demonstrativo de resultado da rede — {MONTHS[month - 1]} {year}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`?year=${prevYear}&month=${prevMonth}`}
            className="px-3 py-1.5 rounded-lg text-sm text-white/40 hover:text-white/70"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            Anterior
          </Link>
          <Link
            href={`?year=${nextYear}&month=${nextMonth}`}
            className="px-3 py-1.5 rounded-lg text-sm text-white/40 hover:text-white/70"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            Próximo
          </Link>
        </div>
      </div>

      {/* Totals cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card-dark rounded-xl p-4">
          <p className="text-xs text-white/40 mb-1">Receita total</p>
          <p className="text-xl font-bold text-emerald-400">{fmtCurrency(report.totals.revenue)}</p>
        </div>
        <div className="card-dark rounded-xl p-4">
          <p className="text-xs text-white/40 mb-1">Insumos</p>
          <p className="text-xl font-bold text-red-400">{fmtCurrency(report.totals.suppliesCost)}</p>
        </div>
        <div className="card-dark rounded-xl p-4">
          <p className="text-xs text-white/40 mb-1">Folha + overhead</p>
          <p className="text-xl font-bold text-red-400">
            {fmtCurrency(report.totals.payrollCost + report.totals.overheadCost)}
          </p>
        </div>
        <div className="card-dark rounded-xl p-4">
          <p className="text-xs text-white/40 mb-1">EBIT</p>
          <p className={`text-xl font-bold ${report.totals.ebit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {fmtCurrency(report.totals.ebit)}
          </p>
        </div>
      </div>

      {/* Per-unit table */}
      <div className="card-dark rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/08">
          <h2 className="font-semibold text-white">Resultado por Unidade</h2>
        </div>
        {report.units.length === 0 ? (
          <p className="px-5 py-6 text-sm text-white/30 italic text-center">Sem dados no período.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/08">
                <tr>
                  <th className="text-left px-4 py-3 section-header">Unidade</th>
                  <th className="text-right px-4 py-3 section-header">Receita</th>
                  <th className="text-right px-4 py-3 section-header">Insumos</th>
                  <th className="text-right px-4 py-3 section-header">Folha</th>
                  <th className="text-right px-4 py-3 section-header">Overhead</th>
                  <th className="text-right px-4 py-3 section-header">EBIT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/05">
                {report.units.map((u) => (
                  <tr key={u.unitId} className="hover:bg-white/03">
                    <td className="px-4 py-2.5 text-white/70 font-medium">{u.unitName}</td>
                    <td className="px-4 py-2.5 text-right text-emerald-400">{fmtCurrency(u.revenue)}</td>
                    <td className="px-4 py-2.5 text-right text-red-400/70">{fmtCurrency(u.suppliesCost)}</td>
                    <td className="px-4 py-2.5 text-right text-red-400/70">{fmtCurrency(u.payrollCost)}</td>
                    <td className="px-4 py-2.5 text-right text-red-400/70">{fmtCurrency(u.overheadCost)}</td>
                    <td className="px-4 py-2.5 text-right">
                      <span className={`font-semibold ${u.ebit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {fmtCurrency(u.ebit)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-white/10 bg-white/02 font-semibold">
                <tr>
                  <td className="px-4 py-3 text-white/60">Total Rede</td>
                  <td className="px-4 py-3 text-right text-emerald-400">{fmtCurrency(report.totals.revenue)}</td>
                  <td className="px-4 py-3 text-right text-red-400/70">{fmtCurrency(report.totals.suppliesCost)}</td>
                  <td className="px-4 py-3 text-right text-red-400/70">{fmtCurrency(report.totals.payrollCost)}</td>
                  <td className="px-4 py-3 text-right text-red-400/70">{fmtCurrency(report.totals.overheadCost)}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`${report.totals.ebit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {fmtCurrency(report.totals.ebit)}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
