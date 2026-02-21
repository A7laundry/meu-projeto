import { getUnit } from '@/actions/units/crud'
import { OrderForm } from '@/components/domain/order/order-form'

export default async function NewOrderPage({
  params,
}: {
  params: Promise<{ unitId: string }>
}) {
  const { unitId } = await params
  const unit = await getUnit(unitId)
  const unitSlug = unit?.name ?? 'UN'

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Nova Comanda</h1>
        <p className="text-sm text-white/40 mt-0.5">Registre as peças recebidas do cliente</p>
      </div>
      <OrderForm unitId={unitId} unitSlug={unitSlug} />
    </div>
  )
}
