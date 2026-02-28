import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/get-user'
import { listManifests } from '@/actions/manifests/crud'
import { listRoutes } from '@/actions/routes/crud'
import { ColetasPageClient } from './page-client'

export default async function ColetasPage() {
  const user = await getUser()
  if (!user || user.role !== 'store' || !user.unit_id) redirect('/login')

  const today = new Date().toISOString().split('T')[0]

  const [manifests, routes] = await Promise.all([
    listManifests(user.unit_id, today),
    listRoutes(user.unit_id),
  ])

  return (
    <ColetasPageClient
      manifests={manifests}
      routes={routes}
      unitId={user.unit_id}
      date={today}
    />
  )
}
