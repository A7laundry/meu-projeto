import Link from 'next/link'
import { Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getCashflowData, getDreData } from '@/actions/financial/cashflow'
import { CashflowTable } from '@/components/domain/financial/cashflow-table'
import { DreTable } from '@/components/domain/financial/dre-table'
import { PageHeader } from '@/components/layout/page-header'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const revalidate = 0

export default async function CashflowPage({
  params,
  searchParams,
}: {
  params: Promise<{ unitId: string }>
  searchParams: Promise<{ year?: string; month?: string }>
}) {
  const { unitId } = await params
  const sp = await searchParams

  const now = new Date()
  const year = sp.year ? parseInt(sp.year) : now.getFullYear()
  const month = sp.month ? parseInt(sp.month) : now.getMonth() + 1

  const [cashflow, dreRows] = await Promise.all([
    getCashflowData(unitId, year, month),
    getDreData(unitId, year, month),
  ])

  const monthLabel = format(new Date(year, month - 1, 1), 'MMMM yyyy', { locale: ptBR })

  // Navegação de meses
  const prevDate = new Date(year, month - 2, 1)
  const nextDate = new Date(year, month, 1)
  const prevUrl = `/unit/${unitId}/financial/cashflow?year=${prevDate.getFullYear()}&month=${prevDate.getMonth() + 1}`
  const nextUrl = `/unit/${unitId}/financial/cashflow?year=${nextDate.getFullYear()}&month=${nextDate.getMonth() + 1}`
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm" className="text-white/40">
          <Link href={`/unit/${unitId}/financial`}>← Financeiro</Link>
        </Button>
      </div>

      <PageHeader
        overline="Financeiro"
        title="Fluxo de Caixa"
        subtitle={monthLabel}
        accent="#3b82f6"
        icon={Wallet}
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link href={prevUrl}>‹ Anterior</Link>
            </Button>
            {!isCurrentMonth && (
              <Button asChild variant="outline" size="sm">
                <Link href={`/unit/${unitId}/financial/cashflow`}>Hoje</Link>
              </Button>
            )}
            <Button asChild variant="outline" size="sm">
              <Link href={nextUrl}>Próximo ›</Link>
            </Button>
          </>
        }
      />

      <section>
        <h2 className="text-lg font-semibold text-white/90 mb-3">Entradas vs. Saídas</h2>
        <CashflowTable
          weeks={cashflow.weeks}
          totalInflows={cashflow.totalInflows}
          totalOutflows={cashflow.totalOutflows}
          net={cashflow.net}
          year={year}
          month={month}
        />
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white/90 mb-3">DRE Simplificado</h2>
        <DreTable rows={dreRows} />
      </section>
    </div>
  )
}
