import type { KpiAlert } from '@/lib/kpi-thresholds'

interface Props {
  alerts: KpiAlert[]
}

export function ExecutiveAlerts({ alerts }: Props) {
  if (alerts.length === 0) return null

  const critical = alerts.filter((a) => a.level === 'critical')
  const warnings = alerts.filter((a) => a.level === 'warning')

  return (
    <section className="space-y-2">
      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
        Alertas Executivos
      </h2>
      <div className="space-y-2">
        {critical.map((alert, i) => (
          <div
            key={i}
            className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3"
          >
            <span className="text-red-500 mt-0.5">🚨</span>
            <div>
              <p className="text-sm font-semibold text-red-800">{alert.category}</p>
              <p className="text-sm text-red-700">{alert.message}</p>
            </div>
          </div>
        ))}
        {warnings.map((alert, i) => (
          <div
            key={i}
            className="flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3"
          >
            <span className="text-yellow-500 mt-0.5">⚠️</span>
            <div>
              <p className="text-sm font-semibold text-yellow-800">{alert.category}</p>
              <p className="text-sm text-yellow-700">{alert.message}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
