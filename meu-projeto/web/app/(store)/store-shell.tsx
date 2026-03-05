'use client'

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
import { AppShell, type NavGroup, type NavItem } from '@/components/layout/app-shell'

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Operacao',
    items: [
      { href: '/store/pdv', label: 'PDV', icon: ScanBarcode },
      { href: '/store/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/store/comandas', label: 'Comandas', icon: ClipboardList },
    ],
  },
  {
    label: 'Gestao',
    items: [
      { href: '/store/clients', label: 'Clientes', icon: Users },
      { href: '/store/crm', label: 'CRM', icon: Heart },
      { href: '/store/coletas', label: 'Coletas & Entregas', icon: Truck },
    ],
  },
  {
    label: 'Financeiro',
    items: [
      { href: '/store/financeiro', label: 'Financeiro', icon: Wallet },
      { href: '/store/relatorios', label: 'Relatorios', icon: BarChart3 },
      { href: '/store/precos', label: 'Precos', icon: Tag },
    ],
  },
]

const BOTTOM_NAV: NavItem[] = [
  { href: '/store/pdv', label: 'PDV', icon: ScanBarcode },
  { href: '/store/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/store/comandas', label: 'Comandas', icon: ClipboardList },
  { href: '/store/clients', label: 'Clientes', icon: Users },
  { href: '/store/financeiro', label: 'Financeiro', icon: Wallet },
]

interface StoreShellProps {
  children: React.ReactNode
  userName?: string
  userRole?: string
  notificationCount?: number
  logoutAction: () => Promise<void>
}

export function StoreShell({ children, userName, userRole, logoutAction }: StoreShellProps) {
  return (
    <AppShell
      navGroups={NAV_GROUPS}
      bottomNav={BOTTOM_NAV}
      accent="#10b981"
      portalName="A7x Loja"
      portalSub="PDV"
      userName={userName}
      userRole={userRole}
      logoHref="/store/dashboard"
      logoutAction={logoutAction}
    >
      {children}
    </AppShell>
  )
}
