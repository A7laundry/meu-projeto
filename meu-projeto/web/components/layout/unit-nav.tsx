'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useTransition, useState } from 'react'
import { Menu, X } from 'lucide-react'

// ─── Grupos de navegação ──────────────────────────────────────────────────────

const NAV_GROUPS = [
  {
    label: 'Operacional',
    items: [
      { href: 'dashboard',  label: 'Dashboard',   icon: '◈' },
      { href: 'alerts',     label: 'Alertas SLA', icon: '⚡' },
      { href: 'production', label: 'Produção',     icon: '⊞' },
      { href: 'production/history', label: 'Histórico Prod.', icon: '⊡' },
      { href: 'equipment',  label: 'Equipamentos', icon: '⚙' },
      { href: 'recipes',    label: 'Receitas',     icon: '⊟' },
      { href: 'supplies',   label: 'Insumos',      icon: '◎' },
    ],
  },
  {
    label: 'Logística',
    items: [
      { href: 'routes',    label: 'Rotas',      icon: '⊕' },
      { href: 'manifests', label: 'Romaneios',  icon: '⊘' },
    ],
  },
  {
    label: 'Comercial',
    items: [
      { href: 'clients',   label: 'Clientes',   icon: '⊡' },
      { href: 'campaigns', label: 'Campanhas',  icon: '📣' },
      { href: 'pricing',   label: 'Preços',     icon: '◇' },
      { href: 'quotes',    label: 'Orçamentos', icon: '◆' },
    ],
  },
  {
    label: 'Gestão',
    items: [
      { href: 'staff',     label: 'Funcionários', icon: '◉' },
      { href: 'financial', label: 'Financeiro',   icon: '◐' },
    ],
  },
]

// ─── Estilos ──────────────────────────────────────────────────────────────────

const sidebarStyle: React.CSSProperties = {
  background: 'linear-gradient(180deg, #091523 0%, #0d1b2e 60%, #091523 100%)',
  borderRight: '1px solid rgba(59,130,246,0.10)',
}

// ─── NavList ──────────────────────────────────────────────────────────────────

function NavList({
  unitId,
  pathname,
  onLinkClick,
}: {
  unitId: string
  pathname: string
  onLinkClick?: () => void
}) {
  return (
    <nav className="py-3 space-y-4 px-3">
      {NAV_GROUPS.map((group) => (
        <div key={group.label}>
          {/* Label da seção */}
          <p className="text-[9px] uppercase tracking-widest font-semibold px-3 mb-1.5"
            style={{ color: 'rgba(59,130,246,0.35)' }}>
            {group.label}
          </p>

          {/* Itens */}
          <div className="space-y-0.5">
            {group.items.map(({ href, label, icon }) => {
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
                      ? 'font-medium nav-indicator'
                      : 'hover:bg-white/04',
                  ].join(' ')}
                  style={active ? {
                    background: 'rgba(59,130,246,0.12)',
                    color: '#60a5fa',
                  } : {
                    color: 'rgba(255,255,255,0.45)',
                  }}
                >
                  <span className="text-xs" style={{ color: active ? '#60a5fa' : 'rgba(255,255,255,0.22)' }}>
                    {icon}
                  </span>
                  {label}
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </nav>
  )
}

// ─── UnitNav ──────────────────────────────────────────────────────────────────

export function UnitNav({ unitId }: { unitId: string }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [, startTransition] = useTransition()

  useEffect(() => {
    startTransition(() => setMobileOpen(false))
  }, [pathname])

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside
        className="hidden lg:block w-52 flex-shrink-0 overflow-y-auto scrollbar-dark"
        style={sidebarStyle}
      >
        <div className="px-3 pt-5 pb-1">
          <p className="text-[10px] uppercase tracking-widest font-semibold px-3"
            style={{ color: 'rgba(59,130,246,0.40)' }}>
            Unidade
          </p>
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
            className="relative flex flex-col w-64 h-full overflow-y-auto scrollbar-dark"
            style={sidebarStyle}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid rgba(59,130,246,0.08)' }}>
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
