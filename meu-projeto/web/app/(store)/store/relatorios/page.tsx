import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/get-user'
import { getSalesReport } from '@/actions/store/reports'
import { RelatoriosPageClient } from './page-client'

export default async function RelatoriosPage() {
  const user = await getUser()
  if (!user || user.role !== 'store' || !user.unit_id) redirect('/login')

  // Default: últimos 7 dias
  const now = new Date()
  const to = now.toISOString().split('T')[0]
  const from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
    .toISOString()
    .split('T')[0]

  const report = await getSalesReport(user.unit_id, from, to)

  return (
    <RelatoriosPageClient
      initialReport={report}
      unitId={user.unit_id}
      initialFrom={from}
      initialTo={to}
    />
  )
}
