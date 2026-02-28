'use client'

import { useState, useTransition } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Target } from 'lucide-react'
import { upsertGoal } from '@/actions/store/goals'

interface StoreGoalFormProps {
  unitId: string
  currentGoal: number | null
}

export function StoreGoalForm({ unitId, currentGoal }: StoreGoalFormProps) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(currentGoal?.toString() ?? '')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit() {
    const num = parseFloat(value)
    if (isNaN(num) || num <= 0) {
      setError('Informe um valor válido')
      return
    }

    setError(null)
    const today = new Date().toISOString().split('T')[0]

    startTransition(async () => {
      const result = await upsertGoal(unitId, today, num)
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
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
          style={{
            background: 'rgba(52,211,153,0.10)',
            border: '1px solid rgba(52,211,153,0.20)',
            color: '#34d399',
          }}
        >
          <Target size={14} />
          {currentGoal ? 'Alterar Meta' : 'Definir Meta'}
        </button>
      </DialogTrigger>
      <DialogContent
        className="max-w-sm p-0 overflow-hidden"
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
              Meta de Receita — Hoje
            </DialogTitle>
          </DialogHeader>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-white/55">Valor da meta (R$)</label>
            <input
              type="number"
              min="0"
              step="100"
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder="Ex: 3000"
              className="input-premium w-full"
              style={{ padding: '12px 14px', borderRadius: 10, fontSize: 16 }}
              autoFocus
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
              type="button"
              onClick={handleSubmit}
              disabled={isPending || !value}
              className="flex-1 py-3 rounded-xl text-sm font-bold btn-emerald disabled:opacity-40"
            >
              {isPending ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
