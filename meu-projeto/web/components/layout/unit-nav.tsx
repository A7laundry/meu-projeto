'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'

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

const sidebarStyle: React.CSSProperties = {
  background: '#07070a',
  borderRight: '1px solid rgba(214,178,94,0.10)',
}

interface UnitNavProps {
  unitId: string
}

function NavList({ unitId, pathname, onLinkClick }: { unitId: string; pathname: string; onLinkClick?: () => void }) {
  return (
    <nav className="py-4 space-y-0.5 px-3">
      {NAV_ITEMS.map(({ href, label, icon }) => {
        const fullHref = `/unit/${unitId}/${href}`
        const active = pathname === fullHref || pathname.startsWith(fullHref + '/')
        return (
          <Link
            key={href}
            href={fullHref}
            onClick={onLinkClick}
            className={[
              'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-all',
              active
                ? 'bg-[#d6b25e]/10 text-[#d6b25e] font-medium'
                : 'text-white/50 hover:text-white/90 hover:bg-white/05',
            ].join(' ')}
          >
            <span className={`text-xs ${active ? 'text-[#d6b25e]' : 'text-white/30'}`}>{icon}</span>
            {label}
          </Link>
        )
      })}
    </nav>
  )
}

export function UnitNav({ unitId }: UnitNavProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:block w-52 flex-shrink-0 overflow-y-auto" style={sidebarStyle}>
        <div className="px-3 pt-5 pb-2">
          <p className="text-[10px] uppercase tracking-widest text-[#d6b25e]/40 font-semibold px-3">Unidade</p>
        </div>
        <NavList unitId={unitId} pathname={pathname} />
      </aside>

      {/* ── Mobile Hamburger ── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-[72px] z-40 w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/08 transition-all"
        aria-label="Abrir menu"
      >
        <Menu size={18} />
      </button>

      {/* ── Mobile Drawer ── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="relative flex flex-col w-64 h-full overflow-y-auto"
            style={sidebarStyle}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#d6b25e]/08">
              <p className="text-sm font-semibold text-white/80">Navegação</p>
              <button onClick={() => setMobileOpen(false)} className="text-white/30 hover:text-white/70 p-1">
                <X size={18} />
              </button>
            </div>
            <NavList unitId={unitId} pathname={pathname} onLinkClick={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </>
  )
}
