'use client'

import { Home, User, LogOut } from 'lucide-react'
import { AppShell, type NavGroup, type NavItem } from '@/components/layout/app-shell'

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Minha Conta',
    items: [
      { href: '/client/orders', label: 'Meus Pedidos', icon: Home },
      { href: '/client/profile', label: 'Perfil', icon: User },
    ],
  },
]

const BOTTOM_NAV: NavItem[] = [
  { href: '/client/orders', label: 'Pedidos', icon: Home },
  { href: '/client/profile', label: 'Perfil', icon: User },
]

interface ClientShellProps {
  children: React.ReactNode
  userName?: string
  logoutAction: () => Promise<void>
}

export function ClientShell({ children, userName, logoutAction }: ClientShellProps) {
  return (
    <AppShell
      navGroups={NAV_GROUPS}
      bottomNav={BOTTOM_NAV}
      accent="#3b82f6"
      portalName="A7x Lavanderia"
      portalSub="Portal do Cliente"
      userName={userName}
      userRole="Cliente"
      logoHref="/client/orders"
      logoutAction={logoutAction}
    >
      {children}
    </AppShell>
  )
}
