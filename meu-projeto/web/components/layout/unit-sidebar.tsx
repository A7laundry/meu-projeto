'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: 'dashboard',  label: 'Dashboard',      icon: '◈' },
  { href: 'alerts',     label: 'Alertas SLA',    icon: '⚡' },
  { href: 'production', label: 'Produção',        icon: '⊞' },
  { href: 'equipment',  label: 'Equipamentos',    icon: '⚙' },
  { href: 'recipes',    label: 'Receitas',        icon: '⊟' },
  { href: 'supplies',   label: 'Insumos',         icon: '◎' },
  { href: 'staff',      label: 'Funcionários',    icon: '◉' },
  { href: 'clients',    label: 'Clientes',        icon: '⊡' },
  { href: 'routes',     label: 'Rotas',           icon: '⊕' },
  { href: 'manifests',  label: 'Romaneios',       icon: '⊘' },
  { href: 'pricing',    label: 'Preços',          icon: '◇' },
  { href: 'quotes',     label: 'Orçamentos',      icon: '◆' },
  { href: 'financial',  label: 'Financeiro',      icon: '◐' },
]

interface UnitSidebarProps {
  unitId: string
}

export function UnitSidebar({ unitId }: UnitSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="w-52 border-r border-[#60a5fa]/10 bg-[#07070a] py-4 px-3 flex-shrink-0 overflow-y-auto">
      <div className="px-3 mb-4">
        <p className="text-[10px] uppercase tracking-widest text-[#60a5fa]/40 font-semibold">
          Unidade
        </p>
      </div>
      <nav className="space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon }) => {
          const fullHref = `/unit/${unitId}/${href}`
          const active = pathname === fullHref || pathname.startsWith(fullHref + '/')
          return (
            <Link
              key={href}
              href={fullHref}
              className={[
                'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-all',
                active
                  ? 'bg-[#60a5fa]/10 text-[#60a5fa] font-medium'
                  : 'text-white/50 hover:text-white/90 hover:bg-white/5',
              ].join(' ')}
            >
              <span className={[
                'text-xs',
                active ? 'text-[#60a5fa]' : 'text-white/30',
              ].join(' ')}>
                {icon}
              </span>
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
