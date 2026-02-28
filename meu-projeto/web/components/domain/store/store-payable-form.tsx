'use client'

import { useState, useTransition } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus } from 'lucide-react'
import { createPayable } from '@/actions/financial/payables'
import { PAYABLE_CATEGORY_LABELS } from '@/types/financial'
import type { PayableCategory } from '@/types/financial'

interface StorePayableFormProps {
  unitId: string
}

const CATEGORIES = Object.entries(PAYABLE_CATEGORY_LABELS) as [PayableCategory, string][]

export function StorePayableForm({ unitId }: StorePayableFormProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await createPayable(unitId, formData)
      if (!result.success) {
        setError(result.error)
        return
      }
      setOpen(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold btn-emerald"
        >
          <Plus size={14} />
          Nova Despesa
        </button>
      </DialogTrigger>
      <DialogContent
        className="max-w-md p-0 overflow-hidden"
        style={{
          background: '#09090f',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20,
        }}
      >
        <div className="px-6 pt-6 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <DialogHeader>
            <DialogTitle
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: 'rgba(52,211,153,0.55)' }}
            >
              Registrar Despesa
            </DialogTitle>
          </DialogHeader>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-white/55">Descrição</label>
            <input
              name="description"
              required
              placeholder="Ex: Compra de insumos"
              className="input-premium w-full"
              style={{ padding: '10px 14px', borderRadius: 10, fontSize: 14 }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-white/55">Valor (R$)</label>
              <input
                name="amount"
                type="number"
                min="0.01"
                step="0.01"
                required
                placeholder="0.00"
                className="input-premium w-full"
                style={{ padding: '10px 14px', borderRadius: 10, fontSize: 14 }}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-white/55">Vencimento</label>
              <input
                name="due_date"
                type="date"
                required
                className="input-premium w-full"
                style={{ padding: '10px 14px', borderRadius: 10, fontSize: 14, colorScheme: 'dark' }}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-white/55">Categoria</label>
            <select
              name="category"
              required
              className="input-premium w-full"
              style={{ padding: '10px 14px', borderRadius: 10, fontSize: 14 }}
            >
              {CATEGORIES.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-white/55">Fornecedor (opcional)</label>
            <input
              name="supplier"
              placeholder="Nome do fornecedor"
              className="input-premium w-full"
              style={{ padding: '10px 14px', borderRadius: 10, fontSize: 14 }}
            />
          </div>

          {error && (
            <p className="text-xs" style={{ color: '#fca5a5' }}>{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 py-3 rounded-xl text-sm font-medium"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.65)' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-3 rounded-xl text-sm font-bold btn-emerald disabled:opacity-40"
            >
              {isPending ? 'Salvando...' : 'Registrar'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
