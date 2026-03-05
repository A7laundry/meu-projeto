import { requireUser } from '@/lib/auth/get-user'
import { listEquipment } from '@/actions/equipment/crud'
import { getShiftCycleCounts } from '@/actions/equipment/shift-cycles'
import { getSectorKpis } from '@/actions/production/sector-kpis'
import { SectorPageClient } from './page-client'

export default async function PassadoriaPage() {
  const user = await requireUser()

  const [allEquipment, shiftCycles, sectorKpis] = await Promise.all([
    listEquipment(user.unit_id!),
    getShiftCycleCounts(user.unit_id!),
    getSectorKpis(user.unit_id!, 'ironing'),
  ])

  const equipment = allEquipment.filter(
    (eq) => eq.type === 'iron' && eq.status === 'active'
  )

  return (
    <SectorPageClient
      unitId={user.unit_id!}
      operatorName={user.full_name}
      sectorKey="ironing"
      sectorName="Passadoria"
      statuses={['ironing']}
      equipment={equipment}
      shiftCycles={shiftCycles}
      sectorKpis={sectorKpis}
    />
  )
}
