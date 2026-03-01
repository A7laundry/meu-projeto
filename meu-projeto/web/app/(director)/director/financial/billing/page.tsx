export const revalidate = 60

import Link from 'next/link'
import { ArrowLeft, DollarSign, Clock, AlertTriangle } from 'lucide-react'
import { getNetworkBilling, getNetworkAging } from '@/actions/director/network-billing'

const fmtCurrency = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const AGING_COLORS = [
  'text-emerald-400 bg-emerald-400/10',
  'text-yellow-400 bg-yellow-400/10',
  'text-orange-400 bg-orange-400/10',
  'text-red-400 bg-red-400/10',
]

export default async function BillingPage() {
  const [{ clients, totals }, aging] = await Promise.all([
    getNetworkBilling(),
    getNetworkAging(),
  ])

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <Link
        href="/director/financial"
        className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors"
      >
        <ArrowLeft size={14} />
        Financeiro
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-white">Faturamento por Cliente</h1>
        <p className="text-sm text-white/40 mt-1">
          Visão consolidada de faturamento e aging de recebíveis
        </p>
      </div>

      {/* 3 KPI cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card-dark rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={14} className="text-[#60a5fa]/60" />
            <p className="text-xs text-white/40">Total faturado</p>
          </div>
          <p className="text-xl font-bold text-white">{fmtCurrency(totals.billed)}</p>
        </div>
        <div className="card-dark rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={14} className="text-emerald-400/60" />
            <p className="text-xs text-white/40">Total pago</p>
          </div>
          <p className="text-xl font-bold text-emerald-400">{fmtCurrency(totals.paid)}</p>
        </div>
        <div className="card-dark rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={14} className="text-yellow-400/60" />
            <p className="text-xs text-white/40">Total pendente</p>
          </div>
          <p className="text-xl font-bold text-yellow-400">{fmtCurrency(totals.pending)}</p>
        </div>
      </div>

      {/* Tabela de clientes */}
      <section className="space-y-3">
        <h2 className="font-semibold text-white">Faturamento por Cliente</h2>
        <div className="card-dark rounded-xl overflow-hidden">
          {clients.length === 0 ? (
            <p className="px-5 py-6 text-sm text-white/30 italic text-center">
              Nenhum faturamento encontrado.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-white/08">
                  <tr>
                    <th className="text-left px-4 py-3 section-header">Cliente</th>
                    <th className="text-left px-4 py-3 section-header">Unidade</th>
                    <th className="text-right px-4 py-3 section-header">Faturado</th>
                    <th className="text-right px-4 py-3 section-header">Pago</th>
                    <th className="text-right px-4 py-3 section-header">Pendente</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/05">
                  {clients.map((c) => (
                    <tr key={`${c.clientId}-${c.unitName}`} className="hover:bg-white/03">
                      <td className="px-4 py-2.5 text-white/70 font-medium">{c.clientName}</td>
                      <td className="px-4 py-2.5 text-white/50 text-xs">{c.unitName}</td>
                      <td className="px-4 py-2.5 text-right text-white">{fmtCurrency(c.totalBilled)}</td>
                      <td className="px-4 py-2.5 text-right text-emerald-400">{fmtCurrency(c.totalPaid)}</td>
                      <td className="px-4 py-2.5 text-right">
                        <span className={c.totalPending > 0 ? 'text-yellow-400 font-medium' : 'text-white/40'}>
                          {fmtCurrency(c.totalPending)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t border-white/10 bg-white/02 font-semibold">
                  <tr>
                    <td className="px-4 py-3 text-white/60" colSpan={2}>Total</td>
                    <td className="px-4 py-3 text-right text-white">{fmtCurrency(totals.billed)}</td>
                    <td className="px-4 py-3 text-right text-emerald-400">{fmtCurrency(totals.paid)}</td>
                    <td className="px-4 py-3 text-right text-yellow-400">{fmtCurrency(totals.pending)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Aging */}
      <section className="space-y-3">
        <div className="flex items-baseline gap-3">
          <h2 className="font-semibold text-white">Aging de Recebíveis</h2>
          <span className="text-xs text-white/30">
            Total em aberto: {fmtCurrency(aging.grandTotal)}
          </span>
        </div>

        {/* 4 Aging bucket cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {aging.buckets.map((b, i) => (
            <div key={b.label} className="card-dark rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={14} className={AGING_COLORS[i].split(' ')[0] + '/60'} />
                <p className="text-xs text-white/40">{b.label}</p>
              </div>
              <p className={`text-lg font-bold ${AGING_COLORS[i].split(' ')[0]}`}>
                {fmtCurrency(b.amount)}
              </p>
              <p className="text-xs text-white/30 mt-1">{b.count} título{b.count !== 1 ? 's' : ''}</p>
            </div>
          ))}
        </div>

        {/* Aging por unidade */}
        {aging.byUnit.length > 0 && (
          <div className="card-dark rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/08">
              <h3 className="text-sm font-semibold text-white/70">Aging por Unidade</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-white/08">
                  <tr>
                    <th className="text-left px-4 py-3 section-header">Unidade</th>
                    {aging.buckets.map((b) => (
                      <th key={b.label} className="text-right px-4 py-3 section-header">{b.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/05">
                  {aging.byUnit.map((u) => (
                    <tr key={u.unitName} className="hover:bg-white/03">
                      <td className="px-4 py-2.5 text-white/70 font-medium">{u.unitName}</td>
                      {u.buckets.map((b, i) => (
                        <td key={b.label} className={`px-4 py-2.5 text-right ${b.amount > 0 ? AGING_COLORS[i].split(' ')[0] : 'text-white/20'}`}>
                          {fmtCurrency(b.amount)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
