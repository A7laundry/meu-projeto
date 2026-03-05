'use client'

import {
  LayoutDashboard,
  Target,
  Trophy,
  User,
  Settings,
  FileText,
  CheckSquare,
} from 'lucide-react'
import { AppShell, type NavGroup, type NavItem } from '@/components/layout/app-shell'

interface CopywriterShellProps {
  children: React.ReactNode
  userName?: string
  userRole?: string
  isAdmin: boolean
  xp: number
  level: string
  xpProgress: number
  logoutAction: () => Promise<void>
}

export function CopywriterShell({
  children,
  userName,
  userRole,
  isAdmin,
  xp,
  level,
  xpProgress,
  logoutAction,
}: CopywriterShellProps) {
  const navGroups: NavGroup[] = [
    {
      label: 'Copywriter',
      items: [
        { href: '/copywriter/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/copywriter/missions', label: 'Missoes', icon: Target },
        { href: '/copywriter/leaderboard', label: 'Ranking', icon: Trophy },
        { href: '/copywriter/profile', label: 'Perfil', icon: User },
      ],
    },
    ...(isAdmin ? [{
      label: 'Admin',
      items: [
        { href: '/copywriter/admin', label: 'Painel Admin', icon: Settings },
        { href: '/copywriter/admin/briefings', label: 'Briefings', icon: FileText },
        { href: '/copywriter/admin/reviews', label: 'Reviews', icon: CheckSquare },
      ],
    }] : []),
  ]

  const bottomNav: NavItem[] = [
    { href: '/copywriter/dashboard', label: 'Home', icon: LayoutDashboard },
    { href: '/copywriter/missions', label: 'Missoes', icon: Target },
    { href: '/copywriter/leaderboard', label: 'Ranking', icon: Trophy },
    { href: '/copywriter/profile', label: 'Perfil', icon: User },
  ]

  return (
    <AppShell
      navGroups={navGroups}
      bottomNav={bottomNav}
      accent="#a855f7"
      portalName="A7x Copy"
      portalSub={`${level} · ${xp} XP`}
      userName={userName}
      userRole={userRole}
      logoHref="/copywriter/dashboard"
      logoutAction={logoutAction}
      sidebarFooter={
        <div className="px-2">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-white/30">XP</span>
            <span className="text-[10px] font-bold" style={{ color: '#a855f7' }}>{xp}</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(168,85,247,0.12)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(xpProgress, 100)}%`,
                background: 'linear-gradient(90deg, #7c3aed, #a855f7)',
                boxShadow: '0 0 8px rgba(168,85,247,0.4)',
              }}
            />
          </div>
        </div>
      }
    >
      {children}
    </AppShell>
  )
}
