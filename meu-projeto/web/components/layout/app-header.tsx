import Link from 'next/link'
import { logout } from '@/app/(auth)/login/actions'
import { Separator } from '@/components/ui/separator'
import type { UserProfile } from '@/types/auth'

const ROLE_LABELS: Record<string, string> = {
  director: 'Diretor',
  unit_manager: 'Gerente de Unidade',
  operator: 'Operador',
  driver: 'Motorista',
  store: 'Loja',
  customer: 'Cliente',
  sdr: 'SDR',
  closer: 'Closer',
}

interface AppHeaderProps {
  user: UserProfile | null
  title?: string
  subtitle?: string
  logoHref?: string
  children?: React.ReactNode
  dark?: boolean
}

export function AppHeader({
  user,
  title = 'A7x TecNologia - OS.',
  subtitle,
  logoHref = '/',
  children,
  dark = false,
}: AppHeaderProps) {
  const roleLabel = user?.role ? ROLE_LABELS[user.role] ?? user.role : null

  if (dark) {
    return (
      <header className="border-b border-[#d6b25e]/20 bg-[#07070a] px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link href={logoHref} className="flex items-center gap-2 group">
            <span className="text-lg font-black tracking-tight gold-text">A7x</span>
            <span className="text-xs text-[#d6b25e]/60 font-medium hidden sm:block">TecNologia - OS.</span>
          </Link>
          {subtitle && (
            <>
              <Separator orientation="vertical" className="h-5 bg-[#d6b25e]/20" />
              <span className="text-sm font-medium text-[#d6b25e]/80">{subtitle}</span>
            </>
          )}
          {children}
        </div>
        <div className="flex items-center gap-4">
          {user?.full_name && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#d6b25e]/20 border border-[#d6b25e]/40 flex items-center justify-center">
                <span className="text-xs font-bold text-[#d6b25e]">
                  {user.full_name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="hidden sm:block text-right">
                <p className="text-xs font-medium text-white/90 leading-none">{user.full_name}</p>
                {roleLabel && <p className="text-[10px] text-[#d6b25e]/60 mt-0.5">{roleLabel}</p>}
              </div>
            </div>
          )}
          <form action={logout}>
            <button
              type="submit"
              className="text-xs text-white/40 hover:text-[#d6b25e] transition-colors border border-white/10 hover:border-[#d6b25e]/40 rounded px-2 py-1"
            >
              Sair
            </button>
          </form>
        </div>
      </header>
    )
  }

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
