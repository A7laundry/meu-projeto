import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/get-user'
import { listOrders } from '@/actions/orders/list'
import { ComandasClient } from './page-client'

export default async function StoreComandasPage() {
  const user = await getUser()
  if (!user || user.role !== 'store' || !user.unit_id) redirect('/login')

  const orders = await listOrders(user.unit_id)

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div>
        <p
          className="text-[10px] uppercase tracking-widest font-semibold mb-1"
          style={{ color: 'rgba(52,211,153,0.40)' }}
        >
          Comandas
        </p>
        <h1 className="text-xl font-bold text-white tracking-tight">Acompanhamento</h1>
      </div>

      <ComandasClient orders={orders} />
    </div>
  )
}
