import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "A7X System's — Sistema Operacional para Lavanderias",
  description:
    'Controle de produção em tempo real, NPS integrado e dashboard executivo para redes de lavanderia industrial.',
}

const FEATURES = [
  {
    icon: '◈',
    title: 'Dashboard Executivo',
    desc: 'Visão consolidada de toda a rede em tempo real. Gauges, tendências semanais e comparativo entre unidades em uma tela.',
    color: '#2563eb',
    tag: 'DIRETOR',
  },
  {
    icon: '⊞',
    title: 'Controle de Produção',
    desc: 'Rastreie cada peça por setor — triagem, lavagem, secagem, passadoria. Alertas automáticos de SLA antes do prazo vencer.',
    color: '#3b82f6',
    tag: 'OPERAÇÃO',
  },
  {
    icon: '◎',
    title: 'NPS Integrado',
    desc: 'Pesquisa automática por link, painel de resultados por unidade, promotores e detratores — sem depender de terceiros.',
    color: '#059669',
    tag: 'CLIENTE',
  },
  {
    icon: '⬡',
    title: 'Gestão de Insumos',
    desc: 'Entradas e saídas de produtos químicos com custo por comanda calculado automaticamente. Controle de estoque em tempo real.',
    color: '#7c3aed',
    tag: 'INSUMOS',
  },
  {
    icon: '⊡',
    title: 'Romaneios Digitais',
    desc: 'Motoristas recebem rotas no celular, marcam entregas e coletas. Clientes acompanham o status das peças em tempo real.',
    color: '#ea580c',
    tag: 'LOGÍSTICA',
  },
  {
    icon: '⚙',
    title: 'CRM Comercial',
    desc: 'Pipeline de leads com funil de prospecção, campanhas de marketing digital e LTV calculado para cada cliente.',
    color: '#db2777',
    tag: 'VENDAS',
  },
]

const PANELS = [
  {
    icon: '◈',
    title: 'Painel Executivo',
    role: 'Director',
    desc: 'Dashboard consolidado com KPIs multi-unidade, tendências semanais e alertas executivos.',
    color: '#2563eb',
    img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=220&fit=crop&q=80',
  },
  {
    icon: '⊞',
    title: 'Gestão de Unidade',
    role: 'Unit Manager',
    desc: 'Controle de produção, equipamentos, insumos e equipe da sua unidade.',
    color: '#059669',
    img: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&h=220&fit=crop&q=80',
  },
  {
    icon: '⊡',
    title: 'Operação',
    role: 'Sector Operator',
    desc: 'Interface tablet otimizada por setor — triagem, lavagem, secagem, passadoria.',
    color: '#7c3aed',
    img: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=400&h=220&fit=crop&q=80',
  },
  {
    icon: '◎',
    title: 'Loja / PDV',
    role: 'Store',
    desc: 'Ponto de venda, CRM de clientes e controle financeiro integrado.',
    color: '#d97706',
    img: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=220&fit=crop&q=80',
  },
  {
    icon: '⬡',
    title: 'Motorista',
    role: 'Driver',
    desc: 'Rotas otimizadas, registro de coletas e entregas em tempo real.',
    color: '#ea580c',
    img: 'https://images.unsplash.com/photo-1619454016518-697bc231e7cb?w=400&h=220&fit=crop&q=80',
  },
  {
    icon: '⚙',
    title: 'Portal do Cliente',
    role: 'Customer',
    desc: 'Acompanhamento de pedidos, histórico de serviços e NPS.',
    color: '#0891b2',
    img: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=220&fit=crop&q=80',
  },
]

