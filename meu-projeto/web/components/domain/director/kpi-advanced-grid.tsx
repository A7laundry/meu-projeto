import { DollarSign, Zap, AlertTriangle, FlaskConical } from 'lucide-react'
import type { AdvancedKpis } from '@/actions/director/kpis-advanced'

interface Props {
  kpis: AdvancedKpis
}

const COLORS = {
  blue:   { text: 'text-blue-400',   bg: 'rgba(96,165,250,0.10)',   border: 'rgba(96,165,250,0.18)',   hex: '#60a5fa' },
  green:  { text: 'text-emerald-400', bg: 'rgba(52,211,153,0.10)',  border: 'rgba(52,211,153,0.18)',   hex: '#34d399' },
  orange: { text: 'text-orange-400', bg: 'rgba(251,146,60,0.10)',   border: 'rgba(251,146,60,0.18)',   hex: '#fb923c' },
  red:    { text: 'text-red-400',    bg: 'rgba(248,113,113,0.10)',  border: 'rgba(248,113,113,0.18)',  hex: '#f87171' },
  purple: { text: 'text-violet-400', bg: 'rgba(167,139,250,0.10)',  border: 'rgba(167,139,250,0.18)', hex: '#a78bfa' },
}

type ColorKey = keyof typeof COLORS

function StatCard({
  label,
  value,
  sub,
  colorKey,
  Icon,
}: {
  label: string
  value: string
  sub?: string
  colorKey: ColorKey
  Icon: React.ElementType
}) {
  const c = COLORS[colorKey]
  return (
    <div className="card-stat rounded-xl p-5 space-y-3">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center"
        style={{ background: c.bg, border: `1px solid ${c.border}` }}
      >
        <Icon size={16} className={c.text} />
      </div>
      <div>
        <p className={`text-2xl font-bold num-stat ${c.text}`}>{value}</p>
        <p className="section-header mt-1.5">{label}</p>
        {sub && <p className="text-xs text-white/25 mt-1">{sub}</p>}
      </div>
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

  const breakageColor: ColorKey = kpis.deliveryBreakageRate > 10 ? 'red' : 'orange'

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Custo por peça (mês)"
        value={kpis.costPerKg !== null ? `R$ ${fmt(kpis.costPerKg)}` : '—'}
        sub="Pagamentos ÷ peças"
        colorKey="blue"
        Icon={DollarSign}
      />
      <StatCard
        label="Peças/hora (rede)"
        value={avgPiecesPerHour !== null ? String(avgPiecesPerHour) : '—'}
        sub="Média das unidades"
        colorKey="green"
        Icon={Zap}
      />
      <StatCard
        label="Taxa de ruptura hoje"
        value={`${kpis.deliveryBreakageRate}%`}
        sub="Atrasadas ÷ total comandas"
        colorKey={breakageColor}
        Icon={AlertTriangle}
      />
      <StatCard
        label="Insumo por comanda"
        value={kpis.chemicalPerOrder !== null ? `${fmt(kpis.chemicalPerOrder, 1)} un` : '—'}
        sub="Saídas de químico ÷ comandas"
        colorKey="purple"
        Icon={FlaskConical}
      />
    </div>
  )
}
