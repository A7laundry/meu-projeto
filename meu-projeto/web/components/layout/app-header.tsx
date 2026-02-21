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
  copywriter: 'Redator',
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
      <header
        className="px-6 py-3 flex items-center justify-between flex-shrink-0"
        style={{
          background: 'rgba(5,5,8,0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(214,178,94,0.12)',
          boxShadow: '0 1px 0 rgba(214,178,94,0.04), 0 4px 24px rgba(0,0,0,0.3)',
        }}
      >
        <div className="flex items-center gap-4">
          <Link href={logoHref} className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, rgba(214,178,94,0.20) 0%, rgba(185,138,44,0.08) 100%)', border: '1px solid rgba(214,178,94,0.28)' }}
            >
              <span className="text-sm font-black gold-text leading-none">A</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-sm font-bold text-white/90 group-hover:text-white transition-colors">A7x OS</span>
            </div>
          </Link>
          {subtitle && (
            <>
              <Separator orientation="vertical" className="h-4 bg-[#d6b25e]/15" />
              <span className="text-sm text-white/50">{subtitle}</span>
            </>
          )}
          {children}
        </div>
        <div className="flex items-center gap-3">
          {user?.full_name && (
            <div className="flex items-center gap-2.5">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-medium text-white/80 leading-none">{user.full_name}</p>
                {roleLabel && <p className="text-[10px] text-[#d6b25e]/55 mt-0.5 uppercase tracking-wide">{roleLabel}</p>}
              </div>
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, rgba(214,178,94,0.22) 0%, rgba(185,138,44,0.12) 100%)',
                  border: '1.5px solid rgba(214,178,94,0.35)',
                  boxShadow: '0 0 12px rgba(214,178,94,0.12)',
                }}
              >
                <span className="text-xs font-bold text-[#d6b25e]">
                  {user.full_name.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          )}
          <form action={logout}>
            <button
              type="submit"
              className="text-xs text-white/35 hover:text-white/70 transition-colors border border-white/08 hover:border-white/20 rounded-md px-2.5 py-1.5"
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
