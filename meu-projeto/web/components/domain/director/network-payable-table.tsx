'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createPayable, markPayablePaid } from '@/actions/financial/payables'
import { FINANCIAL_STATUS_LABELS, PAYABLE_CATEGORY_LABELS } from '@/types/financial'
import type { NetworkPayable } from '@/actions/director/network-payables'
import type { FinancialStatus, PayableCategory } from '@/types/financial'

const fmtCurrency = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const statusColor: Record<FinancialStatus, string> = {
  pending: 'text-yellow-400 bg-yellow-400/10',
  paid: 'text-emerald-400 bg-emerald-400/10',
  overdue: 'text-red-400 bg-red-400/10',
}

const inputCls =
  'w-full rounded-lg px-3 py-2 text-sm text-white bg-white/05 border border-white/10 focus:outline-none focus:border-[#60a5fa]/50 focus:ring-1 focus:ring-[#60a5fa]/30 placeholder:text-white/25 transition-colors'

const labelCls = 'block text-xs font-medium text-white/50 mb-1'

const CATEGORIES: { value: PayableCategory; label: string }[] = [
  { value: 'supplies', label: 'Insumos' },
  { value: 'equipment', label: 'Equipamentos' },
  { value: 'payroll', label: 'Folha de pagamento' },
  { value: 'utilities', label: 'Utilidades (água/luz)' },
  { value: 'rent', label: 'Aluguel' },
  { value: 'other', label: 'Outros' },
]

interface Props {
  payables: NetworkPayable[]
  units: { id: string; name: string }[]
}

export function NetworkPayableTable({ payables, units }: Props) {
  const router = useRouter()
  const [unitFilter, setUnitFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const filtered = payables.filter((p) => {
    if (unitFilter && p.unit_id !== unitFilter) return false
    if (statusFilter && p.status !== statusFilter) return false
    if (categoryFilter && p.category !== categoryFilter) return false
    return true
  })

  const handleMarkPaid = (id: string, unitId: string) => {
    startTransition(async () => {
      await markPayablePaid(id, unitId)
      router.refresh()
    })
  }

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const form = e.currentTarget
    const unitId = (form.elements.namedItem('unit_id') as HTMLSelectElement).value
    if (!unitId) {
      setError('Selecione uma unidade')
      return
    }
    const fd = new FormData(form)
    fd.delete('unit_id')
    startTransition(async () => {
      const result = await createPayable(unitId, fd)
      if (!result.success) {
        setError(result.error)
        return
      }
      setShowCreate(false)
      form.reset()
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      {/* Filtros + botão criar */}
      <div className="flex flex-wrap items-center gap-3">
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

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg px-3 py-2 text-sm text-white bg-white/05 border border-white/10 focus:outline-none focus:border-[#60a5fa]/50"
        >
          <option value="" className="bg-[#07070a]">Todas as categorias</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value} className="bg-[#07070a]">{c.label}</option>
          ))}
        </select>

        <button
          onClick={() => setShowCreate(true)}
          className="ml-auto px-4 py-2 rounded-lg text-sm font-semibold bg-[#60a5fa] text-black hover:bg-[#e8cc7e] transition-colors"
        >
          + Nova conta a pagar
        </button>
      </div>

      {/* Tabela */}
      <div className="card-dark rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <p className="px-5 py-6 text-sm text-white/30 italic text-center">
            Nenhuma conta a pagar encontrada.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/08">
                <tr>
                  <th className="text-left px-4 py-3 section-header">Unidade</th>
                  <th className="text-left px-4 py-3 section-header">Descrição</th>
                  <th className="text-left px-4 py-3 section-header">Fornecedor</th>
                  <th className="text-left px-4 py-3 section-header">Categoria</th>
                  <th className="text-right px-4 py-3 section-header">Valor</th>
                  <th className="text-left px-4 py-3 section-header">Vencimento</th>
                  <th className="text-center px-4 py-3 section-header">Status</th>
                  <th className="text-center px-4 py-3 section-header">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/05">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-white/03">
                    <td className="px-4 py-2.5 text-white/50 text-xs">{p.unit_name}</td>
                    <td className="px-4 py-2.5 text-white/70">{p.description}</td>
                    <td className="px-4 py-2.5 text-white/50">{p.supplier ?? '—'}</td>
                    <td className="px-4 py-2.5 text-white/50 text-xs">
                      {PAYABLE_CATEGORY_LABELS[p.category]}
                    </td>
                    <td className="px-4 py-2.5 text-right text-white font-medium">{fmtCurrency(Number(p.amount))}</td>
                    <td className="px-4 py-2.5 text-white/50">
                      {new Date(p.due_date + 'T12:00:00').toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[p.status]}`}>
                        {FINANCIAL_STATUS_LABELS[p.status]}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      {p.status !== 'paid' && (
                        <button
                          onClick={() => handleMarkPaid(p.id, p.unit_id)}
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

      {/* Modal criar conta a pagar */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowCreate(false)}
          />
          <div
            className="relative w-full max-w-md mx-4 rounded-xl p-6"
            style={{
              background: 'linear-gradient(160deg, rgba(59,130,246,0.05) 0%, rgba(5,5,8,0.98) 100%)',
              border: '1px solid rgba(59,130,246,0.15)',
              boxShadow: '0 25px 50px rgba(0,0,0,0.6)',
            }}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#60a5fa]/40 font-semibold mb-1">
                  Financeiro da Rede
                </p>
                <h2 className="text-lg font-bold text-white">Nova Conta a Pagar</h2>
              </div>
              <button
                onClick={() => setShowCreate(false)}
                className="text-white/30 hover:text-white/70 transition-colors text-xl leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className={labelCls}>Unidade</label>
                <select name="unit_id" required className={inputCls}>
                  <option value="" className="bg-[#07070a]">Selecionar unidade...</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id} className="bg-[#07070a]">{u.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>Descrição</label>
                <input name="description" required placeholder="Ex: Compra de insumos" className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Fornecedor</label>
                <input name="supplier" placeholder="Nome do fornecedor (opcional)" className={inputCls} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Categoria</label>
                  <select name="category" required className={inputCls}>
                    <option value="" className="bg-[#07070a]">Selecionar...</option>
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value} className="bg-[#07070a]">{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Valor (R$)</label>
                  <input name="amount" type="number" step="0.01" min="0.01" required placeholder="0,00" className={inputCls} />
                </div>
              </div>

              <div>
                <label className={labelCls}>Data de vencimento</label>
                <input name="due_date" type="date" required className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Observações</label>
                <input name="notes" placeholder="Notas (opcional)" className={inputCls} />
              </div>

              {error && (
                <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#60a5fa] text-black hover:bg-[#e8cc7e] transition-colors disabled:opacity-50"
                >
                  {isPending ? 'Criando...' : 'Criar Conta'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 rounded-lg text-sm text-white/40 hover:text-white/70 hover:bg-white/05 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
