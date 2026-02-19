import type { FinancialSummary } from '@/types/financial'

function formatCurrency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

interface FinancialSummaryProps {
  summary: FinancialSummary
}

export function FinancialSummaryCard({ summary }: FinancialSummaryProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      <div className="rounded-lg border bg-green-50 border-green-200 p-4 text-center">
        <p className="text-xl font-bold text-green-800">
          {formatCurrency(summary.totalReceivable)}
        </p>
        <p className="text-xs text-green-600 mt-1">A receber</p>
      </div>
      <div className="rounded-lg border bg-red-50 border-red-200 p-4 text-center">
        <p className="text-xl font-bold text-red-800">
          {formatCurrency(summary.totalPayable)}
        </p>
        <p className="text-xs text-red-600 mt-1">A pagar</p>
      </div>
      <div
        className={`rounded-lg border p-4 text-center ${
          summary.balance >= 0
            ? 'bg-blue-50 border-blue-200'
            : 'bg-orange-50 border-orange-200'
        }`}
      >
        <p
          className={`text-xl font-bold ${
            summary.balance >= 0 ? 'text-blue-800' : 'text-orange-800'
          }`}
        >
          {formatCurrency(summary.balance)}
        </p>
        <p
          className={`text-xs mt-1 ${
            summary.balance >= 0 ? 'text-blue-600' : 'text-orange-600'
          }`}
        >
          Saldo projetado
        </p>
      </div>
      <div className="rounded-lg border bg-yellow-50 border-yellow-200 p-4 text-center">
        <p className="text-xl font-bold text-yellow-800">
          {formatCurrency(summary.overdueReceivable)}
        </p>
        <p className="text-xs text-yellow-600 mt-1">Vencidos a receber</p>
      </div>
      <div className="rounded-lg border bg-yellow-50 border-yellow-200 p-4 text-center">
        <p className="text-xl font-bold text-yellow-800">
          {formatCurrency(summary.overduePayable)}
        </p>
        <p className="text-xs text-yellow-600 mt-1">Vencidos a pagar</p>
      </div>
    </div>
  )
}
