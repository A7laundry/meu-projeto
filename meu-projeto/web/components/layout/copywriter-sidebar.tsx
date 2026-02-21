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

export function CopywriterSidebar({ userName, roleLabel, isAdmin, xp = 0, level = 'Novato', xpProgress = 0 }: CopywriterSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="w-56 border-r border-[#d6b25e]/10 bg-[#07070a] py-6 px-3 flex-shrink-0 flex flex-col overflow-y-auto">
      {/* Módulo label */}
      <div className="px-3 mb-4">
        <p className="text-[10px] uppercase tracking-widest text-[#d6b25e]/40 font-semibold">
          Copywriter
        </p>
      </div>

      {/* Mini XP bar */}
      <div className="px-3 mb-6">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-medium text-[#d6b25e]/70">{level}</span>
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
              className={[
                'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-all',
                active
                  ? 'bg-[#d6b25e]/10 text-[#d6b25e] font-medium'
                  : 'text-white/50 hover:text-white/90 hover:bg-white/5',
              ].join(' ')}
            >
              <span className={active ? 'text-[#d6b25e]' : 'text-white/30'}>{icon}</span>
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
                  className={[
                    'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-all',
                    active
                      ? 'bg-[#d6b25e]/10 text-[#d6b25e] font-medium'
                      : 'text-white/50 hover:text-white/90 hover:bg-white/5',
                  ].join(' ')}
                >
                  <span className={active ? 'text-[#d6b25e]' : 'text-white/30'}>{icon}</span>
                  {label}
                </Link>
              )
            })}
          </>
        )}
      </nav>

      {/* Usuário */}
      <div className="px-3 mt-4 pt-4 border-t border-[#d6b25e]/10">
        <p className="text-xs font-medium text-white/70 truncate">{userName}</p>
        <p className="text-[10px] text-[#d6b25e]/50">{roleLabel}</p>
      </div>

      <div className="px-3 mt-2">
        <p className="text-[10px] text-white/20">v1.0 · A7x OS</p>
      </div>
    </aside>
  )
}
