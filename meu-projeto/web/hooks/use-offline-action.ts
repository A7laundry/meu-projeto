'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { useNetworkStatus } from '@/hooks/use-network-status'
import { enqueueAction, drainQueue, getPendingActions } from '@/lib/offline/queue'

/**
 * Hook que encapsula uma server action com suporte offline.
 * Quando offline, enfileira a ação no IndexedDB.
 * Quando volta online, drena a fila automaticamente.
 */
export function useOfflineAction<T extends Record<string, unknown>>(
  actionName: string,
  handler: (payload: T) => Promise<{ success: boolean; error?: string }>
) {
  const { isOnline } = useNetworkStatus()
  const [pendingCount, setPendingCount] = useState(0)
  const [syncing, setSyncing] = useState(false)
  const [, startTransition] = useTransition()
  const mountedRef = useRef(false)

  // Carrega contagem pendente na montagem via useTransition (evita set-state-in-effect)
  useEffect(() => {
    if (mountedRef.current) return
    mountedRef.current = true
    startTransition(async () => {
      try {
        const actions = await getPendingActions()
        setPendingCount(actions.filter((a) => a.action === actionName).length)
      } catch {
        // IndexedDB pode não estar disponível
      }
    })
  }, [actionName, startTransition])

  // Drena a fila quando volta online
  useEffect(() => {
    if (!isOnline || pendingCount === 0) return

    let cancelled = false

    const timer = setTimeout(() => {
      startTransition(async () => {
        setSyncing(true)
        await drainQueue(async (action) => {
          if (action.action !== actionName) return true
          const result = await handler(action.payload as T)
          return result.success
        })
        if (!cancelled) {
          setSyncing(false)
          const actions = await getPendingActions()
          setPendingCount(actions.filter((a) => a.action === actionName).length)
        }
      })
    }, 2000)

    return () => { cancelled = true; clearTimeout(timer) }
  }, [isOnline, pendingCount, actionName, handler, startTransition])

  // Executa a ação (online) ou enfileira (offline)
  const execute = useCallback(async (payload: T): Promise<{ success: boolean; error?: string; queued?: boolean }> => {
    if (isOnline) {
      return handler(payload)
    }

    await enqueueAction(actionName, payload)
    const actions = await getPendingActions()
    setPendingCount(actions.filter((a) => a.action === actionName).length)
    return { success: true, queued: true }
  }, [isOnline, actionName, handler])

  return { execute, pendingCount, syncing, isOnline }
}
