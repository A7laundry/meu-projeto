'use client'

import { useState, useMemo, useEffect } from 'react'
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

export default function PortalPage() {
  const [user, setUser] = useState<any>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    getUser().then(u => {
      if (!u) redirect('/login')
      setUser(u)
    })
  }, [])

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY })
  }

  const visiblePanels = useMemo(() => {
    if (!user) return []
    return PANELS.filter(p => p.roles.includes(user.role))
  }, [user])

  const visibleActions = useMemo(() => {
    if (!user) return []
    return QUICK_ACTIONS.filter(a => a.roles.includes(user.role))
  }, [user])

  function resolveHref(panel: PanelDef): string {
    let href = panel.href
    if (href.includes('{unitId}') && user?.unit_id) {
      href = href.replace('{unitId}', user.unit_id)
    } else if (href.includes('{unitId}')) {
      href = '/login'
    }
    if (href.includes('{sector}') && user?.sector) {
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

  if (!user) return null

  return (
    <>
      <style>{`
        /* ── Modern Premium Portal Styles ── */
        .portal-card-v2 {
          position: relative;
          overflow: hidden;
          border-radius: 24px;
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(32px) saturate(1.8);
          border: 1px solid rgba(255,255,255,0.08);
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          text-decoration: none;
          display: flex;
          flex-direction: column;
        }
        .portal-card-v2:hover {
          transform: translateY(-8px) scale(1.02);
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.15);
          box-shadow: 0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(59,130,246,0.15);
        }
        .portal-card-v2:hover .card-img {
          transform: scale(1.1) rotate(1deg);
          filter: grayscale(0) brightness(1.1);
        }
        .portal-card-v2 .card-img {
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          filter: grayscale(0.2) brightness(0.85);
        }

        /* Spotlight Effect */
        .spotlight {
          position: absolute;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle at center, rgba(59,130,246,0.04) 0%, transparent 70%);
          pointer-events: none;
          z-index: 1;
          mix-blend-mode: soft-light;
        }

        /* Digital Noise Texture */
        .noise-grain {
          position: fixed;
          inset: 0;
          z-index: 99;
          pointer-events: none;
          opacity: 0.025;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }

        .portal-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 24px;
        }
        @media (max-width: 640px) {
          .portal-grid { grid-template-columns: 1fr; }
        }

        @keyframes stagger-in {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .stagger-item {
          animation: stagger-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      <div
        className="min-h-screen text-white noise-grain-container"
        onMouseMove={handleMouseMove}
        style={{ background: '#02040a', position: 'relative', overflowX: 'hidden' }}
      >
        <div className="noise-grain" />

        {/* Dynamic Spotlight */}
        <div
          className="spotlight"
          style={{
            left: mousePos.x - 300,
            top: mousePos.y - 300,
            transition: 'left 0.1s ease-out, top 0.1s ease-out'
          }}
        />

        {/* Global Gradients */}
        <div className="fixed inset-0 pointer-events-none" style={{
          background: 'radial-gradient(circle at 50% -10%, rgba(59,130,246,0.08) 0%, transparent 60%), radial-gradient(circle at 0% 100%, rgba(139,92,246,0.04) 0%, transparent 40%)'
        }} />

        <div style={{ position: 'relative', zIndex: 10 }}>
          {/* ── Header ── */}
          <nav className="glass py-4 px-6 sticky top-0 z-50 border-b border-white/05 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <Link href="/portal" className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center font-black shadow-lg shadow-blue-500/20">A7</div>
                <div>
                  <h1 className="text-15 font-black tracking-tight leading-none">A7X <span className="text-white/30 font-medium font-inter">Intelligence</span></h1>
                  <span className="text-10 uppercase tracking-widest text-white/25">Operations Hub</span>
                </div>
              </Link>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 bg-white/03 border border-white/05 rounded-full py-1.5 pl-1.5 pr-4">
                  <div className="w-7 h-7 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-xs font-bold text-blue-400">
                    {user.full_name.charAt(0)}
                  </div>
                  <div className="leading-none">
                    <p className="text-12 font-bold">{user.full_name}</p>
                    <p className="text-10 text-white/40 uppercase tracking-wider mt-0.5">{user.role}</p>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          {/* ── Hero ── */}
          <section className="pt-20 pb-12 px-6">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <div className="stagger-item" style={{ animationDelay: '0.1s' }}>
                <span className="px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-10 font-black tracking-widest text-blue-400 uppercase">
                  Connected & Active
                </span>
              </div>
              <h2 className="text-5xl md:text-6xl font-black tracking-tighter shimmer-text stagger-item" style={{ animationDelay: '0.2s' }}>
                {greeting}, {user.full_name.split(' ')[0]}
              </h2>
              <p className="text-18 text-white/40 leading-relaxed stagger-item" style={{ animationDelay: '0.3s' }}>
                Integrated control center for next-gen laundry intelligence. <br className="hidden md:block" />
                Choose a module to begin your operation.
              </p>

              {/* Quick Actions */}
              <div className="flex flex-wrap justify-center gap-3 pt-4 stagger-item" style={{ animationDelay: '0.4s' }}>
                {visibleActions.map(action => (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/03 border border-white/05 hover:bg-white/07 transition-all group"
                  >
                    <span className="text-lg" style={{ color: action.color }}>{action.icon}</span>
                    <span className="text-12 font-bold text-white/60 group-hover:text-white transition-colors">{action.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* ── Main Grid ── */}
          <section className="px-6 pb-24">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-4 mb-10 stagger-item" style={{ animationDelay: '0.5s' }}>
                <h3 className="section-title-lg m-0">Operation Modules</h3>
                <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
              </div>

              <div className="portal-grid">
                {visiblePanels.map((panel, idx) => (
                  <Link
                    key={panel.title}
                    href={resolveHref(panel)}
                    className="portal-card-v2 stagger-item"
                    style={{ animationDelay: `${0.6 + idx * 0.1}s` }}
                  >
                    <div className="relative h-56 overflow-hidden">
                      <img src={panel.img} className="card-img w-full h-full object-cover" alt={panel.title} />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#02040a] via-[#02040a]/20 to-transparent opacity-90" />
                      <div className="absolute top-4 left-4 px-3 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-9 font-black tracking-widest text-white/80 uppercase">
                        {panel.tag}
                      </div>
                    </div>

                    <div className="p-8 flex flex-col flex-1">
                      <div className="flex items-start gap-5 mb-6">
                        <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                          style={{ background: `${panel.color}15`, border: `1px solid ${panel.color}30`, color: panel.color }}
                        >
                          {panel.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-22 font-black tracking-tight text-white mb-2">{panel.title}</h4>
                          <p className="text-14 text-white/40 leading-relaxed font-medium">{panel.desc}</p>
                        </div>
                      </div>

                      <div className="mt-auto pt-6 border-t border-white/05 flex items-center justify-between">
                        <span className="text-11 font-bold text-white/20 uppercase tracking-widest">
                          Access Ready
                        </span>
                        <div className="flex items-center gap-2 group-hover:gap-4 transition-all" style={{ color: panel.color }}>
                          <span className="text-13 font-black uppercase tracking-wider">Launch</span>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7" /></svg>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
