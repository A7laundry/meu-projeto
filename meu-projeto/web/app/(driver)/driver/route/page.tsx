import { getUser } from '@/lib/auth/get-user'
import { getDriverManifestsToday, markStopVisited } from '@/actions/manifests/driver'
import type { ManifestStop } from '@/types/manifest'

const SHIFT_LABELS: Record<string, string> = {
  morning: 'Manhã',
  afternoon: 'Tarde',
  night: 'Noite',
}

const STOP_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  visited: 'bg-green-500/20 text-green-400 border-green-500/30',
  skipped: 'bg-red-500/20 text-red-400 border-red-500/30',
}

const STOP_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  visited: 'Visitado',
  skipped: 'Pulado',
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

  if (manifests.length === 0) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-400 mb-4 capitalize">{today}</p>
        <div className="rounded-xl bg-gray-800 border border-gray-700 p-8 text-center">
          <p className="text-4xl mb-3">🚚</p>
          <p className="text-white font-medium mb-1">Nenhum romaneio para hoje</p>
          <p className="text-sm text-gray-400">
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
      {/* Resumo do dia */}
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1 capitalize">{today}</p>
        <h1 className="text-lg font-bold text-white">Olá, {user?.full_name?.split(' ')[0]}</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {visitedStops} de {totalStops} paradas concluídas
        </p>
      </div>

      {/* Barra de progresso */}
      <div className="rounded-xl bg-gray-800 border border-gray-700 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-300">Progresso do dia</span>
          <span className="text-sm font-bold text-white">{progress}%</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Romaneios */}
      {manifests.map((manifest) => {
        const stops = manifest.stops ?? []
        const visitedCount = stops.filter((s) => s.status === 'visited').length

        return (
          <div key={manifest.id} className="rounded-xl bg-gray-800 border border-gray-700 overflow-hidden">
            {/* Cabeçalho do romaneio */}
            <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">
                  {manifest.route_name ?? 'Rota sem nome'}
                </p>
                <p className="text-xs text-gray-400">
                  Turno: {SHIFT_LABELS[manifest.route_shift ?? ''] ?? manifest.route_shift ?? '—'}
                  {' · '}
                  {visitedCount}/{stops.length} paradas
                </p>
              </div>
              <span className={[
                'text-xs px-2 py-0.5 rounded-full border',
                manifest.status === 'completed'
                  ? 'bg-green-500/20 text-green-400 border-green-500/30'
                  : manifest.status === 'in_progress'
                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                    : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
              ].join(' ')}>
                {manifest.status === 'completed' ? 'Concluído' : manifest.status === 'in_progress' ? 'Em andamento' : 'Pendente'}
              </span>
            </div>

            {/* Lista de paradas */}
            <div className="divide-y divide-gray-700/50">
              {stops.map((stop: ManifestStop, idx: number) => (
                <div key={stop.id} className="px-4 py-3 flex items-start gap-3">
                  {/* Número da parada */}
                  <div className={[
                    'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5',
                    stop.status === 'visited'
                      ? 'bg-green-500/20 text-green-400'
                      : stop.status === 'skipped'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-gray-700 text-gray-400',
                  ].join(' ')}>
                    {stop.status === 'visited' ? '✓' : idx + 1}
                  </div>

                  {/* Dados da parada */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {stop.client_name ?? 'Cliente desconhecido'}
                    </p>
                    {stop.client_address && (
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {stop.client_address}
                      </p>
                    )}
                    <span className={[
                      'inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded border',
                      STOP_STATUS_COLORS[stop.status] ?? 'bg-gray-700 text-gray-400 border-gray-600',
                    ].join(' ')}>
                      {STOP_STATUS_LABELS[stop.status] ?? stop.status}
                    </span>
                  </div>

                  {/* Ações */}
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
                        className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Visitar
                      </button>
                    </form>
                  )}
                </div>
              ))}

              {stops.length === 0 && (
                <p className="px-4 py-3 text-sm text-gray-500">
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