const SEGMENTS = [
  { label: 'Lavanderias Comerciais', desc: 'De 300 a 10.000+ peças/dia', img: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=300&h=180&fit=crop&q=80' },
  { label: 'Hotéis e Pousadas', desc: 'Roupas de cama, toalhas e uniformes', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&h=180&fit=crop&q=80' },
  { label: 'Hospitais e Clínicas', desc: 'Lavanderia hospitalar com rastreio', img: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=300&h=180&fit=crop&q=80' },
  { label: 'Restaurantes e Redes', desc: 'Uniformes com controle de custos', img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=300&h=180&fit=crop&q=80' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* ─── 1. NAV ─────────────────────────────────────────── */}
      <nav className="ml-nav">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/home" className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tight" style={{ color: 'var(--ml-accent)' }}>
              A7X
            </span>
            <span className="text-xs font-medium" style={{ color: 'var(--ml-text-muted)' }}>
              System&apos;s
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#paineis" className="ml-nav-link">Painéis</a>
            <a href="#funcionalidades" className="ml-nav-link">Funcionalidades</a>
            <a href="#como-funciona" className="ml-nav-link">Como Funciona</a>
            <a href="#segmentos" className="ml-nav-link">Segmentos</a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="ml-nav-link hidden sm:inline-block">
              Entrar
            </Link>
            <Link href="/oferta" className="ml-btn-primary" style={{ padding: '8px 20px', fontSize: '13px' }}>
              Conhecer Oferta
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── 2. HERO ────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ background: 'var(--ml-bg)' }}>
        <div className="ml-dot-grid absolute inset-0 pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 pt-20 pb-16 md:pt-28 md:pb-24 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6" style={{ background: 'var(--ml-accent-light)', color: 'var(--ml-accent)', fontSize: '12px', fontWeight: 700 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ml-accent)', display: 'inline-block' }} />
                v4.2 — Sistema Operacional Completo
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] mb-6" style={{ color: 'var(--ml-text)' }}>
                O sistema que faz{' '}
                <span style={{ color: 'var(--ml-accent)' }}>sua lavanderia</span>{' '}
                funcionar no piloto automático
              </h1>

              <p className="text-lg mb-6" style={{ color: 'var(--ml-text-secondary)', lineHeight: 1.7 }}>
                Dashboard executivo, controle de produção, NPS integrado e 6 painéis especializados. Tudo o que uma rede de lavanderia precisa em uma plataforma.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <Link href="/oferta" className="ml-btn-primary-lg">
                  Conhecer Oferta Especial →
                </Link>
                <a href="#como-funciona" className="ml-btn-ghost">
                  Como funciona
                </a>
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {['Implantação em 48h', 'Sem fidelidade', '100% web'].map((t) => (
                  <div key={t} className="flex items-center gap-2 text-sm" style={{ color: 'var(--ml-text-secondary)' }}>
                    <span style={{ color: '#059669', fontWeight: 700 }}>✓</span> {t}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="rounded-2xl overflow-hidden" style={{ boxShadow: 'var(--ml-shadow-xl)' }}>
                <img
                  src="https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=1200&h=700&fit=crop&q=80"
                  alt="Lavanderia industrial moderna"
                  width={600}
                  height={350}
                  loading="eager"
                  className="w-full h-auto object-cover"
                />
              </div>
              <div
                className="absolute -bottom-4 -left-4 px-5 py-3 rounded-xl"
                style={{ background: 'var(--ml-bg)', boxShadow: 'var(--ml-shadow-lg)', border: '1px solid var(--ml-border)' }}
              >
                <p className="text-2xl font-black" style={{ color: 'var(--ml-accent)' }}>6</p>
                <p className="text-xs font-medium" style={{ color: 'var(--ml-text-muted)' }}>painéis integrados</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. STATS ───────────────────────────────────────── */}
      <section style={{ background: 'var(--ml-bg-alt)' }}>
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { num: '6', label: 'Painéis especializados', sub: 'Diretor, Gerente, Operação, Loja, Motorista, Cliente' },
              { num: '60s', label: 'Primeira comanda', sub: 'Da coleta ao sistema em tempo recorde' },
              { num: '48h', label: 'Implantação', sub: 'Do contrato ao go-live em 2 dias' },
              { num: '∞', label: 'Escalabilidade', sub: 'De 1 a 100 unidades, sem restrições' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl md:text-4xl font-black mb-1" style={{ color: 'var(--ml-accent)' }}>{s.num}</p>
                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--ml-text)' }}>{s.label}</p>
                <p className="text-xs" style={{ color: 'var(--ml-text-muted)' }}>{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 4. PAINÉIS ─────────────────────────────────────── */}
      <section id="paineis" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <p className="ml-overline mb-3">PAINÉIS</p>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight" style={{ color: 'var(--ml-text)' }}>
            6 painéis, um para cada função
          </h2>
          <p className="mt-3 text-base max-w-2xl mx-auto" style={{ color: 'var(--ml-text-secondary)' }}>
            Cada pessoa na operação tem a interface certa para o seu papel — sem ruído, sem complexidade desnecessária.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PANELS.map((p) => (
            <div key={p.title} className="ml-card overflow-hidden">
              <div className="h-40 overflow-hidden">
                <img
                  src={p.img}
                  alt={p.title}
                  width={400}
                  height={220}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xl" style={{ color: p.color }}>{p.icon}</span>
                  <div>
                    <h3 className="text-base font-bold" style={{ color: 'var(--ml-text)' }}>{p.title}</h3>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: `${p.color}12`, color: p.color }}>
                      {p.role}
                    </span>
                  </div>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--ml-text-secondary)' }}>{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 5. FUNCIONALIDADES ──────────────────────────────── */}
      <section id="funcionalidades" style={{ background: 'var(--ml-bg-alt)' }}>
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <p className="ml-overline mb-3">FUNCIONALIDADES</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight" style={{ color: 'var(--ml-text)' }}>
              Tudo que você precisa, nada que não precisa
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="ml-card p-7">
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                    style={{ background: `${f.color}10`, color: f.color }}
                  >
                    {f.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-bold" style={{ color: 'var(--ml-text)' }}>{f.title}</h3>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: `${f.color}10`, color: f.color }}>
                        {f.tag}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--ml-text-secondary)' }}>{f.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 6. COMO FUNCIONA ────────────────────────────────── */}
      <section id="como-funciona" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <p className="ml-overline mb-3">COMO FUNCIONA</p>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight" style={{ color: 'var(--ml-text)' }}>
            3 passos para transformar sua operação
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: '01',
              title: 'Contrate',
              desc: 'Escolha seu plano e receba acesso imediato à plataforma. Sem burocracia, sem instalação.',
            },
            {
              step: '02',
              title: 'Configure',
              desc: 'Nossa equipe configura unidades, setores, clientes e fluxos em até 48 horas. Você acompanha tudo.',
            },
            {
              step: '03',
              title: 'Opere',
              desc: 'Sua equipe começa a usar no dia seguinte. Suporte dedicado nas primeiras semanas de operação.',
            },
          ].map((s) => (
            <div key={s.step} className="text-center">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{ background: 'var(--ml-accent-light)', color: 'var(--ml-accent)', fontSize: '20px', fontWeight: 900 }}
              >
                {s.step}
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--ml-text)' }}>{s.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--ml-text-secondary)' }}>{s.desc}</p>
            </div>
          ))}
        </div>

        <div
          className="mt-12 p-5 rounded-xl text-center"
          style={{ background: 'var(--ml-accent-light)', border: '1px solid rgba(37,99,235,0.12)' }}
        >
          <p className="text-sm font-medium" style={{ color: 'var(--ml-accent)' }}>
            Sem necessidade de instalar nada — 100% web, acesse de qualquer dispositivo com navegador.
          </p>
        </div>
      </section>

      {/* ─── 7. ANTES / DEPOIS ───────────────────────────────── */}
      <section style={{ background: 'var(--ml-bg-alt)' }}>
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <p className="ml-overline mb-3">TRANSFORMAÇÃO</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight" style={{ color: 'var(--ml-text)' }}>
              Antes vs. Depois do A7X
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Antes */}
            <div className="rounded-2xl p-8" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
              <p className="text-sm font-bold mb-5" style={{ color: '#dc2626' }}>SEM A7X</p>
              <ul className="space-y-3">
                {[
                  'Planilhas espalhadas e desatualizadas',
                  'Sem controle de SLA, pedidos atrasam',
                  'Insumos acabam sem aviso',
                  'NPS? Só quando o cliente reclama',
                  'Romaneios em papel, perdas constantes',
                  'Decisões no feeling, sem dados',
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2 text-sm" style={{ color: '#991b1b' }}>
                    <span className="mt-0.5">✗</span> {t}
                  </li>
                ))}
              </ul>
            </div>

            {/* Depois */}
            <div className="rounded-2xl p-8" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <p className="text-sm font-bold mb-5" style={{ color: '#059669' }}>COM A7X</p>
              <ul className="space-y-3">
                {[
                  'Dashboard unificado em tempo real',
                  'SLA com alertas automáticos por setor',
                  'Insumos com estoque mínimo e custo/comanda',
                  'NPS automático por link, resultados no painel',
                  'Romaneios digitais com rastreio GPS',
                  'Decisões baseadas em dados reais',
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2 text-sm" style={{ color: '#166534' }}>
                    <span className="mt-0.5 font-bold" style={{ color: '#059669' }}>✓</span> {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 8. SEGMENTOS ────────────────────────────────────── */}
      <section id="segmentos" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <p className="ml-overline mb-3">SEGMENTOS</p>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight" style={{ color: 'var(--ml-text)' }}>
            Feito para quem lava em escala
          </h2>
          <p className="mt-3 text-base max-w-2xl mx-auto" style={{ color: 'var(--ml-text-secondary)' }}>
            Lavanderias, hotéis, hospitais e restaurantes — o A7X adapta-se ao seu volume e fluxo.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SEGMENTS.map((s) => (
            <div key={s.label} className="ml-card overflow-hidden">
              <div className="h-36 overflow-hidden">
                <img
                  src={s.img}
                  alt={s.label}
                  width={300}
                  height={180}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5">
                <h3 className="text-sm font-bold mb-1" style={{ color: 'var(--ml-text)' }}>{s.label}</h3>
                <p className="text-xs" style={{ color: 'var(--ml-text-secondary)' }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 9. CTA FINAL ────────────────────────────────────── */}
      <section style={{ background: 'var(--ml-accent-light)' }}>
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <p className="ml-overline mb-3">OFERTA ESPECIAL</p>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4" style={{ color: 'var(--ml-text)' }}>
            Primeiras 50 empresas por R$150/mês
          </h2>
          <p className="text-base mb-8 max-w-xl mx-auto" style={{ color: 'var(--ml-text-secondary)' }}>
            Acesso completo a todos os 6 painéis. Sem fidelidade, cancele quando quiser. Implantação em até 48 horas.
          </p>

          <Link href="/oferta" className="ml-btn-primary-lg">
            Quero Garantir Minha Vaga →
          </Link>

          <div className="flex justify-center gap-6 mt-8 flex-wrap">
            {['Sem fidelidade', 'Cancele quando quiser', '48h implantação', '100% web'].map((t) => (
              <span key={t} className="text-xs font-medium flex items-center gap-1.5" style={{ color: 'var(--ml-text-secondary)' }}>
                <span style={{ color: '#059669' }}>✓</span> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 10. FOOTER ──────────────────────────────────────── */}
      <footer style={{ background: '#0f172a', color: 'rgba(255,255,255,0.6)' }}>
        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div>
              <p className="text-xl font-black text-white mb-2">A7X</p>
              <p className="text-xs leading-relaxed">
                Sistema operacional completo para redes de lavanderia industrial.
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider mb-3">Produto</p>
              <ul className="space-y-2 text-xs">
                <li><a href="#paineis" className="hover:text-white transition-colors">Painéis</a></li>
                <li><a href="#funcionalidades" className="hover:text-white transition-colors">Funcionalidades</a></li>
                <li><a href="#segmentos" className="hover:text-white transition-colors">Segmentos</a></li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider mb-3">Empresa</p>
              <ul className="space-y-2 text-xs">
                <li><a href="#como-funciona" className="hover:text-white transition-colors">Como Funciona</a></li>
                <li><Link href="/oferta" className="hover:text-white transition-colors">Oferta Especial</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider mb-3">Acesso</p>
              <ul className="space-y-2 text-xs">
                <li><Link href="/login" className="hover:text-white transition-colors">Entrar</Link></li>
                <li><Link href="/oferta" className="hover:text-white transition-colors">Cadastrar</Link></li>
              </ul>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }} className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-xs">© 2025 A7x TecNologia. Todos os direitos reservados.</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Synkra AIOS v4.2</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
