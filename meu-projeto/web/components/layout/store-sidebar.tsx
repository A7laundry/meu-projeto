'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ScanBarcode,
  LayoutDashboard,
  ClipboardList,
  Users,
  Heart,
  Truck,
  Wallet,
  BarChart3,
  Tag,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

interface NavSection {
  title: string
  items: NavItem[]
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Operação',
    items: [
      { href: '/store/pdv',       label: 'PDV',                icon: ScanBarcode },
      { href: '/store/dashboard', label: 'Dashboard',          icon: LayoutDashboard },
      { href: '/store/comandas',  label: 'Comandas',           icon: ClipboardList },
    ],
  },
  {
    title: 'Gestão',
    items: [
      { href: '/store/clients',   label: 'Clientes',           icon: Users },
      { href: '/store/crm',       label: 'CRM',                icon: Heart },
      { href: '/store/coletas',   label: 'Coletas & Entregas', icon: Truck },
    ],
  },
  {
    title: 'Financeiro',
    items: [
      { href: '/store/financeiro',  label: 'Financeiro',       icon: Wallet },
      { href: '/store/relatorios',  label: 'Relatórios',       icon: BarChart3 },
      { href: '/store/precos',      label: 'Preços',           icon: Tag },
    ],
  },
]

interface StoreSidebarProps {
  userName: string
  unitName: string
}

export function StoreSidebar({ userName, unitName }: StoreSidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className="w-56 flex-shrink-0 flex flex-col overflow-y-auto scrollbar-dark py-6 px-3"
      style={{
        background: 'linear-gradient(180deg, #091523 0%, #0d1b2e 60%, #091523 100%)',
        borderRight: '1px solid rgba(52,211,153,0.09)',
      }}
    >
      {/* Módulo label */}
      <div className="px-3 mb-6">
        <p
          className="text-[10px] uppercase tracking-widest font-semibold"
          style={{ color: 'rgba(52,211,153,0.40)' }}
        >
          Loja
        </p>
      </div>

      {/* Nav sections */}
      <nav className="flex-1 space-y-5">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            <p
              className="px-3 mb-1.5 text-[9px] uppercase tracking-widest font-semibold"
              style={{ color: 'rgba(255,255,255,0.18)' }}
            >
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(href + '/')
                return (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-all group"
                    style={active ? {
                      background: 'rgba(52,211,153,0.12)',
                      color: '#34d399',
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
                    <Icon
                      size={16}
                      style={{ color: active ? '#34d399' : 'rgba(255,255,255,0.25)' }}
                    />
                    {label}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Usuário */}
      <div
        className="px-3 mt-4 pt-4"
        style={{ borderTop: '1px solid rgba(52,211,153,0.08)' }}
      >
        <p className="text-xs font-medium text-white/70 truncate">{userName}</p>
        <p className="text-[10px]" style={{ color: 'rgba(52,211,153,0.45)' }}>{unitName}</p>
      </div>

      <div className="px-3 mt-2">
        <p className="text-[10px] text-white/20">v1.0 · A7x OS</p>
      </div>
    </aside>
  )
}
