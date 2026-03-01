import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/get-user'
import type { UserRole } from '@/types/auth'

interface PanelDef {
  roles: UserRole[]
  href: string
  title: string
  desc: string
  icon: string
  color: string
  bg: string
  border: string
  img: string
  tag: string
}

const PANELS: PanelDef[] = [
  {
    roles: ['director'],
    href: '/director/dashboard',
    title: 'Painel Executivo',
    desc: 'Dashboard consolidado com KPIs multi-unidade, tendências semanais e alertas executivos.',
    icon: '◈',
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.08)',
    border: 'rgba(59,130,246,0.25)',
    img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=340&fit=crop&q=80',
    tag: 'DIRETOR',
  },
  {
    roles: ['director', 'unit_manager'],
    href: '/unit/{unitId}/dashboard',
    title: 'Gestão de Unidade',
    desc: 'Controle de produção, equipamentos, insumos e equipe da sua unidade.',
    icon: '⊞',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.08)',
    border: 'rgba(16,185,129,0.25)',
    img: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=600&h=340&fit=crop&q=80',
    tag: 'UNIDADE',
  },
  {
    roles: ['operator', 'unit_manager'],
    href: '/sector/{sector}',
    title: 'Operação',
    desc: 'Interface tablet otimizada por setor — triagem, lavagem, secagem, passadoria e expedição.',
    icon: '⊡',
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.08)',
    border: 'rgba(139,92,246,0.25)',
    img: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=600&h=340&fit=crop&q=80',
    tag: 'PRODUÇÃO',
  },
  {
    roles: ['store'],
    href: '/store/pdv',
    title: 'Loja / PDV',
    desc: 'Ponto de venda, CRM de clientes, controle financeiro e gestão de ordens de serviço.',
    icon: '◎',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.25)',
    img: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=340&fit=crop&q=80',
    tag: 'VENDAS',
  },
  {
    roles: ['driver'],
    href: '/driver/route',
    title: 'Minhas Rotas',
    desc: 'Rotas otimizadas, registro de coletas e entregas com confirmação em tempo real.',
    icon: '⬡',
    color: '#f97316',
    bg: 'rgba(249,115,22,0.08)',
    border: 'rgba(249,115,22,0.25)',
    img: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=340&fit=crop&q=80',
    tag: 'LOGÍSTICA',
  },
  {
    roles: ['customer'],
    href: '/client/orders',
    title: 'Meus Pedidos',
    desc: 'Acompanhamento de pedidos, histórico de serviços e avaliação de atendimento.',
    icon: '⚙',
    color: '#06b6d4',
    bg: 'rgba(6,182,212,0.08)',
    border: 'rgba(6,182,212,0.25)',
    img: 'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=600&h=340&fit=crop&q=80',
    tag: 'CLIENTE',
  },
  {
    roles: ['sdr', 'closer', 'director', 'unit_manager'],
    href: '/commercial/dashboard',
    title: 'Comercial',
    desc: 'Pipeline de leads, funil de vendas, campanhas e acompanhamento de metas.',
    icon: '⊕',
    color: '#ec4899',
    bg: 'rgba(236,72,153,0.08)',
    border: 'rgba(236,72,153,0.25)',
    img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=340&fit=crop&q=80',
    tag: 'CRM',
  },
  {
    roles: ['copywriter', 'director'],
    href: '/copywriter/dashboard',
    title: 'Copywriting',
    desc: 'Geração de conteúdo com IA, calendário editorial e métricas de performance.',
    icon: '✦',
    color: '#a78bfa',
    bg: 'rgba(167,139,250,0.08)',
    border: 'rgba(167,139,250,0.25)',
    img: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&h=340&fit=crop&q=80',
    tag: 'CONTEÚDO',
  },
]

const QUICK_ACTIONS = [
  { label: 'Nova OS', icon: '＋', color: '#3b82f6', href: '/store/pdv', roles: ['store', 'unit_manager', 'director'] as UserRole[] },
  { label: 'Relatórios', icon: '⊞', color: '#10b981', href: '/director/reports', roles: ['director', 'unit_manager'] as UserRole[] },
  { label: 'NPS', icon: '◎', color: '#f59e0b', href: '/director/nps', roles: ['director', 'unit_manager'] as UserRole[] },
  { label: 'Auditoria', icon: '⊡', color: '#8b5cf6', href: '/director/audit', roles: ['director'] as UserRole[] },
]

