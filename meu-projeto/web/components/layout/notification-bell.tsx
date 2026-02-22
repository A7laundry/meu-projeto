'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import Link from 'next/link'
import { getNotifications, type NotificationItem } from '@/actions/notifications'

interface NotificationBellProps {
  initialCount: number
}

const TYPE_LABELS: Record<string, string> = {
  new_lead:    'Novo Lead',
  follow_up:   'Follow-up',
  ready_order: 'Comanda Pronta',
}

export function NotificationBell({ initialCount }: NotificationBellProps) {
  const [open, setOpen]                 = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loaded, setLoaded]             = useState(false)
  const [isPending, startTransition]    = useTransition()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  function handleToggle() {
    if (!open && !loaded) {
      startTransition(async () => {
        const data = await getNotifications()
        setNotifications(data)
        setLoaded(true)
      })
    }
    setOpen(v => !v)
  }

  function relativeTime(iso: string) {
    const diff  = Date.now() - new Date(iso).getTime()
    const mins  = Math.floor(diff / 60_000)
    const hours = Math.floor(diff / 3_600_000)
    const days  = Math.floor(diff / 86_400_000)
    if (mins  < 60) return `${mins}m`
    if (hours < 24) return `${hours}h`
    return `${days}d`
  }

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        onClick={handleToggle}
        className="relative w-8 h-8 flex items-center justify-center rounded-lg transition-all"
        style={{
          background: open ? 'rgba(214,178,94,0.12)' : 'transparent',
          border:     open ? '1px solid rgba(214,178,94,0.25)' : '1px solid transparent',
          color:      open ? '#d6b25e' : 'rgba(255,255,255,0.40)',
        }}
        aria-label="Notificações"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {initialCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold leading-none"
            style={{ background: 'rgba(248,113,113,0.90)', color: '#fff' }}
          >
            {initialCount > 9 ? '9+' : initialCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-11 w-80 rounded-xl z-50 overflow-hidden"
          style={{
            background:  '#0e0e14',
            border:      '1px solid rgba(255,255,255,0.10)',
            boxShadow:   '0 20px 60px rgba(0,0,0,0.60)',
          }}
        >
          {/* Header */}
          <div
            className="px-4 py-3 flex items-center justify-between"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            <p className="text-xs font-semibold text-white/70">Notificações</p>
            {initialCount > 0 && (
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(248,113,113,0.15)', color: 'rgba(248,113,113,0.85)' }}
              >
                {initialCount} nova{initialCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Body */}
          {isPending ? (
            <div className="py-10 text-center">
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.28)' }}>Carregando...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <p className="text-2xl">🎉</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.28)' }}>Tudo em dia!</p>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {notifications.map((n, i) => (
                <Link
                  key={n.id}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-white/[0.04]"
                  style={{
                    borderBottom: i < notifications.length - 1
                      ? '1px solid rgba(255,255,255,0.04)'
                      : undefined,
                    textDecoration: 'none',
                  }}
                >
                  <span className="text-base flex-shrink-0 mt-0.5">{n.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] font-semibold" style={{ color: 'rgba(255,255,255,0.55)' }}>
                        {TYPE_LABELS[n.type] ?? n.type}
                      </p>
                      <span className="text-[10px] flex-shrink-0" style={{ color: 'rgba(255,255,255,0.25)' }}>
                        {relativeTime(n.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm truncate mt-0.5" style={{ color: 'rgba(255,255,255,0.82)' }}>
                      {n.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
