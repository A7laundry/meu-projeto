'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/director/dashboard',    label: 'Dashboard Geral', icon: '◈' },
  { href: '/director/units',        label: 'Unidades',         icon: '⊞' },
  { href: '/director/reports',      label: 'Relatórios',       icon: '⊟' },
  { href: '/director/nps',          label: 'NPS & Pesquisas',  icon: '◎' },
  { href: '/commercial/dashboard',  label: 'Comercial',        icon: '◇' },
]

interface DirectorSidebarProps {
  units: { id: string; name: string }[]
}

export function DirectorSidebar({ units }: DirectorSidebarProps) {
  const pathname = usePathname()
  const firstUnitId = units[0]?.id

  return (
    <aside className="w-56 border-r border-[#d6b25e]/10 bg-[#07070a] py-6 px-3 flex-shrink-0 flex flex-col overflow-y-auto">
      {/* Logo mark */}
      <div className="px-3 mb-6">
        <p className="text-[10px] uppercase tracking-widest text-[#d6b25e]/40 font-semibold">
          Painel Executivo
        </p>
      </div>

      {/* Nav principal */}
      <nav className="space-y-0.5">
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

      {/* Unidades individuais */}
      {units.length > 0 && (
        <div className="mt-6 pt-4 border-t border-[#d6b25e]/10 flex-1">
          <p className="text-[10px] uppercase tracking-widest text-[#d6b25e]/40 font-semibold px-3 mb-2">
            Acessar Unidade
          </p>
          <nav className="space-y-0.5">
            {units.map((unit) => {
              const unitBase = `/unit/${unit.id}`
              const active = pathname.startsWith(unitBase)
              return (
                <Link
                  key={unit.id}
                  href={`${unitBase}/dashboard`}
                  className={[
                    'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-all',
                    active
                      ? 'bg-[#d6b25e]/10 text-[#d6b25e] font-medium'
                      : 'text-white/40 hover:text-white/80 hover:bg-white/5',
                  ].join(' ')}
                >
                  <span className={['text-[10px]', active ? 'text-[#d6b25e]' : 'text-white/20'].join(' ')}>▸</span>
                  <span className="truncate">{unit.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      )}

      {/* Painel TV */}
      {firstUnitId && (
        <div className="mt-4 pt-4 border-t border-[#d6b25e]/10">
          <a
            href={`/tv/${firstUnitId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-white/30 hover:text-white/70 hover:bg-white/5 transition-all"
          >
            <span>⊡</span>
            Painel TV
            <span className="ml-auto text-[10px] text-white/20">↗</span>
          </a>
        </div>
      )}

      {/* Version */}
      <div className="px-3 mt-4">
        <p className="text-[10px] text-white/20">v1.0 · A7x OS</p>
      </div>
    </aside>
  )
}