export default async function PortalPage() {
  const maybeUser = await getUser()

  if (!maybeUser) {
    redirect('/login')
  }

  const user = maybeUser
  const visiblePanels = PANELS.filter(p => p.roles.includes(user.role))
  const visibleActions = QUICK_ACTIONS.filter(a => a.roles.includes(user.role))

  function resolveHref(panel: PanelDef): string {
    let href = panel.href
    if (href.includes('{unitId}') && user.unit_id) {
      href = href.replace('{unitId}', user.unit_id)
    } else if (href.includes('{unitId}')) {
      href = '/login'
    }
    if (href.includes('{sector}') && user.sector) {
      href = href.replace('{sector}', user.sector)
    } else if (href.includes('{sector}')) {
      href = '/login'
    }
    return href
  }

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Bom dia'
    if (h < 18) return 'Boa tarde'
    return 'Boa noite'
  })()

  return (
    <>
      <style>{`
        /* ── Portal Card — Apple-inspired ── */
        .portal-card-v2 {
          position: relative;
          overflow: hidden;
          border-radius: 20px;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.06);
          transition: all 0.4s cubic-bezier(0.34,1.56,0.64,1);
          text-decoration: none;
          display: flex;
          flex-direction: column;
        }
        .portal-card-v2:hover {
          transform: translateY(-6px) scale(1.01);
          box-shadow: 0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(59,130,246,0.12);
        }
        .portal-card-v2:hover .card-img-overlay {
          opacity: 0.6;
        }
        .portal-card-v2:hover .card-img {
          transform: scale(1.08);
        }
        .portal-card-v2:hover .card-arrow {
          transform: translateX(4px);
          opacity: 1;
        }
        .portal-card-v2:hover .card-glow-line {
          opacity: 1;
        }

        /* ── Quick Action ── */
        .quick-action {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 16px 12px;
          border-radius: 16px;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.06);
          transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1);
          text-decoration: none;
          cursor: pointer;
        }
        .quick-action:hover {
          transform: translateY(-3px) scale(1.04);
          background: rgba(255,255,255,0.05);
          box-shadow: 0 12px 40px rgba(0,0,0,0.4);
        }

        /* ── Portal Grid — Responsive ── */
        .portal-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }
        @media (max-width: 480px) {
          .portal-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }
        @media (min-width: 1200px) {
          .portal-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        /* ── Dot grid (portal-specific to avoid conflict) ── */
        .portal-dot-grid {
          background-image: radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 32px 32px;
        }

        /* ── Hero gradient animation ── */
        @keyframes portal-gradient {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
        .portal-hero-glow {
          animation: portal-gradient 6s ease-in-out infinite;
        }

        /* ── Stagger animations ── */
        .portal-fade-up {
          opacity: 0;
          transform: translateY(16px);
          animation: portalFadeUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards;
        }
        @keyframes portalFadeUp {
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div
        className="min-h-screen text-white"
        style={{ background: 'linear-gradient(180deg, #040610 0%, #0a1628 40%, #071020 100%)' }}
      >
        {/* Background layers */}
        <div className="portal-dot-grid fixed inset-0 pointer-events-none" style={{ zIndex: 0, opacity: 0.5 }} />

        {/* Hero spotlight */}
        <div className="fixed pointer-events-none" style={{
          top: 0, left: '50%', transform: 'translateX(-50%)',
          width: 1200, height: 600, zIndex: 0,
          background: 'radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.10) 0%, transparent 55%)',
        }} />

        {/* Secondary glow */}
        <div className="portal-hero-glow fixed pointer-events-none" style={{
          top: -100, right: -200, width: 800, height: 800, zIndex: 0,
          background: 'radial-gradient(ellipse, rgba(139,92,246,0.06) 0%, transparent 60%)',
          borderRadius: '50%',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>

          {/* ── NAV — Glassmorphism ── */}
          <nav style={{
            position: 'sticky', top: 0, zIndex: 50,
            background: 'rgba(4,6,16,0.75)',
            backdropFilter: 'blur(24px) saturate(1.5)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}>
            <div style={{
              maxWidth: 1200, margin: '0 auto', padding: '0 24px',
              height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <Link href="/portal" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 900, color: '#fff',
                  boxShadow: '0 4px 16px rgba(59,130,246,0.3)',
                }}>A7</div>
                <div>
                  <span style={{ fontWeight: 800, fontSize: 15, color: '#fff', letterSpacing: '-0.02em' }}>
                    A7X System&apos;s
                  </span>
                  <span style={{ display: 'block', fontSize: 10, color: 'rgba(255,255,255,0.30)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: -1 }}>
                    Sistema Operacional
                  </span>
                </div>
              </Link>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <Link href="/home" style={{
                  fontSize: 12, color: 'rgba(255,255,255,0.35)', textDecoration: 'none',
                  transition: 'color 0.2s',
                }}>
                  Site
                </Link>
                <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.08)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 10,
                    background: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(59,130,246,0.05) 100%)',
                    border: '1px solid rgba(59,130,246,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, color: '#60a5fa',
                  }}>
                    {user.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.80)' }}>
                      {user.full_name}
                    </span>
                    <span style={{
                      fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
                      color: '#60a5fa',
                    }}>
                      {user.role.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          {/* ── HERO SECTION ── */}
          <section style={{ position: 'relative', overflow: 'hidden' }}>
            {/* Hero Background Image */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
              <img
                src="https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=1600&h=600&fit=crop&q=80"
                alt=""
                loading="eager"
                style={{
                  width: '100%', height: '100%', objectFit: 'cover',
                  opacity: 0.12, filter: 'saturate(0.8)',
                }}
              />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(180deg, rgba(4,6,16,0.5) 0%, rgba(10,22,40,0.85) 60%, rgba(7,16,32,1) 100%)',
              }} />
            </div>

            <div style={{ position: 'relative', zIndex: 1, padding: '72px 24px 48px', textAlign: 'center' }}>
              <div style={{ maxWidth: 700, margin: '0 auto' }}>
                {/* Overline badge */}
                <div className="portal-fade-up" style={{ marginBottom: 20, animationDelay: '0s' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '6px 16px', borderRadius: 100,
                    background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.18)',
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                    color: '#60a5fa',
                  }}>
                    <span style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: '#10b981',
                      boxShadow: '0 0 8px rgba(16,185,129,0.6)',
                    }} />
                    Sistema Online
                  </span>
                </div>

                {/* Greeting */}
                <h1 className="portal-fade-up" style={{
                  fontSize: 'clamp(32px, 5vw, 52px)',
                  fontWeight: 900, letterSpacing: '-0.035em',
                  color: '#fff', margin: '0 0 8px', lineHeight: 1.1,
                  animationDelay: '0.08s',
                }}>
                  {greeting},{' '}
                  <span style={{
                    background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #93c5fd 100%)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}>
                    {user.full_name.split(' ')[0]}
                  </span>
                </h1>

                <p className="portal-fade-up" style={{
                  fontSize: 17, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, margin: '0 0 32px',
                  maxWidth: 480, marginLeft: 'auto', marginRight: 'auto',
                  animationDelay: '0.16s',
                }}>
                  Escolha o painel que deseja acessar ou use os atalhos rápidos abaixo.
                </p>

                {/* Quick Actions */}
                {visibleActions.length > 0 && (
                  <div className="portal-fade-up" style={{
                    display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap',
                    animationDelay: '0.24s',
                  }}>
                    {visibleActions.map(action => (
                      <Link key={action.label} href={action.href} className="quick-action" style={{ minWidth: 90 }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: 12,
                          background: `${action.color}12`,
                          border: `1px solid ${action.color}25`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 18, color: action.color,
                        }}>{action.icon}</div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.55)' }}>
                          {action.label}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ── Divider ── */}
          <div style={{
            maxWidth: 1200, margin: '0 auto', padding: '0 24px',
          }}>
            <div style={{
              height: 1,
              background: 'linear-gradient(90deg, transparent 0%, rgba(59,130,246,0.15) 30%, rgba(59,130,246,0.15) 70%, transparent 100%)',
            }} />
          </div>

          {/* ── SECTION HEADER ── */}
          <section style={{ padding: '48px 24px 8px' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
              <div className="portal-fade-up" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                animationDelay: '0.32s',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <h2 style={{
                    fontSize: 12, fontWeight: 700, letterSpacing: '0.14em',
                    textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', margin: 0,
                  }}>
                    Seus Painéis
                  </h2>
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    padding: '2px 10px', borderRadius: 100,
                    background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)',
                    color: 'rgba(59,130,246,0.65)',
                  }}>
                    {visiblePanels.length}
                  </span>
                </div>
                <div style={{
                  flex: 1, maxWidth: 400, height: 1, marginLeft: 20,
                  background: 'linear-gradient(90deg, rgba(59,130,246,0.2) 0%, transparent 100%)',
                }} />
              </div>
            </div>
          </section>

          {/* ── PANELS GRID ── */}
          <section style={{ padding: '24px 24px 64px' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
              {visiblePanels.length === 0 ? (
                <div className="portal-fade-up" style={{
                  textAlign: 'center', padding: '80px 24px',
                  background: 'rgba(255,255,255,0.02)', borderRadius: 24,
                  border: '1px solid rgba(255,255,255,0.06)',
                  animationDelay: '0.3s',
                }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: 20, margin: '0 auto 20px',
                    background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 28,
                  }}>🔒</div>
                  <p style={{ fontSize: 18, fontWeight: 700, color: 'rgba(255,255,255,0.60)', margin: '0 0 8px' }}>
                    Nenhum painel disponível
                  </p>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.30)', margin: 0, maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
                    Seu perfil ainda não tem permissão para acessar os painéis do sistema.
                    Entre em contato com o administrador.
                  </p>
                </div>
              ) : (
                <div className="portal-grid">
                  {visiblePanels.map((panel, i) => (
                    <Link
                      key={panel.title}
                      href={resolveHref(panel)}
                      className="portal-card-v2 portal-fade-up"
                      style={{ animationDelay: `${0.3 + i * 0.08}s` }}
                    >
                      {/* Card Image */}
                      <div style={{
                        position: 'relative', height: 180, overflow: 'hidden',
                        borderRadius: '20px 20px 0 0',
                      }}>
                        <img
                          className="card-img"
                          src={panel.img}
                          alt={panel.title}
                          loading="lazy"
                          style={{
                            width: '100%', height: '100%', objectFit: 'cover',
                            transition: 'transform 0.6s cubic-bezier(0.16,1,0.3,1)',
                          }}
                        />
                        <div className="card-img-overlay" style={{
                          position: 'absolute', inset: 0,
                          background: `linear-gradient(180deg, ${panel.color}08 0%, rgba(4,6,16,0.92) 100%)`,
                          transition: 'opacity 0.4s ease', opacity: 0.75,
                        }} />

                        {/* Tag badge */}
                        <div style={{
                          position: 'absolute', top: 14, left: 14,
                          padding: '4px 12px', borderRadius: 8,
                          background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(12px)',
                          border: `1px solid ${panel.border}`,
                          fontSize: 9, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase',
                          color: panel.color,
                        }}>
                          {panel.tag}
                        </div>

                        {/* Glow line on top */}
                        <div className="card-glow-line" style={{
                          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                          background: `linear-gradient(90deg, transparent, ${panel.color}, transparent)`,
                          opacity: 0, transition: 'opacity 0.4s ease',
                        }} />
                      </div>

                      {/* Card Content */}
                      <div style={{ padding: '20px 24px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 12 }}>
                          <div style={{
                            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                            background: panel.bg, border: `1px solid ${panel.border}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 20, color: panel.color,
                          }}>{panel.icon}</div>
                          <div>
                            <h3 style={{
                              fontSize: 17, fontWeight: 800, color: '#fff',
                              margin: '0 0 4px', letterSpacing: '-0.02em',
                            }}>{panel.title}</h3>
                            <p style={{
                              fontSize: 13, color: 'rgba(255,255,255,0.38)',
                              lineHeight: 1.55, margin: 0,
                            }}>{panel.desc}</p>
                          </div>
                        </div>

                        <div style={{ flex: 1 }} />

                        {/* Footer */}
                        <div style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          paddingTop: 16,
                          borderTop: '1px solid rgba(255,255,255,0.04)',
                        }}>
                          <span style={{
                            fontSize: 11, fontWeight: 600,
                            color: 'rgba(255,255,255,0.25)',
                            letterSpacing: '0.04em',
                          }}>
                            {panel.roles.length > 2 ? 'Multi-acesso' : panel.roles.map(r => r.replace('_', ' ')).join(', ')}
                          </span>
                          <span className="card-arrow" style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            fontSize: 13, fontWeight: 700, color: panel.color,
                            transition: 'all 0.3s ease', opacity: 0.7,
                          }}>
                            Acessar
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ display: 'block' }}>
                              <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* ── SYSTEM INFO BAR ── */}
          <section style={{ padding: '0 24px 48px' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
              <div className="portal-fade-up" style={{
                display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center',
                animationDelay: '0.6s',
              }}>
                {[
                  { label: 'Versão', value: '4.2', color: '#3b82f6' },
                  { label: 'API', value: 'Online', color: '#10b981' },
                  { label: 'Uptime', value: '99.9%', color: '#10b981' },
                ].map(item => (
                  <div key={item.label} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 16px', borderRadius: 12,
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                    fontSize: 12,
                  }}>
                    <span style={{ color: 'rgba(255,255,255,0.30)' }}>{item.label}</span>
                    <span style={{ color: item.color, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── FOOTER ── */}
          <footer style={{
            borderTop: '1px solid rgba(255,255,255,0.04)',
            padding: '28px 24px',
          }}>
            <div style={{
              maxWidth: 1200, margin: '0 auto',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: 6,
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 9, fontWeight: 900, color: '#fff',
                }}>A</div>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.20)' }}>
                  © {new Date().getFullYear()} A7X System&apos;s
                </span>
              </div>
              <div style={{ display: 'flex', gap: 20 }}>
                <Link href="/home" style={{ fontSize: 12, color: 'rgba(255,255,255,0.20)', textDecoration: 'none' }}>
                  Site
                </Link>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.12)' }}>
                  Sistema Operacional Inteligente
                </span>
              </div>
            </div>
          </footer>

        </div>
      </div>
    </>
  )
}
