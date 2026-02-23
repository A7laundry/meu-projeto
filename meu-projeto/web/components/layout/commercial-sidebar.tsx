'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/commercial/dashboard',  label: 'Dashboard',      icon: '◈' },
  { href: '/commercial/leads',      label: 'Pipeline',        icon: '⊞' },
  { href: '/commercial/campaigns',  label: 'Campanhas',       icon: '◎' },
  { href: '/commercial/clients',    label: 'Clientes + LTV',  icon: '⊡' },
]

interface CommercialSidebarProps {
  userName: string
  roleLabel: string
}

export function CommercialSidebar({ userName, roleLabel }: CommercialSidebarProps) {
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
      <div className="px-3 mb-6">
        <p
          className="text-[10px] uppercase tracking-widest font-semibold"
          style={{ color: 'rgba(59,130,246,0.40)' }}
        >
          Comercial
        </p>
      </div>

      {/* Nav */}
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
