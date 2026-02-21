import type { KpiAlert } from '@/lib/kpi-thresholds'

interface Props {
  alerts: KpiAlert[]
}

export function ExecutiveAlerts({ alerts }: Props) {
  const critical = alerts.filter((a) => a.level === 'critical')
  const warnings = alerts.filter((a) => a.level === 'warning')

  return (
    <section className="space-y-2">
      <h2 className="section-header">Alertas Executivos</h2>
      {alerts.length === 0 ? (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-400/70">
          Nenhum alerta — operação dentro dos parâmetros.
        </div>
      ) : (
        <div className="space-y-2">
          {critical.map((alert, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-lg border border-red-500/25 bg-red-500/10 px-4 py-3"
            >
              <span className="text-red-400 mt-0.5 text-base">⚠</span>
              <div>
                <p className="text-sm font-semibold text-red-300">{alert.category}</p>
                <p className="text-sm text-red-400/80">{alert.message}</p>
              </div>
            </div>
          ))}
          {warnings.map((alert, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-lg border border-yellow-500/25 bg-yellow-500/08 px-4 py-3"
            >
              <span className="text-yellow-400 mt-0.5 text-base">◆</span>
              <div>
                <p className="text-sm font-semibold text-yellow-300">{alert.category}</p>
                <p className="text-sm text-yellow-400/70">{alert.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
