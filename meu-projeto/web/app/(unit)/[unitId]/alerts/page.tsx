import { requireUser } from '@/lib/auth/get-user'
import { getSlaAlerts } from '@/lib/queries/sla-alerts'
import { SlaAlertList } from '@/components/domain/production/sla-alert-list'

export const revalidate = 60

export default async function AlertsPage({
  params,
}: {
  params: Promise<{ unitId: string }>
}) {
  const { unitId } = await params
  const user = await requireUser()
  const alerts = await getSlaAlerts(unitId)

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Alertas de SLA
          {alerts.length > 0 && (
            <span className="ml-3 inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-700 text-sm font-bold">
              {alerts.length}
            </span>
          )}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Comandas paradas além do tempo esperado por setor · atualiza a cada 60s
        </p>
      </div>

      <SlaAlertList alerts={alerts} unitId={unitId} operatorId={user.id} />
    </div>
  )
}
