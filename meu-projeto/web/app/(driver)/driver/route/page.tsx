import { getUser } from '@/lib/auth/get-user'
import { getDriverManifestsToday, markStopVisited } from '@/actions/manifests/driver'
import type { ManifestStop } from '@/types/manifest'

const SHIFT_LABELS: Record<string, string> = {
  morning: 'Manhã',
  afternoon: 'Tarde',
  night: 'Noite',
}

const STOP_STATUS_STYLE: Record<string, { bg: string; border: string; color: string; label: string }> = {
  pending: { bg: 'rgba(251,191,36,0.10)', border: 'rgba(251,191,36,0.25)', color: '#fbbf24', label: 'Pendente' },
  visited: { bg: 'rgba(52,211,153,0.10)', border: 'rgba(52,211,153,0.25)', color: '#34d399', label: 'Visitado' },
  skipped: { bg: 'rgba(248,113,113,0.10)', border: 'rgba(248,113,113,0.25)', color: '#f87171', label: 'Pulado' },
}

export default async function DriverRoutePage() {
  const [user, manifests] = await Promise.all([
    getUser(),
    getDriverManifestsToday(),
  ])

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  const firstName = user?.full_name?.split(' ')[0] ?? 'Motorista'

  if (manifests.length === 0) {
    return (
      <div className="p-6 space-y-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#d6b25e]/40 font-semibold mb-1 capitalize">{today}</p>
          <h1 className="text-xl font-bold text-white">Olá, {firstName}</h1>
        </div>
        <div
          className="rounded-2xl p-8 text-center"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <p className="text-4xl mb-3">🚚</p>
          <p className="text-white/75 font-semibold mb-1">Nenhum romaneio para hoje</p>
          <p className="text-sm text-white/35">
            Entre em contato com o gerente de unidade para verificar sua escala.
          </p>
        </div>
      </div>
    )
  }

  const totalStops = manifests.reduce((acc, m) => acc + (m.stops?.length ?? 0), 0)
  const visitedStops = manifests.reduce(
    (acc, m) => acc + (m.stops?.filter((s) => s.status === 'visited').length ?? 0),
    0,
  )
  const progress = totalStops > 0 ? Math.round((visitedStops / totalStops) * 100) : 0

  return (
    <div className="p-4 space-y-4">
      {/* Saudação */}
      <div className="pt-1">
        <p className="text-[10px] uppercase tracking-widest text-[#d6b25e]/40 font-semibold mb-1 capitalize">{today}</p>
        <h1 className="text-xl font-bold text-white">Olá, {firstName}</h1>
        <p className="text-sm text-white/40 mt-0.5">
          {visitedStops} de {totalStops} paradas concluídas
        </p>
      </div>

      {/* Card de progresso */}
      <div
        className="rounded-2xl p-4"
        style={{
          background: 'linear-gradient(135deg, rgba(214,178,94,0.07) 0%, rgba(5,5,8,0.9) 100%)',
          border: '1px solid rgba(214,178,94,0.12)',
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-white/55">Progresso do dia</span>
          <span className="text-lg font-bold tabular-nums" style={{ color: '#d6b25e' }}>{progress}%</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${progress}%`,
              background: progress === 100
                ? 'linear-gradient(90deg, #34d399, #10b981)'
                : 'linear-gradient(90deg, #d6b25e, #b98a2c)',
            }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] text-white/25">{visitedStops} visitadas</span>
          <span className="text-[10px] text-white/25">{totalStops - visitedStops} restantes</span>
        </div>
      </div>

      {/* Romaneios */}
      {manifests.map((manifest) => {
        const stops = manifest.stops ?? []
        const visitedCount = stops.filter((s) => s.status === 'visited').length
        const isCompleted = manifest.status === 'completed'
        const isInProgress = manifest.status === 'in_progress'

        return (
          <div
            key={manifest.id}
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            {/* Cabeçalho do romaneio */}
            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
            >
              <div>
                <p className="text-sm font-semibold text-white/85">
                  {manifest.route_name ?? 'Rota sem nome'}
                </p>
                <p className="text-xs text-white/30 mt-0.5">
                  Turno {SHIFT_LABELS[manifest.route_shift ?? ''] ?? manifest.route_shift ?? '—'}
                  {' · '}
                  {visitedCount}/{stops.length} paradas
                </p>
              </div>
              <span
                className="text-[11px] px-2.5 py-1 rounded-full font-medium"
                style={
                  isCompleted
                    ? { background: 'rgba(52,211,153,0.12)', color: '#34d399', border: '1px solid rgba(52,211,153,0.25)' }
                    : isInProgress
                      ? { background: 'rgba(96,165,250,0.12)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.25)' }
                      : { background: 'rgba(251,191,36,0.10)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.22)' }
                }
              >
                {isCompleted ? 'Concluído' : isInProgress ? 'Em andamento' : 'Pendente'}
              </span>
            </div>

            {/* Lista de paradas */}
            <div>
              {stops.map((stop: ManifestStop, idx: number) => {
                const style = STOP_STATUS_STYLE[stop.status] ?? STOP_STATUS_STYLE.pending

                return (
                  <div
                    key={stop.id}
                    className="px-4 py-3 flex items-start gap-3"
                    style={{ borderBottom: idx < stops.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                  >
                    {/* Número da parada */}
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                      style={{
                        background: style.bg,
                        border: `1px solid ${style.border}`,
                        color: style.color,
                      }}
                    >
                      {stop.status === 'visited' ? '✓' : idx + 1}
                    </div>

                    {/* Dados da parada */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white/80 truncate">
                        {stop.client_name ?? 'Cliente desconhecido'}
                      </p>
                      {stop.client_address && (
                        <p className="text-xs text-white/30 truncate mt-0.5">
                          {stop.client_address}
                        </p>
                      )}
                      <span
                        className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded"
                        style={{ background: style.bg, color: style.color, border: `1px solid ${style.border}` }}
                      >
                        {style.label}
                      </span>
                    </div>

                    {/* Ação visitar */}
                    {stop.status === 'pending' && (
                      <form
                        action={async () => {
                          'use server'
                          await markStopVisited(stop.id, 'visited')
                        }}
                        className="flex-shrink-0"
                      >
                        <button
                          type="submit"
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                          style={{
                            background: 'rgba(214,178,94,0.14)',
                            color: '#d6b25e',
                            border: '1px solid rgba(214,178,94,0.28)',
                          }}
                        >
                          Visitar
                        </button>
                      </form>
                    )}
                  </div>
                )
              })}

              {stops.length === 0 && (
                <p className="px-4 py-4 text-sm text-white/25 text-center">
                  Nenhuma parada neste romaneio.
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
