import type { AdvancedKpis } from '@/actions/director/kpis-advanced'

interface Props {
  kpis: AdvancedKpis
}

const ACCENT_COLORS: Record<string, string> = {
  blue: 'text-blue-400',
  green: 'text-emerald-400',
  orange: 'text-orange-400',
  purple: 'text-violet-400',
  red: 'text-red-400',
}

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string
  value: string
  sub?: string
  color: 'blue' | 'green' | 'orange' | 'purple' | 'red'
}) {
  return (
    <div className="card-stat rounded-xl p-4">
      <p className={`text-2xl font-bold ${ACCENT_COLORS[color]}`}>{value}</p>
      <p className="text-xs text-white/50 mt-1 font-semibold uppercase tracking-wide">{label}</p>
      {sub && <p className="text-xs text-white/25 mt-0.5">{sub}</p>}
    </div>
  )
}

export function KpiAdvancedGrid({ kpis }: Props) {
  const fmt = (v: number | null, decimals = 2) =>
    v === null ? '—' : v.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })

  const avgPiecesPerHour =
    kpis.piecesPerHourByUnit.filter((u) => u.piecesPerHour !== null).length > 0
      ? Math.round(
          kpis.piecesPerHourByUnit
            .filter((u) => u.piecesPerHour !== null)
            .reduce((s, u) => s + (u.piecesPerHour ?? 0), 0) /
            kpis.piecesPerHourByUnit.filter((u) => u.piecesPerHour !== null).length,
        )
      : null

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Custo por peça (mês)"
        value={kpis.costPerKg !== null ? `R$ ${fmt(kpis.costPerKg)}` : '—'}
        sub="Pagamentos ÷ peças processadas"
        color="blue"
      />
      <StatCard
        label="Peças/hora (média rede)"
        value={avgPiecesPerHour !== null ? String(avgPiecesPerHour) : '—'}
        sub="Média das unidades com dados"
        color="green"
      />
      <StatCard
        label="Taxa de ruptura hoje"
        value={`${kpis.deliveryBreakageRate}%`}
        sub="Comandas atrasadas / total"
        color={kpis.deliveryBreakageRate > 10 ? 'red' : 'orange'}
      />
      <StatCard
        label="Insumo por comanda hoje"
        value={kpis.chemicalPerOrder !== null ? `${fmt(kpis.chemicalPerOrder, 1)} un` : '—'}
        sub="Saídas de químico ÷ comandas"
        color="purple"
      />
    </div>
  )
}
