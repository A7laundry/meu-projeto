import { Bell } from 'lucide-react'
import { requireUser } from '@/lib/auth/get-user'
import { getSlaAlerts } from '@/lib/queries/sla-alerts'
import { SlaAlertList } from '@/components/domain/production/sla-alert-list'
import { PageHeader } from '@/components/layout/page-header'

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
      <PageHeader
        overline="Unidade"
        title={`Alertas de SLA${alerts.length > 0 ? ` (${alerts.length})` : ''}`}
        subtitle="Comandas paradas além do tempo esperado por setor · atualiza a cada 60s"
        accent="#3b82f6"
        icon={Bell}
      />

      <SlaAlertList alerts={alerts} unitId={unitId} operatorId={user.id} />
    </div>
  )
}
