import { getOrderHistory } from '@/actions/orders/history'
import { OrderHistoryTable } from '@/components/domain/order/order-history-table'

export const revalidate = 0

export default async function ProductionHistoryPage({
  params,
}: {
  params: Promise<{ unitId: string }>
}) {
  const { unitId } = await params
  const { orders, total } = await getOrderHistory(unitId)

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Histórico de Produção</h1>
        <p className="text-sm text-white/40 mt-1">
          Todas as comandas · busca, filtros e exportação
        </p>
      </div>

      <OrderHistoryTable
        unitId={unitId}
        initialOrders={orders}
        initialTotal={total}
      />
    </div>
  )
}
