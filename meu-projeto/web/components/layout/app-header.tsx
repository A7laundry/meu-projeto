import Link from 'next/link'
import { logout } from '@/app/(auth)/login/actions'
import { Separator } from '@/components/ui/separator'
import type { UserProfile } from '@/types/auth'

interface AppHeaderProps {
  user: UserProfile | null
  title?: string
  subtitle?: string
  logoHref?: string
  children?: React.ReactNode
}

export function AppHeader({
  user,
  title = 'Synkra Laundry OS',
  subtitle,
  logoHref = '/',
  children,
}: AppHeaderProps) {
  return (
    <header className="border-b bg-white px-6 py-3 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-4">
        <Link href={logoHref} className="text-sm font-bold text-gray-900">
          {title}
        </Link>
        {subtitle && (
          <>
            <Separator orientation="vertical" className="h-5" />
            <span className="text-sm font-medium text-gray-700">{subtitle}</span>
          </>
        )}
        {children}
      </div>
      <div className="flex items-center gap-4">
        {user?.full_name && (
          <span className="text-sm text-gray-500">{user.full_name}</span>
        )}
        <form action={logout}>
          <button type="submit" className="text-sm text-gray-400 hover:text-gray-700 transition-colors">
            Sair
          </button>
        </form>
      </div>
    </header>
  )
}
