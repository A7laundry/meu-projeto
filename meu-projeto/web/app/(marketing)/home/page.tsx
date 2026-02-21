import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'A7x TecNologia OS — Sistema Operacional para Lavanderias',
  description:
    'Controle de produção em tempo real, NPS integrado e dashboard executivo para redes de lavanderia. Tudo em um sistema inteligente.',
}

// ─── Dados de conteúdo ───────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: '◈',
    title: 'Dashboard Executivo',
    desc: 'Visualize o desempenho de toda a rede em tempo real. Gauges de pontualidade, tendência semanal e comparativo entre unidades em uma única tela.',
    tag: 'DIRETOR',
    color: '#d6b25e',
  },
  {
    icon: '⊞',
    title: 'Controle de Produção',
    desc: 'Saiba onde está cada peça em cada setor — triagem, lavagem, secagem, passadoria. Alertas automáticos de SLA antes do prazo vencer.',
    tag: 'OPERAÇÃO',
    color: '#60a5fa',
  },
  {
    icon: '◎',
    title: 'NPS Integrado',
    desc: 'Pesquisa de satisfação automática por link, com painel de resultados por unidade, promotores e detratores — sem terceiros.',
    tag: 'CLIENTE',
    color: '#34d399',
  },
  {
    icon: '⬡',
    title: 'Gestão de Insumos',
    desc: 'Entradas e saídas de produtos químicos com custo por comanda calculado automaticamente. Nunca mais fique sem estoque crítico.',
    tag: 'INSUMOS',
    color: '#a78bfa',
  },
  {
    icon: '⊡',
    title: 'Romaneios Digitais',
    desc: 'Motoristas recebem rotas no celular, marcam entregas e coletas. Clientes acompanham o status das peças em tempo real.',
    tag: 'LOGÍSTICA',
    color: '#fb923c',
  },
  {
    icon: '⚙',
    title: 'CRM Comercial',
    desc: 'Pipeline de leads para sua equipe de vendas. Funil de prospecção, campanhas de marketing digital e LTV de cada cliente.',
    tag: 'VENDAS',
    color: '#f472b6',
  },
]

const STEPS = [
  {
    n: '01',
    title: 'Configure em minutos',
    desc: 'Cadastre suas unidades, setores e equipe. O sistema já vem com os fluxos de lavanderia configurados — você só personaliza.',
  },
  {
    n: '02',
    title: 'Opere com visibilidade total',
    desc: 'Cada operador registra o status das peças no setor. O sistema atualiza painéis e dispara alertas automaticamente.',
  },
  {
    n: '03',
    title: 'Decida com dados reais',
    desc: 'Diretores acessam KPIs consolidados, tendências e alertas executivos. Menos feeling, mais resultado.',
  },
]

const SEGMENTS = [
  { icon: '👔', label: 'Lavanderias Comerciais', desc: 'De 300 a 10.000+ peças/dia' },
  { icon: '🏨', label: 'Hotéis e Pousadas', desc: 'Roupas de cama, toalhas e uniformes' },
  { icon: '🏥', label: 'Hospitais e Clínicas', desc: 'Lavanderia hospitalar com rastreio completo' },
  { icon: '🍽️', label: 'Restaurantes e Redes', desc: 'Uniformes e enxoval com controle de custos' },
]

const NUMBERS = [
  { value: '100%', label: 'Web — acesse de qualquer dispositivo ou TV' },
  { value: '60s', label: 'Atualização automática dos dashboards' },
  { value: '∞', label: 'Unidades e operadores sem custo adicional' },
  { value: '24/7', label: 'Suporte dedicado na implantação' },
]

// ─── Componentes ─────────────────────────────────────────────────────────────

function GoldDot() {
  return (
    <span
      className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
      style={{ background: '#d6b25e', boxShadow: '0 0 8px rgba(214,178,94,0.6)' }}
    />
  )
}

function Badge({ text, color }: { text: string; color: string }) {
  return (
    <span
      className="text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-full"
      style={{ background: `${color}18`, border: `1px solid ${color}30`, color }}
    >
      {text}
    </span>
  )
}

