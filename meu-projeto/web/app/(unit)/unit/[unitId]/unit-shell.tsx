'use client'

import {
    LayoutDashboard,
    AlertTriangle,
    Factory,
    Wrench,
    FlaskConical,
    PackageOpen,
    Users,
    MapPin,
    ClipboardList,
    Tag,
    FileText,
    DollarSign,
    History,
    Megaphone,
} from 'lucide-react'
import { AppShell, type NavGroup, type NavItem } from '@/components/layout/app-shell'

// ─── Portal Accent ───────────────────────────────────────────────────────────
const ACCENT = '#06b6d4' // Cyan — Unit portal

// ─── Types ───────────────────────────────────────────────────────────────────
interface UnitShellProps {
    children: React.ReactNode
    unitId: string
    unitName: string
    userName?: string
    userRole?: string
    logoutAction: () => Promise<void>
}

// ─── UnitShell ───────────────────────────────────────────────────────────────
export function UnitShell({
    children,
    unitId,
    unitName,
    userName,
    userRole,
    logoutAction,
}: UnitShellProps) {
    const base = `/unit/${unitId}`

    const navGroups: NavGroup[] = [
        {
            label: 'Operacional',
            items: [
                { href: `${base}/dashboard`, label: 'Dashboard', icon: LayoutDashboard },
                { href: `${base}/alerts`, label: 'Alertas SLA', icon: AlertTriangle },
                { href: `${base}/production`, label: 'Produção', icon: Factory },
                { href: `${base}/production/history`, label: 'Histórico Prod.', icon: History },
                { href: `${base}/equipment`, label: 'Equipamentos', icon: Wrench },
                { href: `${base}/recipes`, label: 'Receitas', icon: FlaskConical },
                { href: `${base}/supplies`, label: 'Insumos', icon: PackageOpen },
            ],
        },
        {
            label: 'Logística',
            items: [
                { href: `${base}/routes`, label: 'Rotas', icon: MapPin },
                { href: `${base}/manifests`, label: 'Romaneios', icon: ClipboardList },
            ],
        },
        {
            label: 'Comercial',
            items: [
                { href: `${base}/clients`, label: 'Clientes', icon: Users },
                { href: `${base}/campaigns`, label: 'Campanhas', icon: Megaphone },
                { href: `${base}/pricing`, label: 'Preços', icon: Tag },
                { href: `${base}/quotes`, label: 'Orçamentos', icon: FileText },
            ],
        },
        {
            label: 'Gestão',
            items: [
                { href: `${base}/staff`, label: 'Funcionários', icon: Users },
                { href: `${base}/financial`, label: 'Financeiro', icon: DollarSign },
            ],
        },
    ]

    const bottomNav: NavItem[] = [
        { href: `${base}/dashboard`, label: 'Dashboard', icon: LayoutDashboard },
        { href: `${base}/alerts`, label: 'Alertas', icon: AlertTriangle },
        { href: `${base}/production`, label: 'Produção', icon: Factory },
        { href: `${base}/manifests`, label: 'Romaneios', icon: ClipboardList },
        { href: `${base}/financial`, label: 'Financeiro', icon: DollarSign },
    ]

    return (
        <AppShell
            navGroups={navGroups}
            bottomNav={bottomNav}
            accent={ACCENT}
            portalName="A7x Unidade"
            portalSub={unitName}
            userName={userName}
            userRole={userRole}
            logoHref={`${base}/dashboard`}
            logoutAction={logoutAction}
        >
            {children}
        </AppShell>
    )
}
