export const revalidate = 0

import Link from 'next/link'
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import { getNetworkCashflow } from '@/actions/director/network-cashflow'

const fmtCurrency = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

interface Props {
  searchParams: Promise<{ year?: string; month?: string }>
}

export default async function CashflowPage({ searchParams }: Props) {
  const sp = await searchParams
  const now = new Date()
  const year = Number(sp.year ?? now.getFullYear())
  const month = Number(sp.month ?? now.getMonth() + 1)

  const { weeks, totalInflows, totalOutflows, net, byUnit } = await getNetworkCashflow(year, month)

  const prevMonth = month === 1 ? 12 : month - 1
  const prevYear = month === 1 ? year - 1 : year
  const nextMonth = month === 12 ? 1 : month + 1
  const nextYear = month === 12 ? year + 1 : year

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <Link
        href="/director/financial"
        className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors"
      >
        <ArrowLeft size={14} />
        Financeiro
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Fluxo de Caixa Consolidado</h1>
          <p className="text-sm text-white/40 mt-1">
            Entradas e saídas da rede — {MONTHS[month - 1]} {year}
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

      {/* 3 KPI cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card-dark rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={14} className="text-emerald-400/60" />
            <p className="text-xs text-white/40">Total entradas</p>
          </div>
          <p className="text-xl font-bold text-emerald-400">{fmtCurrency(totalInflows)}</p>
        </div>
        <div className="card-dark rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown size={14} className="text-red-400/60" />
            <p className="text-xs text-white/40">Total saídas</p>
          </div>
          <p className="text-xl font-bold text-red-400">{fmtCurrency(totalOutflows)}</p>
        </div>
        <div className="card-dark rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={14} className={net >= 0 ? 'text-emerald-400/60' : 'text-red-400/60'} />
            <p className="text-xs text-white/40">Saldo líquido</p>
          </div>
          <p className={`text-xl font-bold ${net >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {fmtCurrency(net)}
          </p>
        </div>
      </div>

      {/* Tabela semanal */}
      <section className="space-y-3">
        <h2 className="font-semibold text-white">Fluxo Semanal</h2>
        <div className="card-dark rounded-xl overflow-hidden">
          {weeks.every((w) => w.inflows === 0 && w.outflows === 0) ? (
            <p className="px-5 py-6 text-sm text-white/30 italic text-center">
              Sem movimentações no período.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-white/08">
                  <tr>
                    <th className="text-left px-4 py-3 section-header">Semana</th>
                    <th className="text-right px-4 py-3 section-header">Entradas</th>
                    <th className="text-right px-4 py-3 section-header">Saídas</th>
                    <th className="text-right px-4 py-3 section-header">Saldo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/05">
                  {weeks.map((w) => (
                    <tr key={w.week} className="hover:bg-white/03">
                      <td className="px-4 py-2.5 text-white/70 font-medium">{w.label}</td>
                      <td className="px-4 py-2.5 text-right text-emerald-400">{fmtCurrency(w.inflows)}</td>
                      <td className="px-4 py-2.5 text-right text-red-400/70">{fmtCurrency(w.outflows)}</td>
                      <td className="px-4 py-2.5 text-right">
                        <span className={`font-semibold ${w.net >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {fmtCurrency(w.net)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t border-white/10 bg-white/02 font-semibold">
                  <tr>
                    <td className="px-4 py-3 text-white/60">Total</td>
                    <td className="px-4 py-3 text-right text-emerald-400">{fmtCurrency(totalInflows)}</td>
                    <td className="px-4 py-3 text-right text-red-400/70">{fmtCurrency(totalOutflows)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={net >= 0 ? 'text-emerald-400' : 'text-red-400'}>{fmtCurrency(net)}</span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Tabela por unidade */}
      <section className="space-y-3">
        <h2 className="font-semibold text-white">Fluxo por Unidade</h2>
        <div className="card-dark rounded-xl overflow-hidden">
          {byUnit.every((u) => u.inflows === 0 && u.outflows === 0) ? (
            <p className="px-5 py-6 text-sm text-white/30 italic text-center">
              Sem movimentações no período.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-white/08">
                  <tr>
                    <th className="text-left px-4 py-3 section-header">Unidade</th>
                    <th className="text-right px-4 py-3 section-header">Entradas</th>
                    <th className="text-right px-4 py-3 section-header">Saídas</th>
                    <th className="text-right px-4 py-3 section-header">Saldo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/05">
                  {byUnit.map((u) => (
                    <tr key={u.unitId} className="hover:bg-white/03">
                      <td className="px-4 py-2.5 text-white/70 font-medium">{u.unitName}</td>
                      <td className="px-4 py-2.5 text-right text-emerald-400">{fmtCurrency(u.inflows)}</td>
                      <td className="px-4 py-2.5 text-right text-red-400/70">{fmtCurrency(u.outflows)}</td>
                      <td className="px-4 py-2.5 text-right">
                        <span className={`font-semibold ${u.net >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {fmtCurrency(u.net)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t border-white/10 bg-white/02 font-semibold">
                  <tr>
                    <td className="px-4 py-3 text-white/60">Total Rede</td>
                    <td className="px-4 py-3 text-right text-emerald-400">{fmtCurrency(totalInflows)}</td>
                    <td className="px-4 py-3 text-right text-red-400/70">{fmtCurrency(totalOutflows)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={net >= 0 ? 'text-emerald-400' : 'text-red-400'}>{fmtCurrency(net)}</span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
