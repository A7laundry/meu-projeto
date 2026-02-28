'use client'

import type { PdvItem } from '@/components/domain/store/pdv-item-picker'

export type PaymentMethod = 'cash' | 'credit_card' | 'debit_card' | 'pix'

const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: string }[] = [
  { value: 'cash', label: 'Dinheiro', icon: '\uD83D\uDCB5' },
  { value: 'credit_card', label: 'Credito', icon: '\uD83D\uDCB3' },
  { value: 'debit_card', label: 'Debito', icon: '\uD83D\uDCB3' },
  { value: 'pix', label: 'PIX', icon: '\uD83D\uDCF1' },
]

interface PdvSummaryPanelProps {
  items: PdvItem[]
  promisedDate: string
  onPromisedDateChange: (date: string) => void
  paymentMethod: PaymentMethod | null
  onPaymentMethodChange: (method: PaymentMethod) => void
  error: string | null
  isPending: boolean
  onSubmit: () => void
}

export function PdvSummaryPanel({
  items,
  promisedDate,
  onPromisedDateChange,
  paymentMethod,
  onPaymentMethodChange,
  error,
  isPending,
  onSubmit,
}: PdvSummaryPanelProps) {
  const total = items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0)
  const totalPieces = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <div
      className="rounded-2xl p-5 space-y-4 lg:sticky lg:top-6"
      style={{
        background: 'linear-gradient(160deg, rgba(52,211,153,0.07) 0%, rgba(5,5,8,0.95) 100%)',
        border: '1px solid rgba(52,211,153,0.15)',
        boxShadow: '0 8px 32px rgba(16,185,129,0.06)',
      }}
    >
      <p
        className="text-[10px] uppercase tracking-widest font-semibold"
        style={{ color: 'rgba(52,211,153,0.55)' }}
      >
        Resumo
      </p>

      {/* Items list */}
      {items.length === 0 ? (
        <p className="text-sm text-white/25 py-6 text-center">Nenhum item adicionado</p>
      ) : (
        <div className="space-y-2 max-h-52 overflow-y-auto scrollbar-dark">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm">
              <span className="text-white/65">
                {item.quantity}× {item.label}
              </span>
              <span className="font-semibold num-stat text-white/80">
                {(item.unit_price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Divider */}
      <div style={{ borderTop: '1px solid rgba(52,211,153,0.12)' }} />

      {/* Total */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-white/30 font-semibold">Total</p>
          <p className="text-xs text-white/30">{totalPieces} peça{totalPieces !== 1 ? 's' : ''}</p>
        </div>
        <p className="text-3xl font-bold num-stat" style={{ color: '#34d399' }}>
          R$ {total.toFixed(2)}
        </p>
      </div>

      {/* Promised date */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-white/45">Data de entrega</label>
        <input
          type="date"
          value={promisedDate}
          onChange={e => onPromisedDateChange(e.target.value)}
          className="input-premium w-full"
          style={{ padding: '10px 14px', borderRadius: 10, fontSize: 14, colorScheme: 'dark' }}
        />
      </div>

      {/* Forma de pagamento */}
      <div className="space-y-2">
        <label className="text-[11px] font-semibold text-white/45">Forma de pagamento</label>
        <div className="grid grid-cols-2 gap-2">
          {PAYMENT_METHODS.map((pm) => {
            const isSelected = paymentMethod === pm.value
            return (
              <button
                key={pm.value}
                type="button"
                onClick={() => onPaymentMethodChange(pm.value)}
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all"
                style={{
                  background: isSelected
                    ? 'rgba(52,211,153,0.12)'
                    : 'rgba(255,255,255,0.03)',
                  border: isSelected
                    ? '1.5px solid rgba(52,211,153,0.35)'
                    : '1px solid rgba(255,255,255,0.08)',
                  color: isSelected ? '#34d399' : 'rgba(255,255,255,0.55)',
                  boxShadow: isSelected ? '0 0 12px rgba(52,211,153,0.08)' : 'none',
                }}
              >
                <span className="text-base">{pm.icon}</span>
                <span>{pm.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          className="px-3 py-2.5 rounded-xl text-sm"
          style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.20)', color: '#fca5a5' }}
        >
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="button"
        onClick={onSubmit}
        disabled={isPending || items.length === 0}
        className="w-full rounded-xl text-base font-bold btn-emerald disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ padding: '16px', height: 56 }}
      >
        {isPending ? 'Criando...' : 'Confirmar Comanda ✓'}
      </button>
    </div>
  )
}
