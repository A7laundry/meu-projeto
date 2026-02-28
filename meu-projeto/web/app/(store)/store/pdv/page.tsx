import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/get-user'
import { getUnit } from '@/actions/units/crud'
import { listPriceTable } from '@/actions/pricing/crud'
import { PdvPageClient } from './page-client'

export default async function PdvPage() {
  const user = await getUser()
  if (!user || user.role !== 'store' || !user.unit_id) redirect('/login')

  const [unit, prices] = await Promise.all([
    getUnit(user.unit_id),
    listPriceTable(user.unit_id),
  ])

  if (!unit) redirect('/auth/error')

  const activePrices = prices.filter(p => p.active)

  return (
    <PdvPageClient
      unitId={user.unit_id}
      unitSlug={unit.slug}
      prices={activePrices}
    />
  )
}
