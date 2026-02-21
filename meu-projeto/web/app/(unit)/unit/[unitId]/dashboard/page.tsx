import { ClipboardList, Package, Activity, DollarSign, TrendingDown, TrendingUp } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { getProductionKpis } from '@/lib/queries/production-kpis'
import { KpiCard } from '@/components/domain/kpi/kpi-card'
import { ProductionChart } from '@/components/domain/kpi/production-chart'
import { SectorQueueChart } from '@/components/domain/kpi/sector-queue-chart'
import { RingGauge } from '@/components/ui/ring-gauge'

export const revalidate = 60

async function getDailyRevenue(unitId: string): Promise<number> {
  const supabase = createAdminClient()
  const today = new Date().toISOString().split('T')[0]

  const [ordersRes, pricesRes] = await Promise.all([
    supabase
      .from('orders')
      .select('items:order_items(piece_type, quantity)')
      .eq('unit_id', unitId)
      .gte('created_at', `${today}T00:00:00`),
    supabase
      .from('price_table')
      .select('piece_type, price')
      .eq('unit_id', unitId)
      .eq('active', true),
  ])

  const priceMap = new Map<string, number>()
  for (const p of pricesRes.data ?? []) {
    priceMap.set(p.piece_type, Number(p.price))
  }

  let total = 0
  for (const order of ordersRes.data ?? []) {
    for (const item of (order.items as { piece_type: string; quantity: number }[] | null) ?? []) {
      total += (priceMap.get(item.piece_type) ?? 0) * item.quantity
    }
  }
  return total
}

async function getDailyChemicalCost(unitId: string): Promise<{
  totalCost: number
  byProduct: { name: string; qty: number; cost: number }[]
}> {
  const supabase = createAdminClient()
  const today = new Date().toISOString().split('T')[0]

  const { data } = await supabase
    .from('chemical_movements')
    .select('quantity, product:chemical_products(name, cost_per_unit, measure_unit)')
    .eq('unit_id', unitId)
    .eq('movement_type', 'out')
    .gte('created_at', `${today}T00:00:00`)

  const byProduct: { name: string; qty: number; cost: number }[] = []
  let totalCost = 0

  for (const row of data ?? []) {
    const product = Array.isArray(row.product) ? row.product[0] : row.product as { name: string; cost_per_unit: number } | null
    if (!product) continue
    const cost = row.quantity * product.cost_per_unit
    totalCost += cost
    const existing = byProduct.find((p) => p.name === product.name)
    if (existing) { existing.qty += row.quantity; existing.cost += cost }
    else byProduct.push({ name: product.name, qty: row.quantity, cost })
  }

  return { totalCost, byProduct: byProduct.sort((a, b) => b.cost - a.cost) }
}

