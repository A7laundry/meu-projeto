'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { markReceivablePaid } from '@/actions/financial/receivables'
import { FINANCIAL_STATUS_LABELS } from '@/types/financial'
import type { NetworkReceivable } from '@/actions/director/network-receivables'
import type { FinancialStatus } from '@/types/financial'

const fmtCurrency = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const statusColor: Record<FinancialStatus, string> = {
  pending: 'text-yellow-400 bg-yellow-400/10',
  paid: 'text-emerald-400 bg-emerald-400/10',
  overdue: 'text-red-400 bg-red-400/10',
}

interface Props {
  receivables: NetworkReceivable[]
  units: { id: string; name: string }[]
}

export function NetworkReceivableTable({ receivables, units }: Props) {
  const router = useRouter()
  const [unitFilter, setUnitFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [isPending, startTransition] = useTransition()

  const filtered = receivables.filter((r) => {
    if (unitFilter && r.unit_id !== unitFilter) return false
    if (statusFilter && r.status !== statusFilter) return false
    return true
  })

  const handleMarkPaid = (id: string, unitId: string) => {
    startTransition(async () => {
      await markReceivablePaid(id, unitId)
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <select
          value={unitFilter}
          onChange={(e) => setUnitFilter(e.target.value)}
          className="rounded-lg px-3 py-2 text-sm text-white bg-white/05 border border-white/10 focus:outline-none focus:border-[#60a5fa]/50"
        >
          <option value="" className="bg-[#07070a]">Todas as unidades</option>
          {units.map((u) => (
            <option key={u.id} value={u.id} className="bg-[#07070a]">{u.name}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg px-3 py-2 text-sm text-white bg-white/05 border border-white/10 focus:outline-none focus:border-[#60a5fa]/50"
        >
          <option value="" className="bg-[#07070a]">Todos os status</option>
          <option value="pending" className="bg-[#07070a]">Pendente</option>
          <option value="paid" className="bg-[#07070a]">Pago</option>
          <option value="overdue" className="bg-[#07070a]">Vencido</option>
        </select>
      </div>

      {/* Tabela */}
      <div className="card-dark rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <p className="px-5 py-6 text-sm text-white/30 italic text-center">
            Nenhum recebível encontrado.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/08">
                <tr>
                  <th className="text-left px-4 py-3 section-header">Unidade</th>
                  <th className="text-left px-4 py-3 section-header">Descrição</th>
                  <th className="text-left px-4 py-3 section-header">Cliente</th>
                  <th className="text-right px-4 py-3 section-header">Valor</th>
                  <th className="text-left px-4 py-3 section-header">Vencimento</th>
                  <th className="text-center px-4 py-3 section-header">Status</th>
                  <th className="text-center px-4 py-3 section-header">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/05">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-white/03">
                    <td className="px-4 py-2.5 text-white/50 text-xs">{r.unit_name}</td>
                    <td className="px-4 py-2.5 text-white/70">{r.description}</td>
                    <td className="px-4 py-2.5 text-white/50">{r.client_name ?? '—'}</td>
                    <td className="px-4 py-2.5 text-right text-white font-medium">{fmtCurrency(Number(r.amount))}</td>
                    <td className="px-4 py-2.5 text-white/50">
                      {new Date(r.due_date + 'T12:00:00').toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[r.status]}`}>
                        {FINANCIAL_STATUS_LABELS[r.status]}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      {r.status !== 'paid' && (
                        <button
                          onClick={() => handleMarkPaid(r.id, r.unit_id)}
                          disabled={isPending}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium text-emerald-400 bg-emerald-400/10 hover:bg-emerald-400/20 transition-colors disabled:opacity-40"
                        >
                          Marcar pago
                        </button>
                      )}
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
