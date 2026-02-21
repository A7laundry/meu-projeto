import { login } from './actions'
import Link from 'next/link'

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  return (
    <div
      className="min-h-screen flex dot-grid-bg"
      style={{ background: 'linear-gradient(135deg, #050508 0%, #07070f 100%)' }}
    >
      {/* Gold spotlight */}
      <div
        className="fixed pointer-events-none"
        style={{
          top: 0, left: 0, right: 0, height: '60vh',
          background: 'radial-gradient(ellipse 80% 60% at 30% 0%, rgba(214,178,94,0.07) 0%, transparent 65%)',
          zIndex: 0,
        }}
      />

      {/* ── LEFT PANEL — Branding ──────────────────────────────── */}
      <div
        className="hidden lg:flex flex-col justify-between relative z-10"
        style={{
          width: '52%',
          padding: '48px 56px',
          borderRight: '1px solid rgba(214,178,94,0.08)',
          background: 'linear-gradient(160deg, rgba(214,178,94,0.04) 0%, transparent 50%)',
        }}
      >
        {/* Logo */}
        <Link href="/home" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #d6b25e 0%, #b08030 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 15, fontWeight: 900, color: '#05050a',
          }}>A</div>
          <span style={{ fontWeight: 700, fontSize: 15, color: 'rgba(255,255,255,0.85)', letterSpacing: '-0.01em' }}>
            A7x <span style={{ color: 'rgba(255,255,255,0.28)', fontWeight: 400 }}>TecNologia</span>
          </span>
        </Link>

        {/* Central — headline + features */}
        <div>
          <p style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
            color: 'rgba(214,178,94,0.55)', marginBottom: 20,
          }}>
            Sistema Operacional Inteligente
          </p>

          <h1 style={{
            fontSize: 'clamp(32px, 3.5vw, 52px)',
            fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.06,
            color: '#fff', marginBottom: 32,
          }}>
            Tudo que sua{' '}
            <span className="shimmer-text">lavanderia</span>
            {' '}precisa em um só lugar.
          </h1>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { icon: '◈', title: 'Dashboard Executivo', desc: 'KPIs em tempo real para toda a rede' },
              { icon: '⊞', title: 'Controle de Produção', desc: 'Rastreie cada peça em cada setor' },
              { icon: '◎', title: 'NPS Integrado', desc: 'Satisfação dos clientes sem terceiros' },
              { icon: '⊡', title: 'Romaneios Digitais', desc: 'Logística gerenciada no celular' },
            ].map(f => (
              <div key={f.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <span style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: 'rgba(214,178,94,0.08)', border: '1px solid rgba(214,178,94,0.16)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, color: '#d6b25e',
                }}>{f.icon}</span>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.80)', margin: '0 0 2px' }}>{f.title}</p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.36)', margin: 0 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.18)' }}>
          © {new Date().getFullYear()} A7x TecNologia · Sistema Operacional Inteligente
        </p>
      </div>

      {/* ── RIGHT PANEL — Form ────────────────────────────────── */}
      <div
        className="flex-1 flex flex-col items-center justify-center relative z-10"
        style={{ padding: '48px 24px' }}
      >
        {/* Mobile logo */}
        <div className="lg:hidden mb-10 text-center">
          <div style={{
            width: 44, height: 44, borderRadius: 12, margin: '0 auto 12px',
            background: 'linear-gradient(135deg, #d6b25e 0%, #b08030 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 900, color: '#05050a',
          }}>A</div>
          <p className="shimmer-text" style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.04em' }}>A7x TecNologia</p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.30)', marginTop: 4 }}>Sistema Operacional Inteligente</p>
        </div>

        {/* Form card */}
        <div
          className="card-premium w-full slide-up"
          style={{ maxWidth: 400, padding: '40px 36px', borderRadius: 20 }}
        >
          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{
              fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em',
              color: '#fff', margin: '0 0 6px',
            }}>
              Bem-vindo de volta
            </h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', margin: 0 }}>
              Acesse sua área de trabalho
            </p>
          </div>

          <LoginForm searchParams={searchParams} />

          {/* Link para landing */}
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <Link
              href="/home"
              style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', textDecoration: 'none' }}
            >
              Conhecer o sistema →
            </Link>
          </div>
        </div>

        {/* Trust signals */}
        <div style={{
          display: 'flex', gap: 20, marginTop: 28, flexWrap: 'wrap', justifyContent: 'center',
        }}>
          {['100% seguro', 'Dados criptografados', 'Acesso por perfil'].map(t => (
            <span key={t} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              fontSize: 11, color: 'rgba(255,255,255,0.22)',
            }}>
              <span style={{ color: '#34d399', fontSize: 9 }}>✓</span> {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

async function LoginForm({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  const params = await searchParams

  return (
    <form action={login} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {params?.error && (
        <div style={{
          borderRadius: 10, padding: '12px 16px',
          background: 'rgba(248,113,113,0.08)',
          border: '1px solid rgba(248,113,113,0.22)',
          fontSize: 13, color: '#fca5a5',
        }}>
          {params.error}
        </div>
      )}
      {params?.message && (
        <div style={{
          borderRadius: 10, padding: '12px 16px',
          background: 'rgba(96,165,250,0.08)',
          border: '1px solid rgba(96,165,250,0.22)',
          fontSize: 13, color: '#93c5fd',
        }}>
          {params.message}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{
          fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.40)',
        }}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="seu@email.com"
          required
          autoComplete="email"
          className="input-premium"
          style={{
            padding: '12px 16px', borderRadius: 10,
            fontSize: 14, width: '100%', boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{
          fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.40)',
        }}>
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          autoComplete="current-password"
          className="input-premium"
          style={{
            padding: '12px 16px', borderRadius: 10,
            fontSize: 14, width: '100%', boxSizing: 'border-box',
          }}
        />
      </div>

      <button
        type="submit"
        className="btn-gold"
        style={{
          width: '100%', padding: '13px 0', borderRadius: 10,
          fontSize: 14, fontWeight: 700, marginTop: 4,
          border: 'none', cursor: 'pointer',
        }}
      >
        Entrar no Sistema
      </button>
    </form>
  )
}
