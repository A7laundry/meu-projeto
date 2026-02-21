import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'A7x TecNologia OS — Sistema Operacional para Lavanderias',
  description:
    'Controle de produção em tempo real, NPS integrado e dashboard executivo para redes de lavanderia industrial.',
}

const FEATURES = [
  {
    icon: '◈',
    title: 'Dashboard Executivo',
    desc: 'Visão consolidada de toda a rede em tempo real. Gauges, tendências semanais e comparativo entre unidades em uma tela.',
    color: '#d6b25e',
    tag: 'DIRETOR',
  },
  {
    icon: '⊞',
    title: 'Controle de Produção',
    desc: 'Rastreie cada peça por setor — triagem, lavagem, secagem, passadoria. Alertas automáticos de SLA antes do prazo vencer.',
    color: '#60a5fa',
    tag: 'OPERAÇÃO',
  },
  {
    icon: '◎',
    title: 'NPS Integrado',
    desc: 'Pesquisa automática por link, painel de resultados por unidade, promotores e detratores — sem depender de terceiros.',
    color: '#34d399',
    tag: 'CLIENTE',
  },
  {
    icon: '⬡',
    title: 'Gestão de Insumos',
    desc: 'Entradas e saídas de produtos químicos com custo por comanda calculado automaticamente. Controle de estoque em tempo real.',
    color: '#a78bfa',
    tag: 'INSUMOS',
  },
  {
    icon: '⊡',
    title: 'Romaneios Digitais',
    desc: 'Motoristas recebem rotas no celular, marcam entregas e coletas. Clientes acompanham o status das peças em tempo real.',
    color: '#fb923c',
    tag: 'LOGÍSTICA',
  },
  {
    icon: '⚙',
    title: 'CRM Comercial',
    desc: 'Pipeline de leads com funil de prospecção, campanhas de marketing digital e LTV calculado para cada cliente.',
    color: '#f472b6',
    tag: 'VENDAS',
  },
]

