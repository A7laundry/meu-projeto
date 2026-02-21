import { requireUser } from '@/lib/auth/get-user'
import { SectorPageClient } from './page-client'

export default async function PassadoriaPage() {
  const user = await requireUser()
  return (
    <SectorPageClient
      unitId={user.unit_id!}
      operatorName={user.full_name}
      sectorKey="ironing"
      sectorName="Passadoria"
      statuses={['ironing']}
    />
  )
}
