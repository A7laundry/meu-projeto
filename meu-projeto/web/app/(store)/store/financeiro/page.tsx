import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/get-user'
import { listReceivables } from '@/actions/financial/receivables'
import { listPayables } from '@/actions/financial/payables'
import { FinanceiroPageClient } from './page-client'

export default async function FinanceiroPage() {
  const user = await getUser()
  if (!user || user.role !== 'store' || !user.unit_id) redirect('/login')

  const [receivables, payables] = await Promise.all([
    listReceivables(user.unit_id),
    listPayables(user.unit_id),
  ])

  return (
    <FinanceiroPageClient
      receivables={receivables}
      payables={payables}
      unitId={user.unit_id}
    />
  )
}
