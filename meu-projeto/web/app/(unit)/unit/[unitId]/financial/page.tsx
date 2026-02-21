import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { listReceivables } from '@/actions/financial/receivables'
import { listPayables } from '@/actions/financial/payables'
import { FinancialSummaryCard } from '@/components/domain/financial/financial-summary'
import { ReceivableList } from '@/components/domain/financial/receivable-list'
import { PayableList } from '@/components/domain/financial/payable-list'
import type { FinancialSummary } from '@/types/financial'

export const revalidate = 0

export default async function FinancialPage({
  params,
}: {
  params: Promise<{ unitId: string }>
}) {
  const { unitId } = await params
  const [receivables, payables] = await Promise.all([
    listReceivables(unitId),
    listPayables(unitId),
  ])

  const pendingReceivable = receivables.filter((r) => r.status === 'pending')
  const pendingPayable = payables.filter((p) => p.status === 'pending')
  const overdueReceivable = receivables.filter((r) => r.status === 'overdue')
  const overduePayable = payables.filter((p) => p.status === 'overdue')

  const summary: FinancialSummary = {
    totalReceivable: pendingReceivable.reduce((s, r) => s + Number(r.amount), 0),
    totalPayable: pendingPayable.reduce((s, p) => s + Number(p.amount), 0),
    balance:
      pendingReceivable.reduce((s, r) => s + Number(r.amount), 0) -
      pendingPayable.reduce((s, p) => s + Number(p.amount), 0),
    overdueReceivable: overdueReceivable.reduce((s, r) => s + Number(r.amount), 0),
    overduePayable: overduePayable.reduce((s, p) => s + Number(p.amount), 0),
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
          <p className="text-sm text-gray-500 mt-1">Contas a receber e a pagar da unidade</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/unit/${unitId}/financial/cashflow`}>📈 Fluxo de Caixa / DRE</Link>
        </Button>
      </div>

      <FinancialSummaryCard summary={summary} />

      <div className="space-y-6">
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Contas a Receber</h2>
          <ReceivableList unitId={unitId} receivables={receivables} />
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Contas a Pagar</h2>
          <PayableList unitId={unitId} payables={payables} />
        </section>
      </div>
    </div>
  )
}
