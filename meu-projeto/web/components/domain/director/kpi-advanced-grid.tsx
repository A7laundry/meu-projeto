import type { AdvancedKpis } from '@/actions/director/kpis-advanced'

interface Props {
  kpis: AdvancedKpis
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
  const colors = {
    blue: 'bg-blue-50 border-blue-200 text-blue-800 text-blue-600',
    green: 'bg-green-50 border-green-200 text-green-800 text-green-600',
    orange: 'bg-orange-50 border-orange-200 text-orange-800 text-orange-600',
    purple: 'bg-purple-50 border-purple-200 text-purple-800 text-purple-600',
    red: 'bg-red-50 border-red-200 text-red-800 text-red-600',
  }
  const [bg, border, textMain, textSub] = colors[color].split(' ')

  return (
    <div className={`rounded-lg border ${bg} ${border} p-4`}>
      <p className={`text-lg font-bold ${textMain}`}>{value}</p>
      <p className={`text-xs ${textSub} mt-0.5`}>{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
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
