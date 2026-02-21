import { listPriceTable } from '@/actions/pricing/crud'
import { PricingList } from '@/components/domain/commercial/pricing-list'

export const revalidate = 0

export default async function PricingPage({
  params,
}: {
  params: Promise<{ unitId: string }>
}) {
  const { unitId } = await params
  const entries = await listPriceTable(unitId)

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Tabela de Preços</h1>
        <p className="text-sm text-white/40 mt-1">
          Preços base por tipo de peça para cálculo de orçamentos
        </p>
      </div>

      <PricingList unitId={unitId} entries={entries} />
    </div>
  )
}
