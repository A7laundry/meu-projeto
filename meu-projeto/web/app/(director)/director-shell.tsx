'use client'

import {
  LayoutDashboard,
  Building2,
  Users,
  Globe,
  DollarSign,
  Truck,
  UserCog,
  Scale,
  TrendingUp,
  PieChart,
  Wallet,
  CreditCard,
  Receipt,
  FileBarChart,
  Star,
  Shield,
  MessageSquareText,
  Briefcase,
  Store,
  PenTool,
  Tv,
} from 'lucide-react'
import { AppShell, type NavGroup, type NavItem } from '@/components/layout/app-shell'

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Rede',
    items: [
      { href: '/director/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/director/units', label: 'Unidades', icon: Building2 },
      { href: '/director/users', label: 'Usuarios', icon: Users },
    ],
  },
  {
    label: 'Departamentos',
    items: [
      { href: '/director/financial', label: 'Financeiro', icon: DollarSign },
      { href: '/director/logistics', label: 'Logistica', icon: Truck },
      { href: '/director/hr', label: 'RH', icon: UserCog },
      { href: '/director/legal', label: 'Juridico', icon: Scale },
    ],
  },
  {
    label: 'Financeiro',
    items: [
      { href: '/director/financial/dre', label: 'DRE', icon: TrendingUp },
      { href: '/director/financial/cashflow', label: 'Fluxo de Caixa', icon: PieChart },
      { href: '/director/financial/receivables', label: 'Contas a Receber', icon: Wallet },
      { href: '/director/financial/payables', label: 'Contas a Pagar', icon: CreditCard },
      { href: '/director/financial/billing', label: 'Faturamento', icon: Receipt },
    ],
  },
  {
    label: 'Analise',
    items: [
      { href: '/director/reports', label: 'Relatorios', icon: FileBarChart },
      { href: '/director/nps', label: 'NPS', icon: Star },
      { href: '/director/audit', label: 'Auditoria', icon: Shield },
      { href: '/director/feedback', label: 'Feedback', icon: MessageSquareText },
    ],
  },
  {
    label: 'Modulos',
    items: [
      { href: '/commercial/dashboard', label: 'Comercial', icon: Briefcase, external: true },
      { href: '/store/pdv', label: 'Loja / PDV', icon: Store, external: true },
      { href: '/copywriter/dashboard', label: 'Copywriting', icon: PenTool, external: true },
    ],
  },
]

const BOTTOM_NAV: NavItem[] = [
  { href: '/director/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/director/financial', label: 'Financeiro', icon: DollarSign },
  { href: '/director/units', label: 'Unidades', icon: Building2 },
  { href: '/director/reports', label: 'Relatorios', icon: FileBarChart },
  { href: '/director/users', label: 'Usuarios', icon: Users },
]

interface DirectorShellProps {
  children: React.ReactNode
  userName?: string
  userRole?: string
  units: { id: string; name: string }[]
  logoutAction: () => Promise<void>
}

export function DirectorShell({ children, userName, userRole, units, logoutAction }: DirectorShellProps) {
  const firstUnitId = units[0]?.id

  const unitNavGroups: NavGroup[] = units.length > 0 ? [{
    label: 'Unidades',
    items: units.map((u) => ({
      href: `/unit/${u.id}/dashboard`,
      label: u.name,
      icon: Building2,
    })),
  }] : []

  return (
    <AppShell
      navGroups={[...NAV_GROUPS, ...unitNavGroups]}
      bottomNav={BOTTOM_NAV}
      accent="#3b82f6"
      portalName="A7x OS"
      portalSub="Executivo"
      userName={userName}
      userRole={userRole}
      logoHref="/director/dashboard"
      logoutAction={logoutAction}
      sidebarFooter={
        firstUnitId ? (
          <a
            href={`/tv/${firstUnitId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-white/25 hover:text-white/55 hover:bg-white/[0.03] transition-all"
          >
            <Tv size={14} />
            <span className="text-xs">Painel TV</span>
            <span className="ml-auto text-[10px] opacity-40">{'\u2197'}</span>
          </a>
        ) : undefined
      }
    >
      {children}
    </AppShell>
  )
}
