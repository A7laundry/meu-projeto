'use client'

import { useTransition } from 'react'
import { CheckCircle } from 'lucide-react'
import { markPayablePaid } from '@/actions/financial/payables'
import { FINANCIAL_STATUS_LABELS, PAYABLE_CATEGORY_LABELS } from '@/types/financial'
import type { Payable } from '@/types/financial'

interface StorePayableListProps {
  payables: Payable[]
  unitId: string
}

const STATUS_COLORS: Record<string, { bg: string; border: string; color: string }> = {
  pending: { bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.20)', color: '#fbbf24' },
  overdue: { bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.20)', color: '#f87171' },
  paid: { bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.20)', color: '#34d399' },
}

export function StorePayableList({ payables, unitId }: StorePayableListProps) {
  const [isPending, startTransition] = useTransition()

  function handleMarkPaid(id: string) {
    startTransition(async () => {
      await markPayablePaid(id, unitId)
    })
  }

  const pending = payables.filter(p => p.status !== 'paid')
  const paid = payables.filter(p => p.status === 'paid')

  if (payables.length === 0) {
    return (
      <div className="rounded-xl p-8 text-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <p className="text-sm text-white/30">Nenhuma despesa registrada</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {[...pending, ...paid].map(p => {
        const style = STATUS_COLORS[p.status] ?? STATUS_COLORS.pending
        const dueDate = new Date(p.due_date + 'T12:00:00')
        return (
          <div
            key={p.id}
            className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white/80 truncate">{p.description}</p>
              <p className="text-[11px] text-white/35">
                {PAYABLE_CATEGORY_LABELS[p.category]}
                {p.supplier && ` · ${p.supplier}`}
                {' · Venc. '}
                {dueDate.toLocaleDateString('pt-BR')}
              </p>
            </div>
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
              style={{ background: style.bg, color: style.color, border: `1px solid ${style.border}` }}
            >
              {FINANCIAL_STATUS_LABELS[p.status]}
            </span>
            <p className="text-sm font-bold num-stat shrink-0" style={{ color: '#f87171' }}>
              R$ {Number(p.amount).toFixed(2)}
            </p>
            {p.status !== 'paid' && (
              <button
                onClick={() => handleMarkPaid(p.id)}
                disabled={isPending}
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all disabled:opacity-30"
                style={{ background: 'rgba(52,211,153,0.12)', color: '#34d399' }}
                title="Marcar como pago"
              >
                <CheckCircle size={14} />
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
