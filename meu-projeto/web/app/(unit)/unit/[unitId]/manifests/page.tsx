import { listRoutes } from '@/actions/routes/crud'
import { listManifests } from '@/actions/manifests/crud'
import { ManifestList } from '@/components/domain/logistics/manifest-list'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const revalidate = 0

export default async function ManifestsPage({
  params,
}: {
  params: Promise<{ unitId: string }>
}) {
  const { unitId } = await params
  const today = new Date().toISOString().split('T')[0]

  const [manifests, routes] = await Promise.all([
    listManifests(unitId, today),
    listRoutes(unitId),
  ])

  const todayWeekday = new Date().getDay() // 0=Dom ... 6=Sáb
  const todayRoutes = routes.filter(
    (r) => r.active && r.weekdays.includes(todayWeekday),
  )

  const todayLabel = format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Romaneio Diário</h1>
        <p className="text-sm text-white/40 mt-1 capitalize">{todayLabel}</p>
      </div>

      <ManifestList
        unitId={unitId}
        date={today}
        initialManifests={manifests}
        todayRoutes={todayRoutes}
      />
    </div>
  )
}
