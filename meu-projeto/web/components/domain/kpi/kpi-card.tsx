interface KpiCardProps {
  title: string
  value: string | number
  unit?: string
  trend?: number
  subtitle?: string
  highlight?: boolean
  alert?: boolean
  stagger?: 1 | 2 | 3 | 4 | 5 | 6
}

function formatValue(value: string | number): string {
  if (typeof value === 'number') {
    return value.toLocaleString('pt-BR')
  }
  return value
}

export function KpiCard({ title, value, unit, trend, subtitle, highlight, alert, stagger }: KpiCardProps) {
  const cardClass = alert
    ? 'card-alert'
    : highlight
      ? 'card-gold glow-gold'
      : 'card-stat'

  const staggerClass = stagger ? `stagger-${stagger}` : ''

  return (
    <div className={`rounded-xl p-5 space-y-2 animate-fade-up ${staggerClass} ${cardClass}`}>
      <p className="section-header">{title}</p>
      <div className="flex items-end gap-2">
        <span
          className={`text-3xl font-bold num-stat ${
            highlight ? 'gold-text' : alert ? 'text-red-400' : 'text-white'
          }`}
        >
          {formatValue(value)}
        </span>
        {unit && (
          <span className="text-sm text-white/40 mb-1">{unit}</span>
        )}
        {trend !== undefined && trend !== 0 && (
          <span
            className={`text-xs font-semibold mb-1 px-1.5 py-0.5 rounded-md ${
              trend > 0
                ? 'text-emerald-400 bg-emerald-400/10'
                : 'text-red-400 bg-red-400/10'
            }`}
          >
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      {subtitle && (
        <p className="text-xs text-white/35">{subtitle}</p>
      )}
    </div>
  )
}
