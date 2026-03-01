export const revalidate = 0

import Link from 'next/link'
import { getDayCloseReport } from '@/actions/manifests/day-close'

interface Props {
  params: Promise<{ unitId: string }>
  searchParams: Promise<{ date?: string }>
}

export default async function DayClosePage({ params, searchParams }: Props) {
  const { unitId } = await params
  const sp = await searchParams
  const report = await getDayCloseReport(unitId, sp.date)

  const formattedDate = new Date(report.date + 'T12:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Fechamento Logístico</h1>
          <p className="text-sm text-white/40 mt-1 capitalize">{formattedDate}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/unit/${unitId}/manifests/day-close?date=${
              new Date(new Date(report.date + 'T12:00:00').getTime() - 86400_000).toISOString().split('T')[0]
            }`}
            className="px-3 py-1.5 rounded-lg text-sm text-white/40 hover:text-white/70"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            Dia anterior
          </Link>
          <Link
            href={`/unit/${unitId}/manifests`}
            className="px-3 py-1.5 rounded-lg text-sm text-white/50 hover:text-white/70"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            Romaneios
          </Link>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Romaneios', value: `${report.completedManifests}/${report.totalManifests}`, sub: 'concluídos' },
          { label: 'Paradas visitadas', value: String(report.visitedStops), sub: `de ${report.totalStops}` },
          { label: 'Não realizadas', value: String(report.skippedStops), sub: 'rupturas', alert: report.skippedStops > 0 },
          { label: 'Taxa de ruptura', value: `${report.ruptureRate}%`, sub: '', alert: report.ruptureRate >= 10 },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl p-4"
            style={{
              background: kpi.alert ? 'rgba(248,113,113,0.06)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${kpi.alert ? 'rgba(248,113,113,0.18)' : 'rgba(255,255,255,0.07)'}`,
            }}
          >
            <p className="text-xs text-white/40 mb-1">{kpi.label}</p>
            <p className={`text-2xl font-bold ${kpi.alert ? 'text-red-400' : 'text-white'}`}>
              {kpi.value}
            </p>
            {kpi.sub && <p className="text-[10px] text-white/25 mt-0.5">{kpi.sub}</p>}
          </div>
        ))}
      </div>

      {/* Pending stops warning */}
      {report.pendingStops > 0 && (
        <div
          className="rounded-xl px-5 py-3"
          style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.20)' }}
        >
          <p className="text-sm text-yellow-400 font-medium">
            {report.pendingStops} parada{report.pendingStops !== 1 ? 's' : ''} ainda pendente{report.pendingStops !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Rupture details */}
      <div className="card-dark rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/08">
          <h2 className="font-semibold text-white">
            Rupturas ({report.ruptures.length})
          </h2>
        </div>
        {report.ruptures.length === 0 ? (
          <p className="px-5 py-6 text-sm text-white/30 italic text-center">
            Nenhuma ruptura registrada.
          </p>
        ) : (
          <div className="divide-y divide-white/05">
            {report.ruptures.map((r, i) => (
              <div key={i} className="px-5 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-white/80">{r.clientName}</p>
                  <p className="text-xs text-white/30">{r.driverName}</p>
                </div>
                <p className="text-xs text-red-400/70 mt-0.5">{r.reason}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
