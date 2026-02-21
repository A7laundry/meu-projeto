import type { NetworkFinancial } from '@/actions/director/consolidated'

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

interface FinancialNetworkSummaryProps {
  financial: NetworkFinancial
}

export function FinancialNetworkSummary({ financial }: FinancialNetworkSummaryProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="card-stat rounded-xl p-5 text-center">
        <p className="text-xs text-emerald-400/70 uppercase tracking-widest font-semibold mb-1">A receber (rede)</p>
        <p className="text-2xl font-bold text-emerald-400">{fmt(financial.totalReceivable)}</p>
      </div>
      <div className="card-alert rounded-xl p-5 text-center">
        <p className="text-xs text-red-400/70 uppercase tracking-widest font-semibold mb-1">A pagar (rede)</p>
        <p className="text-2xl font-bold text-red-400">{fmt(financial.totalPayable)}</p>
      </div>
      <div
        className={`rounded-xl p-5 text-center ${
          financial.balance >= 0 ? 'card-gold' : 'card-warn'
        }`}
      >
        <p className={`text-xs uppercase tracking-widest font-semibold mb-1 ${
          financial.balance >= 0 ? 'text-[#d6b25e]/70' : 'text-yellow-400/70'
        }`}>
          Saldo projetado
        </p>
        <p className={`text-2xl font-bold ${
          financial.balance >= 0 ? 'gold-text' : 'text-yellow-400'
        }`}>
          {fmt(financial.balance)}
        </p>
      </div>
    </div>
  )
}