// ─── Página ──────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div
      className="min-h-screen text-white"
      style={{ background: 'linear-gradient(160deg, #07070a 0%, #0b0b10 40%, #0f0f16 100%)' }}
    >

      {/* ── NAV ──────────────────────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 md:px-12"
        style={{
          background: 'rgba(7,7,10,0.88)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(214,178,94,0.08)',
        }}
      >
        {/* Logo */}
        <Link href="/home" className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm"
            style={{
              background: 'linear-gradient(135deg, #d6b25e, #b98a2c)',
              color: '#07070a',
            }}
          >
            A
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-white">A7x</span>
            <span className="text-white/40 text-xs ml-1.5 hidden sm:inline">TecNologia</span>
          </div>
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-8 text-sm text-white/50">
          <a href="#funcionalidades" className="hover:text-white transition-colors">Funcionalidades</a>
          <a href="#como-funciona" className="hover:text-white transition-colors">Como funciona</a>
          <a href="#para-quem" className="hover:text-white transition-colors">Para quem</a>
          <a href="#contato" className="hover:text-white transition-colors">Contato</a>
        </div>

        {/* CTAs */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-white/50 hover:text-white transition-colors px-3 py-1.5"
          >
            Entrar
          </Link>
          <Link
            href="/captacao"
            className="text-sm font-semibold px-4 py-2 rounded-lg transition-all"
            style={{
              background: 'linear-gradient(135deg, #d6b25e, #c4a050)',
              color: '#07070a',
            }}
          >
            Solicitar Demo
          </Link>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative px-6 md:px-12 pt-24 pb-20 text-center overflow-hidden">
        {/* Glow de fundo */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(214,178,94,0.07) 0%, transparent 70%)',
          }}
        />

        {/* Pill de novidade */}
        <div className="flex justify-center mb-6">
          <span
            className="flex items-center gap-2 text-xs font-medium px-4 py-1.5 rounded-full"
            style={{
              background: 'rgba(214,178,94,0.08)',
              border: '1px solid rgba(214,178,94,0.20)',
              color: '#d6b25e',
            }}
          >
            <GoldDot />
            Sistema 100% em produção · v4.2
          </span>
        </div>

        {/* Headline */}
        <h1
          className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-tight max-w-4xl mx-auto"
          style={{ letterSpacing: '-0.03em' }}
        >
          A inteligência que{' '}
          <span
            style={{
              background: 'linear-gradient(90deg, #d6b25e 0%, #f0d080 50%, #d6b25e 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            sua lavanderia
          </span>
          {' '}merece.
        </h1>

        {/* Subheadline */}
        <p className="mt-6 text-base md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed">
          Controle de produção em tempo real, NPS integrado e dashboard executivo
          para redes de lavanderia. Tudo em um sistema operacional inteligente.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <Link
            href="/captacao"
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-sm transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #d6b25e 0%, #f0d080 100%)',
              color: '#07070a',
              boxShadow: '0 8px 32px rgba(214,178,94,0.25)',
            }}
          >
            Solicitar uma Demo gratuita →
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-sm text-white/70 hover:text-white transition-colors"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.10)',
            }}
          >
            Já sou cliente — Entrar
          </Link>
        </div>

        {/* Social proof */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-xs text-white/30">
          {['Sem contrato de fidelidade', 'Implantação em 48h', 'Suporte via WhatsApp', 'Multi-unidades incluso'].map((t) => (
            <span key={t} className="flex items-center gap-2">
              <GoldDot /> {t}
            </span>
          ))}
        </div>

        {/* Dashboard mockup */}
        <div
          className="relative mt-16 mx-auto max-w-5xl rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(214,178,94,0.12)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(214,178,94,0.05)',
          }}
        >
          {/* Barra de título fake */}
          <div
            className="flex items-center gap-2 px-4 py-3"
            style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
          >
            <span className="w-3 h-3 rounded-full bg-red-500/60" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <span className="w-3 h-3 rounded-full bg-green-500/60" />
            <span className="mx-auto text-xs text-white/25">Dashboard Executivo — A7x TecNologia OS</span>
          </div>

          {/* Conteúdo mockup do dashboard */}
          <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Pontualidade', value: '94%', color: '#10b981' },
              { label: 'Comandas hoje', value: '1.248', color: '#d6b25e' },
              { label: 'Em processo', value: '387', color: '#a78bfa' },
              { label: 'Atrasadas', value: '23', color: '#f87171' },
            ].map((m) => (
              <div
                key={m.label}
                className="rounded-xl p-4"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <p className="text-xs text-white/35 mb-2">{m.label}</p>
                <p className="text-2xl font-black tracking-tight" style={{ color: m.color }}>{m.value}</p>
              </div>
            ))}
          </div>
          <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fake trend chart */}
            <div
              className="rounded-xl p-4"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', minHeight: 100 }}
            >
              <p className="text-xs text-white/35 mb-3">Tendência — últimos 7 dias</p>
              <svg viewBox="0 0 300 60" className="w-full h-12">
                <defs>
                  <linearGradient id="lg1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d6b25e" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#d6b25e" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <polyline
                  points="0,50 50,35 100,38 150,22 200,28 250,10 300,15"
                  fill="none"
                  stroke="#d6b25e"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polygon
                  points="0,50 50,35 100,38 150,22 200,28 250,10 300,15 300,60 0,60"
                  fill="url(#lg1)"
                />
              </svg>
            </div>
            {/* Fake bar chart */}
            <div
              className="rounded-xl p-4"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', minHeight: 100 }}
            >
              <p className="text-xs text-white/35 mb-3">Comparativo por unidade</p>
              <div className="space-y-2">
                {[
                  { name: 'Unidade Centro', pct: 78, color: '#34d399' },
                  { name: 'Unidade Norte', pct: 62, color: '#d6b25e' },
                  { name: 'Unidade Sul', pct: 91, color: '#34d399' },
                ].map((b) => (
                  <div key={b.name} className="flex items-center gap-2">
                    <span className="text-[10px] text-white/30 w-24 flex-shrink-0 truncate">{b.name}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-white/05">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${b.pct}%`, background: b.color, opacity: 0.7 }}
                      />
                    </div>
                    <span className="text-[10px] text-white/40 w-8 text-right">{b.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── NÚMEROS ──────────────────────────────────────────────────────── */}
      <section className="px-6 md:px-12 py-16">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {NUMBERS.map((n) => (
            <div key={n.value} className="text-center">
              <p
                className="text-4xl font-black tracking-tight"
                style={{
                  background: 'linear-gradient(135deg, #d6b25e, #f0d080)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {n.value}
              </p>
              <p className="text-xs text-white/40 mt-2 leading-relaxed">{n.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── DIVISOR ──────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 md:px-12">
        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(214,178,94,0.15), transparent)' }} />
      </div>

      {/* ── FUNCIONALIDADES ──────────────────────────────────────────────── */}
      <section id="funcionalidades" className="px-6 md:px-12 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold tracking-widest text-[#d6b25e]/60 mb-3">FUNCIONALIDADES</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              Um sistema. Seis módulos.{' '}
              <span style={{ color: '#d6b25e' }}>Controle total.</span>
            </h2>
            <p className="text-white/40 mt-4 max-w-xl mx-auto text-sm leading-relaxed">
              Cada módulo foi projetado para o dia a dia real de lavanderias industriais.
              Sem funcionalidades genéricas, sem configurações infinitas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl p-6 flex flex-col gap-4 group transition-all hover:-translate-y-1"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <div className="flex items-start justify-between">
                  <span
                    className="text-2xl"
                    style={{ color: f.color, filter: `drop-shadow(0 0 8px ${f.color}60)` }}
                  >
                    {f.icon}
                  </span>
                  <Badge text={f.tag} color={f.color} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">{f.title}</h3>
                  <p className="text-sm text-white/45 mt-2 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DIVISOR ──────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 md:px-12">
        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(214,178,94,0.15), transparent)' }} />
      </div>

      {/* ── COMO FUNCIONA ────────────────────────────────────────────────── */}
      <section id="como-funciona" className="px-6 md:px-12 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold tracking-widest text-[#d6b25e]/60 mb-3">COMO FUNCIONA</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              Da implantação ao resultado{' '}
              <span style={{ color: '#d6b25e' }}>em 3 passos.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((s, i) => (
              <div key={s.n} className="relative">
                {/* Conector */}
                {i < STEPS.length - 1 && (
                  <div
                    className="hidden md:block absolute top-8 left-[calc(100%+0px)] w-full h-px"
                    style={{ background: 'linear-gradient(90deg, rgba(214,178,94,0.3), transparent)' }}
                  />
                )}
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl mb-5"
                  style={{
                    background: 'rgba(214,178,94,0.08)',
                    border: '1px solid rgba(214,178,94,0.20)',
                    color: '#d6b25e',
                  }}
                >
                  {s.n}
                </div>
                <h3 className="font-bold text-white text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-white/45 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          {/* Timeline bar */}
          <div
            className="mt-12 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            style={{
              background: 'rgba(214,178,94,0.05)',
              border: '1px solid rgba(214,178,94,0.15)',
            }}
          >
            <div>
              <p className="font-bold text-white text-sm">Quanto tempo até o primeiro resultado?</p>
              <p className="text-xs text-white/45 mt-1">
                A maioria das lavanderias começa a operar no sistema em <strong className="text-[#d6b25e]">48 horas</strong> após a contratação.
              </p>
            </div>
            <Link
              href="/captacao"
              className="flex-shrink-0 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: 'rgba(214,178,94,0.15)',
                border: '1px solid rgba(214,178,94,0.30)',
                color: '#d6b25e',
              }}
            >
              Começar agora →
            </Link>
          </div>
        </div>
      </section>

      {/* ── DIVISOR ──────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 md:px-12">
        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(214,178,94,0.15), transparent)' }} />
      </div>

      {/* ── PARA QUEM É ──────────────────────────────────────────────────── */}
      <section id="para-quem" className="px-6 md:px-12 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold tracking-widest text-[#d6b25e]/60 mb-3">SEGMENTOS</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              Feito para quem processa{' '}
              <span style={{ color: '#d6b25e' }}>volume com qualidade.</span>
            </h2>
            <p className="text-white/40 mt-4 max-w-xl mx-auto text-sm leading-relaxed">
              O A7x OS foi desenhado para operações que exigem rastreabilidade, controle de prazo
              e visibilidade de custos. Se você processa mais de 300 peças por dia, é para você.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SEGMENTS.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl p-6 text-center transition-all hover:-translate-y-1"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <p className="text-4xl mb-4">{s.icon}</p>
                <p className="font-bold text-white text-sm">{s.label}</p>
                <p className="text-xs text-white/40 mt-2">{s.desc}</p>
              </div>
            ))}
          </div>

          {/* Destaques */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'Multi-unidades nativo', desc: 'Gerencie 1 ou 50 unidades com o mesmo login de diretor. Nenhuma configuração adicional.' },
              { title: 'Acesso por perfil', desc: 'Diretor, gerente, operador, motorista e loja — cada um vê só o que precisa.' },
              { title: 'Sem instalação', desc: '100% web. Funciona em qualquer navegador, tablet ou TV do chão de fábrica.' },
            ].map((h) => (
              <div
                key={h.title}
                className="rounded-xl p-5"
                style={{
                  background: 'rgba(214,178,94,0.04)',
                  border: '1px solid rgba(214,178,94,0.12)',
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <GoldDot />
                  <p className="font-bold text-white text-sm">{h.title}</p>
                </div>
                <p className="text-xs text-white/45 leading-relaxed">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DIVISOR ──────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 md:px-12">
        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(214,178,94,0.15), transparent)' }} />
      </div>

      {/* ── POR QUE A7X ──────────────────────────────────────────────────── */}
      <section className="px-6 md:px-12 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold tracking-widest text-[#d6b25e]/60 mb-3">POR QUE A7X</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              Não é ERP. Não é planilha.{' '}
              <span style={{ color: '#d6b25e' }}>É um OS.</span>
            </h2>
            <p className="text-white/40 mt-4 max-w-xl mx-auto text-sm leading-relaxed">
              ERPs foram criados para finanças e contabilidade. Planilhas não atualizam em tempo real.
              O A7x OS foi criado do zero para o ritmo e as necessidades de lavanderias industriais.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              className="rounded-2xl p-8"
              style={{ background: 'rgba(248,113,113,0.04)', border: '1px solid rgba(248,113,113,0.12)' }}
            >
              <p className="text-sm font-bold text-red-400/80 mb-4 flex items-center gap-2">
                <span>✗</span> Como era antes
              </p>
              <ul className="space-y-3 text-sm text-white/45">
                {[
                  'Ligações para saber onde está a peça do cliente',
                  'Planilhas desatualizadas no fim do dia',
                  'Sem saber quais unidades estão com atraso',
                  'Custo de insumo desconhecido até o fechamento',
                  'NPS feito no papel ou não feito',
                  'Romaneio impresso e perdido no caminhão',
                ].map((i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-red-400/50 flex-shrink-0 mt-0.5">×</span>
                    {i}
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="rounded-2xl p-8"
              style={{ background: 'rgba(52,211,153,0.04)', border: '1px solid rgba(52,211,153,0.12)' }}
            >
              <p className="text-sm font-bold text-emerald-400/80 mb-4 flex items-center gap-2">
                <span>✓</span> Com o A7x OS
              </p>
              <ul className="space-y-3 text-sm text-white/45">
                {[
                  'Status de cada peça visível no celular, em tempo real',
                  'Dashboard atualizado automaticamente a cada 60 segundos',
                  'Alertas automáticos de atraso antes do cliente reclamar',
                  'Custo por comanda calculado em tempo real',
                  'Link de NPS enviado automaticamente no fim do pedido',
                  'Motorista recebe a rota no celular e marca as entregas',
                ].map((i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400/70 flex-shrink-0 mt-0.5">✓</span>
                    {i}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ────────────────────────────────────────────────────── */}
      <section id="contato" className="px-6 md:px-12 py-24">
        <div
          className="max-w-3xl mx-auto rounded-3xl p-12 text-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(214,178,94,0.08) 0%, rgba(214,178,94,0.04) 100%)',
            border: '1px solid rgba(214,178,94,0.20)',
          }}
        >
          {/* Glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(214,178,94,0.06) 0%, transparent 70%)',
            }}
          />

          <p className="text-xs font-bold tracking-widest text-[#d6b25e]/60 mb-4">PRONTO PARA COMEÇAR?</p>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight">
            Modernize sua lavanderia{' '}
            <span style={{ color: '#d6b25e' }}>esta semana.</span>
          </h2>
          <p className="text-white/45 mt-4 text-sm leading-relaxed max-w-md mx-auto">
            Agende uma demonstração gratuita e veja como o A7x OS funciona na prática,
            com os dados da sua operação.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link
              href="/captacao"
              className="px-8 py-4 rounded-xl font-bold text-sm transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #d6b25e 0%, #f0d080 100%)',
                color: '#07070a',
                boxShadow: '0 8px 32px rgba(214,178,94,0.30)',
              }}
            >
              Solicitar Demo Gratuita →
            </Link>
          </div>

          <p className="text-xs text-white/25 mt-6">
            Sem cartão de crédito · Sem compromisso · Implantação em 48h
          </p>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer
        className="px-6 md:px-12 py-10"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs"
                style={{ background: 'linear-gradient(135deg, #d6b25e, #b98a2c)', color: '#07070a' }}
              >
                A
              </div>
              <span className="font-bold text-sm text-white">A7x TecNologia</span>
            </div>
            <p className="text-xs text-white/30 max-w-xs leading-relaxed">
              Sistema Operacional Inteligente para redes de lavanderia industrial.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm text-white/40">
            {[
              { label: 'Funcionalidades', href: '#funcionalidades' },
              { label: 'Como funciona', href: '#como-funciona' },
              { label: 'Para quem é', href: '#para-quem' },
              { label: 'Solicitar Demo', href: '/captacao' },
              { label: 'Formulário de captação', href: '/captacao' },
              { label: 'Área do cliente', href: '/login' },
            ].map((l) => (
              <Link key={l.label} href={l.href} className="hover:text-white transition-colors text-xs">
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="max-w-5xl mx-auto mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/20"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
        >
          <p>© {new Date().getFullYear()} A7x TecNologia. Todos os direitos reservados.</p>
          <p>Desenvolvido com tecnologia de ponta para lavanderias industriais.</p>
        </div>
      </footer>
    </div>
  )
}
