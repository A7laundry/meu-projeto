'use client'

import Link from 'next/link'
import { useState } from 'react'

/* ─── Data ────────────────────────────────────────────────────────── */

const PORTALS = [
  {
    name: 'Diretor',
    sub: 'Painel Executivo',
    desc: 'Visao completa da rede: KPIs de todas as unidades, financeiro consolidado (DRE, fluxo de caixa, contas), gestao de usuarios, NPS, auditoria e logistica.',
    icon: '\u{1F451}',
    accent: '#d6b25e',
    gradient: 'from-amber-500/20 via-amber-500/5 to-transparent',
    email: 'diretor@a7lavanderia.com.br',
    modules: ['Dashboard', 'Financeiro', 'DRE', 'Fluxo de Caixa', 'Unidades', 'Usuarios', 'NPS', 'Relatorios', 'Auditoria', 'Logistica'],
  },
  {
    name: 'Gerente',
    sub: 'Gestao de Unidade',
    desc: 'Controle total de uma unidade: producao em tempo real, pedidos, equipamentos, insumos, equipe, precos, orcamentos, romaneios e financeiro local.',
    icon: '\u{1F3E2}',
    accent: '#60a5fa',
    gradient: 'from-blue-500/20 via-blue-500/5 to-transparent',
    email: 'gerente@a7lavanderia.com.br',
    modules: ['Dashboard', 'Producao', 'Pedidos', 'Equipamentos', 'Insumos', 'Equipe', 'Precos', 'Orcamentos', 'Romaneios', 'Financeiro'],
  },
  {
    name: 'Loja / PDV',
    sub: 'Ponto de Venda',
    desc: 'Atendimento ao cliente: cria pedidos, acompanha comandas, gerencia CRM, consulta precos e financeiro da loja.',
    icon: '\u{1F6D2}',
    accent: '#10b981',
    gradient: 'from-emerald-500/20 via-emerald-500/5 to-transparent',
    email: 'loja@synkra.test',
    password: 'Synkra@123',
    modules: ['Dashboard', 'PDV', 'Comandas', 'CRM', 'Precos', 'Financeiro'],
  },
  {
    name: 'Comercial',
    sub: 'Vendas & Marketing',
    desc: 'Pipeline de vendas: captacao e gerenciamento de leads, clientes com analise de LTV, campanhas de marketing com ROI.',
    icon: '\u{1F4DE}',
    accent: '#06b6d4',
    gradient: 'from-cyan-500/20 via-cyan-500/5 to-transparent',
    email: 'sdr@synkra.test',
    password: 'Synkra@123',
    modules: ['Dashboard', 'Leads', 'Clientes + LTV', 'Campanhas'],
  },
  {
    name: 'Copywriter',
    sub: 'Criacao de Conteudo',
    desc: 'Sistema gamificado: missoes de criacao de conteudo, ranking competitivo, XP e badges, painel administrativo de briefings.',
    icon: '\u{270D}\u{FE0F}',
    accent: '#a855f7',
    gradient: 'from-purple-500/20 via-purple-500/5 to-transparent',
    email: 'copy@synkra.test',
    password: 'Synkra@123',
    modules: ['Dashboard', 'Missoes', 'Ranking', 'Admin', 'Briefings'],
  },
  {
    name: 'Cliente',
    sub: 'Portal do Cliente',
    desc: 'Area do cliente: acompanhe seus pedidos em tempo real e gerencie seu perfil.',
    icon: '\u{1F464}',
    accent: '#64748b',
    gradient: 'from-slate-500/15 via-slate-500/5 to-transparent',
    email: 'cliente@synkra.test',
    password: 'Synkra@123',
    modules: ['Meus Pedidos', 'Perfil'],
  },
]

const SECTORS = [
  { name: 'Triagem', icon: '\u{1F50D}', desc: 'Classifica pecas e atribui receita', color: '#f472b6', email: 'triagem@a7lavanderia.com.br' },
  { name: 'Lavagem', icon: '\u{1F9F4}', desc: 'Seleciona maquina, receita e ciclos', color: '#60a5fa', email: 'lavagem@a7lavanderia.com.br' },
  { name: 'Secagem', icon: '\u{1F32C}\u{FE0F}', desc: 'Verifica filtro e temperatura', color: '#fbbf24', email: 'secagem@a7lavanderia.com.br' },
  { name: 'Passadoria', icon: '\u{1F455}', desc: 'Checklist individual por peca', color: '#a78bfa', email: 'passadoria@a7lavanderia.com.br' },
  { name: 'Expedicao', icon: '\u{1F4E6}', desc: 'Embala e notifica cliente', color: '#34d399', email: 'expedicao@a7lavanderia.com.br' },
  { name: 'Motorista', icon: '\u{1F69A}', desc: 'Rota, foto e assinatura', color: '#fb923c', email: 'motorista@a7lavanderia.com.br' },
]

