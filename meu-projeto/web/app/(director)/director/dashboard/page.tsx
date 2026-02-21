import Link from 'next/link'
import {
  ClipboardList,
  Package,
  Activity,
  Clock,
  AlertTriangle,
} from 'lucide-react'
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
import type { OrderStatus } from '@/types/order'

export const revalidate = 60

const STATUS_LABEL_SHORT: Partial<Record<OrderStatus, string>> = {
  received:  'Receb.',
  sorting:   'Triagem',
  washing:   'Lavagem',
  drying:    'Secagem',
  ironing:   'Passad.',
  ready:     'Pronto',
  shipped:   'Enviado',
}
const STATUS_COLOR: Partial<Record<OrderStatus, string>> = {
  received:  '#94a3b8',
  sorting:   '#f59e0b',
  washing:   '#3b82f6',
  drying:    '#f97316',
  ironing:   '#8b5cf6',
  ready:     '#10b981',
  shipped:   '#06b6d4',
}

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
      Promise.all(unitList.map(async (unit) => ({ unit, kpis: await getProductionKpis(unit.id) }))),
      getNetworkFinancial(unitIds),
      getNetworkSlaAlerts(unitIds),
      getNetworkManifests(unitIds),
      getAdvancedKpis(unitIds),
      getNpsScoreByUnit(unitList),
      getWeeklyTrend(unitIds),
    ])

  const totalOrders    = allKpis.reduce((s, u) => s + u.kpis.dailyVolume.total_orders, 0)
  const totalPieces    = allKpis.reduce((s, u) => s + u.kpis.dailyVolume.total_items, 0)
  const totalInQueue   = allKpis.reduce((s, u) => s + u.kpis.queueByStatus.reduce((qs, q) => qs + q.count, 0), 0)
  const totalLate      = allKpis.reduce((s, u) => s + u.kpis.onTimeVsLate.late, 0)
  const totalSlaAlerts = slaAlerts.reduce((s, u) => s + u.alertCount, 0)
  const executiveAlerts = evaluateKpiAlerts({ advancedKpis, slaAlerts, manifestSummaries, npsScores })

  const timestamp = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className="p-6 space-y-10">

      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard do Diretor</h1>
          <p className="text-sm text-white/40 mt-1">
            Consolidado de <span className="text-white/60 font-medium">{unitList.length}</span> unidade{unitList.length !== 1 ? 's' : ''}
            <span className="mx-2 text-white/20">·</span>
            <span className="num-stat text-white/30 text-xs">{timestamp}</span>
          </p>
        </div>
        <div className="flex items-center gap-4">
          <LiveIndicator intervalSeconds={60} />
          <div className="w-px h-4 bg-white/10" />
          <Link href="/director/nps" className="text-sm text-[#d6b25e]/70 hover:text-[#d6b25e] transition-colors">NPS</Link>
          <Link href="/director/reports" className="text-sm text-[#d6b25e]/70 hover:text-[#d6b25e] transition-colors">Relatórios</Link>
        </div>
      </div>

      {/* ── Alertas Executivos ─────────────────────────── */}
      <ExecutiveAlerts alerts={executiveAlerts} />

      {/* ── Produção — KPIs com ícone ─────────────────── */}
      <section className="space-y-4">
        <h2 className="section-title">
          Produção — Hoje
          <span className="count-badge">{totalOrders} comandas</span>
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <KpiCard
            title="Comandas hoje (rede)" value={totalOrders} highlight stagger={1}
            icon={ClipboardList} iconColor="#d6b25e" iconBg="rgba(214,178,94,0.12)"
          />
          <KpiCard
            title="Peças processadas" value={totalPieces} unit="pçs" stagger={2}
            icon={Package} iconColor="#60a5fa" iconBg="rgba(96,165,250,0.10)"
          />
          <KpiCard
            title="Em processo agora" value={totalInQueue} stagger={3}
            icon={Activity} iconColor="#a78bfa" iconBg="rgba(167,139,250,0.10)"
          />
          <KpiCard
            title="Atrasadas" value={totalLate} subtitle="Todas as unidades"
            alert={totalLate > 0} stagger={4}
            icon={Clock}
            iconColor={totalLate > 0 ? '#f87171' : '#94a3b8'}
            iconBg={totalLate > 0 ? 'rgba(248,113,113,0.10)' : 'rgba(148,163,184,0.08)'}
          />
          <KpiCard
            title="Alertas SLA" value={totalSlaAlerts} subtitle="Em excesso agora"
            alert={totalSlaAlerts > 0} stagger={5}
            icon={AlertTriangle}
            iconColor={totalSlaAlerts > 0 ? '#f87171' : '#94a3b8'}
            iconBg={totalSlaAlerts > 0 ? 'rgba(248,113,113,0.10)' : 'rgba(148,163,184,0.08)'}
          />
        </div>
      </section>

      {/* ── Tendência Semanal ──────────────────────────── */}
      <WeeklyTrendChart data={weeklyTrend} />

      {/* ── KPIs Avançados ────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="section-title">KPIs Avançados</h2>
        <KpiAdvancedGrid kpis={advancedKpis} />
      </section>

      {/* ── NPS ───────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="section-title" style={{ flex: 1 }}>NPS — Satisfação dos Clientes</h2>
          <Link href="/director/nps" className="text-xs text-[#d6b25e]/60 hover:text-[#d6b25e] transition-colors flex-shrink-0">
            Ver detalhes →
          </Link>
        </div>
        {npsScores.some((s) => s.totalResponses > 0) ? (
          <NpsSummary scores={npsScores} />
        ) : (
          <div className="rounded-xl border border-white/06 bg-white/02 px-5 py-4 text-sm text-white/30 italic">
            Nenhuma resposta NPS registrada ainda.
          </div>
        )}
      </section>

      {/* ── Financeiro da Rede ────────────────────────── */}
      <section className="space-y-4">
        <h2 className="section-title">Financeiro da Rede</h2>
        <FinancialNetworkSummary financial={networkFinancial} />
      </section>

      {/* ── Unidades ──────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="section-title">
          Unidades
          <span className="count-badge">{unitList.length} ativas</span>
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {allKpis.map(({ unit, kpis }, idx) => {
            const inQueue   = kpis.queueByStatus.reduce((s, q) => s + q.count, 0)
            const unitSla   = slaAlerts.find((u) => u.unitId === unit.id)?.alertCount ?? 0
            const unitManifest = manifestSummaries.find((m) => m.unitId === unit.id)
            const onTimePct = kpis.dailyVolume.total_orders > 0
              ? Math.round((kpis.onTimeVsLate.on_time / kpis.dailyVolume.total_orders) * 100)
              : 100
            const activeStatuses = kpis.queueByStatus.filter((q) => q.count > 0)

            return (
              <div
                key={unit.id}
                className={`rounded-xl p-5 space-y-4 animate-fade-up ${unitSla > 0 ? 'card-alert' : 'card-dark'}`}
                style={{ animationDelay: `${idx * 0.07}s` }}
              >
                {/* Header da unidade */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-2 h-2 rounded-full ${unitSla > 0 ? 'bg-red-400 animate-pulse' : 'bg-emerald-500'}`} />
                    <h3 className="font-semibold text-white text-sm">{unit.name}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {unitSla > 0 && (
                      <Link
                        href={`/unit/${unit.id}/alerts`}
                        className="text-xs bg-red-500/15 text-red-400 px-2 py-0.5 rounded-full font-medium hover:bg-red-500/25 transition-colors border border-red-500/20"
                      >
                        {unitSla} alerta{unitSla !== 1 ? 's' : ''}
                      </Link>
                    )}
                    <Link href={`/unit/${unit.id}/dashboard`} className="text-xs text-[#d6b25e]/60 hover:text-[#d6b25e] transition-colors">
                      Ver →
                    </Link>
                  </div>
                </div>

                {/* Mini KPIs em linha */}
                <div className="grid grid-cols-4 gap-3">
                  <KpiCard title="Comandas" value={kpis.dailyVolume.total_orders} />
                  <KpiCard title="Em fila" value={inQueue} />
                  <KpiCard title="Atrasadas" value={kpis.onTimeVsLate.late} alert={kpis.onTimeVsLate.late > 0} />
                  <KpiCard
                    title="Romaneios"
                    value={unitManifest ? `${unitManifest.completedManifests}/${unitManifest.totalManifests}` : '—'}
                  />
                </div>

                {/* Pipeline de status (pills coloridas) */}
                {activeStatuses.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1 border-t border-white/05">
                    {activeStatuses.map((q) => {
                      const color = STATUS_COLOR[q.status] ?? '#94a3b8'
                      const label = STATUS_LABEL_SHORT[q.status] ?? q.status
                      return (
                        <span
                          key={q.status}
                          className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
                          style={{ background: `${color}12`, border: `1px solid ${color}25`, color }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
                          {label} <span className="num-stat font-semibold">{q.count}</span>
                        </span>
                      )
                    })}
                    <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ml-auto"
                      style={{
                        background: onTimePct >= 90 ? 'rgba(52,211,153,0.10)' : 'rgba(251,146,60,0.10)',
                        border: `1px solid ${onTimePct >= 90 ? 'rgba(52,211,153,0.25)' : 'rgba(251,146,60,0.25)'}`,
                        color: onTimePct >= 90 ? '#34d399' : '#fb923c',
                      }}
                    >
                      <span className="num-stat font-semibold">{onTimePct}%</span> prazo
                    </span>
                  </div>
                )}

                <ProductionChart data={kpis.queueByStatus} />
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
