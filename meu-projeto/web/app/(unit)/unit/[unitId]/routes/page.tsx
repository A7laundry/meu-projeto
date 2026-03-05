import { MapPin } from 'lucide-react'
import { listActiveClients } from '@/actions/clients/crud'
import { listRoutes } from '@/actions/routes/crud'
import { RouteList } from '@/components/domain/logistics/route-list'
import { PageHeader } from '@/components/layout/page-header'

export const revalidate = 0

export default async function RoutesPage({
  params,
}: {
  params: Promise<{ unitId: string }>
}) {
  const { unitId } = await params
  const [routes, activeClients] = await Promise.all([
    listRoutes(unitId),
    listActiveClients(unitId),
  ])

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <PageHeader
        overline="Unidade"
        title="Rotas Fixas"
        subtitle="Rotas de coleta e entrega com paradas em sequência"
        accent="#3b82f6"
        icon={MapPin}
      />

      <RouteList
        unitId={unitId}
        initialRoutes={routes}
        activeClients={activeClients}
      />
    </div>
  )
}