const PASSWORD = 'A7teste@2026'

/* ─── Credential Copy ─────────────────────────────────────────────── */

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <button
      onClick={handleCopy}
      className="group/copy flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1.5 rounded-lg transition-all duration-200 hover:bg-white/[0.06] active:scale-95 cursor-pointer"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <span className="text-white/40">{label}:</span>
      <span className="text-white/70">{text}</span>
      {copied ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" className="flex-shrink-0">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/20 group-hover/copy:text-white/40 flex-shrink-0">
          <rect x="9" y="9" width="13" height="13" rx="2" />
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
        </svg>
      )}
    </button>
  )
}

/* ─── Page ─────────────────────────────────────────────────────────── */

export default function UatGuidePage() {
  return (
    <div className="min-h-screen bg-[#06060a] text-white selection:bg-amber-500/20 overflow-x-hidden">

      {/* Background ambient light */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[radial-gradient(ellipse,rgba(214,178,94,0.08),transparent_70%)]" />
        <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(96,165,250,0.04),transparent_70%)]" />
        <div className="absolute top-2/3 -right-40 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(168,85,247,0.04),transparent_70%)]" />
      </div>

      <div className="relative">

        {/* ─── Hero ───────────────────────────────────────────── */}
        <header className="px-4 pt-12 pb-16 sm:pt-20 sm:pb-24 text-center">
          <div className="mx-auto max-w-2xl">
            {/* Logo */}
            <div className="inline-block relative mb-8">
              <div className="absolute -inset-8 bg-[radial-gradient(circle,rgba(214,178,94,0.12),transparent_70%)]" />
              <h1 className="relative text-6xl sm:text-7xl font-black tracking-tighter bg-gradient-to-b from-[#e8cc7a] via-[#d6b25e] to-[#b8943f] bg-clip-text text-transparent leading-none">
                A7x
              </h1>
              <p className="relative text-[11px] sm:text-xs tracking-[0.35em] uppercase text-[#d6b25e]/50 font-semibold mt-2">
                TecNologia
              </p>
            </div>

            <p className="text-xl sm:text-2xl font-bold text-white/90 tracking-tight">
              Sistema de Lavanderia Industrial
            </p>
            <p className="text-sm sm:text-base text-white/35 mt-3 max-w-lg mx-auto leading-relaxed">
              Plataforma completa para gestao de lavanderias: do recebimento a entrega, com portais especializados para cada funcao.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#e8cc7a] via-[#d6b25e] to-[#c4a24d] px-8 py-3.5 text-sm font-bold text-[#0a0a0f] shadow-lg shadow-amber-500/10 hover:shadow-amber-500/25 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
              >
                Acessar o Sistema
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/home"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-white/[0.05] border border-white/[0.08] px-8 py-3.5 text-sm font-semibold text-white/50 hover:text-white/70 hover:bg-white/[0.08] transition-all duration-300 hover:-translate-y-0.5"
              >
                Ver Site Institucional
              </Link>
            </div>

            {/* Quick stats */}
            <div className="flex items-center justify-center gap-8 sm:gap-12 mt-12">
              {[
                { n: '12', label: 'Portais' },
                { n: '80+', label: 'Telas' },
                { n: '7', label: 'Setores' },
                { n: '100%', label: 'Mobile' },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-xl sm:text-2xl font-black tabular-nums bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">{s.n}</p>
                  <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-white/20 font-medium mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </header>

        {/* ─── Portais Administrativos ────────────────────────── */}
        <section className="px-4 pb-16 sm:pb-20">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-10 sm:mb-12">
              <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-[#d6b25e]/50 font-semibold mb-3">Ecossistema</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Portais do Sistema</h2>
              <p className="text-sm text-white/30 mt-2 max-w-md mx-auto">Cada portal oferece uma experiencia dedicada para sua funcao</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {PORTALS.map((portal) => (
                <div
                  key={portal.name}
                  className="group relative rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-1"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  {/* Gradient hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${portal.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

                  <div className="relative p-5 sm:p-6 flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-start gap-3.5 mb-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                        style={{ background: `${portal.accent}12`, border: `1px solid ${portal.accent}18` }}
                      >
                        {portal.icon}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">{portal.name}</h3>
                        <p className="text-[11px] font-medium mt-0.5" style={{ color: `${portal.accent}aa` }}>{portal.sub}</p>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-white/35 leading-relaxed mb-4 flex-1">{portal.desc}</p>

                    {/* Modules */}
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {portal.modules.map((m) => (
                        <span
                          key={m}
                          className="text-[10px] font-medium px-2 py-1 rounded-md"
                          style={{ background: `${portal.accent}0c`, color: `${portal.accent}88`, border: `1px solid ${portal.accent}12` }}
                        >
                          {m}
                        </span>
                      ))}
                    </div>

                    {/* Credentials */}
                    <div className="space-y-1.5 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <CopyButton text={portal.email} label="Email" />
                      <CopyButton text={portal.password ?? PASSWORD} label="Senha" />
                    </div>

                    {/* Login CTA */}
                    <Link
                      href="/login"
                      className="mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                      style={{ background: `${portal.accent}18`, color: portal.accent, border: `1px solid ${portal.accent}25` }}
                    >
                      Acessar Portal
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Pipeline Produtivo ─────────────────────────────── */}
        <section className="px-4 pb-16 sm:pb-20">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-10 sm:mb-12">
              <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-white/25 font-semibold mb-3">Producao</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Pipeline Produtivo</h2>
              <p className="text-sm text-white/30 mt-2 max-w-md mx-auto">O caminho completo de uma peca — da recepcao a entrega</p>
            </div>

            {/* Desktop: horizontal pipeline */}
            <div className="hidden sm:block">
              <div className="flex items-start gap-2">
                {SECTORS.map((sector, i) => (
                  <div key={sector.name} className="flex-1 flex flex-col items-center group">
                    {/* Node */}
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                      style={{
                        background: `${sector.color}15`,
                        border: `1.5px solid ${sector.color}25`,
                        boxShadow: `0 0 0 0px ${sector.color}00`,
                      }}
                    >
                      {sector.icon}
                    </div>

                    {/* Arrow */}
                    {i < SECTORS.length - 1 && (
                      <div className="absolute" style={{ left: `calc(${((i + 1) / SECTORS.length) * 100}% - 8px)`, top: 28 }}>
                      </div>
                    )}

                    {/* Label */}
                    <p className="text-xs font-bold text-white mt-3">{sector.name}</p>
                    <p className="text-[10px] text-white/30 mt-1 text-center leading-snug">{sector.desc}</p>

                    {/* Credential */}
                    <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-[9px] font-mono text-white/25 text-center truncate max-w-[120px]">{sector.email}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Connection line */}
              <div className="relative -mt-[88px] mx-7 h-px mb-20">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/30 via-blue-500/30 via-yellow-500/20 via-violet-500/30 to-orange-500/30" />
              </div>
            </div>

            {/* Mobile: vertical pipeline */}
            <div className="sm:hidden space-y-1">
              {SECTORS.map((sector, i) => (
                <div key={sector.name} className="flex items-center gap-4 py-3 px-2">
                  <div className="relative">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ background: `${sector.color}15`, border: `1.5px solid ${sector.color}25` }}
                    >
                      {sector.icon}
                    </div>
                    {/* Connector */}
                    {i < SECTORS.length - 1 && (
                      <div className="absolute left-1/2 top-full w-px h-4 -translate-x-1/2" style={{ background: `${sector.color}25` }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white">{sector.name}</p>
                    <p className="text-[11px] text-white/30">{sector.desc}</p>
                    <p className="text-[9px] font-mono text-white/20 mt-1 truncate">{sector.email}</p>
                  </div>
                  <span
                    className="text-[10px] font-black w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${sector.color}15`, color: `${sector.color}aa` }}
                  >
                    {i + 1}
                  </span>
                </div>
              ))}
            </div>

            {/* Sector password */}
            <div className="text-center mt-6">
              <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <span className="text-[10px] uppercase tracking-wider text-white/25 font-semibold">Senha dos setores</span>
                <CopyButton text={PASSWORD} label="" />
              </div>
            </div>
          </div>
        </section>

        {/* ─── Extras ─────────────────────────────────────────── */}
        <section className="px-4 pb-16 sm:pb-20">
          <div className="mx-auto max-w-5xl">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* TV Panel */}
              <div
                className="group rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5"
                style={{ background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.10)' }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center text-lg">
                    {'\u{1F4FA}'}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">TV Panel</h3>
                    <p className="text-[10px] text-white/25">Tela para fabrica</p>
                  </div>
                </div>
                <p className="text-xs text-white/30 leading-relaxed mb-3">Painel em tempo real para TVs na fabrica mostrando status de producao, filas e alertas.</p>
                <p className="text-[10px] text-white/20 font-mono">Acesse como Diretor ou Gerente</p>
              </div>

              {/* Feedback */}
              <div
                className="group rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5"
                style={{ background: 'rgba(52,211,153,0.04)', border: '1px solid rgba(52,211,153,0.10)' }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-lg">
                    {'\u{1F4AC}'}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Feedback</h3>
                    <p className="text-[10px] text-white/25">Sua opiniao importa</p>
                  </div>
                </div>
                <p className="text-xs text-white/30 leading-relaxed mb-3">Encontrou um bug? Tem uma sugestao? Envie feedback detalhado para nos diretamente pelo sistema.</p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400/70 hover:text-emerald-400 transition-colors"
                >
                  Acessar e enviar
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              {/* Paginas publicas */}
              <div
                className="group rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-lg">
                    {'\u{1F310}'}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Paginas Publicas</h3>
                    <p className="text-[10px] text-white/25">Sem login</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { href: '/home', label: 'Landing Page' },
                    { href: '/oferta', label: 'Oferta' },
                    { href: '/captacao', label: 'Captacao' },
                    { href: '/login', label: 'Login' },
                  ].map((p) => (
                    <Link
                      key={p.href}
                      href={p.href}
                      className="text-[11px] font-medium px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/40 hover:text-white/70 hover:bg-white/[0.08] transition-all duration-200"
                    >
                      {p.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Dicas ──────────────────────────────────────────── */}
        <section className="px-4 pb-16 sm:pb-20">
          <div className="mx-auto max-w-3xl">
            <div
              className="rounded-2xl p-6 sm:p-8"
              style={{ background: 'linear-gradient(135deg, rgba(214,178,94,0.06) 0%, rgba(214,178,94,0.01) 100%)', border: '1px solid rgba(214,178,94,0.10)' }}
            >
              <h3 className="text-base font-bold text-white mb-4">Como testar o sistema</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { n: '1', title: 'Copie as credenciais', desc: 'Clique no email e senha de qualquer portal acima para copiar.' },
                  { n: '2', title: 'Faca login', desc: 'Acesse o login e cole as credenciais. Cada conta redireciona ao portal correto.' },
                  { n: '3', title: 'Explore o portal', desc: 'Navegue pelas telas, teste funcionalidades e observe o design.' },
                  { n: '4', title: 'Envie feedback', desc: 'Acesse a pagina de Feedback pelo menu e descreva sua experiencia.' },
                ].map((step) => (
                  <div key={step.n} className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-lg bg-[#d6b25e]/15 text-[#d6b25e] text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                      {step.n}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white/80">{step.title}</p>
                      <p className="text-xs text-white/35 mt-0.5 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-5 space-y-2" style={{ borderTop: '1px solid rgba(214,178,94,0.08)' }}>
                {[
                  'Use Chrome ou Safari para melhor experiencia',
                  'Setores de producao sao otimizados para tablet (tela cheia)',
                  'O app do motorista funciona melhor no celular',
                  'Para o fluxo completo: Loja > Triagem > Lavagem > Secagem > Passadoria > Expedicao > Entrega',
                ].map((tip) => (
                  <div key={tip} className="flex items-start gap-2.5">
                    <div className="w-1 h-1 rounded-full bg-[#d6b25e]/30 mt-2 flex-shrink-0" />
                    <p className="text-[11px] text-white/30 leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── Footer ─────────────────────────────────────────── */}
        <footer className="px-4 pb-10 text-center space-y-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#d6b25e] to-[#c4a24d] text-sm font-bold text-[#0a0a0f] hover:shadow-lg hover:shadow-amber-500/15 transition-all duration-300 hover:-translate-y-0.5"
          >
            Comecar Agora
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Link href="/home" className="text-[11px] text-[#d6b25e]/25 hover:text-[#d6b25e]/50 transition-colors">Site</Link>
            <span className="text-white/8">|</span>
            <Link href="/login" className="text-[11px] text-white/15 hover:text-white/40 transition-colors">Login</Link>
            <span className="text-white/8">|</span>
            <Link href="/captacao" className="text-[11px] text-white/15 hover:text-white/40 transition-colors">Captacao</Link>
          </div>
          <p className="text-[9px] text-white/8 mt-2">A7x TecNologia v2.0</p>
        </footer>

      </div>
    </div>
  )
}
