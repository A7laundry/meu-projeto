'use client'

import { useNetworkStatus } from '@/hooks/use-network-status'
import { cn } from '@/lib/utils'

interface NetworkIndicatorProps {
  className?: string
  showLabel?: boolean
}

export function NetworkIndicator({ className, showLabel = true }: NetworkIndicatorProps) {
  const { isOnline } = useNetworkStatus()

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 text-xs font-medium',
        isOnline ? 'text-emerald-400' : 'text-red-400',
        className
      )}
      title={isOnline ? 'Conectado' : 'Sem conexão'}
    >
      <span
        className={cn(
          'h-2 w-2 rounded-full flex-shrink-0',
          isOnline ? 'bg-emerald-400 animate-none' : 'bg-red-400 animate-pulse'
        )}
      />
      {showLabel && <span>{isOnline ? 'Online' : 'Offline'}</span>}
    </div>
  )
}
