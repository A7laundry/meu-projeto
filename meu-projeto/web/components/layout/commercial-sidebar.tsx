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
    <aside className="w-56 border-r border-[#d6b25e]/10 bg-[#07070a] py-6 px-3 flex-shrink-0 flex flex-col overflow-y-auto">
      {/* Logo mark */}
      <div className="px-3 mb-6">
        <p className="text-[10px] uppercase tracking-widest text-[#d6b25e]/40 font-semibold">
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
