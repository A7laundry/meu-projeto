import { listActiveClients } from '@/actions/clients/crud'
import { listPriceTable } from '@/actions/pricing/crud'
import { listQuotes } from '@/actions/quotes/crud'
import { QuoteFormDialog } from '@/components/domain/commercial/quote-form-dialog'
import { QuoteList } from '@/components/domain/commercial/quote-list'

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
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orçamentos</h1>
          <p className="text-sm text-gray-500 mt-1">
            Crie e acompanhe orçamentos para clientes
          </p>
        </div>
        <QuoteFormDialog
          unitId={unitId}
          activeClients={activeClients}
          priceTable={priceTable}
        />
      </div>

      <QuoteList unitId={unitId} quotes={quotes} />
    </div>
  )
}
