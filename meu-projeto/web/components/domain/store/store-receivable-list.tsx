'use client'

import { useTransition } from 'react'
import { CheckCircle } from 'lucide-react'
import { markReceivablePaid } from '@/actions/financial/receivables'
import { FINANCIAL_STATUS_LABELS } from '@/types/financial'
import type { Receivable } from '@/types/financial'

interface StoreReceivableListProps {
  receivables: Receivable[]
  unitId: string
}

const STATUS_COLORS: Record<string, { bg: string; border: string; color: string }> = {
  pending: { bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.20)', color: '#fbbf24' },
  overdue: { bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.20)', color: '#f87171' },
  paid: { bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.20)', color: '#34d399' },
}

export function StoreReceivableList({ receivables, unitId }: StoreReceivableListProps) {
  const [isPending, startTransition] = useTransition()

  function handleMarkPaid(id: string) {
    startTransition(async () => {
      await markReceivablePaid(id, unitId)
    })
  }

  const pending = receivables.filter(r => r.status !== 'paid')
  const paid = receivables.filter(r => r.status === 'paid')

  if (receivables.length === 0) {
    return (
      <div className="rounded-xl p-8 text-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <p className="text-sm text-white/30">Nenhum valor a receber</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {[...pending, ...paid].map(r => {
        const style = STATUS_COLORS[r.status] ?? STATUS_COLORS.pending
        const dueDate = new Date(r.due_date + 'T12:00:00')
        return (
          <div
            key={r.id}
            className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white/80 truncate">{r.description}</p>
              <p className="text-[11px] text-white/35">
                {r.client_name && `${r.client_name} · `}
                Venc. {dueDate.toLocaleDateString('pt-BR')}
              </p>
            </div>
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
              style={{ background: style.bg, color: style.color, border: `1px solid ${style.border}` }}
            >
              {FINANCIAL_STATUS_LABELS[r.status]}
            </span>
            <p className="text-sm font-bold num-stat shrink-0" style={{ color: '#34d399' }}>
              R$ {Number(r.amount).toFixed(2)}
            </p>
            {r.status !== 'paid' && (
              <button
                onClick={() => handleMarkPaid(r.id)}
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
