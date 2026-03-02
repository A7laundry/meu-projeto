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
  Users,
  ExternalLink,
  Shield,
  DollarSign,
  Globe,
  Store,
  PenTool,
  Truck,
  UserCog,
  Scale,
  TrendingUp,
  Wallet,
  Receipt,
  CreditCard,
  PieChart,
  MessageSquareText,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// ─── Grupos de navegação ──────────────────────────────────────────────────────

const NAV_GROUPS: {
  label: string
  items: { href: string; label: string; icon: LucideIcon; external?: boolean }[]
}[] = [
  {
    label: 'Rede',
    items: [
      { href: '/director/dashboard', label: 'Dashboard Geral', icon: LayoutDashboard },
      { href: '/director/units',     label: 'Unidades',         icon: Building2 },
      { href: '/director/users',     label: 'Usuários',         icon: Users },
      { href: '/portal',             label: 'Portal',           icon: Globe, external: true },
    ],
  },
  {
    label: 'Departamentos',
    items: [
      { href: '/director/financial',    label: 'Financeiro',   icon: DollarSign },
      { href: '/director/logistics',    label: 'Logística',    icon: Truck },
      { href: '/director/hr',           label: 'RH',           icon: UserCog },
      { href: '/director/legal',        label: 'Jurídico',     icon: Scale },
    ],
  },
  {
    label: 'Financeiro',
    items: [
      { href: '/director/financial/dre',         label: 'DRE',              icon: TrendingUp },
      { href: '/director/financial/cashflow',    label: 'Fluxo de Caixa',  icon: PieChart },
      { href: '/director/financial/receivables', label: 'Contas a Receber', icon: Wallet },
      { href: '/director/financial/payables',    label: 'Contas a Pagar',  icon: CreditCard },
      { href: '/director/financial/billing',     label: 'Faturamento',     icon: Receipt },
    ],
  },
  {
    label: 'Análise',
    items: [
      { href: '/director/reports',   label: 'Relatórios',      icon: FileBarChart },
      { href: '/director/nps',      label: 'NPS & Pesquisas', icon: Star },
      { href: '/director/audit',    label: 'Auditoria',       icon: Shield },
      { href: '/director/feedback', label: 'Feedback UAT',    icon: MessageSquareText },
    ],
  },
  {
    label: 'Módulos',
    items: [
      { href: '/commercial/dashboard', label: 'Comercial',   icon: Briefcase, external: true },
      { href: '/store/pdv',            label: 'Loja / PDV',  icon: Store,     external: true },
      { href: '/copywriter/dashboard', label: 'Copywriting', icon: PenTool,   external: true },
    ],
  },
]

const STORAGE_KEY = 'a7x-sidebar-collapsed'

const sidebarStyle: React.CSSProperties = {
  background: 'linear-gradient(180deg, #091523 0%, #0d1b2e 60%, #091523 100%)',
  borderRight: '1px solid rgba(59,130,246,0.09)',
  boxShadow: '1px 0 0 rgba(255,255,255,0.02)',
}

