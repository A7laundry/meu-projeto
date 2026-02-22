'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useTransition, useState } from 'react'
import {
  LayoutDashboard,
  Building2,
  FileBarChart,
  Star,
  Briefcase,
  Tv,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const NAV_ITEMS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/director/dashboard',   label: 'Dashboard Geral', icon: LayoutDashboard },
  { href: '/director/units',       label: 'Unidades',         icon: Building2 },
  { href: '/director/reports',     label: 'Relatórios',       icon: FileBarChart },
  { href: '/director/nps',         label: 'NPS & Pesquisas',  icon: Star },
  { href: '/commercial/dashboard', label: 'Comercial',        icon: Briefcase },
]

const STORAGE_KEY = 'a7x-sidebar-collapsed'

interface DirectorNavProps {
  units: { id: string; name: string }[]
}

function NavLinks({
  collapsed,
  units,
  pathname,
  onLinkClick,
}: {
  collapsed: boolean
  units: { id: string; name: string }[]
  pathname: string
  onLinkClick?: () => void
}) {
  const firstUnitId = units[0]?.id

  return (
    <>
      {/* Nav principal */}
      <nav className="py-4 space-y-0.5 flex-shrink-0" style={{ padding: collapsed ? '16px 8px' : '16px 12px' }}>
        {!collapsed && (
          <p className="text-[9px] uppercase tracking-widest text-[#d6b25e]/30 font-semibold px-3 mb-2">Menu</p>
        )}
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              onClick={onLinkClick}
              title={collapsed ? label : undefined}
              className={[
                'relative flex items-center rounded-lg transition-all duration-200',
                collapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5',
                active
                  ? 'bg-[#d6b25e]/10 text-[#d6b25e] font-medium' + (collapsed ? '' : ' nav-indicator')
                  : 'text-white/45 hover:text-white/85 hover:bg-white/04',
              ].join(' ')}
            >
              <Icon size={15} className={`flex-shrink-0 ${active ? 'text-[#d6b25e]' : 'text-white/25'}`} />
              {!collapsed && <span className="truncate text-sm">{label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Unidades */}
      {units.length > 0 && (
        <div className="flex-1 border-t border-[#d6b25e]/08" style={{ padding: collapsed ? '16px 8px' : '16px 12px' }}>
          {!collapsed && (
            <p className="text-[9px] uppercase tracking-widest text-[#d6b25e]/30 font-semibold px-3 mb-2">Unidades</p>
          )}
          <nav className="space-y-0.5">
            {units.map((unit) => {
              const unitBase = `/unit/${unit.id}`
              const active = pathname.startsWith(unitBase)
              return (
                <Link
                  key={unit.id}
                  href={`${unitBase}/dashboard`}
                  onClick={onLinkClick}
                  title={collapsed ? unit.name : undefined}
                  className={[
                    'relative flex items-center rounded-lg transition-all duration-200',
                    collapsed ? 'justify-center p-3' : 'gap-2.5 px-3 py-2',
                    active
                      ? 'bg-[#d6b25e]/10 text-[#d6b25e] font-medium' + (collapsed ? '' : ' nav-indicator')
                      : 'text-white/35 hover:text-white/75 hover:bg-white/04',
                  ].join(' ')}
                >
                  <div className={`rounded-full flex-shrink-0 ${collapsed ? 'w-2 h-2' : 'w-1.5 h-1.5'} ${active ? 'bg-[#d6b25e]' : 'bg-white/15'}`} />
                  {!collapsed && <span className="truncate text-xs">{unit.name}</span>}
                </Link>
              )
            })}
          </nav>
        </div>
      )}

      {/* Footer TV */}
      <div className="border-t border-[#d6b25e]/08 mt-auto" style={{ padding: collapsed ? '12px 8px' : '12px 20px' }}>
        {firstUnitId && (
          <a
            href={`/tv/${firstUnitId}`}
            target="_blank"
            rel="noopener noreferrer"
            title={collapsed ? 'Painel TV' : undefined}
            className={[
              'flex items-center rounded-lg text-white/25 hover:text-white/60 hover:bg-white/04 transition-all',
              collapsed ? 'justify-center p-3' : 'gap-2.5 px-3 py-2',
            ].join(' ')}
          >
            <Tv size={13} className="flex-shrink-0" />
            {!collapsed && (
              <>
                <span className="text-xs">Painel TV</span>
                <span className="ml-auto text-[10px] opacity-50">↗</span>
              </>
            )}
          </a>
        )}
        {!collapsed && (
          <div className="px-3 mt-2 flex items-center gap-2">
            <span className="badge-live">Ao vivo</span>
          </div>
        )}
      </div>
    </>
  )
}

export function DirectorNav({ units }: DirectorNavProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [, startTransition] = useTransition()

  useEffect(() => {
    startTransition(() => {
      setMounted(true)
      setCollapsed(localStorage.getItem(STORAGE_KEY) === 'true')
    })
  }, [])

  // Fechar mobile nav quando pathname muda
  useEffect(() => {
    startTransition(() => setMobileOpen(false))
  }, [pathname])

  const toggle = () => {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem(STORAGE_KEY, String(next))
  }

  const sidebarStyle: React.CSSProperties = {
    background: 'linear-gradient(180deg, #060609 0%, #07070a 60%, #060609 100%)',
    borderRight: '1px solid rgba(214,178,94,0.08)',
    boxShadow: '1px 0 0 rgba(255,255,255,0.02)',
  }

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside
        className="hidden lg:flex flex-col flex-shrink-0 overflow-y-auto overflow-x-hidden scrollbar-dark transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ ...sidebarStyle, width: mounted && collapsed ? 60 : 224 }}
      >
        {/* Logo + toggle */}
        <div
          className="flex items-center border-b border-[#d6b25e]/08 flex-shrink-0"
          style={{ padding: collapsed ? '16px 12px' : '16px 20px', justifyContent: collapsed ? 'center' : 'space-between' }}
        >
          {!collapsed ? (
            <Link href="/director/dashboard" className="flex items-center gap-2.5 group min-w-0">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, rgba(214,178,94,0.18) 0%, rgba(185,138,44,0.08) 100%)', border: '1px solid rgba(214,178,94,0.25)' }}>
                <span className="text-sm font-black gold-text leading-none">A</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white/90 leading-none truncate group-hover:text-white transition-colors">A7x OS</p>
                <p className="text-[9px] text-[#d6b25e]/40 mt-0.5 uppercase tracking-wider">Executivo</p>
              </div>
            </Link>
          ) : (
            <Link href="/director/dashboard">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, rgba(214,178,94,0.18) 0%, rgba(185,138,44,0.08) 100%)', border: '1px solid rgba(214,178,94,0.25)' }}>
                <span className="text-sm font-black gold-text leading-none">A</span>
              </div>
            </Link>
          )}
          <button
            onClick={toggle}
            className="flex-shrink-0 text-white/20 hover:text-white/60 transition-colors p-1 rounded"
            style={{ marginLeft: collapsed ? 0 : 'auto' }}
          >
            {collapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
          </button>
        </div>

        <NavLinks collapsed={collapsed} units={units} pathname={pathname} />
      </aside>

      {/* ── Mobile Hamburger Button (positioned after logo ~60px) ── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-[72px] z-40 w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/08 transition-all"
        aria-label="Abrir menu"
      >
        <Menu size={18} />
      </button>

      {/* ── Mobile Drawer Overlay ── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex"
          onClick={() => setMobileOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Drawer */}
          <div
            className="relative flex flex-col w-72 h-full overflow-y-auto overflow-x-hidden"
            style={sidebarStyle}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header do drawer */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#d6b25e]/08">
              <Link href="/director/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, rgba(214,178,94,0.18) 0%, rgba(185,138,44,0.08) 100%)', border: '1px solid rgba(214,178,94,0.25)' }}>
                  <span className="text-sm font-black gold-text leading-none">A</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-white/90">A7x OS</p>
                  <p className="text-[9px] text-[#d6b25e]/40 uppercase tracking-wider">Executivo</p>
                </div>
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="text-white/30 hover:text-white/70 transition-colors p-1"
              >
                <X size={18} />
              </button>
            </div>

            <NavLinks
              collapsed={false}
              units={units}
              pathname={pathname}
              onLinkClick={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  )
}
