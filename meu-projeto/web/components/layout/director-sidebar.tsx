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
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const NAV_ITEMS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/director/dashboard',    label: 'Dashboard Geral', icon: LayoutDashboard },
  { href: '/director/units',        label: 'Unidades',         icon: Building2 },
  { href: '/director/reports',      label: 'Relatórios',       icon: FileBarChart },
  { href: '/director/nps',          label: 'NPS & Pesquisas',  icon: Star },
  { href: '/commercial/dashboard',  label: 'Comercial',        icon: Briefcase },
]

const STORAGE_KEY = 'a7x-sidebar-collapsed'

interface DirectorSidebarProps {
  units: { id: string; name: string }[]
}

export function DirectorSidebar({ units }: DirectorSidebarProps) {
  const pathname = usePathname()
  const firstUnitId = units[0]?.id
  const [collapsed, setCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [, startTransition] = useTransition()

  useEffect(() => {
    startTransition(() => {
      setMounted(true)
      setCollapsed(localStorage.getItem(STORAGE_KEY) === 'true')
    })
  }, [])

  const toggle = () => {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem(STORAGE_KEY, String(next))
  }

  return (
    <aside
      className="flex-shrink-0 flex flex-col overflow-y-auto overflow-x-hidden scrollbar-dark transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
      style={{
        width: mounted && collapsed ? 60 : 224,
        background: 'linear-gradient(180deg, #060609 0%, #07070a 60%, #060609 100%)',
        borderRight: '1px solid rgba(214,178,94,0.08)',
        boxShadow: '1px 0 0 rgba(255,255,255,0.02)',
      }}
    >
      {/* Logo + toggle */}
      <div
        className="flex items-center border-b border-[#d6b25e]/08 flex-shrink-0"
        style={{ padding: collapsed ? '16px 12px' : '16px 20px', justifyContent: collapsed ? 'center' : 'space-between' }}
      >
        {!collapsed && (
          <Link href="/director/dashboard" className="flex items-center gap-2.5 group min-w-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, rgba(214,178,94,0.18) 0%, rgba(185,138,44,0.08) 100%)',
                border: '1px solid rgba(214,178,94,0.25)',
              }}
            >
              <span className="text-sm font-black gold-text leading-none">A</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white/90 leading-none truncate group-hover:text-white transition-colors">A7x OS</p>
              <p className="text-[9px] text-[#d6b25e]/40 mt-0.5 uppercase tracking-wider">Executivo</p>
            </div>
          </Link>
        )}
        {collapsed && (
          <Link href="/director/dashboard">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(214,178,94,0.18) 0%, rgba(185,138,44,0.08) 100%)',
                border: '1px solid rgba(214,178,94,0.25)',
              }}
            >
              <span className="text-sm font-black gold-text leading-none">A</span>
            </div>
          </Link>
        )}
        <button
          onClick={toggle}
          className="flex-shrink-0 text-white/20 hover:text-white/60 transition-colors p-1 rounded"
          title={collapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
          style={{ marginLeft: collapsed ? 0 : 'auto' }}
        >
          {collapsed
            ? <PanelLeftOpen size={14} />
            : <PanelLeftClose size={14} />
          }
        </button>
      </div>

      {/* Nav principal */}
      <nav className="py-4 space-y-0.5 flex-shrink-0" style={{ padding: collapsed ? '16px 8px' : '16px 12px' }}>
        {!collapsed && (
          <p className="text-[9px] uppercase tracking-widest text-[#d6b25e]/30 font-semibold px-3 mb-2">
            Menu
          </p>
        )}
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={[
                'relative flex items-center rounded-lg transition-all duration-200',
                collapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5',
                active
                  ? 'bg-[#d6b25e]/10 text-[#d6b25e] font-medium' + (collapsed ? '' : ' nav-indicator')
                  : 'text-white/45 hover:text-white/85 hover:bg-white/04',
              ].join(' ')}
            >
              <Icon
                size={15}
                className={`flex-shrink-0 transition-colors ${active ? 'text-[#d6b25e]' : 'text-white/25'}`}
              />
              {!collapsed && <span className="truncate text-sm">{label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Unidades individuais */}
      {units.length > 0 && (
        <div
          className="flex-1 border-t border-[#d6b25e]/08"
          style={{ padding: collapsed ? '16px 8px' : '16px 12px' }}
        >
          {!collapsed && (
            <p className="text-[9px] uppercase tracking-widest text-[#d6b25e]/30 font-semibold px-3 mb-2">
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
                  title={collapsed ? unit.name : undefined}
                  className={[
                    'relative flex items-center rounded-lg transition-all duration-200',
                    collapsed ? 'justify-center p-3' : 'gap-2.5 px-3 py-2',
                    active
                      ? 'bg-[#d6b25e]/10 text-[#d6b25e] font-medium' + (collapsed ? '' : ' nav-indicator')
                      : 'text-white/35 hover:text-white/75 hover:bg-white/04',
                  ].join(' ')}
                >
                  <div className={`rounded-full flex-shrink-0 transition-colors ${collapsed ? 'w-2 h-2' : 'w-1.5 h-1.5'} ${active ? 'bg-[#d6b25e]' : 'bg-white/15'}`} />
                  {!collapsed && <span className="truncate text-xs">{unit.name}</span>}
                </Link>
              )
            })}
          </nav>
        </div>
      )}

      {/* Footer */}
      <div
        className="border-t border-[#d6b25e]/08 mt-auto"
        style={{ padding: collapsed ? '12px 8px' : '12px 20px' }}
      >
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
    </aside>
  )
}
