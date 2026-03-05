'use client'

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, PanelLeftClose, PanelLeftOpen, LogOut, ChevronRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// ─── Types ──────────────────────────────────────────────────────────────────────

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  external?: boolean
  badge?: string | number
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export interface AppShellProps {
  children: React.ReactNode
  /** Navigation groups for sidebar */
  navGroups: NavGroup[]
  /** Bottom nav items for mobile (max 5) */
  bottomNav?: NavItem[]
  /** Portal accent color */
  accent?: string
  /** Portal name shown in sidebar header */
  portalName: string
  /** Portal subtitle */
  portalSub?: string
  /** User display name */
  userName?: string
  /** User role label */
  userRole?: string
  /** Logo link destination */
  logoHref?: string
  /** Logout server action */
  logoutAction?: () => Promise<void>
  /** Extra footer content in sidebar */
  sidebarFooter?: React.ReactNode
  /** Notification count badge */
  notificationCount?: number
}

// ─── Accent color utilities ─────────────────────────────────────────────────────

function accentVars(accent: string) {
  return {
    '--shell-accent': accent,
    '--shell-accent-10': `${accent}1a`,
    '--shell-accent-15': `${accent}26`,
    '--shell-accent-20': `${accent}33`,
    '--shell-accent-30': `${accent}4d`,
    '--shell-accent-50': `${accent}80`,
  } as React.CSSProperties
}

// ─── Constants ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'a7x-shell-collapsed'
const SIDEBAR_W = 240
const SIDEBAR_W_COLLAPSED = 64

// ─── AppShell ───────────────────────────────────────────────────────────────────

