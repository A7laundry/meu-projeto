'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/copywriter/dashboard',   label: 'Quartel General', icon: '⬡' },
  { href: '/copywriter/missions',    label: 'Missões',         icon: '⊕' },
  { href: '/copywriter/leaderboard', label: 'Ranking',         icon: '◆' },
  { href: '/copywriter/profile',     label: 'Perfil',          icon: '◎' },
]

const ADMIN_ITEMS = [
  { href: '/copywriter/admin',           label: 'Admin',       icon: '⬢' },
  { href: '/copywriter/admin/briefings', label: 'Briefings',   icon: '⊞' },
  { href: '/copywriter/admin/reviews',   label: 'Avaliações',  icon: '⊡' },
]

interface CopywriterSidebarProps {
  userName: string
  roleLabel: string
  isAdmin: boolean
  xp?: number
  level?: string
  xpProgress?: number
}

export function CopywriterSidebar({
  userName,
  roleLabel,
  isAdmin,
  xp = 0,
  level = 'Novato',
  xpProgress = 0,
}: CopywriterSidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className="w-56 flex-shrink-0 flex flex-col overflow-y-auto scrollbar-dark py-6 px-3"
      style={{
        background: 'linear-gradient(180deg, #091523 0%, #0d1b2e 60%, #091523 100%)',
        borderRight: '1px solid rgba(59,130,246,0.09)',
      }}
    >
      {/* Módulo label */}
      <div className="px-3 mb-4">
        <p
          className="text-[10px] uppercase tracking-widest font-semibold"
          style={{ color: 'rgba(59,130,246,0.40)' }}
        >
          Copywriter
        </p>
      </div>

      {/* Mini XP bar */}
      <div className="px-3 mb-6">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-medium" style={{ color: '#60a5fa' }}>{level}</span>
          <span className="text-[10px] text-white/30">{xp} XP</span>
        </div>
        <div className="xp-bar">
          <div className="xp-bar-fill" style={{ width: `${xpProgress}%` }} />
        </div>
      </div>

      {/* Nav principal */}
      <nav className="space-y-0.5 flex-1">
        {NAV_ITEMS.map(({ href, label, icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-all"
              style={active ? {
                background: 'rgba(59,130,246,0.12)',
                color: '#60a5fa',
                fontWeight: 500,
              } : {
                color: 'rgba(255,255,255,0.45)',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.color = 'rgba(255,255,255,0.85)'
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.color = 'rgba(255,255,255,0.45)'
                  e.currentTarget.style.background = ''
                }
              }}
            >
              <span style={{ color: active ? '#60a5fa' : 'rgba(255,255,255,0.25)' }}>{icon}</span>
              {label}
            </Link>
          )
        })}

        {/* Admin section */}
        {isAdmin && (
          <>
            <div className="pt-4 pb-2 px-3">
              <p className="text-[9px] uppercase tracking-widest text-white/20 font-semibold">
                Administração
              </p>
            </div>
            {ADMIN_ITEMS.map(({ href, label, icon }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-all"
                  style={active ? {
                    background: 'rgba(59,130,246,0.12)',
                    color: '#60a5fa',
                    fontWeight: 500,
                  } : {
                    color: 'rgba(255,255,255,0.45)',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.color = 'rgba(255,255,255,0.85)'
                      e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.color = 'rgba(255,255,255,0.45)'
                      e.currentTarget.style.background = ''
                    }
                  }}
                >
                  <span style={{ color: active ? '#60a5fa' : 'rgba(255,255,255,0.25)' }}>{icon}</span>
                  {label}
                </Link>
              )
            })}
          </>
        )}
      </nav>

      {/* Usuário */}
      <div
        className="px-3 mt-4 pt-4"
        style={{ borderTop: '1px solid rgba(59,130,246,0.08)' }}
      >
        <p className="text-xs font-medium text-white/70 truncate">{userName}</p>
        <p className="text-[10px]" style={{ color: 'rgba(59,130,246,0.45)' }}>{roleLabel}</p>
      </div>

      <div className="px-3 mt-2">
        <p className="text-[10px] text-white/20">v1.0 · A7x OS</p>
      </div>
    </aside>
  )
}
