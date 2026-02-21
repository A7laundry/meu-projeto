import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { getProductionKpis } from '@/lib/queries/production-kpis'
import { getNetworkFinancial, getNetworkSlaAlerts, getNetworkManifests } from '@/actions/director/consolidated'
import { getAdvancedKpis } from '@/actions/director/kpis-advanced'
import { getNpsScoreByUnit } from '@/actions/director/nps'
import { getWeeklyTrend } from '@/actions/director/trends'
import { evaluateKpiAlerts } from '@/lib/kpi-alerts'
import { KpiCard } from '@/components/domain/kpi/kpi-card'
import { ProductionChart } from '@/components/domain/kpi/production-chart'
import { FinancialNetworkSummary } from '@/components/domain/director/financial-network-summary'
import { KpiAdvancedGrid } from '@/components/domain/director/kpi-advanced-grid'
import { NpsSummary } from '@/components/domain/director/nps-summary'
import { ExecutiveAlerts } from '@/components/domain/director/executive-alerts'
import { WeeklyTrendChart } from '@/components/domain/director/weekly-trend-chart'
import { LiveIndicator } from '@/components/ui/live-indicator'
import type { Unit } from '@/types/unit'

export const revalidate = 60

export default async function DirectorDashboardPage() {
  const supabase = createAdminClient()

  const { data: units } = await supabase
    .from('units')
    .select('id, name')
    .eq('active', true)
    .order('name')

  const unitList = (units ?? []) as Pick<Unit, 'id' | 'name'>[]
  const unitIds = unitList.map((u) => u.id)

  const [allKpis, networkFinancial, slaAlerts, manifestSummaries, advancedKpis, npsScores, weeklyTrend] =
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
      getWeeklyTrend(unitIds),
    ])

  const totalOrders = allKpis.reduce((s, u) => s + u.kpis.dailyVolume.total_orders, 0)
  const totalPieces = allKpis.reduce((s, u) => s + u.kpis.dailyVolume.total_items, 0)
  const totalInQueue = allKpis.reduce(
    (s, u) => s + u.kpis.queueByStatus.reduce((qs, q) => qs + q.count, 0),
    0,
  )
  const totalLate = allKpis.reduce((s, u) => s + u.kpis.onTimeVsLate.late, 0)
  const totalSlaAlerts = slaAlerts.reduce((s, u) => s + u.alertCount, 0)
  const executiveAlerts = evaluateKpiAlerts({
    advancedKpis,
    slaAlerts,
    manifestSummaries,
    npsScores,
  })

  const timestamp = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard do Diretor</h1>
          <p className="text-sm text-white/40 mt-0.5">
            Consolidado de {units?.length ?? 0} unidade{(units?.length ?? 0) !== 1 ? 's' : ''}
          </p>
          <p className="text-xs text-white/20 mt-1 num-stat">Atualizado em {timestamp}</p>
        </div>
        <div className="flex items-center gap-4">
          <LiveIndicator intervalSeconds={60} />
          <div className="w-px h-4 bg-white/10" />
          <Link href="/director/nps" className="text-sm text-[#d6b25e] hover:text-[#b98a2c] transition-colors">
            NPS
          </Link>
          <Link href="/director/reports" className="text-sm text-[#d6b25e] hover:text-[#b98a2c] transition-colors">
            Relatórios
          </Link>
        </div>
      </div>

      {/* Alertas Executivos */}
      <ExecutiveAlerts alerts={executiveAlerts} />

      {/* Produção */}
      <section className="space-y-3">
        <h2 className="section-header">Produção — Hoje</h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <KpiCard title="Comandas hoje (rede)" value={totalOrders} highlight stagger={1} />
          <KpiCard title="Peças hoje (rede)" value={totalPieces} unit="peças" stagger={2} />
          <KpiCard title="Em processo agora" value={totalInQueue} stagger={3} />
          <KpiCard title="Atrasadas" value={totalLate} subtitle="Todas as unidades" alert={totalLate > 0} stagger={4} />
          <KpiCard title="Alertas SLA" value={totalSlaAlerts} subtitle="Em excesso agora" alert={totalSlaAlerts > 0} stagger={5} />
        </div>
      </section>

      {/* Tendência Semanal */}
      <WeeklyTrendChart data={weeklyTrend} />

      {/* KPIs Avançados */}
      <section className="space-y-3">
        <h2 className="section-header">KPIs Avançados</h2>
        <KpiAdvancedGrid kpis={advancedKpis} />
      </section>

      {/* NPS */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="section-header">NPS — Satisfação dos Clientes</h2>
          <Link href="/director/nps" className="text-xs text-[#d6b25e] hover:underline">
            Ver detalhes →
          </Link>
        </div>
        {npsScores.some((s) => s.totalResponses > 0) ? (
          <NpsSummary scores={npsScores} />
        ) : (
          <div className="rounded-lg border border-white/08 bg-white/03 px-4 py-3 text-sm text-white/35">
            Nenhuma resposta NPS registrada ainda.
          </div>
        )}
      </section>

      {/* Financeiro da Rede */}
      <section className="space-y-3">
        <h2 className="section-header">Financeiro</h2>
        <FinancialNetworkSummary financial={networkFinancial} />
      </section>

      {/* Cards por unidade */}
      <section className="space-y-4">
        <h2 className="section-header">Unidades</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {allKpis.map(({ unit, kpis }, idx) => {
            const inQueue = kpis.queueByStatus.reduce((s, q) => s + q.count, 0)
            const unitSla = slaAlerts.find((u) => u.unitId === unit.id)?.alertCount ?? 0
            const unitManifest = manifestSummaries.find((m) => m.unitId === unit.id)

            return (
              <div
                key={unit.id}
                className={`rounded-xl p-5 space-y-4 animate-fade-up ${unitSla > 0 ? 'card-alert' : 'card-dark'}`}
                style={{ animationDelay: `${idx * 0.08}s` }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white">{unit.name}</h3>
                  <div className="flex items-center gap-2">
                    {unitSla > 0 && (
                      <Link
                        href={`/unit/${unit.id}/alerts`}
                        className="text-xs bg-red-500/15 text-red-400 px-2 py-0.5 rounded-full font-medium hover:bg-red-500/25 transition-colors border border-red-500/20"
                      >
                        {unitSla} alerta{unitSla !== 1 ? 's' : ''}
                      </Link>
                    )}
                    <Link
                      href={`/unit/${unit.id}/dashboard`}
                      className="text-xs text-[#d6b25e]/70 hover:text-[#d6b25e] transition-colors"
                    >
                      Ver unidade →
                    </Link>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <KpiCard title="Comandas" value={kpis.dailyVolume.total_orders} />
                  <KpiCard title="Em fila" value={inQueue} />
                  <KpiCard title="Atrasadas" value={kpis.onTimeVsLate.late} alert={kpis.onTimeVsLate.late > 0} />
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
