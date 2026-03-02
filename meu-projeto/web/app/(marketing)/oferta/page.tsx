import Link from 'next/link'
import type { Metadata } from 'next'
import { submitOfertaForm } from './actions'

export const metadata: Metadata = {
  title: "Oferta Especial — A7X System's | R$150/mês",
  description:
    'Primeiras 50 empresas com acesso completo ao A7X por apenas R$150/mês. Sem fidelidade, implantação em 48h.',
}

export default async function OfertaPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>
}) {
  const { ok, error } = await searchParams

  /* ── Tela de sucesso ────────────────────────────────────── */
  if (ok) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-6 text-4xl font-bold">
            ✓
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-3">
            Parabéns! Sua vaga foi reservada.
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed mb-6">
            Nossa equipe entrará em contato pelo WhatsApp em até{' '}
            <strong className="text-blue-600">24 horas úteis</strong> para
            iniciar a implantação do A7X na sua lavanderia.
          </p>
          <Link
            href="/home"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors"
          >
            ← Voltar para o site
          </Link>
        </div>
      </div>
    )
  }

  /* ── Página principal ───────────────────────────────────── */
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* ─── NAV ──────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/home" className="flex items-center gap-2">
            <span className="text-lg font-black text-blue-600">A7X</span>
            <span className="text-xs text-slate-400">System&apos;s</span>
          </Link>
          <Link href="/home" className="text-xs text-slate-400 hover:text-slate-700 transition-colors">
            ← Voltar ao site
          </Link>
        </div>
      </nav>

      {/* ─── HERO ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white">
        {/* Hero image background */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=1600&h=900&fit=crop&q=80"
            alt=""
            className="w-full h-full object-cover opacity-[0.07]"
          />
        </div>

        <div className="relative max-w-4xl mx-auto px-6 pt-16 pb-14 md:pt-24 md:pb-20 text-center">
          {/* Urgência badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-sm font-bold mb-8">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Restam vagas das 50 primeiras empresas
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] text-slate-900 mb-6">
            Sua lavanderia no{' '}
            <span className="text-blue-600">piloto automático</span>
            <br className="hidden md:block" />
            por R$150/mês
          </h1>

          <p className="text-lg text-slate-500 mb-8 max-w-2xl mx-auto leading-relaxed">
            Sistema completo com 6 painéis especializados. Dashboard, produção, NPS, insumos, romaneios e CRM — tudo incluso.
          </p>

          {/* Preço */}
          <div className="flex items-baseline justify-center gap-3 mb-10">
            <span className="text-lg text-slate-400 line-through">R$490/mês</span>
            <span className="text-5xl md:text-6xl font-black text-blue-600">R$150</span>
            <span className="text-lg text-slate-400">/mês</span>
          </div>

          <a
            href="#formulario"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-blue-600 text-white font-extrabold text-lg shadow-lg shadow-blue-600/25 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/30 hover:-translate-y-0.5 transition-all"
          >
            Quero Garantir Minha Vaga →
          </a>
        </div>
      </section>

      {/* ─── IMAGEM DE IMPACTO ────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 -mt-4 mb-16">
        <div className="rounded-2xl overflow-hidden shadow-2xl shadow-slate-900/10">
          <img
            src="https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=1400&h=500&fit=crop&q=80"
            alt="Lavanderia industrial moderna operando"
            width={1400}
            height={500}
            className="w-full h-56 md:h-80 object-cover"
          />
        </div>
      </section>

      {/* ─── PROBLEMAS ────────────────────────────────────── */}
      <section className="bg-slate-50">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-20">
          <div className="text-center mb-12">
            <p className="text-xs font-bold tracking-widest text-blue-600 uppercase mb-3">Você se identifica?</p>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
              Se você vive algum desses problemas...
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: '📞', title: 'Ligações sem fim', desc: 'Clientes ligam toda hora perguntando "cadê minhas peças?" — e sua equipe para tudo para responder.' },
              { icon: '📋', title: 'Planilhas que mentem', desc: 'Controle em Excel, caderno ou memória. Números nunca batem e ninguém confia nos dados.' },
              { icon: '⏰', title: 'SLA estourado', desc: 'Pedidos atrasam, clientes reclamam e você só descobre quando já é tarde demais.' },
              { icon: '🧪', title: 'Insumos acabando', desc: 'Produto químico acaba no meio do turno. Ninguém avisou, ninguém controlou.' },
              { icon: '😐', title: 'NPS no papel', desc: 'Satisfação do cliente? Só quando alguém reclama no WhatsApp ou Google.' },
              { icon: '📄', title: 'Romaneio perdido', desc: 'Papel molhado, letra ilegível, entrega trocada. Prejuízo toda semana.' },
            ].map((p) => (
              <div key={p.title} className="bg-red-50 border border-red-200 rounded-xl p-5">
                <span className="text-2xl block mb-2">{p.icon}</span>
                <h3 className="text-sm font-bold text-red-900 mb-1">{p.title}</h3>
                <p className="text-sm text-red-700 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SOLUÇÃO ──────────────────────────────────────── */}
      <section>
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-20">
          <div className="text-center mb-12">
            <p className="text-xs font-bold tracking-widest text-blue-600 uppercase mb-3">A solução</p>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
              Conheça o A7X System&apos;s
            </h2>
            <p className="mt-3 text-base text-slate-500 max-w-xl mx-auto">
              O sistema operacional que resolve cada um desses problemas — automaticamente.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=300&fit=crop&q=80',
                title: 'Dashboard em tempo real',
                desc: 'KPIs de toda a rede em uma tela. Produção, SLA, NPS e financeiro atualizados minuto a minuto.',
              },
              {
                img: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=600&h=300&fit=crop&q=80',
                title: 'Produção rastreada',
                desc: 'Cada peça rastreada por setor — triagem, lavagem, secagem, passadoria. Com alertas de SLA automáticos.',
              },
              {
                img: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=300&fit=crop&q=80',
                title: 'NPS automático',
                desc: 'Pesquisa enviada por link após cada entrega. Resultados no painel, sem depender de terceiros.',
              },
              {
                img: 'https://images.unsplash.com/photo-1619454016518-697bc231e7cb?w=600&h=300&fit=crop&q=80',
                title: 'Romaneio digital',
                desc: 'Motorista com rota no celular, cliente acompanha em tempo real. Zero papel, zero perda.',
              },
            ].map((f) => (
              <div key={f.title} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
                <img
                  src={f.img}
                  alt={f.title}
                  width={600}
                  height={300}
                  loading="lazy"
                  className="w-full h-44 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-base font-bold text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STATS ────────────────────────────────────────── */}
      <section className="bg-blue-600">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { num: '6', label: 'Painéis inclusos' },
              { num: '48h', label: 'Implantação' },
              { num: '100%', label: 'Web — sem instalar' },
              { num: '0', label: 'Fidelidade' },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-3xl md:text-4xl font-black text-white">{s.num}</p>
                <p className="text-xs text-blue-100 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── O QUE INCLUI ─────────────────────────────────── */}
      <section>
        <div className="max-w-3xl mx-auto px-6 py-16 md:py-20">
          <div className="text-center mb-10">
            <p className="text-xs font-bold tracking-widest text-blue-600 uppercase mb-3">Tudo incluso</p>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
              O que você recebe por R$150/mês
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {[
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
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <span className="text-emerald-600 font-bold text-base mt-0.5 shrink-0">✓</span>
                <p className="text-sm text-emerald-900">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CONFIANÇA ────────────────────────────────────── */}
      <section className="bg-slate-50">
        <div className="max-w-4xl mx-auto px-6 py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: '🔓', title: 'Sem fidelidade', desc: 'Mês a mês, sem contrato longo.' },
              { icon: '↩️', title: 'Cancele quando quiser', desc: 'Sem multas, sem burocracia.' },
              { icon: '⚡', title: 'Implantação em 48h', desc: 'Do contrato ao go-live rápido.' },
              { icon: '🌐', title: '100% web', desc: 'Acesse de qualquer navegador.' },
            ].map((t) => (
              <div key={t.title} className="text-center bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                <span className="text-3xl block mb-3">{t.icon}</span>
                <h3 className="text-sm font-bold text-slate-900 mb-1">{t.title}</h3>
                <p className="text-xs text-slate-500">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FORMULÁRIO ───────────────────────────────────── */}
      <section id="formulario" className="bg-white">
        <div className="max-w-lg mx-auto px-6 py-16 md:py-20">
          <div className="text-center mb-8">
            <p className="text-xs font-bold tracking-widest text-blue-600 uppercase mb-3">Garanta sua vaga</p>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
              Preencha e garanta o preço especial
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Sem compromisso — nossa equipe entrará em contato para tirar suas dúvidas.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-lg shadow-slate-900/5">
            {error && (
              <div className="mb-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                {error === 'dados' ? 'Nome e WhatsApp são obrigatórios.' : 'Erro ao enviar. Tente novamente.'}
              </div>
            )}

            <form action={submitOfertaForm} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Seu nome *</label>
                <input
                  name="name"
                  required
                  placeholder="João da Silva"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Empresa / Lavanderia</label>
                <input
                  name="company"
                  placeholder="Lavanderia do João"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">WhatsApp *</label>
                  <input
                    name="phone"
                    required
                    type="tel"
                    placeholder="(11) 99999-9999"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">E-mail</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="joao@exemplo.com"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Tipo de negócio</label>
                <select
                  name="type"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all appearance-none"
                  style={{
                    backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
                    backgroundPosition: 'right 12px center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '20px',
                    paddingRight: '40px',
                  }}
                >
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
                className="w-full py-4 rounded-xl bg-blue-600 text-white font-extrabold text-base shadow-lg shadow-blue-600/25 hover:bg-blue-700 hover:shadow-xl transition-all mt-2"
              >
                Quero Garantir Minha Vaga por R$150/mês
              </button>

              <p className="text-center text-xs text-slate-400 mt-2">
                Sem compromisso. Nossa equipe entra em contato em até 24h úteis.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────── */}
      <footer className="bg-slate-900 text-slate-400">
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