export default async function UnitDashboardPage({
  params,
}: {
  params: Promise<{ unitId: string }>
}) {
  const { unitId } = await params
  const [kpis, chemical, dailyRevenue] = await Promise.all([
    getProductionKpis(unitId),
    getDailyChemicalCost(unitId),
    getDailyRevenue(unitId),
  ])

  const { dailyVolume, queueByStatus, piecesPerSectorLastHour, onTimeVsLate } = kpis
  const totalInQueue = queueByStatus.reduce((s, q) => s + q.count, 0)
  const onTimePercent = dailyVolume.total_orders > 0
    ? Math.round((onTimeVsLate.on_time / dailyVolume.total_orders) * 100)
    : 100
  const costPerOrder = dailyVolume.completed_orders > 0
    ? chemical.totalCost / dailyVolume.completed_orders
    : 0
  const maxChemicalCost = Math.max(...chemical.byProduct.map(p => p.cost), 1)

  const gaugeColor = onTimePercent >= 90 ? '#10b981' : onTimePercent >= 70 ? '#f59e0b' : '#f87171'

  return (
    <div className="p-6 space-y-10">

      {/* ── Header ─────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard de Produção</h1>
        <p className="text-sm text-white/40 mt-1">Dados de hoje — atualiza a cada 60s</p>
      </div>

      {/* ── KPIs principais ───────────────────────────── */}
      <section className="space-y-4">
        <h2 className="section-title">Produção — Hoje</h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <KpiCard
            title="Faturamento estimado" highlight stagger={1}
            value={dailyRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            subtitle="Comandas de hoje"
            icon={TrendingUp} iconColor="#34d399" iconBg="rgba(52,211,153,0.12)"
          />
          <KpiCard
            title="Comandas do dia" value={dailyVolume.total_orders}
            subtitle="Criadas hoje" stagger={2}
            icon={ClipboardList} iconColor="#d6b25e" iconBg="rgba(214,178,94,0.12)"
          />
          <KpiCard
            title="Peças processadas" value={dailyVolume.total_items}
            unit="pçs" subtitle="Total de itens" stagger={3}
            icon={Package} iconColor="#60a5fa" iconBg="rgba(96,165,250,0.10)"
          />
          <KpiCard
            title="Na fila agora" value={totalInQueue}
            subtitle="Todos os setores" stagger={4}
            icon={Activity} iconColor="#a78bfa" iconBg="rgba(167,139,250,0.10)"
          />

          {/* Ring gauge — No prazo */}
          <div className="card-stat rounded-xl p-5 flex flex-col items-center justify-center gap-2 animate-fade-up stagger-5">
            <RingGauge
              percent={onTimePercent}
              size={80}
              strokeWidth={7}
              color={gaugeColor}
            />
            <div className="text-center">
              <p className="section-header">No prazo</p>
              {onTimeVsLate.late > 0 && (
                <p className="text-xs text-red-400/70 mt-1 num-stat">
                  {onTimeVsLate.late} atrasada{onTimeVsLate.late !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Gráficos ───────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="section-title">Fila &amp; Setores — Agora</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProductionChart data={queueByStatus} />
          <SectorQueueChart data={piecesPerSectorLastHour} />
        </div>
      </section>

      {/* ── Custo de Insumos ──────────────────────────── */}
      <section className="space-y-4">
        <h2 className="section-title">Insumos — Hoje</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <KpiCard
            title="Total em insumos" stagger={1}
            value={`R$ ${chemical.totalCost.toFixed(2).replace('.', ',')}`}
            subtitle="Saídas de estoque de hoje"
            icon={DollarSign} iconColor="#34d399" iconBg="rgba(52,211,153,0.10)"
          />
          <KpiCard
            title="Custo por comanda" stagger={2}
            value={`R$ ${costPerOrder.toFixed(2).replace('.', ',')}`}
            subtitle={`${dailyVolume.completed_orders} comanda${dailyVolume.completed_orders !== 1 ? 's' : ''} concluída${dailyVolume.completed_orders !== 1 ? 's' : ''}`}
            icon={TrendingDown} iconColor="#fbbf24" iconBg="rgba(251,191,36,0.10)"
          />

          {/* Por produto com barras */}
          <div className="card-dark rounded-xl p-5 animate-fade-up stagger-3">
            <p className="section-header mb-4">Por produto</p>
            {chemical.byProduct.length === 0 ? (
              <p className="text-sm text-white/25 italic">Nenhuma saída de insumo hoje</p>
            ) : (
              <div className="space-y-3">
                {chemical.byProduct.slice(0, 4).map((p) => {
                  const pct = Math.round((p.cost / maxChemicalCost) * 100)
                  return (
                    <div key={p.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/55 truncate mr-2">{p.name}</span>
                        <span className="text-white font-medium num-stat flex-shrink-0">
                          R$ {p.cost.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                      <div className="h-1 rounded-full bg-white/04 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#d6b25e]/60"
                          style={{ width: `${pct}%`, transition: 'width 0.8s cubic-bezier(0.16,1,0.3,1)' }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
