'use client'

import {
  LayoutDashboard,
  Users,
  UserPlus,
  Megaphone,
} from 'lucide-react'
import { AppShell, type NavGroup, type NavItem } from '@/components/layout/app-shell'

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Comercial',
    items: [
      { href: '/commercial/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/commercial/leads', label: 'Leads', icon: UserPlus },
      { href: '/commercial/clients', label: 'Clientes', icon: Users },
      { href: '/commercial/campaigns', label: 'Campanhas', icon: Megaphone },
    ],
  },
]

const BOTTOM_NAV: NavItem[] = [
  { href: '/commercial/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/commercial/leads', label: 'Leads', icon: UserPlus },
  { href: '/commercial/clients', label: 'Clientes', icon: Users },
  { href: '/commercial/campaigns', label: 'Campanhas', icon: Megaphone },
]

interface CommercialShellProps {
  children: React.ReactNode
  userName?: string
  userRole?: string
  logoutAction: () => Promise<void>
}

export function CommercialShell({ children, userName, userRole, logoutAction }: CommercialShellProps) {
  return (
    <AppShell
      navGroups={NAV_GROUPS}
      bottomNav={BOTTOM_NAV}
      accent="#06b6d4"
      portalName="A7x Comercial"
      portalSub="Vendas"
      userName={userName}
      userRole={userRole}
      logoHref="/commercial/dashboard"
      logoutAction={logoutAction}
    >
      {children}
    </AppShell>
  )
}
