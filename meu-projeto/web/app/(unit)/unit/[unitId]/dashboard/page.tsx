import { getProductionKpis } from '@/lib/queries/production-kpis'
import { KpiCard } from '@/components/domain/kpi/kpi-card'
import { ProductionChart } from '@/components/domain/kpi/production-chart'
import { SectorQueueChart } from '@/components/domain/kpi/sector-queue-chart'

export const revalidate = 60

export default async function UnitDashboardPage({
  params,
}: {
  params: Promise<{ unitId: string }>
}) {
  const { unitId } = await params
  const kpis = await getProductionKpis(unitId)
  const { dailyVolume, queueByStatus, piecesPerSectorLastHour, onTimeVsLate } = kpis

  const totalInQueue = queueByStatus.reduce((s, q) => s + q.count, 0)
  const onTimePercent =
    dailyVolume.total_orders > 0
      ? Math.round((onTimeVsLate.on_time / dailyVolume.total_orders) * 100)
      : 100

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard de Produção</h1>
        <p className="text-sm text-gray-500 mt-0.5">Dados de hoje — atualiza a cada 60s</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Comandas do dia" value={dailyVolume.total_orders} subtitle="Criadas hoje" highlight />
        <KpiCard title="Peças processadas" value={dailyVolume.total_items} unit="peças" subtitle="Total de itens no dia" />
        <KpiCard title="Na fila agora" value={totalInQueue} subtitle="Em processo (todos os setores)" />
        <KpiCard title="No prazo" value={`${onTimePercent}%`} subtitle={`${onTimeVsLate.late} atrasada(s)`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProductionChart data={queueByStatus} />
        <SectorQueueChart data={piecesPerSectorLastHour} />
      </div>
    </div>
  )
}
