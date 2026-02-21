import { requireUser } from '@/lib/auth/get-user'
import { SectorPageClient } from './page-client'

export default async function ExpedicaoPage() {
  const user = await requireUser()
  return (
    <SectorPageClient
      unitId={user.unit_id!}
      operatorName={user.full_name}
      sectorKey="shipping"
      sectorName="Expedição"
      statuses={['ready']}
    />
  )
}