export default function HomePage() {
  return (
    <>
      <style>{`
        @keyframes shimmer-gold {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes float-y {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
        @keyframes ping-slow {
          0%        { transform: scale(1); opacity: 0.8; }
          75%, 100% { transform: scale(2.2); opacity: 0; }
        }
        .shimmer-text {
          background: linear-gradient(90deg,
            #b08030 0%, #d6b25e 20%, #f5e09f 40%,
            #d6b25e 60%, #b08030 80%, #d6b25e 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer-gold 3.5s linear infinite;
        }
        .float-card { animation: float-y 5.5s ease-in-out infinite; }
        .dot-grid-bg {
          background-image: radial-gradient(circle, rgba(255,255,255,0.045) 1px, transparent 1px);
          background-size: 28px 28px;
        }
        .nav-link { color: rgba(255,255,255,0.45); text-decoration: none; transition: color 0.2s; }
        .nav-link:hover { color: #fff; }
        .feat-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 28px;
          transition: all 0.25s ease;
        }
        .feat-card:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(214,178,94,0.22);
          transform: translateY(-3px);
          box-shadow: 0 16px 48px rgba(0,0,0,0.45), 0 0 0 1px rgba(214,178,94,0.10);
        }
        .cta-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 32px; border-radius: 12px;
          background: linear-gradient(135deg, #d6b25e 0%, #f0d080 100%);
          color: #05050a; font-weight: 700; font-size: 15px;
          text-decoration: none;
          box-shadow: 0 8px 32px rgba(214,178,94,0.25);
          transition: all 0.2s;
        }
        .cta-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 12px 40px rgba(214,178,94,0.35);
        }
        .cta-ghost {
          display: inline-flex; align-items: center;
          padding: 14px 28px; border-radius: 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.10);
          color: rgba(255,255,255,0.65); font-weight: 500; font-size: 15px;
          text-decoration: none; transition: all 0.2s;
        }
        .cta-ghost:hover { background: rgba(255,255,255,0.07); color: #fff; }
        .step-num {
          width: 56px; height: 56px; border-radius: 16px; flex-shrink: 0;
          background: rgba(214,178,94,0.08);
          border: 1px solid rgba(214,178,94,0.22);
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; font-weight: 900; color: #d6b25e; letter-spacing: -0.04em;
        }
      `}</style>

      <div
        className="min-h-screen text-white"
        style={{ background: 'linear-gradient(180deg, #050508 0%, #06060d 50%, #080810 100%)' }}
      >
        {/* Dot grid */}
        <div className="dot-grid-bg fixed inset-0 pointer-events-none" style={{ zIndex: 0, opacity: 0.6 }} />

        {/* Gold spotlight */}
        <div
          className="fixed pointer-events-none"
          style={{
            top: 0, left: '50%', transform: 'translateX(-50%)',
            width: 900, height: 500, zIndex: 0,
            background: 'radial-gradient(ellipse at 50% 0%, rgba(214,178,94,0.09) 0%, transparent 65%)',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1 }}>

          {/* ── NAV ─────────────────────────────────────────────────────── */}
          <nav style={{
            position: 'sticky', top: 0, zIndex: 50,
            background: 'rgba(5,5,8,0.82)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}>
            <div style={{
              maxWidth: 1160, margin: '0 auto', padding: '0 24px',
              height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <Link href="/home" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'linear-gradient(135deg, #d6b25e 0%, #b08030 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 900, color: '#05050a',
                }}>A</div>
                <span style={{ fontWeight: 700, fontSize: 14, color: '#fff', letterSpacing: '-0.01em' }}>
                  A7x <span style={{ color: 'rgba(255,255,255,0.30)', fontWeight: 400 }}>TecNologia</span>
                </span>
              </Link>

              <div style={{ display: 'flex', gap: 32 }} className="hidden md:flex">
                {[['Funcionalidades', '#funcionalidades'], ['Como funciona', '#como-funciona'], ['Para quem', '#segmentos'], ['Contato', '#cta']].map(([l, h]) => (
                  <a key={l} href={h} className="nav-link" style={{ fontSize: 14 }}>{l}</a>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Link href="/login" className="nav-link" style={{ fontSize: 14 }}>Entrar</Link>
                <Link href="/captacao" style={{
                  fontSize: 13, fontWeight: 600, padding: '8px 18px', borderRadius: 8,
                  background: 'linear-gradient(135deg, #d6b25e 0%, #c4a050 100%)',
                  color: '#05050a', textDecoration: 'none',
                }}>
                  Solicitar Demo
                </Link>
              </div>
            </div>
          </nav>

          {/* ── HERO ────────────────────────────────────────────────────── */}
          <section style={{ padding: '88px 24px 48px', textAlign: 'center' }}>
            <div style={{ maxWidth: 820, margin: '0 auto' }}>

              {/* Badge */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '5px 14px', borderRadius: 100,
                  background: 'rgba(214,178,94,0.08)',
                  border: '1px solid rgba(214,178,94,0.22)',
                  fontSize: 12, fontWeight: 500, color: '#d6b25e', letterSpacing: '0.02em',
                }}>
                  <span style={{ position: 'relative', display: 'inline-block', width: 8, height: 8 }}>
                    <span style={{
                      position: 'absolute', inset: 0, borderRadius: '50%',
                      background: '#10b981', animation: 'ping-slow 2s ease-out infinite',
                    }} />
                    <span style={{ position: 'relative', display: 'block', width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                  </span>
                  Sistema em produção · v4.2
                </span>
              </div>

              {/* H1 */}
              <h1 style={{
                fontSize: 'clamp(38px, 6vw, 80px)',
                fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.04,
                color: '#fff', marginBottom: 24,
              }}>
                A inteligência que{' '}
                <span className="shimmer-text">sua lavanderia</span>
                {' '}merece.
              </h1>

              <p style={{
                fontSize: 18, color: 'rgba(255,255,255,0.48)', lineHeight: 1.7,
                maxWidth: 520, margin: '0 auto 32px',
              }}>
                Controle de produção em tempo real, NPS integrado e dashboard executivo
                para redes de lavanderia industrial.
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap', marginBottom: 44, fontSize: 13, color: 'rgba(255,255,255,0.38)' }}>
                {['Implantação em 48h', 'Multi-unidades incluso', 'Sem contrato de fidelidade'].map(t => (
                  <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: '#34d399' }}>✓</span> {t}
                  </span>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/captacao" className="cta-primary">Solicitar Demo gratuita →</Link>
                <Link href="/login" className="cta-ghost">Já sou cliente</Link>
              </div>
            </div>

            {/* ── Dashboard mockup ── */}
            <div style={{ maxWidth: 960, margin: '64px auto 0', padding: '0 16px' }}>
              <div className="float-card" style={{
                borderRadius: 16, overflow: 'hidden',
                boxShadow: '0 0 0 1px rgba(214,178,94,0.10), 0 48px 120px rgba(0,0,0,0.85)',
                background: '#06060e',
              }}>
                {/* Browser chrome */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px',
                  background: '#09091a', borderBottom: '1px solid rgba(255,255,255,0.05)',
                }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {['#ff5f56', '#ffbd2e', '#27c93f'].map(c => (
                      <div key={c} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />
                    ))}
                  </div>
                  <div style={{
                    flex: 1, maxWidth: 300, margin: '0 auto',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 6, padding: '4px 12px',
                    fontSize: 11, color: 'rgba(255,255,255,0.22)', textAlign: 'center',
                  }}>
                    app.a7xos.com.br / director / dashboard
                  </div>
                </div>

                {/* App layout */}
                <div style={{ display: 'flex', minHeight: 360, background: '#05050a' }}>
                  {/* Sidebar */}
                  <div style={{
                    width: 52, background: '#07070f',
                    borderRight: '1px solid rgba(255,255,255,0.04)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 0', gap: 6,
                  }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: 8,
                      background: 'linear-gradient(135deg, #d6b25e, #b08030)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 900, color: '#07070a',
                    }}>A</div>
                    <div style={{ height: 4 }} />
                    {[{ i: '◈', a: true }, { i: '⊞', a: false }, { i: '◎', a: false }, { i: '⊡', a: false }].map((n, k) => (
                      <div key={k} style={{
                        width: 30, height: 30, borderRadius: 8,
                        background: n.a ? 'rgba(214,178,94,0.12)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, color: n.a ? '#d6b25e' : 'rgba(255,255,255,0.18)',
                      }}>{n.i}</div>
                    ))}
                  </div>

                  {/* Main */}
                  <div style={{ flex: 1, padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: 0 }}>Dashboard Executivo</p>
                        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.30)', margin: '2px 0 0' }}>3 unidades ativas · atualizado há 8s</p>
                      </div>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 6px #10b981' }} />
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)' }}>Ao vivo</span>
                      </span>
                    </div>

                    {/* KPI cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 10 }}>
                      {[
                        { l: 'Pontualidade', v: '94%', c: '#10b981' },
                        { l: 'Comandas hoje', v: '1.248', c: '#d6b25e' },
                        { l: 'Em processo', v: '387', c: '#a78bfa' },
                        { l: 'Atrasadas', v: '12', c: '#f87171' },
                      ].map(k => (
                        <div key={k.l} style={{
                          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                          borderRadius: 10, padding: '10px 12px',
                        }}>
                          <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', margin: '0 0 4px' }}>{k.l}</p>
                          <p style={{ fontSize: 20, fontWeight: 800, color: k.c, margin: 0, letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums' }}>{k.v}</p>
                        </div>
                      ))}
                    </div>

                    {/* Charts */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, padding: 12 }}>
                        <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.28)', margin: '0 0 8px' }}>Tendência — 7 dias</p>
                        <svg viewBox="0 0 240 44" style={{ width: '100%', height: 32 }}>
                          <defs>
                            <linearGradient id="mc1" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#d6b25e" stopOpacity="0.28" />
                              <stop offset="100%" stopColor="#d6b25e" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          <polyline points="0,38 34,30 68,33 102,16 136,20 170,7 204,10 240,4"
                            fill="none" stroke="#d6b25e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <polygon points="0,38 34,30 68,33 102,16 136,20 170,7 204,10 240,4 240,44 0,44" fill="url(#mc1)" />
                        </svg>
                      </div>

                      <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, padding: 12 }}>
                        <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.28)', margin: '0 0 8px' }}>Por unidade</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {[
                            { n: 'Centro', on: 72, q: 18, l: 10 },
                            { n: 'Norte',  on: 57, q: 28, l: 15 },
                            { n: 'Sul',    on: 88, q: 8,  l: 4  },
                          ].map(u => (
                            <div key={u.n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.28)', width: 28, flexShrink: 0 }}>{u.n}</span>
                              <div style={{ flex: 1, height: 6, borderRadius: 3, overflow: 'hidden', display: 'flex', background: 'rgba(255,255,255,0.04)' }}>
                                <div style={{ width: `${u.on}%`, background: '#34d399', opacity: 0.75 }} />
                                <div style={{ width: `${u.q}%`,  background: '#d6b25e', opacity: 0.65 }} />
                                <div style={{ width: `${u.l}%`,  background: '#f87171', opacity: 0.70 }} />
                              </div>
                            </div>
                          ))}
                        </div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                          {[['#34d399', 'No prazo'], ['#d6b25e', 'Em fila'], ['#f87171', 'Atrasadas']].map(([c, lb]) => (
                            <span key={lb} style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 8, color: 'rgba(255,255,255,0.26)' }}>
                              <span style={{ width: 5, height: 5, borderRadius: '50%', background: c, flexShrink: 0 }} />{lb}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Glow reflection */}
              <div style={{
                height: 80, marginTop: -40, pointerEvents: 'none',
                background: 'radial-gradient(ellipse at 50% 0%, rgba(214,178,94,0.07) 0%, transparent 70%)',
                filter: 'blur(20px)',
              }} />
            </div>
          </section>

          {/* ── STATS ───────────────────────────────────────────────────── */}
          <section style={{ padding: '56px 24px' }}>
            <div style={{
              maxWidth: 960, margin: '0 auto',
              display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1,
            }} className="md:grid-cols-4">
              {[
                { v: '100%', l: 'Web — funciona em qualquer dispositivo ou TV' },
                { v: '60s',  l: 'Atualização automática dos dashboards' },
                { v: '48h',  l: 'Tempo médio de implantação' },
                { v: '∞',    l: 'Unidades e operadores sem custo adicional' },
              ].map((s, i) => (
                <div key={s.v} style={{
                  textAlign: 'center', padding: '32px 24px',
                  borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                }} className={i > 0 ? 'border-l border-white/05' : ''}>
                  <p style={{
                    fontSize: 44, fontWeight: 900, letterSpacing: '-0.05em',
                    background: 'linear-gradient(135deg, #d6b25e 0%, #f0d080 100%)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                    margin: '0 0 8px',
                  }}>{s.v}</p>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', lineHeight: 1.5, margin: 0, maxWidth: 180, marginLeft: 'auto', marginRight: 'auto' }}>{s.l}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Divider */}
          <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px' }}>
            <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(214,178,94,0.12), transparent)' }} />
          </div>

          {/* ── FUNCIONALIDADES ─────────────────────────────────────────── */}
          <section id="funcionalidades" style={{ padding: '88px 24px' }}>
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: 56 }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(214,178,94,0.60)', textTransform: 'uppercase', marginBottom: 12 }}>
                  Funcionalidades
                </p>
                <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, letterSpacing: '-0.03em', color: '#fff', margin: '0 0 16px' }}>
                  Um sistema.{' '}
                  <span style={{ color: '#d6b25e' }}>Seis módulos.</span>
                  {' '}Controle total.
                </h2>
                <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.40)', maxWidth: 500, margin: '0 auto', lineHeight: 1.6 }}>
                  Cada módulo foi projetado para o ritmo real de lavanderias industriais.
                  Sem configurações genéricas.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
                {FEATURES.map(f => (
                  <div key={f.title} className="feat-card">
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                      <span style={{ fontSize: 24, color: f.color, filter: `drop-shadow(0 0 8px ${f.color}55)` }}>{f.icon}</span>
                      <span style={{
                        fontSize: 10, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase',
                        padding: '3px 8px', borderRadius: 6,
                        background: `${f.color}15`, border: `1px solid ${f.color}28`, color: f.color,
                      }}>{f.tag}</span>
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.02em' }}>{f.title}</h3>
                    <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.42)', lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Divider */}
          <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px' }}>
            <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(214,178,94,0.12), transparent)' }} />
          </div>

          {/* ── COMO FUNCIONA ───────────────────────────────────────────── */}
          <section id="como-funciona" style={{ padding: '88px 24px' }}>
            <div style={{ maxWidth: 960, margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: 56 }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(214,178,94,0.60)', textTransform: 'uppercase', marginBottom: 12 }}>
                  Como funciona
                </p>
                <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, letterSpacing: '-0.03em', color: '#fff', margin: 0 }}>
                  Da implantação ao resultado{' '}
                  <span style={{ color: '#d6b25e' }}>em 3 passos.</span>
                </h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 32 }}>
                {[
                  {
                    n: '01', title: 'Configure em minutos',
                    desc: 'Cadastre suas unidades, setores e equipe. O sistema já vem com os fluxos de lavanderia configurados — você só personaliza.',
                  },
                  {
                    n: '02', title: 'Opere com visibilidade total',
                    desc: 'Cada operador registra o status das peças no setor. O sistema atualiza painéis e dispara alertas automaticamente.',
                  },
                  {
                    n: '03', title: 'Decida com dados reais',
                    desc: 'Diretores acessam KPIs consolidados, tendências semanais e alertas executivos. Menos intuição, mais resultado.',
                  },
                ].map(s => (
                  <div key={s.n}>
                    <div className="step-num" style={{ marginBottom: 20 }}>{s.n}</div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', margin: '0 0 10px' }}>{s.title}</h3>
                    <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.42)', lineHeight: 1.65, margin: 0 }}>{s.desc}</p>
                  </div>
                ))}
              </div>

              <div style={{
                marginTop: 48, borderRadius: 14, padding: '20px 24px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
                background: 'rgba(214,178,94,0.05)', border: '1px solid rgba(214,178,94,0.15)',
              }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#fff', margin: '0 0 4px' }}>
                    Quanto tempo até o primeiro resultado?
                  </p>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.42)', margin: 0 }}>
                    A maioria das lavanderias começa a operar em{' '}
                    <strong style={{ color: '#d6b25e' }}>48 horas</strong> após a contratação.
                  </p>
                </div>
                <Link href="/captacao" style={{
                  padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                  background: 'rgba(214,178,94,0.12)', border: '1px solid rgba(214,178,94,0.28)', color: '#d6b25e',
                  textDecoration: 'none', flexShrink: 0,
                }}>
                  Começar agora →
                </Link>
              </div>
            </div>
          </section>

          {/* Divider */}
          <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px' }}>
            <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(214,178,94,0.12), transparent)' }} />
          </div>

          {/* ── ANTES / DEPOIS ──────────────────────────────────────────── */}
          <section style={{ padding: '88px 24px' }}>
            <div style={{ maxWidth: 960, margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: 52 }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(214,178,94,0.60)', textTransform: 'uppercase', marginBottom: 12 }}>
                  Por que A7x OS
                </p>
                <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, letterSpacing: '-0.03em', color: '#fff', margin: 0 }}>
                  Não é ERP. Não é planilha.{' '}
                  <span style={{ color: '#d6b25e' }}>É um OS.</span>
                </h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
                {/* Antes */}
                <div style={{
                  borderRadius: 16, padding: '28px 32px',
                  background: 'rgba(248,113,113,0.04)', border: '1px solid rgba(248,113,113,0.12)',
                }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(248,113,113,0.75)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16 }}>✗</span> Como era antes
                  </p>
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[
                      'Ligações para saber onde está a peça do cliente',
                      'Planilhas desatualizadas no fim do dia',
                      'Sem saber quais unidades estão atrasadas',
                      'Custo de insumo desconhecido até o fechamento',
                      'NPS feito no papel — ou não feito',
                      'Romaneio impresso e perdido no caminhão',
                    ].map(i => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: 'rgba(255,255,255,0.42)', lineHeight: 1.5 }}>
                        <span style={{ color: 'rgba(248,113,113,0.55)', flexShrink: 0, marginTop: 1 }}>×</span> {i}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Depois */}
                <div style={{
                  borderRadius: 16, padding: '28px 32px',
                  background: 'rgba(52,211,153,0.04)', border: '1px solid rgba(52,211,153,0.14)',
                }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(52,211,153,0.80)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16 }}>✓</span> Com o A7x OS
                  </p>
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[
                      'Status de cada peça visível no celular, em tempo real',
                      'Dashboard atualizado automaticamente a cada 60 segundos',
                      'Alertas automáticos de atraso antes do cliente reclamar',
                      'Custo por comanda calculado em tempo real',
                      'Link de NPS enviado automaticamente ao finalizar pedido',
                      'Motorista recebe rota no celular e marca as entregas',
                    ].map(i => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: 'rgba(255,255,255,0.42)', lineHeight: 1.5 }}>
                        <span style={{ color: 'rgba(52,211,153,0.70)', flexShrink: 0, marginTop: 1 }}>✓</span> {i}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Divider */}
          <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px' }}>
            <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(214,178,94,0.12), transparent)' }} />
          </div>

          {/* ── SEGMENTOS ───────────────────────────────────────────────── */}
          <section id="segmentos" style={{ padding: '88px 24px' }}>
            <div style={{ maxWidth: 960, margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: 52 }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(214,178,94,0.60)', textTransform: 'uppercase', marginBottom: 12 }}>
                  Para quem é
                </p>
                <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, letterSpacing: '-0.03em', color: '#fff', margin: '0 0 16px' }}>
                  Feito para quem processa{' '}
                  <span style={{ color: '#d6b25e' }}>volume com qualidade.</span>
                </h2>
                <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.38)', maxWidth: 480, margin: '0 auto', lineHeight: 1.6 }}>
                  Se você processa mais de 300 peças por dia e precisa de rastreabilidade
                  e controle de custos, o A7x OS é para você.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                {[
                  { symbol: '◐', label: 'Lavanderias Comerciais', desc: 'De 300 a 10.000+ peças/dia' },
                  { symbol: '◇', label: 'Hotéis e Pousadas',      desc: 'Roupas de cama, toalhas e uniformes' },
                  { symbol: '⊕', label: 'Hospitais e Clínicas',   desc: 'Lavanderia hospitalar com rastreio' },
                  { symbol: '⊗', label: 'Restaurantes e Redes',   desc: 'Uniformes com controle de custos' },
                ].map(s => (
                  <div key={s.label} className="feat-card" style={{ textAlign: 'center', padding: '28px 20px' }}>
                    <p style={{ fontSize: 32, color: '#d6b25e', margin: '0 0 12px', filter: 'drop-shadow(0 0 10px rgba(214,178,94,0.4))' }}>{s.symbol}</p>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#fff', margin: '0 0 6px' }}>{s.label}</p>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', margin: 0, lineHeight: 1.5 }}>{s.desc}</p>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, marginTop: 12 }}>
                {[
                  { title: 'Multi-unidades nativo',  desc: 'Gerencie 1 ou 50 unidades com o mesmo login de diretor. Nenhuma configuração adicional.' },
                  { title: 'Acesso por perfil',       desc: 'Diretor, gerente, operador, motorista e loja — cada um vê só o que precisa.' },
                  { title: 'Sem instalação',          desc: '100% web. Funciona em qualquer navegador, tablet ou TV de chão de fábrica.' },
                ].map(h => (
                  <div key={h.title} style={{
                    borderRadius: 12, padding: '18px 20px',
                    background: 'rgba(214,178,94,0.04)', border: '1px solid rgba(214,178,94,0.10)',
                  }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#d6b25e', flexShrink: 0, boxShadow: '0 0 6px rgba(214,178,94,0.5)' }} />
                      {h.title}
                    </p>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.40)', margin: 0, lineHeight: 1.55 }}>{h.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── CTA FINAL ───────────────────────────────────────────────── */}
          <section id="cta" style={{ padding: '32px 24px 96px' }}>
            <div style={{
              maxWidth: 760, margin: '0 auto',
              borderRadius: 24, padding: '64px 40px',
              textAlign: 'center', position: 'relative', overflow: 'hidden',
              background: 'linear-gradient(135deg, rgba(214,178,94,0.09) 0%, rgba(214,178,94,0.04) 100%)',
              border: '1px solid rgba(214,178,94,0.20)',
            }}>
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: 'radial-gradient(ellipse 70% 70% at 50% 50%, rgba(214,178,94,0.06) 0%, transparent 70%)',
              }} />
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(214,178,94,0.60)', textTransform: 'uppercase', marginBottom: 12 }}>
                Pronto para começar?
              </p>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, letterSpacing: '-0.03em', color: '#fff', margin: '0 0 16px' }}>
                Modernize sua lavanderia{' '}
                <span style={{ color: '#d6b25e' }}>esta semana.</span>
              </h2>
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.42)', maxWidth: 400, margin: '0 auto 36px', lineHeight: 1.6 }}>
                Agende uma demonstração gratuita e veja o A7x OS funcionando
                com os dados da sua operação.
              </p>
              <Link href="/captacao" className="cta-primary" style={{ fontSize: 16, padding: '16px 40px' }}>
                Solicitar Demo Gratuita →
              </Link>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.22)', marginTop: 20 }}>
                Sem cartão de crédito · Sem compromisso · Implantação em 48h
              </p>
            </div>
          </section>

          {/* ── FOOTER ──────────────────────────────────────────────────── */}
          <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '40px 24px' }}>
            <div style={{
              maxWidth: 1100, margin: '0 auto',
              display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'space-between', alignItems: 'flex-start',
            }}>
              <div style={{ maxWidth: 240 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: 8,
                    background: 'linear-gradient(135deg, #d6b25e, #b08030)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 900, color: '#05050a',
                  }}>A</div>
                  <span style={{ fontWeight: 700, fontSize: 14, color: '#fff' }}>A7x TecNologia</span>
                </div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.30)', lineHeight: 1.6, margin: 0 }}>
                  Sistema Operacional Inteligente para redes de lavanderia industrial.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', marginBottom: 14 }}>Produto</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[['Funcionalidades', '#funcionalidades'], ['Como funciona', '#como-funciona'], ['Para quem', '#segmentos']].map(([l, h]) => (
                      <a key={l} href={h} className="nav-link" style={{ fontSize: 13 }}>{l}</a>
                    ))}
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', marginBottom: 14 }}>Acesso</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[['Solicitar Demo', '/captacao'], ['Área do cliente', '/login'], ['Formulário de lead', '/captacao']].map(([l, h]) => (
                      <Link key={l} href={h} className="nav-link" style={{ fontSize: 13 }}>{l}</Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div style={{
              maxWidth: 1100, margin: '32px auto 0', paddingTop: 24,
              borderTop: '1px solid rgba(255,255,255,0.04)',
              display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between', alignItems: 'center',
            }}>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.20)', margin: 0 }}>
                © {new Date().getFullYear()} A7x TecNologia. Todos os direitos reservados.
              </p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.18)', margin: 0 }}>
                Tecnologia de ponta para lavanderias industriais.
              </p>
            </div>
          </footer>

        </div>
      </div>
    </>
  )
}
