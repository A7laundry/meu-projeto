import { createAdminClient } from '@/lib/supabase/admin'
import { getProductionKpis } from '@/lib/queries/production-kpis'
import { KpiCard } from '@/components/domain/kpi/kpi-card'
import { ProductionChart } from '@/components/domain/kpi/production-chart'
import { SectorQueueChart } from '@/components/domain/kpi/sector-queue-chart'

export const revalidate = 60

/* ─── Custo de insumos do dia ──────────────────────────────────── */

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
    const product = Array.isArray(row.product) ? row.product[0] : row.product as { name: string; cost_per_unit: number; measure_unit: string } | null
    if (!product) continue
    const cost = row.quantity * product.cost_per_unit
    totalCost += cost
    const existing = byProduct.find((p) => p.name === product.name)
    if (existing) {
      existing.qty += row.quantity
      existing.cost += cost
    } else {
      byProduct.push({ name: product.name, qty: row.quantity, cost })
    }
  }

  return { totalCost, byProduct: byProduct.sort((a, b) => b.cost - a.cost) }
}

/* ─── Página ────────────────────────────────────────────────────── */

export default async function UnitDashboardPage({
  params,
}: {
  params: Promise<{ unitId: string }>
}) {
  const { unitId } = await params
  const [kpis, chemical] = await Promise.all([
    getProductionKpis(unitId),
    getDailyChemicalCost(unitId),
  ])

  const { dailyVolume, queueByStatus, piecesPerSectorLastHour, onTimeVsLate } = kpis
  const totalInQueue = queueByStatus.reduce((s, q) => s + q.count, 0)
  const onTimePercent =
    dailyVolume.total_orders > 0
      ? Math.round((onTimeVsLate.on_time / dailyVolume.total_orders) * 100)
      : 100
  const costPerOrder =
    dailyVolume.completed_orders > 0
      ? chemical.totalCost / dailyVolume.completed_orders
      : 0

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard de Produção</h1>
        <p className="text-sm text-white/40 mt-0.5">Dados de hoje — atualiza a cada 60s</p>
      </div>

      {/* KPIs principais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Comandas do dia"    value={dailyVolume.total_orders}    subtitle="Criadas hoje"                   highlight />
        <KpiCard title="Peças processadas"  value={dailyVolume.total_items}      unit="peças" subtitle="Total de itens"  />
        <KpiCard title="Na fila agora"      value={totalInQueue}                 subtitle="Em processo (todos os setores)" />
        <KpiCard
          title="No prazo"
          value={`${onTimePercent}%`}
          subtitle={`${onTimeVsLate.late} atrasada(s)`}
          alert={onTimeVsLate.late > 0}
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProductionChart data={queueByStatus} />
        <SectorQueueChart data={piecesPerSectorLastHour} />
      </div>

      {/* Custo de insumos do dia */}
      <section>
        <h2 className="section-header mb-4">Custo de Insumos — Hoje</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="card-stat rounded-xl p-5 space-y-1">
            <p className="section-header">Total gasto em insumos</p>
            <p className="text-2xl font-bold text-white">
              R$ {chemical.totalCost.toFixed(2).replace('.', ',')}
            </p>
            <p className="text-xs text-white/35">Saídas de estoque de hoje</p>
          </div>
          <div className="card-stat rounded-xl p-5 space-y-1">
            <p className="section-header">Custo por comanda</p>
            <p className="text-2xl font-bold text-white">
              R$ {costPerOrder.toFixed(2).replace('.', ',')}
            </p>
            <p className="text-xs text-white/35">
              Baseado em {dailyVolume.completed_orders} comanda{dailyVolume.completed_orders !== 1 ? 's' : ''} concluída{dailyVolume.completed_orders !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="card-dark rounded-xl p-5">
            <p className="section-header mb-3">Por produto</p>
            {chemical.byProduct.length === 0 ? (
              <p className="text-sm text-white/30 italic">Nenhuma saída de insumo hoje</p>
            ) : (
              <div className="space-y-2">
                {chemical.byProduct.slice(0, 4).map((p) => (
                  <div key={p.name} className="flex items-center justify-between text-sm">
                    <span className="text-white/60 truncate mr-2">{p.name}</span>
                    <div className="text-right flex-shrink-0">
                      <span className="font-medium text-white">
                        R$ {p.cost.toFixed(2).replace('.', ',')}
                      </span>
                      <span className="text-xs text-white/35 ml-1">({p.qty.toFixed(1)}×)</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
