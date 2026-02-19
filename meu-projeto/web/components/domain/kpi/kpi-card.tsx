interface KpiCardProps {
  title: string
  value: string | number
  unit?: string
  trend?: number
  subtitle?: string
  highlight?: boolean
}

export function KpiCard({ title, value, unit, trend, subtitle, highlight }: KpiCardProps) {
  return (
    <div
      className={`rounded-xl border p-5 space-y-2 ${
        highlight
          ? 'border-blue-200 bg-blue-50'
          : 'border-gray-200 bg-white'
      }`}
    >
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold text-gray-900">{value}</span>
        {unit && <span className="text-sm text-gray-500 mb-1">{unit}</span>}
        {trend !== undefined && trend !== 0 && (
          <span
            className={`text-sm font-medium mb-1 ${
              trend > 0 ? 'text-emerald-600' : 'text-red-500'
            }`}
          >
            {trend > 0 ? '▲' : '▼'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
    </div>
  )
}
