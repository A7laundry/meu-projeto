import type { LucideIcon } from 'lucide-react'

interface KpiCardProps {
  title: string
  value: string | number
  unit?: string
  trend?: number
  subtitle?: string
  highlight?: boolean
  alert?: boolean
  stagger?: 1 | 2 | 3 | 4 | 5 | 6
  icon?: LucideIcon
  iconColor?: string   // ex: '#60a5fa'
  iconBg?: string     // ex: 'rgba(96,165,250,0.12)'
}

function formatValue(value: string | number): string {
  if (typeof value === 'number') {
    return value.toLocaleString('pt-BR')
  }
  return value
}

export function KpiCard({
  title,
  value,
  unit,
  trend,
  subtitle,
  highlight,
  alert,
  stagger,
  icon: Icon,
  iconColor,
  iconBg,
}: KpiCardProps) {
  const cardClass = alert
    ? 'card-alert'
    : highlight
      ? 'card-gold glow-gold'
      : 'card-stat'

  const staggerClass = stagger ? `stagger-${stagger}` : ''
  const valueColor = highlight ? 'gold-text' : alert ? 'text-red-400' : 'text-white'

  // Versão com ícone — layout rico
  if (Icon) {
    return (
      <div className={`rounded-xl p-5 space-y-3 animate-fade-up ${staggerClass} ${cardClass}`}>
        <div className="flex items-start justify-between">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: iconBg ?? 'rgba(214,178,94,0.12)',
              border: `1px solid ${iconColor ?? '#d6b25e'}25`,
            }}
          >
            <Icon size={16} style={{ color: iconColor ?? '#d6b25e' }} />
          </div>
          {trend !== undefined && trend !== 0 && (
            <span
              className={`text-xs font-semibold px-1.5 py-0.5 rounded-md ${
                trend > 0 ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'
              }`}
            >
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </span>
          )}
        </div>
        <div>
          <div className="flex items-end gap-2">
            <span className={`text-3xl font-bold num-stat ${valueColor}`}>
              {formatValue(value)}
            </span>
            {unit && <span className="text-sm text-white/40 mb-1">{unit}</span>}
          </div>
          <p className="section-header mt-1.5">{title}</p>
          {subtitle && <p className="text-xs text-white/30 mt-1">{subtitle}</p>}
        </div>
      </div>
    )
  }

  // Versão compacta — sem ícone (padrão, para mini-cards)
  return (
    <div className={`rounded-xl p-5 space-y-2 animate-fade-up ${staggerClass} ${cardClass}`}>
      <p className="section-header">{title}</p>
      <div className="flex items-end gap-2">
        <span className={`text-3xl font-bold num-stat ${valueColor}`}>
          {formatValue(value)}
        </span>
        {unit && <span className="text-sm text-white/40 mb-1">{unit}</span>}
        {trend !== undefined && trend !== 0 && (
          <span
            className={`text-xs font-semibold mb-1 px-1.5 py-0.5 rounded-md ${
              trend > 0 ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'
            }`}
          >
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      {subtitle && <p className="text-xs text-white/35">{subtitle}</p>}
    </div>
  )
}
