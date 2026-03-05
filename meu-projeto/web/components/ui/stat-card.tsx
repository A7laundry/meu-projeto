import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  /** Label above value */
  label: string
  /** Main value (number or string) */
  value: string | number
  /** Sub-label below value */
  sub?: string
  /** Accent color */
  accent?: string
  /** Optional icon */
  icon?: LucideIcon
  /** Trend indicator: positive, negative, neutral */
  trend?: { value: string; direction: 'up' | 'down' | 'neutral' }
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
}

export function StatCard({
  label,
  value,
  sub,
  accent = '#3b82f6',
  icon: Icon,
  trend,
  size = 'md',
}: StatCardProps) {
  const valueClass = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  }[size]

  return (
    <div
      className="relative overflow-hidden rounded-xl p-4 transition-all duration-200 hover:-translate-y-0.5 group"
      style={{
        background: `linear-gradient(145deg, ${accent}0a 0%, rgba(0,0,0,0.30) 100%)`,
        border: `1px solid ${accent}15`,
      }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, ${accent}66 0%, ${accent}11 60%, transparent 100%)` }}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-white/40 mb-1.5 truncate">{label}</p>
          <p
            className={`${valueClass} font-bold tracking-tight transition-all`}
            style={{
              color: 'white',
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '-0.03em',
            }}
          >
            {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
          </p>
          {sub && <p className="text-[11px] text-white/25 mt-1">{sub}</p>}
          {trend && (
            <div className="flex items-center gap-1 mt-1.5">
              <span
                className="text-[11px] font-semibold"
                style={{
                  color: trend.direction === 'up' ? '#34d399'
                    : trend.direction === 'down' ? '#f87171'
                    : 'rgba(255,255,255,0.35)',
                }}
              >
                {trend.direction === 'up' && '\u2191'}
                {trend.direction === 'down' && '\u2193'}
                {trend.value}
              </span>
            </div>
          )}
        </div>
        {Icon && (
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: `${accent}12`, border: `1px solid ${accent}1a` }}
          >
            <Icon size={18} style={{ color: `${accent}aa` }} />
          </div>
        )}
      </div>
    </div>
  )
}
