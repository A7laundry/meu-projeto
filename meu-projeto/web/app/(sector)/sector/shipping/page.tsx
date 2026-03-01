import { requireUser } from '@/lib/auth/get-user'
import { listManifests } from '@/actions/manifests/crud'
import { SectorPageClient } from './page-client'

export default async function ExpedicaoPage() {
  const user = await requireUser()

  const today = new Date().toISOString().slice(0, 10)
  let manifestOptions: { id: string; label: string }[] = []
  try {
    const manifests = await listManifests(user.unit_id!, today)
    manifestOptions = manifests
      .filter((m) => m.status !== 'completed')
      .map((m) => ({
        id: m.id,
        label: `${m.route_name ?? 'Rota'} — ${m.driver_name ?? 'Sem motorista'}`,
      }))
  } catch {
    // Se não tiver permissão ou não houver romaneios, segue sem
  }

  return (
    <SectorPageClient
      unitId={user.unit_id!}
      operatorName={user.full_name}
      sectorKey="shipping"
      sectorName="Expedição"
      statuses={['ready']}
      manifests={manifestOptions}
    />
  )
}
