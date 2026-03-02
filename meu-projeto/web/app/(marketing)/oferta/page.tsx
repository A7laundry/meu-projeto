import Link from 'next/link'
import type { Metadata } from 'next'
import { submitOfertaForm } from './actions'

export const metadata: Metadata = {
  title: "Oferta Especial — A7X System's | R$150/mês",
  description:
    'Primeiras 50 empresas com acesso completo ao A7X por apenas R$150/mês. Sem fidelidade, implantação em 48h.',
}

const PAIN_POINTS = [
  {
    icon: '📞',
    title: 'Ligações sem fim',
    desc: 'Clientes ligam toda hora perguntando "cadê minhas peças?" — e sua equipe para tudo para responder.',
  },
  {
    icon: '📋',
    title: 'Planilhas que mentem',
    desc: 'Controle em Excel, caderno ou memória. Números nunca batem e ninguém confia nos dados.',
  },
  {
    icon: '⏰',
    title: 'SLA estourado',
    desc: 'Pedidos atrasam, clientes reclamam e você só descobre quando já é tarde demais.',
  },
  {
    icon: '🧪',
    title: 'Insumos acabando',
    desc: 'Produto químico acaba no meio do turno. Ninguém avisou, ninguém controlou.',
  },
  {
    icon: '😐',
    title: 'NPS no papel',
    desc: 'Satisfação do cliente? Só quando alguém reclama no WhatsApp ou Google.',
  },
  {
    icon: '📄',
    title: 'Romaneio perdido',
    desc: 'Papel molhado, letra ilegível, entrega trocada. Prejuízo toda semana.',
  },
]

const SOLUTION_FEATURES = [
  {
    icon: '◈',
    title: 'Dashboard em tempo real',
    desc: 'KPIs de toda a rede em uma tela. Produção, SLA, NPS e financeiro atualizados minuto a minuto.',
  },
  {
    icon: '⊞',
    title: 'Produção rastreada',
    desc: 'Cada peça rastreada por setor — triagem, lavagem, secagem, passadoria. Com alertas de SLA automáticos.',
  },
  {
    icon: '◎',
    title: 'NPS automático',
    desc: 'Pesquisa enviada por link após cada entrega. Resultados no painel, sem depender de terceiros.',
  },
  {
    icon: '⊡',
    title: 'Romaneio digital',
    desc: 'Motorista com rota no celular, cliente acompanha em tempo real. Zero papel, zero perda.',
  },
]

const INCLUDES = [
  '6 painéis completos (Diretor, Gerente, Operação, Loja, Motorista, Cliente)',
  'Dashboard executivo com KPIs em tempo real',
  'Controle de produção por setor com alertas de SLA',
  'NPS integrado com pesquisa automática',
  'Gestão de insumos com estoque mínimo',
  'Romaneios digitais com rastreio',
  'CRM comercial com pipeline de leads',
  'Portal do cliente para acompanhamento',
  'Implantação assistida em até 48 horas',
  'Suporte dedicado nas primeiras semanas',
]