// ─── NavLinks ─────────────────────────────────────────────────────────────────

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
      {/* Nav principal por grupos */}
      <nav
        className="flex-shrink-0 space-y-4"
        style={{ padding: collapsed ? '16px 8px' : '16px 12px' }}
      >
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p
                className="text-[9px] uppercase tracking-widest font-semibold px-3 mb-1.5"
                style={{ color: 'rgba(59,130,246,0.35)' }}
              >
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map(({ href, label, icon: Icon, external }) => {
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
                      active ? 'nav-indicator' : '',
                    ].join(' ')}
                    style={active ? {
                      background: 'rgba(59,130,246,0.12)',
                      color: '#60a5fa',
                      fontWeight: 500,
                    } : {
                      color: 'rgba(255,255,255,0.40)',
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.color = 'rgba(255,255,255,0.80)'
                        e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.color = 'rgba(255,255,255,0.40)'
                        e.currentTarget.style.background = ''
                      }
                    }}
                  >
                    <Icon
                      size={15}
                      className="flex-shrink-0"
                      style={{ color: active ? '#60a5fa' : 'rgba(255,255,255,0.22)' }}
                    />
                    {!collapsed && (
                      <span className="truncate text-sm flex-1">{label}</span>
                    )}
                    {!collapsed && external && (
                      <ExternalLink size={10} style={{ color: 'rgba(255,255,255,0.18)', flexShrink: 0 }} />
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Unidades */}
      {units.length > 0 && (
        <div
          className="flex-1"
          style={{
            borderTop: '1px solid rgba(59,130,246,0.07)',
            padding: collapsed ? '16px 8px' : '16px 12px',
          }}
        >
          {!collapsed && (
            <p
              className="text-[9px] uppercase tracking-widest font-semibold px-3 mb-1.5"
              style={{ color: 'rgba(59,130,246,0.30)' }}
            >
              Unidades
            </p>
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
                  ].join(' ')}
                  style={active ? {
                    background: 'rgba(59,130,246,0.10)',
                    color: '#60a5fa',
                    fontWeight: 500,
                  } : {
                    color: 'rgba(255,255,255,0.32)',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.color = 'rgba(255,255,255,0.70)'
                      e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.color = 'rgba(255,255,255,0.32)'
                      e.currentTarget.style.background = ''
                    }
                  }}
                >
                  <div
                    className={`rounded-full flex-shrink-0 ${collapsed ? 'w-2 h-2' : 'w-1.5 h-1.5'}`}
                    style={{ background: active ? '#3b82f6' : 'rgba(255,255,255,0.15)' }}
                  />
                  {!collapsed && <span className="truncate text-xs">{unit.name}</span>}
                </Link>
              )
            })}
          </nav>
        </div>
      )}

      {/* Footer TV */}
      <div
        className="mt-auto"
        style={{
          borderTop: '1px solid rgba(59,130,246,0.07)',
          padding: collapsed ? '12px 8px' : '12px 20px',
        }}
      >
        {firstUnitId && (
          <a
            href={`/tv/${firstUnitId}`}
            target="_blank"
            rel="noopener noreferrer"
            title={collapsed ? 'Painel TV' : undefined}
            className={[
              'flex items-center rounded-lg transition-all',
              collapsed ? 'justify-center p-3' : 'gap-2.5 px-3 py-2',
            ].join(' ')}
            style={{ color: 'rgba(255,255,255,0.22)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.22)'; e.currentTarget.style.background = '' }}
          >
            <Tv size={13} className="flex-shrink-0" />
            {!collapsed && (
              <>
                <span className="text-xs">Painel TV</span>
                <span className="ml-auto text-[10px] opacity-40">↗</span>
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

// ─── DirectorNav ──────────────────────────────────────────────────────────────

export function DirectorNav({ units }: { units: { id: string; name: string }[] }) {
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

  useEffect(() => {
    startTransition(() => setMobileOpen(false))
  }, [pathname])

  const toggle = () => {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem(STORAGE_KEY, String(next))
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
          className="flex items-center flex-shrink-0"
          style={{
            borderBottom: '1px solid rgba(59,130,246,0.08)',
            padding: collapsed ? '16px 12px' : '16px 20px',
            justifyContent: collapsed ? 'center' : 'space-between',
          }}
        >
          {!collapsed ? (
            <Link href="/director/dashboard" className="flex items-center gap-2.5 group min-w-0">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, rgba(59,130,246,0.20) 0%, rgba(37,99,235,0.10) 100%)',
                  border: '1px solid rgba(59,130,246,0.30)',
                }}
              >
                <span className="text-sm font-black leading-none gold-text">A</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white/90 leading-none truncate group-hover:text-white transition-colors">
                  A7x OS
                </p>
                <p className="text-[9px] mt-0.5 uppercase tracking-wider" style={{ color: 'rgba(59,130,246,0.45)' }}>
                  Executivo
                </p>
              </div>
            </Link>
          ) : (
            <Link href="/director/dashboard">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(59,130,246,0.20) 0%, rgba(37,99,235,0.10) 100%)',
                  border: '1px solid rgba(59,130,246,0.30)',
                }}
              >
                <span className="text-sm font-black leading-none gold-text">A</span>
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
        <div
          className="lg:hidden fixed inset-0 z-50 flex"
          onClick={() => setMobileOpen(false)}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="relative flex flex-col w-72 h-full overflow-y-auto overflow-x-hidden scrollbar-dark"
            style={sidebarStyle}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid rgba(59,130,246,0.08)' }}
            >
              <Link href="/director/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(59,130,246,0.20) 0%, rgba(37,99,235,0.10) 100%)',
                    border: '1px solid rgba(59,130,246,0.30)',
                  }}
                >
                  <span className="text-sm font-black leading-none gold-text">A</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-white/90">A7x OS</p>
                  <p className="text-[9px] uppercase tracking-wider" style={{ color: 'rgba(59,130,246,0.45)' }}>
                    Executivo
                  </p>
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
