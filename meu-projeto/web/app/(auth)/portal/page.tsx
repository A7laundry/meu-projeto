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
}

const PANELS: PanelDef[] = [
  {
    roles: ['director'],
    href: '/director/dashboard',
    title: 'Painel Executivo',
    desc: 'Dashboard consolidado com KPIs de todas as unidades, tendências semanais e alertas executivos.',
    icon: '◈',
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.08)',
    border: 'rgba(59,130,246,0.20)',
  },
  {
    roles: ['director', 'unit_manager'],
    href: '/unit/{unitId}/dashboard',
    title: 'Gestão de Unidade',
    desc: 'Controle de produção, equipamentos, insumos e equipe da sua unidade.',
    icon: '⊞',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.08)',
    border: 'rgba(16,185,129,0.20)',
  },
  {
    roles: ['operator', 'unit_manager'],
    href: '/sector/{sector}',
    title: 'Operação',
    desc: 'Interface de setor otimizada para tablet — triagem, lavagem, secagem, passadoria e expedição.',
    icon: '⊡',
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.08)',
    border: 'rgba(139,92,246,0.20)',
  },
  {
    roles: ['store'],
    href: '/store/pdv',
    title: 'Loja / PDV',
    desc: 'Ponto de venda, CRM de clientes, controle financeiro e gestão de ordens de serviço.',
    icon: '◎',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.20)',
  },
  {
    roles: ['driver'],
    href: '/driver/route',
    title: 'Minhas Rotas',
    desc: 'Rotas otimizadas, registro de coletas e entregas com confirmação em tempo real.',
    icon: '⬡',
    color: '#f97316',
    bg: 'rgba(249,115,22,0.08)',
    border: 'rgba(249,115,22,0.20)',
  },
  {
    roles: ['customer'],
    href: '/client/orders',
    title: 'Meus Pedidos',
    desc: 'Acompanhamento de pedidos, histórico de serviços e avaliação de atendimento.',
    icon: '⚙',
    color: '#06b6d4',
    bg: 'rgba(6,182,212,0.08)',
    border: 'rgba(6,182,212,0.20)',
  },
  {
    roles: ['sdr', 'closer', 'director', 'unit_manager'],
    href: '/commercial/dashboard',
    title: 'Comercial',
    desc: 'Pipeline de leads, funil de vendas, campanhas e acompanhamento de metas.',
    icon: '⊕',
    color: '#ec4899',
    bg: 'rgba(236,72,153,0.08)',
    border: 'rgba(236,72,153,0.20)',
  },
]

