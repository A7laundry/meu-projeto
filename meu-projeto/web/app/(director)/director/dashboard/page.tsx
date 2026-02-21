import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { getProductionKpis } from '@/lib/queries/production-kpis'
import { getNetworkFinancial, getNetworkSlaAlerts, getNetworkManifests } from '@/actions/director/consolidated'
import { getAdvancedKpis } from '@/actions/director/kpis-advanced'
import { getNpsScoreByUnit } from '@/actions/director/nps'
import { getWeeklyTrend } from '@/actions/director/trends'
import { evaluateKpiAlerts } from '@/lib/kpi-alerts'
import { FinancialNetworkSummary } from '@/components/domain/director/financial-network-summary'
import { KpiAdvancedGrid } from '@/components/domain/director/kpi-advanced-grid'
import { NpsSummary } from '@/components/domain/director/nps-summary'
import { ExecutiveAlerts } from '@/components/domain/director/executive-alerts'
import { WeeklyTrendChart } from '@/components/domain/director/weekly-trend-chart'
import { BigGauge } from '@/components/domain/director/big-gauge'
import { UnitComparisonChart } from '@/components/domain/director/unit-comparison-chart'
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

  // ── Métricas consolidadas ─────────────────────────────
  const totalOrders   = allKpis.reduce((s, u) => s + u.kpis.dailyVolume.total_orders, 0)
  const totalLate     = allKpis.reduce((s, u) => s + u.kpis.onTimeVsLate.late, 0)
  const totalOnTime   = allKpis.reduce((s, u) => s + u.kpis.onTimeVsLate.on_time, 0)
  const totalInQueue  = allKpis.reduce((s, u) => s + u.kpis.queueByStatus.reduce((qs, q) => qs + q.count, 0), 0)
  const totalSlaAlerts = slaAlerts.reduce((s, u) => s + u.alertCount, 0)
  const executiveAlerts = evaluateKpiAlerts({ advancedKpis, slaAlerts, manifestSummaries, npsScores })

  // KPIs de gauge
  const networkOnTimePct = totalOrders > 0
    ? Math.round((totalOnTime / totalOrders) * 100)
    : 100
  const slaHealthPct = totalSlaAlerts === 0
    ? 100
    : Math.max(0, Math.round(100 - (totalSlaAlerts / Math.max(totalOrders, 1)) * 100))
  const onTimeColor  = networkOnTimePct >= 90 ? '#10b981' : networkOnTimePct >= 70 ? '#f59e0b' : '#f87171'
  const slaColor     = slaHealthPct >= 90 ? '#10b981' : slaHealthPct >= 70 ? '#f59e0b' : '#f87171'

  // Dados do comparativo por unidade
  const comparisonData = allKpis.map(({ unit, kpis }) => ({
    name: unit.name,
    onTime:  kpis.onTimeVsLate.on_time,
    inQueue: kpis.queueByStatus.reduce((s, q) => s + q.count, 0),
    late:    kpis.onTimeVsLate.late,
  }))

  const timestamp = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className="p-6 space-y-8">

      {/* ── Header ───────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard Executivo</h1>
          <p className="text-sm text-white/40 mt-1">
            <span className="text-white/60 font-medium">{unitList.length}</span> unidade{unitList.length !== 1 ? 's' : ''} ativas
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

      {/* ── HERO: Gauges + Trend ──────────────────────── */}
      <section>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* Gauges — 2 cols */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-5">
            {/* Gauge 1 — No prazo (rede) */}
            <div
              className="card-dark rounded-xl p-5 flex flex-col items-center justify-center animate-fade-up stagger-1"
              style={{ minHeight: 220 }}
            >
              <BigGauge
                percent={networkOnTimePct}
                centerValue={`${networkOnTimePct}%`}
                centerSub="no prazo"
                label="Pontualidade"
                sublabel="Toda a rede"
                color={onTimeColor}
                size={150}
              />
            </div>

            {/* Gauge 2 — SLA health */}
            <div
              className="card-dark rounded-xl p-5 flex flex-col items-center justify-center animate-fade-up stagger-2"
              style={{ minHeight: 220 }}
            >
              <BigGauge
                percent={slaHealthPct}
                centerValue={totalSlaAlerts === 0 ? 'OK' : String(totalSlaAlerts)}
                centerSub={totalSlaAlerts === 0 ? 'sem alertas' : `alerta${totalSlaAlerts !== 1 ? 's' : ''}`}
                label="Saúde SLA"
                sublabel="Excedidos agora"
                color={slaColor}
                size={150}
              />
            </div>

            {/* Stats adicionais */}
            <div className="col-span-2 grid grid-cols-2 gap-3">
              <div className="card-stat rounded-xl px-4 py-3 animate-fade-up stagger-3">
                <p className="text-xs text-white/35 mb-1">Comandas hoje</p>
                <p className="text-2xl font-bold num-stat text-white">{totalOrders.toLocaleString('pt-BR')}</p>
                <p className="text-xs text-white/25 mt-0.5">criadas na rede</p>
              </div>
              <div className="card-stat rounded-xl px-4 py-3 animate-fade-up stagger-4">
                <p className="text-xs text-white/35 mb-1">Em processo</p>
                <p className="text-2xl font-bold num-stat" style={{ color: '#a78bfa' }}>{totalInQueue.toLocaleString('pt-BR')}</p>
                <p className="text-xs text-white/25 mt-0.5">todos os setores</p>
              </div>
              <div className={`col-span-2 rounded-xl px-4 py-3 animate-fade-up stagger-5 ${totalLate > 0 ? 'card-alert' : 'card-stat'}`}>
                <p className="text-xs text-white/35 mb-1">Atrasadas</p>
                <div className="flex items-baseline gap-2">
                  <p className={`text-2xl font-bold num-stat ${totalLate > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {totalLate > 0 ? totalLate.toLocaleString('pt-BR') : '✓ Zero'}
                  </p>
                  {totalLate > 0 && (
                    <AlertTriangle size={14} className="text-red-400/70" />
                  )}
                </div>
                <p className="text-xs text-white/25 mt-0.5">todas as unidades</p>
              </div>
            </div>
          </div>

          {/* Trend chart — 3 cols, taller */}
          <div className="lg:col-span-3 animate-fade-up stagger-2">
            <WeeklyTrendChart data={weeklyTrend} height={340} />
          </div>
        </div>
      </section>

      {/* ── Comparativo por Unidade ───────────────────── */}
      <section className="animate-fade-up stagger-3">
        <UnitComparisonChart
          data={comparisonData}
          height={Math.max(160, comparisonData.length * 52)}
        />
      </section>

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

      {/* ── Unidades — Detalhe ───────────────────────── */}
      <section className="space-y-4">
        <h2 className="section-title">
          Unidades
          <span className="count-badge">{unitList.length} ativas</span>
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                className={`rounded-xl p-5 space-y-3 animate-fade-up ${unitSla > 0 ? 'card-alert' : 'card-dark'}`}
                style={{ animationDelay: `${idx * 0.06}s` }}
              >
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

                {/* Stats inline */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    { label: 'Comandas', value: kpis.dailyVolume.total_orders, color: 'text-white' },
                    { label: 'Em fila', value: inQueue, color: 'text-violet-400' },
                    { label: 'Atrasadas', value: kpis.onTimeVsLate.late, color: kpis.onTimeVsLate.late > 0 ? 'text-red-400' : 'text-white/40' },
                    { label: 'Romaneios', value: unitManifest ? `${unitManifest.completedManifests}/${unitManifest.totalManifests}` : '—', color: 'text-white/60' },
                  ].map((s) => (
                    <div key={s.label} className="rounded-lg bg-white/03 py-2 px-1">
                      <p className={`text-base font-bold num-stat ${s.color}`}>{typeof s.value === 'number' ? s.value.toLocaleString('pt-BR') : s.value}</p>
                      <p className="text-[10px] text-white/30 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Pipeline pills */}
                {activeStatuses.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/05">
                    {activeStatuses.map((q) => {
                      const color = STATUS_COLOR[q.status] ?? '#94a3b8'
                      const label = STATUS_LABEL_SHORT[q.status] ?? q.status
                      return (
                        <span
                          key={q.status}
                          className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                          style={{ background: `${color}12`, border: `1px solid ${color}22`, color }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
                          {label} <span className="num-stat font-semibold">{q.count}</span>
                        </span>
                      )
                    })}
                    <span
                      className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ml-auto num-stat font-semibold"
                      style={{
                        background: onTimePct >= 90 ? 'rgba(52,211,153,0.10)' : 'rgba(251,146,60,0.10)',
                        border: `1px solid ${onTimePct >= 90 ? 'rgba(52,211,153,0.20)' : 'rgba(251,146,60,0.20)'}`,
                        color: onTimePct >= 90 ? '#34d399' : '#fb923c',
                      }}
                    >
                      {onTimePct}% prazo
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
