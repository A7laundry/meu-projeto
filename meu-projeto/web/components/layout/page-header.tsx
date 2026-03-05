import type { LucideIcon } from 'lucide-react'

interface PageHeaderProps {
  /** Overline text above title */
  overline?: string
  /** Page title */
  title: string
  /** Subtitle/description */
  subtitle?: React.ReactNode
  /** Accent color for overline */
  accent?: string
  /** Right-side actions */
  actions?: React.ReactNode
  /** Optional icon */
  icon?: LucideIcon
}

export function PageHeader({
  overline,
  title,
  subtitle,
  accent = '#3b82f6',
  actions,
  icon: Icon,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
      <div className="min-w-0">
        {overline && (
          <p
            className="text-[11px] uppercase tracking-[0.16em] font-semibold mb-2"
            style={{ color: `${accent}88` }}
          >
            {overline}
          </p>
        )}
        <div className="flex items-center gap-3">
          {Icon && (
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${accent}12`, border: `1px solid ${accent}22` }}
            >
              <Icon size={20} style={{ color: accent }} />
            </div>
          )}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{title}</h1>
            {subtitle && (
              <p className="text-sm text-white/40 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  )
}
