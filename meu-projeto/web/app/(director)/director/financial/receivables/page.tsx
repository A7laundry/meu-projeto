export const revalidate = 0

import Link from 'next/link'
import { ArrowLeft, DollarSign, Clock, AlertTriangle, Hash } from 'lucide-react'
import { getNetworkReceivables } from '@/actions/director/network-receivables'
import { NetworkReceivableTable } from '@/components/domain/director/network-receivable-table'
import { createAdminClient } from '@/lib/supabase/admin'

const fmtCurrency = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default async function ReceivablesPage() {
  const supabase = createAdminClient()
  const { data: units } = await supabase
    .from('units')
    .select('id, name')
    .eq('active', true)
    .order('name')

  const unitList = (units ?? []) as { id: string; name: string }[]
  const { receivables, totals } = await getNetworkReceivables()

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
        <h1 className="text-2xl font-bold text-white">Contas a Receber da Rede</h1>
        <p className="text-sm text-white/40 mt-1">
          Gestão multi-unidade de recebíveis
        </p>
      </div>

      {/* 4 KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card-dark rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={14} className="text-yellow-400/60" />
            <p className="text-xs text-white/40">Total pendente</p>
          </div>
          <p className="text-xl font-bold text-yellow-400">{fmtCurrency(totals.pending)}</p>
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
            <AlertTriangle size={14} className="text-red-400/60" />
            <p className="text-xs text-white/40">Total vencido</p>
          </div>
          <p className="text-xl font-bold text-red-400">{fmtCurrency(totals.overdue)}</p>
        </div>
        <div className="card-dark rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Hash size={14} className="text-[#60a5fa]/60" />
            <p className="text-xs text-white/40">Quantidade</p>
          </div>
          <p className="text-xl font-bold text-white">{totals.count}</p>
        </div>
      </div>

      <NetworkReceivableTable receivables={receivables} units={unitList} />
    </div>
  )
}
