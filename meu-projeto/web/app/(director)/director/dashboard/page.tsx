import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getProductionKpis } from '@/lib/queries/production-kpis'
import { getNetworkFinancial, getNetworkSlaAlerts, getNetworkManifests } from '@/actions/director/consolidated'
import { getAdvancedKpis } from '@/actions/director/kpis-advanced'
import { getNpsScoreByUnit } from '@/actions/director/nps'
import { evaluateKpiAlerts } from '@/actions/director/alerts'
import { KpiCard } from '@/components/domain/kpi/kpi-card'
import { ProductionChart } from '@/components/domain/kpi/production-chart'
import { FinancialNetworkSummary } from '@/components/domain/director/financial-network-summary'
import { KpiAdvancedGrid } from '@/components/domain/director/kpi-advanced-grid'
import { NpsSummary } from '@/components/domain/director/nps-summary'
import { ExecutiveAlerts } from '@/components/domain/director/executive-alerts'
import type { Unit } from '@/types/unit'

export const revalidate = 60

export default async function DirectorDashboardPage() {
  const supabase = await createClient()

  const { data: units } = await supabase
    .from('units')
    .select('id, name')
    .eq('active', true)
    .order('name')

  const unitList = (units ?? []) as Pick<Unit, 'id' | 'name'>[]
  const unitIds = unitList.map((u) => u.id)

  const [allKpis, networkFinancial, slaAlerts, manifestSummaries, advancedKpis, npsScores] =
    await Promise.all([
      Promise.all(
        unitList.map(async (unit) => ({
          unit,
          kpis: await getProductionKpis(unit.id),
        })),
      ),
      getNetworkFinancial(unitIds),
      getNetworkSlaAlerts(unitIds),
      getNetworkManifests(unitIds),
      getAdvancedKpis(unitIds),
      getNpsScoreByUnit(unitList),
    ])

  const totalOrders = allKpis.reduce((s, u) => s + u.kpis.dailyVolume.total_orders, 0)
  const totalPieces = allKpis.reduce((s, u) => s + u.kpis.dailyVolume.total_items, 0)
  const totalInQueue = allKpis.reduce(
    (s, u) => s + u.kpis.queueByStatus.reduce((qs, q) => qs + q.count, 0),
    0,
  )
  const totalLate = allKpis.reduce((s, u) => s + u.kpis.onTimeVsLate.late, 0)
  const totalSlaAlerts = slaAlerts.reduce((s, u) => s + u.alertCount, 0)
  const npsWithData = npsScores.filter((s) => s.totalResponses > 0)
  const executiveAlerts = evaluateKpiAlerts({
    advancedKpis,
    slaAlerts,
    manifestSummaries,
    npsScores,
  })

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard do Diretor</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Consolidado de {units?.length ?? 0} unidades — atualiza a cada 60s
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="/director/nps" className="text-sm text-blue-600 hover:underline">
            ⭐ NPS
          </Link>
          <Link href="/director/reports" className="text-sm text-blue-600 hover:underline">
            📊 Relatórios
          </Link>
        </div>
      </div>

      {/* Alertas Executivos */}
      <ExecutiveAlerts alerts={executiveAlerts} />

      {/* KPIs Produção */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard title="Comandas hoje (rede)" value={totalOrders} highlight />
        <KpiCard title="Peças hoje (rede)" value={totalPieces} unit="peças" />
        <KpiCard title="Em processo agora" value={totalInQueue} />
        <KpiCard title="Atrasadas" value={totalLate} subtitle="Todas as unidades" />
        <KpiCard title="Alertas SLA" value={totalSlaAlerts} subtitle="Em excesso agora" />
      </div>

      {/* KPIs Avançados */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          KPIs Avançados
        </h2>
        <KpiAdvancedGrid kpis={advancedKpis} />
      </section>

      {/* NPS */}
      {npsWithData.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              NPS — Satisfação dos Clientes
            </h2>
            <Link href="/director/nps" className="text-xs text-blue-600 hover:underline">
              Ver detalhes →
            </Link>
          </div>
          <NpsSummary scores={npsScores} />
        </section>
      )}

      {/* Financeiro da Rede */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Financeiro da Rede
        </h2>
        <FinancialNetworkSummary financial={networkFinancial} />
      </section>

      {/* Cards por unidade */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Por Unidade</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {allKpis.map(({ unit, kpis }) => {
            const inQueue = kpis.queueByStatus.reduce((s, q) => s + q.count, 0)
            const unitSla = slaAlerts.find((u) => u.unitId === unit.id)?.alertCount ?? 0
            const unitManifest = manifestSummaries.find((m) => m.unitId === unit.id)

            return (
              <div
                key={unit.id}
                className={`rounded-xl border bg-white p-5 space-y-4 ${
                  unitSla > 0 ? 'border-red-200' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">{unit.name}</h3>
                  <div className="flex items-center gap-2">
                    {unitSla > 0 && (
                      <Link
                        href={`/unit/${unit.id}/alerts`}
                        className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium hover:bg-red-200"
                      >
                        🚨 {unitSla} alerta{unitSla !== 1 ? 's' : ''}
                      </Link>
                    )}
                    <Link
                      href={`/unit/${unit.id}/dashboard`}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Ver unidade →
                    </Link>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <KpiCard title="Comandas" value={kpis.dailyVolume.total_orders} />
                  <KpiCard title="Em fila" value={inQueue} />
                  <KpiCard title="Atrasadas" value={kpis.onTimeVsLate.late} />
                  <KpiCard
                    title="Romaneios"
                    value={unitManifest ? `${unitManifest.completedManifests}/${unitManifest.totalManifests}` : '—'}
                  />
                </div>
                <ProductionChart data={kpis.queueByStatus} />
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