export default async function PortalPage() {
  const maybeUser = await getUser()

  if (!maybeUser) {
    redirect('/login')
  }

  const user = maybeUser

  const visiblePanels = PANELS.filter(p => p.roles.includes(user.role))

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

  return (
    <>
      <style>{`
        .portal-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          padding: 32px 28px;
          transition: all 0.3s ease;
          text-decoration: none;
          display: block;
          position: relative;
          overflow: hidden;
        }
        .portal-card:hover {
          background: rgba(255,255,255,0.05);
          transform: translateY(-4px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        }
        .dot-grid-bg {
          background-image: radial-gradient(circle, rgba(255,255,255,0.045) 1px, transparent 1px);
          background-size: 28px 28px;
        }
      `}</style>

      <div
        className="min-h-screen text-white"
        style={{ background: 'linear-gradient(180deg, #050508 0%, #06060d 50%, #080810 100%)' }}
      >
        {/* Dot grid */}
        <div className="dot-grid-bg fixed inset-0 pointer-events-none" style={{ zIndex: 0, opacity: 0.6 }} />

        {/* Blue spotlight */}
        <div
          className="fixed pointer-events-none"
          style={{
            top: 0, left: '50%', transform: 'translateX(-50%)',
            width: 900, height: 400, zIndex: 0,
            background: 'radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.07) 0%, transparent 65%)',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1 }}>

          {/* ── NAV ── */}
          <nav style={{
            background: 'rgba(5,5,8,0.82)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}>
            <div style={{
              maxWidth: 1100, margin: '0 auto', padding: '0 24px',
              height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <Link href="/portal" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 900, color: '#fff',
                }}>A</div>
                <span style={{ fontWeight: 700, fontSize: 14, color: '#fff', letterSpacing: '-0.01em' }}>
                  A7X <span style={{ color: 'rgba(255,255,255,0.30)', fontWeight: 400 }}>System&apos;s</span>
                </span>
              </Link>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.40)' }}>
                  {user.full_name}
                </span>
                <span style={{
                  fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
                  padding: '4px 10px', borderRadius: 8,
                  background: 'rgba(59,130,246,0.10)', border: '1px solid rgba(59,130,246,0.20)',
                  color: '#60a5fa',
                }}>
                  {user.role.replace('_', ' ')}
                </span>
              </div>
            </div>
          </nav>

          {/* ── HEADER ── */}
          <section style={{ padding: '56px 24px 16px', textAlign: 'center' }}>
            <div style={{ maxWidth: 600, margin: '0 auto' }}>
              <p style={{
                fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
                color: 'rgba(59,130,246,0.60)', textTransform: 'uppercase', marginBottom: 12,
              }}>
                Portal
              </p>
              <h1 style={{
                fontSize: 'clamp(28px, 4vw, 44px)',
                fontWeight: 900, letterSpacing: '-0.03em', color: '#fff', margin: '0 0 12px',
              }}>
                Olá, {user.full_name.split(' ')[0]}.
              </h1>
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.42)', lineHeight: 1.6, margin: 0 }}>
                Selecione o painel que deseja acessar.
              </p>
            </div>
          </section>

          {/* ── PANELS GRID ── */}
          <section style={{ padding: '40px 24px 96px' }}>
            <div style={{ maxWidth: 1000, margin: '0 auto' }}>
              {visiblePanels.length === 0 ? (
                <div style={{
                  textAlign: 'center', padding: '64px 24px',
                  background: 'rgba(255,255,255,0.03)', borderRadius: 20,
                  border: '1px solid rgba(255,255,255,0.07)',
                }}>
                  <p style={{ fontSize: 32, margin: '0 0 16px' }}>🔒</p>
                  <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.50)', margin: '0 0 8px' }}>
                    Nenhum painel disponível
                  </p>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.30)', margin: 0 }}>
                    Seu perfil ainda não tem permissão para acessar os painéis do sistema.
                    Entre em contato com o administrador.
                  </p>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: visiblePanels.length === 1
                    ? '1fr'
                    : 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: 16,
                }}>
                  {visiblePanels.map(panel => (
                    <Link
                      key={panel.title}
                      href={resolveHref(panel)}
                      className="portal-card"
                      style={{
                        borderColor: 'rgba(255,255,255,0.07)',
                      }}
                    >
                      <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                        background: `linear-gradient(90deg, transparent, ${panel.color}, transparent)`,
                        opacity: 0.5,
                      }} />

                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                        <div style={{
                          width: 52, height: 52, borderRadius: 14,
                          background: panel.bg, border: `1px solid ${panel.border}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 24, color: panel.color, flexShrink: 0,
                        }}>{panel.icon}</div>
                        <div>
                          <h3 style={{
                            fontSize: 18, fontWeight: 700, color: '#fff',
                            margin: '0 0 4px', letterSpacing: '-0.02em',
                          }}>{panel.title}</h3>
                          <p style={{
                            fontSize: 14, color: 'rgba(255,255,255,0.42)',
                            lineHeight: 1.5, margin: 0,
                          }}>{panel.desc}</p>
                        </div>
                      </div>

                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                        gap: 6, fontSize: 13, fontWeight: 600, color: panel.color,
                      }}>
                        Acessar →
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* ── FOOTER ── */}
          <footer style={{
            borderTop: '1px solid rgba(255,255,255,0.05)',
            padding: '24px',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.18)', margin: 0 }}>
              © {new Date().getFullYear()} A7X System&apos;s · Sistema Operacional Inteligente
            </p>
          </footer>

        </div>
      </div>
    </>
  )
}
