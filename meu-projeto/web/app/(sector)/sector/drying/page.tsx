import { requireUser } from '@/lib/auth/get-user'
import { listEquipment } from '@/actions/equipment/crud'
import { getShiftCycleCounts } from '@/actions/equipment/shift-cycles'
import { SectorPageClient } from './page-client'

export default async function SecagemPage() {
  const user = await requireUser()

  const [allEquipment, shiftCycles] = await Promise.all([
    listEquipment(user.unit_id!),
    getShiftCycleCounts(user.unit_id!),
  ])

  const equipment = allEquipment.filter(
    (eq) => eq.type === 'dryer' && eq.status === 'active'
  )

  return (
    <SectorPageClient
      unitId={user.unit_id!}
      operatorName={user.full_name}
      sectorKey="drying"
      sectorName="Secagem"
      statuses={['drying']}
      equipment={equipment}
      shiftCycles={shiftCycles}
    />
  )
}
