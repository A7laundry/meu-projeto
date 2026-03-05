import { AlertTriangle, Info, CheckCircle, ShieldAlert } from 'lucide-react'
import type { KpiAlert } from '@/lib/kpi-thresholds'

interface Props {
  alerts: KpiAlert[]
}

export function ExecutiveAlerts({ alerts }: Props) {
  const critical = alerts.filter((a) => a.level === 'critical')
  const warnings = alerts.filter((a) => a.level === 'warning')

  return (
    <section className="space-y-4">
      <style>{`
        @keyframes alert-entry {
          from { opacity: 0; transform: translateX(10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .alert-card-premium {
          animation: alert-entry 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          backdrop-filter: blur(12px);
        }
      `}</style>

      <div className="flex items-center gap-3 mb-2">
        <h2 className="text-12 font-black uppercase tracking-[0.2em] text-white/40">Executive Alerts</h2>
        <div className="h-px flex-1 bg-gradient-to-r from-white/05 to-transparent" />
      </div>

      {alerts.length === 0 ? (
        <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/03 px-5 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-13 font-medium text-emerald-400/80">
            Operations Stable — No active alerts.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {critical.map((alert, i) => (
            <div
              key={`crit-${i}`}
              className="alert-card-premium flex items-start gap-4 rounded-2xl border border-red-500/20 bg-red-500/05 px-5 py-4 shadow-lg shadow-red-900/10"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="w-9 h-9 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5 text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-11 font-black text-red-400 uppercase tracking-widest mb-1">{alert.category}</p>
                <p className="text-14 font-bold text-red-50/90 leading-snug">{alert.message}</p>
              </div>
            </div>
          ))}

          {warnings.map((alert, i) => (
            <div
              key={`warn-${i}`}
              className="alert-card-premium flex items-start gap-4 rounded-2xl border border-amber-500/20 bg-amber-500/05 px-5 py-4"
              style={{ animationDelay: `${(critical.length + i) * 0.1}s` }}
            >
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-11 font-black text-amber-400/80 uppercase tracking-widest mb-1">{alert.category}</p>
                <p className="text-14 font-bold text-amber-50/90 leading-snug">{alert.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