export function AppShell({
  children,
  navGroups,
  bottomNav,
  accent = '#3b82f6',
  portalName,
  portalSub,
  userName,
  userRole,
  logoHref = '/',
  logoutAction,
  sidebarFooter,
}: AppShellProps) {
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

  const vars = accentVars(accent)

  return (
    <div className="min-h-screen flex flex-col" style={{ ...vars, background: '#07080f' }}>
      {/* Accent line top */}
      <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent, ${accent}88, transparent)` }} />

      <div className="flex flex-1 overflow-hidden">
        {/* ── Desktop Sidebar ── */}
        <aside
          className="hidden lg:flex flex-col flex-shrink-0 overflow-y-auto overflow-x-hidden transition-all duration-300 ease-out"
          style={{
            width: mounted && collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W,
            background: 'linear-gradient(180deg, #0a0c14 0%, #0d1017 50%, #0a0c14 100%)',
            borderRight: `1px solid ${accent}14`,
          }}
        >
          <SidebarContent
            collapsed={mounted && collapsed}
            navGroups={navGroups}
            accent={accent}
            portalName={portalName}
            portalSub={portalSub}
            userName={userName}
            userRole={userRole}
            logoHref={logoHref}
            logoutAction={logoutAction}
            pathname={pathname}
            onToggle={toggle}
            footer={sidebarFooter}
          />
        </aside>

        {/* ── Mobile Header ── */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center h-14 px-4 gap-3"
          style={{
            background: 'rgba(10,12,20,0.96)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderBottom: `1px solid ${accent}14`,
          }}
        >
          <button
            onClick={() => setMobileOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl transition-colors"
            style={{ color: `${accent}aa`, background: `${accent}0d` }}
            aria-label="Abrir menu"
          >
            <Menu size={18} />
          </button>
          <Link href={logoHref} className="flex items-center gap-2 min-w-0" aria-label={`${portalName} — ir para início`}>
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `${accent}1a`, border: `1px solid ${accent}30` }}
            >
              <span className="text-xs font-black" style={{ color: accent }}>A</span>
            </div>
            <span className="text-sm font-bold text-white/90 truncate">{portalName}</span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            {userName && (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: `${accent}1a`, border: `1.5px solid ${accent}33` }}
              >
                <span className="text-xs font-bold" style={{ color: accent }}>
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Mobile Drawer ── */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex" onClick={() => setMobileOpen(false)}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <div
              className="relative flex flex-col w-72 max-w-[85vw] h-full overflow-y-auto overflow-x-hidden"
              style={{
                background: 'linear-gradient(180deg, #0a0c14 0%, #0d1017 50%, #0a0c14 100%)',
                borderRight: `1px solid ${accent}14`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-4" style={{ borderBottom: `1px solid ${accent}10` }}>
                <Link href={logoHref} onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: `${accent}1a`, border: `1px solid ${accent}30` }}
                  >
                    <span className="text-sm font-black" style={{ color: accent }}>A</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white/90">{portalName}</p>
                    {portalSub && (
                      <p className="text-[10px] uppercase tracking-wider" style={{ color: `${accent}66` }}>{portalSub}</p>
                    )}
                  </div>
                </Link>
                <button onClick={() => setMobileOpen(false)} className="text-white/30 hover:text-white/70 transition-colors p-1">
                  <X size={18} />
                </button>
              </div>
              <SidebarContent
                collapsed={false}
                navGroups={navGroups}
                accent={accent}
                portalName={portalName}
                portalSub={portalSub}
                userName={userName}
                userRole={userRole}
                logoHref={logoHref}
                logoutAction={logoutAction}
                pathname={pathname}
                onLinkClick={() => setMobileOpen(false)}
                footer={sidebarFooter}
                hideHeader
              />
            </div>
          </div>
        )}

        {/* ── Main Content ── */}
        <main
          className="flex-1 overflow-auto"
          style={{
            paddingTop: 'env(safe-area-inset-top, 0)',
            background: 'radial-gradient(ellipse at 20% 0%, rgba(59,130,246,0.04) 0%, transparent 50%), #09090f',
          }}
        >
          {/* Mobile top spacer */}
          <div className="lg:hidden h-14" />
          {children}
          {/* Mobile bottom spacer for bottom nav */}
          {bottomNav && bottomNav.length > 0 && <div className="lg:hidden h-20" />}
        </main>
      </div>

      {/* ── Mobile Bottom Nav ── */}
      {bottomNav && bottomNav.length > 0 && (
        <nav
          className="lg:hidden fixed bottom-0 left-0 right-0 z-40"
          style={{
            paddingBottom: 'env(safe-area-inset-bottom, 0)',
            background: 'rgba(10,12,20,0.97)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderTop: `1px solid ${accent}14`,
          }}
        >
          <div className="grid h-16" style={{ gridTemplateColumns: `repeat(${bottomNav.length}, 1fr)` }}>
            {bottomNav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + '/')
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  aria-label={item.label}
                  className="relative flex flex-col items-center justify-center gap-1 no-underline transition-colors"
                  style={{ color: active ? accent : 'rgba(255,255,255,0.28)' }}
                >
                  {active && (
                    <span
                      className="absolute top-0 left-1/2 -translate-x-1/2 rounded-b-full"
                      style={{
                        width: 28, height: 2.5,
                        background: `linear-gradient(90deg, ${accent}, ${accent}99)`,
                        boxShadow: `0 0 10px ${accent}66`,
                      }}
                    />
                  )}
                  <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                  <span className="font-medium" style={{ fontSize: 10, letterSpacing: '0.3px' }}>
                    {item.label}
                  </span>
                  {item.badge != null && (
                    <span
                      className="absolute top-1.5 left-1/2 ml-2 min-w-[16px] h-4 flex items-center justify-center rounded-full text-[9px] font-bold text-white"
                      style={{ background: '#ef4444', padding: '0 4px' }}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        </nav>
      )}
    </div>
  )
}

// ─── Sidebar Content (shared between desktop and mobile drawer) ─────────────────

function SidebarContent({
  collapsed,
  navGroups,
  accent,
  portalName,
  portalSub,
  userName,
  userRole,
  logoHref = '/',
  logoutAction,
  pathname,
  onToggle,
  onLinkClick,
  footer,
  hideHeader,
}: {
  collapsed: boolean
  navGroups: NavGroup[]
  accent: string
  portalName: string
  portalSub?: string
  userName?: string
  userRole?: string
  logoHref?: string
  logoutAction?: () => Promise<void>
  pathname: string
  onToggle?: () => void
  onLinkClick?: () => void
  footer?: React.ReactNode
  hideHeader?: boolean
}) {
  return (
    <>
      {/* Logo + Toggle */}
      {!hideHeader && (
        <div
          className="flex items-center flex-shrink-0"
          style={{
            borderBottom: `1px solid ${accent}10`,
            padding: collapsed ? '16px 14px' : '16px 16px',
            justifyContent: collapsed ? 'center' : 'space-between',
          }}
        >
          {!collapsed ? (
            <Link href={logoHref} className="flex items-center gap-2.5 group min-w-0" aria-label={`${portalName} — ir para início`}>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${accent}1a`, border: `1px solid ${accent}30` }}
              >
                <span className="text-sm font-black" style={{ color: accent }}>A</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white/90 leading-none truncate group-hover:text-white transition-colors">
                  {portalName}
                </p>
                {portalSub && (
                  <p className="text-[10px] mt-1 uppercase tracking-wider" style={{ color: `${accent}66` }}>
                    {portalSub}
                  </p>
                )}
              </div>
            </Link>
          ) : (
            <Link href={logoHref} aria-label={`${portalName} — ir para início`}>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: `${accent}1a`, border: `1px solid ${accent}30` }}
              >
                <span className="text-sm font-black" style={{ color: accent }}>A</span>
              </div>
            </Link>
          )}
          {onToggle && (
            <button
              onClick={onToggle}
              className="flex-shrink-0 text-white/20 hover:text-white/60 transition-colors p-1 rounded"
              style={{ marginLeft: collapsed ? 0 : undefined }}
              aria-label={collapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
            >
              {collapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
            </button>
          )}
        </div>
      )}

      {/* Nav Groups */}
      <nav
        className="flex-1 overflow-y-auto overflow-x-hidden py-3"
        style={{ padding: collapsed ? '12px 8px' : '12px 10px' }}
      >
        {navGroups.map((group) => (
          <div key={group.label} className="mb-4">
            {!collapsed && (
              <p
                className="px-3 mb-2 text-[10px] uppercase tracking-widest font-semibold"
                style={{ color: `${accent}50` }}
              >
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map(({ href, label, icon: Icon, external, badge }) => {
                const active = pathname === href || pathname.startsWith(href + '/')
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={onLinkClick}
                    title={collapsed ? label : undefined}
                    aria-label={collapsed ? label : undefined}
                    aria-current={active ? 'page' : undefined}
                    className={[
                      'relative flex items-center rounded-xl transition-all duration-200 group/link',
                      collapsed ? 'justify-center p-2.5 mx-0.5' : 'gap-3 px-3 py-2.5',
                    ].join(' ')}
                    style={active ? {
                      background: `${accent}14`,
                      color: accent,
                    } : {
                      color: 'rgba(255,255,255,0.40)',
                    }}
                  >
                    {/* Active indicator bar */}
                    {active && !collapsed && (
                      <span
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full"
                        style={{
                          height: '60%',
                          background: `linear-gradient(180deg, ${accent} 0%, ${accent}80 100%)`,
                          boxShadow: `0 0 8px ${accent}66`,
                        }}
                      />
                    )}
                    <Icon
                      size={collapsed ? 18 : 16}
                      className="flex-shrink-0 transition-colors"
                      style={{ color: active ? accent : 'rgba(255,255,255,0.25)' }}
                    />
                    {!collapsed && (
                      <>
                        <span className="truncate text-[13px] flex-1 font-medium group-hover/link:text-white/80 transition-colors">
                          {label}
                        </span>
                        {badge != null && (
                          <span
                            className="text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center"
                            style={{ background: `${accent}1a`, color: accent }}
                          >
                            {badge}
                          </span>
                        )}
                        {external && (
                          <ChevronRight size={12} className="flex-shrink-0" style={{ color: 'rgba(255,255,255,0.12)' }} />
                        )}
                      </>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Sidebar Footer */}
      {footer && (
        <div style={{ borderTop: `1px solid ${accent}0d`, padding: collapsed ? '12px 8px' : '12px 14px' }}>
          {footer}
        </div>
      )}

      {/* User Section */}
      <div
        className="mt-auto flex-shrink-0"
        style={{
          borderTop: `1px solid ${accent}0d`,
          padding: collapsed ? '12px 8px' : '12px 14px',
        }}
      >
        {!collapsed && userName && (
          <div className="flex items-center gap-2.5 mb-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: `${accent}14`, border: `1.5px solid ${accent}30` }}
            >
              <span className="text-xs font-bold" style={{ color: accent }}>
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-white/75 truncate">{userName}</p>
              {userRole && (
                <p className="text-[10px] truncate" style={{ color: `${accent}55` }}>{userRole}</p>
              )}
            </div>
          </div>
        )}
        {collapsed && userName && (
          <div className="flex justify-center mb-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: `${accent}14`, border: `1.5px solid ${accent}30` }}
            >
              <span className="text-xs font-bold" style={{ color: accent }}>
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        )}
        {logoutAction && (
          <form action={logoutAction}>
            <button
              type="submit"
              aria-label="Sair da conta"
              className={[
                'flex items-center gap-2 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.03] transition-all w-full',
                collapsed ? 'justify-center p-2' : 'px-3 py-2',
              ].join(' ')}
            >
              <LogOut size={14} />
              {!collapsed && <span className="text-xs">Sair</span>}
            </button>
          </form>
        )}
        {!collapsed && (
          <p className="text-[9px] text-white/10 mt-2 px-1">v1.0 · A7x OS</p>
        )}
      </div>
    </>
  )
}
