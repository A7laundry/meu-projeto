interface KpiCardProps {
  title: string
  value: string | number
  unit?: string
  trend?: number
  subtitle?: string
  highlight?: boolean
  alert?: boolean
}

export function KpiCard({ title, value, unit, trend, subtitle, highlight, alert }: KpiCardProps) {
  const cardClass = alert
    ? 'card-alert'
    : highlight
      ? 'card-gold glow-gold'
      : 'card-stat'

  return (
    <div className={`rounded-xl p-5 space-y-2 animate-fade-up ${cardClass}`}>
      <p className="section-header">{title}</p>
      <div className="flex items-end gap-2">
        <span
          className={`text-3xl font-bold tracking-tight ${
            highlight ? 'gold-text' : alert ? 'text-red-400' : 'text-white'
          }`}
        >
          {value}
        </span>
        {unit && (
          <span className="text-sm text-white/40 mb-1">{unit}</span>
        )}
        {trend !== undefined && trend !== 0 && (
          <span
            className={`text-sm font-semibold mb-1 ${
              trend > 0 ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {trend > 0 ? '▲' : '▼'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      {subtitle && (
        <p className="text-xs text-white/35">{subtitle}</p>
      )}
    </div>
  )
}
