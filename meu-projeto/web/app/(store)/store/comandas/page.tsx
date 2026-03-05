import { redirect } from 'next/navigation'
import { ClipboardList } from 'lucide-react'
import { getUser } from '@/lib/auth/get-user'
import { listOrders } from '@/actions/orders/list'
import { PageHeader } from '@/components/layout/page-header'
import { ComandasClient } from './page-client'

export default async function StoreComandasPage() {
  const user = await getUser()
  if (!user || user.role !== 'store' || !user.unit_id) redirect('/login')

  const orders = await listOrders(user.unit_id)

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <PageHeader
        overline="Comandas"
        title="Acompanhamento"
        accent="#10b981"
        icon={ClipboardList}
      />

      <ComandasClient orders={orders} />
    </div>
  )
}
