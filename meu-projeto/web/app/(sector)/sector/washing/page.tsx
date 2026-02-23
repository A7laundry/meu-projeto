import { requireUser } from '@/lib/auth/get-user'
import { WashingPageClient } from './page-client'
import { listEquipment } from '@/actions/equipment/crud'
import { listRecipes } from '@/actions/recipes/crud'
import { getWashingKpis, type WashingKpis } from '@/actions/production/washing-kpis'

const DEFAULT_KPIS: WashingKpis = {
  ordersWashed: 0,
  totalCycles: 0,
  workTimeMinutes: 0,
  litersConsumed: 0,
  topEquipment: [],
  topRecipes: [],
}

export default async function LavagemPage() {
  const user = await requireUser()

  const [allEquipment, allRecipes, kpis] = await Promise.all([
    listEquipment(user.unit_id!),
    listRecipes(user.unit_id!),
    getWashingKpis(user.unit_id!, user.id).catch(() => DEFAULT_KPIS),
  ])

  const equipment = allEquipment.filter(
    (eq) => eq.type === 'washer' && eq.status === 'active'
  )
  const recipes = allRecipes.filter((r) => r.active)

  return (
    <WashingPageClient
      unitId={user.unit_id!}
      operatorId={user.id}
      operatorName={user.full_name}
      equipment={equipment}
      recipes={recipes}
      kpis={kpis}
    />
  )
}
