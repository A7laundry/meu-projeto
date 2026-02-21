import Link from 'next/link'
import { listOrders } from '@/actions/orders/list'
import { OrderList } from '@/components/domain/order/order-list'
import { Button } from '@/components/ui/button'

export default async function OrdersPage({
  params,
  searchParams,
}: {
  params: Promise<{ unitId: string }>
  searchParams: Promise<{ status?: string; search?: string }>
}) {
  const { unitId } = await params
  const { status, search } = await searchParams

  const orders = await listOrders(unitId, { status, search })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Comandas</h1>
          <p className="text-sm text-gray-500 mt-0.5">{orders.length} comanda(s)</p>
        </div>
        <Button asChild>
          <Link href={`/unit/${unitId}/production/orders/new`}>+ Nova Comanda</Link>
        </Button>
      </div>

      <OrderList orders={orders} unitId={unitId} />
    </div>
  )
}
