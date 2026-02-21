import { listActiveClients } from '@/actions/clients/crud'
import { listRoutes } from '@/actions/routes/crud'
import { RouteList } from '@/components/domain/logistics/route-list'

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Rotas Fixas</h1>
        <p className="text-sm text-white/40 mt-1">
          Rotas de coleta e entrega com paradas em sequência
        </p>
      </div>

      <RouteList
        unitId={unitId}
        initialRoutes={routes}
        activeClients={activeClients}
      />
    </div>
  )
}
