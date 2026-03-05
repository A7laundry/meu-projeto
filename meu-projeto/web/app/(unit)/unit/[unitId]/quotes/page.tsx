import { FileText } from 'lucide-react'
import { listActiveClients } from '@/actions/clients/crud'
import { listPriceTable } from '@/actions/pricing/crud'
import { listQuotes } from '@/actions/quotes/crud'
import { QuoteFormDialog } from '@/components/domain/commercial/quote-form-dialog'
import { QuoteList } from '@/components/domain/commercial/quote-list'
import { PageHeader } from '@/components/layout/page-header'

export const revalidate = 0

export default async function QuotesPage({
  params,
}: {
  params: Promise<{ unitId: string }>
}) {
  const { unitId } = await params
  const [quotes, activeClients, priceTable] = await Promise.all([
    listQuotes(unitId),
    listActiveClients(unitId),
    listPriceTable(unitId),
  ])

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <PageHeader
        overline="Unidade"
        title="Orçamentos"
        subtitle="Crie e acompanhe orçamentos para clientes"
        accent="#3b82f6"
        icon={FileText}
        actions={
          <QuoteFormDialog
            unitId={unitId}
            activeClients={activeClients}
            priceTable={priceTable}
          />
        }
      />

      <QuoteList unitId={unitId} quotes={quotes} />
    </div>
  )
}
