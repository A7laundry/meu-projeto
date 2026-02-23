import { getUser } from '@/lib/auth/get-user'

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()
  const initials = user?.full_name
    ?.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase() ?? '?'

  return (
    <div
      className="min-h-screen text-white"
      style={{ background: '#07070a' }}
    >
      {/* ── Header mobile sticky ── */}
      <header
        className="sticky top-0 z-50"
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          background: 'rgba(7,7,10,0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div
          className="flex items-center justify-between px-4"
          style={{ height: 56 }}
        >
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.25)' }}
            >
              <span style={{ fontSize: 14 }}>🧺</span>
            </div>
            <div>
              <span className="font-bold text-white" style={{ fontSize: 15, letterSpacing: '-0.3px' }}>A7x</span>
              <span className="ml-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.30)' }}>Lavanderia</span>
            </div>
          </div>

          {/* Avatar com iniciais */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs"
            style={{
              background: 'rgba(59,130,246,0.15)',
              border: '1px solid rgba(59,130,246,0.28)',
              color: '#93c5fd',
            }}
          >
            {initials}
          </div>
        </div>
      </header>

      {/* ── Conteúdo ── */}
      <main
        className="overflow-auto"
        style={{ paddingBottom: 'calc(72px + env(safe-area-inset-bottom))' }}
      >
        {children}
      </main>

      {/* ── Bottom nav bar ── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
          background: 'rgba(7,7,10,0.96)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderTop: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <div className="grid grid-cols-4" style={{ height: 56 }}>
          {[
            { href: '/client/orders',  icon: '🏠',  label: 'Início',    active: true  },
            { href: '#history',        icon: '📦',  label: 'Histórico', active: false },
            { href: '#services',       icon: '✨',  label: 'Serviços',  active: false },
            { href: '/auth/logout',    icon: '👤',  label: 'Conta',     active: false },
          ].map((tab) => (
            <a
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center justify-center gap-0.5 no-underline"
              style={{
                color: tab.active ? '#60a5fa' : 'rgba(255,255,255,0.30)',
                textDecoration: 'none',
              }}
            >
              <span style={{ fontSize: 20, lineHeight: 1 }}>{tab.icon}</span>
              <span
                className="font-medium"
                style={{ fontSize: 10, letterSpacing: '0.2px' }}
              >
                {tab.label}
              </span>
              {tab.active && (
                <div
                  className="absolute"
                  style={{
                    bottom: 'calc(env(safe-area-inset-bottom) + 56px)',
                    width: 20, height: 2, borderRadius: 1,
                    background: '#3b82f6',
                  }}
                />
              )}
            </a>
          ))}
        </div>
      </nav>
    </div>
  )
}
