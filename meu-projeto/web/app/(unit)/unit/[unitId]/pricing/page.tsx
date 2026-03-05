import { Tag } from 'lucide-react'
import { listPriceTable } from '@/actions/pricing/crud'
import { PricingList } from '@/components/domain/commercial/pricing-list'
import { PageHeader } from '@/components/layout/page-header'

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
      <PageHeader
        overline="Unidade"
        title="Tabela de Preços"
        subtitle="Preços base por tipo de peça para cálculo de orçamentos"
        accent="#3b82f6"
        icon={Tag}
      />

      <PricingList unitId={unitId} entries={entries} />
    </div>
  )
}
