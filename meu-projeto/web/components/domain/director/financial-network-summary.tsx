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
      <div className="rounded-lg border bg-green-50 border-green-200 p-4 text-center">
        <p className="text-xl font-bold text-green-800">{fmt(financial.totalReceivable)}</p>
        <p className="text-xs text-green-600 mt-1">A receber (rede)</p>
      </div>
      <div className="rounded-lg border bg-red-50 border-red-200 p-4 text-center">
        <p className="text-xl font-bold text-red-800">{fmt(financial.totalPayable)}</p>
        <p className="text-xs text-red-600 mt-1">A pagar (rede)</p>
      </div>
      <div
        className={`rounded-lg border p-4 text-center ${
          financial.balance >= 0
            ? 'bg-blue-50 border-blue-200'
            : 'bg-orange-50 border-orange-200'
        }`}
      >
        <p
          className={`text-xl font-bold ${
            financial.balance >= 0 ? 'text-blue-800' : 'text-orange-800'
          }`}
        >
          {fmt(financial.balance)}
        </p>
        <p
          className={`text-xs mt-1 ${
            financial.balance >= 0 ? 'text-blue-600' : 'text-orange-600'
          }`}
        >
          Saldo projetado
        </p>
      </div>
    </div>
  )
}
