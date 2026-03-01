'use client'

interface OfflineQueueBannerProps {
  pendingCount: number
  syncing: boolean
  isOnline: boolean
}

export function OfflineQueueBanner({ pendingCount, syncing, isOnline }: OfflineQueueBannerProps) {
  if (pendingCount === 0 && isOnline) return null

  if (!isOnline && pendingCount > 0) {
    return (
      <div
        className="px-4 py-2 text-center text-xs font-medium"
        style={{
          background: 'rgba(251,191,36,0.10)',
          color: '#fbbf24',
          borderBottom: '1px solid rgba(251,191,36,0.20)',
        }}
      >
        Sem conexão — {pendingCount} ação{pendingCount !== 1 ? 'ões' : ''} na fila
      </div>
    )
  }

  if (syncing) {
    return (
      <div
        className="px-4 py-2 text-center text-xs font-medium"
        style={{
          background: 'rgba(96,165,250,0.10)',
          color: '#60a5fa',
          borderBottom: '1px solid rgba(96,165,250,0.20)',
        }}
      >
        Sincronizando {pendingCount} ação{pendingCount !== 1 ? 'ões' : ''}...
      </div>
    )
  }

  if (!isOnline) {
    return (
      <div
        className="px-4 py-2 text-center text-xs font-medium"
        style={{
          background: 'rgba(248,113,113,0.08)',
          color: '#f87171',
          borderBottom: '1px solid rgba(248,113,113,0.18)',
        }}
      >
        Sem conexão — ações serão enfileiradas
      </div>
    )
  }

  return null
}
