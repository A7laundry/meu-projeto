import { getUser } from '@/lib/auth/get-user'
import { Home, User, Sparkles, LogOut } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/client/orders',  Icon: Home,     label: 'Início',  active: true  },
  { href: '/client/profile', Icon: User,     label: 'Perfil',  active: false },
  { href: '#services',       Icon: Sparkles, label: 'Serviços', active: false },
  { href: '/auth/logout',    Icon: LogOut,   label: 'Sair',    active: false },
]

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()
  const initials = user?.full_name
    ?.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase() ?? '?'

  return (
    <div className="min-h-screen text-white" style={{ background: '#07080f' }}>

      {/* ── Header sticky ── */}
      <header
        className="sticky top-0 z-50"
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          background: 'rgba(7,8,15,0.94)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="flex items-center justify-between px-4" style={{ height: 56 }}>
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{
                background: 'rgba(59,130,246,0.12)',
                border: '1px solid rgba(59,130,246,0.22)',
              }}
            >
              <span style={{ fontSize: 16 }}>🧺</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-white" style={{ fontSize: 15, letterSpacing: '-0.3px' }}>A7x</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)' }}>Lavanderia</span>
            </div>
          </div>

          {/* Avatar com iniciais */}
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center font-bold"
            style={{
              fontSize: 12,
              background: 'rgba(59,130,246,0.12)',
              border: '1px solid rgba(59,130,246,0.24)',
              color: '#93c5fd',
              letterSpacing: '0.5px',
            }}
          >
            {initials}
          </div>
        </div>
      </header>

      {/* ── Conteúdo ── */}
      <main
        className="overflow-auto"
        style={{ paddingBottom: 'calc(68px + env(safe-area-inset-bottom))' }}
      >
        {children}
      </main>

      {/* ── Bottom Nav ── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
          background: 'rgba(7,8,15,0.97)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderTop: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <div className="grid grid-cols-4" style={{ height: 60 }}>
          {NAV_ITEMS.map((tab) => (
            <a
              key={tab.href}
              href={tab.href}
              className="relative flex flex-col items-center justify-center gap-1 no-underline"
              style={{
                color: tab.active ? '#60a5fa' : 'rgba(255,255,255,0.26)',
                textDecoration: 'none',
              }}
            >
              {/* Indicator line no topo do item ativo */}
              {tab.active && (
                <span
                  className="absolute top-0 left-1/2 rounded-b-full"
                  style={{
                    transform: 'translateX(-50%)',
                    width: 24, height: 2.5,
                    background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                    boxShadow: '0 0 8px rgba(59,130,246,0.6)',
                  }}
                />
              )}
              <tab.Icon size={20} strokeWidth={tab.active ? 2.5 : 1.8} />
              <span
                className="font-medium"
                style={{ fontSize: 10, letterSpacing: '0.3px' }}
              >
                {tab.label}
              </span>
            </a>
          ))}
        </div>
      </nav>
    </div>
  )
}
