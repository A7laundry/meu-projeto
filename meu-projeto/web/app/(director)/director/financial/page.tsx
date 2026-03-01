export const revalidate = 60

import Link from 'next/link'
import { DollarSign, TrendingUp, TrendingDown, FileBarChart, CreditCard, Wallet, BarChart3, Users } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { getNetworkFinancial } from '@/actions/director/consolidated'
import { getConsolidatedDre } from '@/actions/director/consolidated-dre'
import { FinancialNetworkSummary } from '@/components/domain/director/financial-network-summary'
import type { Unit } from '@/types/unit'

const fmtCurrency = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

export default async function FinancialHubPage() {
  const supabase = createAdminClient()
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  const { data: units } = await supabase
    .from('units')
    .select('id, name')
    .eq('active', true)
    .order('name')

  const unitIds = ((units ?? []) as Pick<Unit, 'id' | 'name'>[]).map((u) => u.id)

  const [networkFinancial, dre] = await Promise.all([
    getNetworkFinancial(unitIds),
    getConsolidatedDre(year, month),
  ])

  const totalCosts = dre.totals.suppliesCost + dre.totals.payrollCost + dre.totals.overheadCost

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <p className="text-overline mb-2">Módulo Financeiro</p>
        <h1 className="text-display-lg text-white">Financeiro da Rede</h1>
        <p className="text-sm text-white/40 mt-2">
          Visão consolidada — {MONTHS[month - 1]} {year}
        </p>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card-dark rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={14} className="text-emerald-400/60" />
            <p className="text-xs text-white/40">Receita do mês</p>
          </div>
          <p className="text-xl font-bold text-emerald-400">{fmtCurrency(dre.totals.revenue)}</p>
        </div>
        <div className="card-dark rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={14} className="text-emerald-400/60" />
            <p className="text-xs text-white/40">A receber</p>
          </div>
          <p className="text-xl font-bold text-emerald-400">{fmtCurrency(networkFinancial.totalReceivable)}</p>
        </div>
        <div className="card-dark rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown size={14} className="text-red-400/60" />
            <p className="text-xs text-white/40">A pagar</p>
          </div>
          <p className="text-xl font-bold text-red-400">{fmtCurrency(networkFinancial.totalPayable)}</p>
        </div>
        <div className="card-dark rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileBarChart size={14} className={dre.totals.ebit >= 0 ? 'text-emerald-400/60' : 'text-red-400/60'} />
            <p className="text-xs text-white/40">EBIT</p>
          </div>
          <p className={`text-xl font-bold ${dre.totals.ebit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {fmtCurrency(dre.totals.ebit)}
          </p>
        </div>
      </div>

      {/* Financial Network Summary (A receber / A pagar / Saldo) */}
      <section className="space-y-4">
        <h2 className="section-title">Posição Financeira</h2>
        <FinancialNetworkSummary financial={networkFinancial} />
      </section>

      {/* Mini DRE — Receita vs Custos */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="section-title" style={{ flex: 1 }}>Resumo DRE — {MONTHS[month - 1]}</h2>
          <Link
            href="/director/financial/dre"
            className="text-xs text-[#60a5fa]/60 hover:text-[#60a5fa] transition-colors flex-shrink-0"
          >
            Ver DRE completo →
          </Link>
        </div>
        <div className="card-dark rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-white/05">
              <tr>
                <td className="px-5 py-3 text-white/60">Receita total</td>
                <td className="px-5 py-3 text-right text-emerald-400 font-semibold">{fmtCurrency(dre.totals.revenue)}</td>
              </tr>
              <tr>
                <td className="px-5 py-3 text-white/60">Insumos</td>
                <td className="px-5 py-3 text-right text-red-400/70">{fmtCurrency(dre.totals.suppliesCost)}</td>
              </tr>
              <tr>
                <td className="px-5 py-3 text-white/60">Folha de pagamento</td>
                <td className="px-5 py-3 text-right text-red-400/70">{fmtCurrency(dre.totals.payrollCost)}</td>
              </tr>
              <tr>
                <td className="px-5 py-3 text-white/60">Overhead</td>
                <td className="px-5 py-3 text-right text-red-400/70">{fmtCurrency(dre.totals.overheadCost)}</td>
              </tr>
              <tr className="bg-white/02">
                <td className="px-5 py-3 text-white/80 font-semibold">Total custos</td>
                <td className="px-5 py-3 text-right text-red-400 font-semibold">{fmtCurrency(totalCosts)}</td>
              </tr>
            </tbody>
            <tfoot className="border-t border-white/10">
              <tr>
                <td className="px-5 py-3 text-white font-bold">EBIT</td>
                <td className={`px-5 py-3 text-right font-bold text-lg ${dre.totals.ebit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {fmtCurrency(dre.totals.ebit)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* Cards de navegação */}
      <section className="space-y-4">
        <h2 className="section-title">Módulos Financeiros</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/director/financial/dre"
            className="card-dark rounded-xl p-5 group hover:bg-white/04 transition-colors"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.20)' }}>
                <FileBarChart size={16} className="text-[#60a5fa]" />
              </div>
              <h3 className="font-semibold text-white group-hover:text-[#60a5fa] transition-colors">DRE Consolidado</h3>
            </div>
            <p className="text-xs text-white/40">
              Demonstrativo de resultado por unidade com navegação mensal
            </p>
          </Link>
          <Link
            href="/director/financial/receivables"
            className="card-dark rounded-xl p-5 group hover:bg-white/04 transition-colors"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.20)' }}>
                <CreditCard size={16} className="text-emerald-400" />
              </div>
              <h3 className="font-semibold text-white group-hover:text-emerald-400 transition-colors">Contas a Receber</h3>
            </div>
            <p className="text-xs text-white/40">
              Gestão multi-unidade de recebíveis com baixa de títulos
            </p>
          </Link>
          <Link
            href="/director/financial/payables"
            className="card-dark rounded-xl p-5 group hover:bg-white/04 transition-colors"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.20)' }}>
                <Wallet size={16} className="text-red-400" />
              </div>
              <h3 className="font-semibold text-white group-hover:text-red-400 transition-colors">Contas a Pagar</h3>
            </div>
            <p className="text-xs text-white/40">
              Lançamento e baixa de contas a pagar de toda a rede
            </p>
          </Link>
          <Link
            href="/director/financial/cashflow"
            className="card-dark rounded-xl p-5 group hover:bg-white/04 transition-colors"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.20)' }}>
                <BarChart3 size={16} className="text-[#60a5fa]" />
              </div>
              <h3 className="font-semibold text-white group-hover:text-[#60a5fa] transition-colors">Fluxo de Caixa</h3>
            </div>
            <p className="text-xs text-white/40">
              Fluxo semanal consolidado com breakdown por unidade
            </p>
          </Link>
          <Link
            href="/director/financial/billing"
            className="card-dark rounded-xl p-5 group hover:bg-white/04 transition-colors"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.20)' }}>
                <Users size={16} className="text-yellow-400" />
              </div>
              <h3 className="font-semibold text-white group-hover:text-yellow-400 transition-colors">Faturamento & Aging</h3>
            </div>
            <p className="text-xs text-white/40">
              Faturamento por cliente e aging de recebíveis
            </p>
          </Link>
          <Link
            href="/director/reports"
            className="card-dark rounded-xl p-5 group hover:bg-white/04 transition-colors"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.20)' }}>
                <TrendingUp size={16} className="text-[#60a5fa]" />
              </div>
              <h3 className="font-semibold text-white group-hover:text-[#60a5fa] transition-colors">Relatórios</h3>
            </div>
            <p className="text-xs text-white/40">
              Exportações, consumo por unidade e relatórios operacionais
            </p>
          </Link>
        </div>
      </section>
    </div>
  )
}