export default async function OfertaPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>
}) {
  const { ok, error } = await searchParams

  if (ok) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--ml-bg)' }}>
        <div className="text-center max-w-md">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: '#f0fdf4', color: '#059669', fontSize: '36px' }}
          >
            ✓
          </div>
          <h1 className="text-2xl font-black mb-3" style={{ color: 'var(--ml-text)' }}>
            Parabéns! Sua vaga foi reservada.
          </h1>
          <p className="text-sm mb-6" style={{ color: 'var(--ml-text-secondary)', lineHeight: 1.7 }}>
            Nossa equipe entrará em contato pelo WhatsApp em até <strong style={{ color: 'var(--ml-accent)' }}>24 horas úteis</strong> para
            iniciar a implantação do A7X na sua lavanderia.
          </p>
          <Link href="/home" className="ml-btn-primary">
            ← Voltar para o site
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--ml-bg)' }}>
      {/* ─── NAV MINIMAL ──────────────────────────────────── */}
      <nav className="ml-nav">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/home" className="flex items-center gap-2">
            <span className="text-lg font-black" style={{ color: 'var(--ml-accent)' }}>A7X</span>
            <span className="text-xs" style={{ color: 'var(--ml-text-muted)' }}>System&apos;s</span>
          </Link>
          <Link href="/home" className="ml-nav-link text-xs">
            ← Voltar ao site
          </Link>
        </div>
      </nav>

      {/* ─── A. ATENÇÃO (Hero) ────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ background: 'var(--ml-bg)' }}>
        <div className="ml-dot-grid absolute inset-0 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 pt-16 pb-14 md:pt-24 md:pb-20 text-center relative z-10">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
            style={{ background: '#fef3c7', color: '#b45309', fontSize: '13px', fontWeight: 700, border: '1px solid #fde68a' }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', display: 'inline-block', animation: 'pulse-blue 2s infinite' }} />
            Restam vagas das 50 primeiras empresas
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] mb-6" style={{ color: 'var(--ml-text)' }}>
            Sua lavanderia no{' '}
            <span style={{ color: 'var(--ml-accent)' }}>piloto automático</span>{' '}
            por R$150/mês
          </h1>

          <p className="text-base md:text-lg mb-8 max-w-2xl mx-auto" style={{ color: 'var(--ml-text-secondary)', lineHeight: 1.7 }}>
            Sistema completo com 6 painéis especializados. Dashboard, produção, NPS, insumos, romaneios e CRM — tudo incluso.
          </p>

          <div className="flex items-center justify-center gap-4 mb-8">
            <span className="text-sm line-through" style={{ color: 'var(--ml-text-muted)' }}>R$490/mês</span>
            <span className="text-4xl md:text-5xl font-black" style={{ color: 'var(--ml-accent)' }}>R$150</span>
            <span className="text-sm" style={{ color: 'var(--ml-text-muted)' }}>/mês</span>
          </div>

          <a href="#formulario" className="ml-btn-primary-lg">
            Quero Garantir Minha Vaga →
          </a>
        </div>
      </section>

      {/* ─── B. INTERESSE (Problemas) ─────────────────────── */}
      <section style={{ background: 'var(--ml-bg-alt)' }}>
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-20">
          <div className="text-center mb-12">
            <p className="ml-overline mb-3">VOCÊ SE IDENTIFICA?</p>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight" style={{ color: 'var(--ml-text)' }}>
              Se você se identifica com algum desses problemas...
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PAIN_POINTS.map((p) => (
              <div
                key={p.title}
                className="rounded-xl p-6"
                style={{ background: '#fef2f2', border: '1px solid #fecaca' }}
              >
                <span className="text-2xl mb-3 block">{p.icon}</span>
                <h3 className="text-sm font-bold mb-1" style={{ color: '#991b1b' }}>{p.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#b91c1c' }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── C. INTERESSE (Solução) ───────────────────────── */}
      <section>
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-20">
          <div className="text-center mb-12">
            <p className="ml-overline mb-3">A SOLUÇÃO</p>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight" style={{ color: 'var(--ml-text)' }}>
              Conheça o A7X System&apos;s
            </h2>
            <p className="mt-3 text-base max-w-xl mx-auto" style={{ color: 'var(--ml-text-secondary)' }}>
              O sistema operacional que resolve cada um desses problemas — automaticamente.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {SOLUTION_FEATURES.map((f) => (
              <div key={f.title} className="ml-card p-7">
                <span className="text-2xl mb-3 block" style={{ color: 'var(--ml-accent)' }}>{f.icon}</span>
                <h3 className="text-base font-bold mb-2" style={{ color: 'var(--ml-text)' }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--ml-text-secondary)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── D. DESEJO (Prova Social) ─────────────────────── */}
      <section style={{ background: 'var(--ml-bg-alt)' }}>
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-20">
          <div className="rounded-2xl overflow-hidden mb-10" style={{ boxShadow: 'var(--ml-shadow-lg)' }}>
            <img
              src="https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=1200&h=500&fit=crop&q=80"
              alt="Lavanderia industrial operando com A7X"
              width={1200}
              height={500}
              loading="lazy"
              className="w-full h-48 md:h-72 object-cover"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { num: '6', label: 'Painéis inclusos' },
              { num: '48h', label: 'Implantação' },
              { num: '100%', label: 'Web — sem instalar nada' },
              { num: '0', label: 'Fidelidade' },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl md:text-3xl font-black" style={{ color: 'var(--ml-accent)' }}>{s.num}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--ml-text-secondary)' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── E. DESEJO (O que inclui) ─────────────────────── */}
      <section>
        <div className="max-w-3xl mx-auto px-6 py-16 md:py-20">
          <div className="text-center mb-10">
            <p className="ml-overline mb-3">TUDO INCLUSO</p>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight" style={{ color: 'var(--ml-text)' }}>
              O que você recebe por R$150/mês
            </h2>
          </div>

          <div className="space-y-3">
            {INCLUDES.map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 p-4 rounded-xl"
                style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}
              >
                <span className="text-base font-bold mt-0.5" style={{ color: '#059669' }}>✓</span>
                <p className="text-sm" style={{ color: '#166534' }}>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── F. DESEJO (Confiança) ────────────────────────── */}
      <section style={{ background: 'var(--ml-bg-alt)' }}>
        <div className="max-w-4xl mx-auto px-6 py-16 md:py-20">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: '🔓', title: 'Sem fidelidade', desc: 'Mês a mês, sem contrato longo.' },
              { icon: '↩️', title: 'Cancele quando quiser', desc: 'Sem multas, sem burocracia.' },
              { icon: '⚡', title: 'Implantação em 48h', desc: 'Do contrato ao go-live rápido.' },
              { icon: '🌐', title: '100% web', desc: 'Acesse de qualquer navegador.' },
            ].map((t) => (
              <div key={t.title} className="text-center p-6">
                <span className="text-3xl mb-3 block">{t.icon}</span>
                <h3 className="text-sm font-bold mb-1" style={{ color: 'var(--ml-text)' }}>{t.title}</h3>
                <p className="text-xs" style={{ color: 'var(--ml-text-secondary)' }}>{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── G. AÇÃO (Formulário) ─────────────────────────── */}
      <section id="formulario">
        <div className="max-w-lg mx-auto px-6 py-16 md:py-20">
          <div className="text-center mb-8">
            <p className="ml-overline mb-3">GARANTA SUA VAGA</p>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight" style={{ color: 'var(--ml-text)' }}>
              Preencha e garanta o preço especial
            </h2>
            <p className="mt-2 text-sm" style={{ color: 'var(--ml-text-secondary)' }}>
              Sem compromisso — nossa equipe entrará em contato para tirar suas dúvidas.
            </p>
          </div>

          {error && (
            <div
              className="mb-6 rounded-xl px-4 py-3 text-sm"
              style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}
            >
              {error === 'dados' ? 'Nome e WhatsApp são obrigatórios.' : 'Erro ao enviar. Tente novamente.'}
            </div>
          )}

          <form action={submitOfertaForm} className="space-y-4">
            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--ml-text)' }}>
                Seu nome *
              </label>
              <input
                name="name"
                required
                placeholder="João da Silva"
                className="ml-input"
              />
            </div>

            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--ml-text)' }}>
                Empresa / Lavanderia
              </label>
              <input
                name="company"
                placeholder="Lavanderia do João"
                className="ml-input"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--ml-text)' }}>
                  WhatsApp *
                </label>
                <input
                  name="phone"
                  required
                  type="tel"
                  placeholder="(11) 99999-9999"
                  className="ml-input"
                />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--ml-text)' }}>
                  E-mail
                </label>
                <input
                  name="email"
                  type="email"
                  placeholder="joao@exemplo.com"
                  className="ml-input"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--ml-text)' }}>
                Tipo de negócio
              </label>
              <select name="type" className="ml-select">
                <option value="business">Lavanderia Comercial</option>
                <option value="hotel">Hotel / Pousada</option>
                <option value="restaurant">Restaurante</option>
                <option value="clinic">Clínica / Hospital</option>
                <option value="gym">Academia / Spa</option>
                <option value="other">Outro</option>
              </select>
            </div>

            <button
              type="submit"
              className="ml-btn-primary-lg w-full mt-2"
            >
              Quero Garantir Minha Vaga por R$150/mês
            </button>

            <p className="text-center text-xs mt-2" style={{ color: 'var(--ml-text-muted)' }}>
              Sem compromisso. Nossa equipe entra em contato em até 24h úteis.
            </p>
          </form>
        </div>
      </section>

      {/* ─── H. FOOTER ────────────────────────────────────── */}
      <footer style={{ background: '#0f172a', color: 'rgba(255,255,255,0.5)' }}>
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-base font-black text-white">A7X</span>
            <span className="text-xs">System&apos;s</span>
          </div>
          <p className="text-xs">© 2025 A7x TecNologia. Todos os direitos reservados.</p>
          <Link href="/home" className="text-xs hover:text-white transition-colors">
            Voltar ao site →
          </Link>
        </div>
      </footer>
    </div>
  )
}
