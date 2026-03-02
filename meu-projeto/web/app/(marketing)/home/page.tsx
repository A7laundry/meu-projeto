import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "A7X System's — O Sistema com IA que Corta Custos Invisíveis da sua Lavanderia",
  description:
    'Lavanderias que faturam +R$1M/ano estão perdendo até 17% do faturamento com custos invisíveis. O A7X elimina isso com IA.',
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#070b14] text-white overflow-x-hidden">

      {/* ─── NAV ──────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#070b14]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/home" className="flex items-center gap-2">
            <span className="text-xl font-black bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">A7X</span>
            <span className="text-[10px] text-white/30 font-medium tracking-widest uppercase">System&apos;s</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-xs text-white/40 hover:text-white transition-colors hidden sm:block">Entrar</Link>
            <Link href="/oferta" className="px-5 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20">
              QUERO ECONOMIZAR →
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO — PROVOCAÇÃO ─────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=1920&h=1080&fit=crop&q=80"
            alt=""
            className="w-full h-full object-cover opacity-[0.08]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#070b14] via-transparent to-[#070b14]" />
        </div>

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="relative max-w-5xl mx-auto px-6 text-center py-20">
          {/* Badge de alerta */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold mb-8 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            ALERTA: Sua lavanderia está sangrando dinheiro agora
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[0.95] mb-6">
            Sua lavanderia perde até
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              R$170 mil por ano
            </span>
            <br />
            <span className="text-white/60 text-3xl md:text-5xl lg:text-5xl">com custos que você nem vê.</span>
          </h1>

          <p className="text-lg md:text-xl text-white/40 max-w-2xl mx-auto mb-4 leading-relaxed">
            Empresas que faturam +R$1M/ano perdem em média <strong className="text-white/70">17% do faturamento</strong> com
            ineficiência operacional, retrabalho, insumos desperdiçados e SLA estourado.
          </p>

          <p className="text-base text-blue-400 font-bold mb-10">
            O A7X usa Inteligência Artificial para eliminar cada centavo perdido.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link
              href="/oferta"
              className="group px-10 py-5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-extrabold text-lg shadow-2xl shadow-blue-600/30 hover:shadow-blue-500/40 hover:-translate-y-1 transition-all"
            >
              DESCOBRIR QUANTO ESTOU PERDENDO →
            </Link>
          </div>

          {/* Trust micro */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-white/25">
            <span>Sem cartão de crédito</span>
            <span className="w-1 h-1 rounded-full bg-white/15" />
            <span>Resultado em 48h</span>
            <span className="w-1 h-1 rounded-full bg-white/15" />
            <span>Cancele quando quiser</span>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="w-5 h-8 rounded-full border-2 border-white/10 flex items-start justify-center p-1">
            <div className="w-1 h-2 bg-blue-500 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* ─── CUSTOS INVISÍVEIS — CHOQUE ────────────────────── */}
      <section className="relative py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-bold tracking-[0.2em] text-red-400 uppercase mb-4">Os custos que ninguém te mostra</p>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
              Onde seus <span className="text-red-400">R$170 mil</span> estão
              <br />escapando todo mês
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                pct: '6%',
                title: 'Retrabalho por erro humano',
                desc: 'Peças lavadas errado, temperatura incorreta, produtos trocados. Sem sistema, ninguém rastreia. Você paga duas vezes.',
                color: 'from-red-500/20 to-red-500/5',
                border: 'border-red-500/20',
                num: 'text-red-400',
              },
              {
                pct: '4%',
                title: 'Insumos desperdiçados',
                desc: 'Dosagem no olho, sem controle de estoque, produtos vencendo. Químicos caros jogados fora sem ninguém perceber.',
                color: 'from-orange-500/20 to-orange-500/5',
                border: 'border-orange-500/20',
                num: 'text-orange-400',
              },
              {
                pct: '3%',
                title: 'SLA estourado = cliente perdido',
                desc: 'Cada atraso que passa batido é um cliente que não volta. Sem alerta, você só descobre quando já perdeu o contrato.',
                color: 'from-amber-500/20 to-amber-500/5',
                border: 'border-amber-500/20',
                num: 'text-amber-400',
              },
              {
                pct: '2%',
                title: 'Horas da equipe em planilha',
                desc: 'Seus melhores funcionários gastam horas digitando dados em Excel. Tempo que deveria ir para produção.',
                color: 'from-yellow-500/20 to-yellow-500/5',
                border: 'border-yellow-500/20',
                num: 'text-yellow-400',
              },
              {
                pct: '1.5%',
                title: 'Logística sem roteirização',
                desc: 'Motorista rodando sem rota, combustível queimado, entregas atrasadas. Dinheiro na rua — literalmente.',
                color: 'from-purple-500/20 to-purple-500/5',
                border: 'border-purple-500/20',
                num: 'text-purple-400',
              },
              {
                pct: '0.5%',
                title: 'Decisões no feeling',
                desc: 'Sem dados, você decide pelo instinto. Cada decisão errada custa caro. Com dashboard, o número fala por você.',
                color: 'from-pink-500/20 to-pink-500/5',
                border: 'border-pink-500/20',
                num: 'text-pink-400',
              },
            ].map((c) => (
              <div key={c.title} className={`relative rounded-2xl bg-gradient-to-b ${c.color} border ${c.border} p-6 hover:-translate-y-1 hover:shadow-2xl transition-all`}>
                <p className={`text-4xl font-black ${c.num} mb-3`}>{c.pct}</p>
                <h3 className="text-base font-bold text-white mb-2">{c.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>

          {/* Totalizador */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-4 px-8 py-5 rounded-2xl bg-red-500/10 border border-red-500/20">
              <span className="text-5xl md:text-6xl font-black text-red-400">17%</span>
              <div className="text-left">
                <p className="text-sm font-bold text-white">do seu faturamento anual</p>
                <p className="text-xs text-white/40">vazando silenciosamente todos os meses</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── IA COMO SOLUÇÃO — VIRADA ──────────────────────── */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-bold tracking-[0.2em] text-blue-400 uppercase mb-4">A virada com inteligência artificial</p>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
              O A7X <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">enxerga o que você não vê</span>
              <br />e corta o que você não sabia que gastava
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {[
              {
                img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=350&fit=crop&q=80',
                tag: 'IA PREDITIVA',
                title: 'Dashboard que prevê problemas antes de acontecer',
                desc: 'Algoritmos analisam padrões de produção e alertam quedas de performance, picos de custo e riscos de SLA — antes que virem prejuízo.',
              },
              {
                img: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=600&h=350&fit=crop&q=80',
                tag: 'AUTOMAÇÃO',
                title: 'Zero retrabalho, zero planilha, zero achismo',
                desc: 'Cada peça rastreada em tempo real. Dosagem de insumos calculada. Rotas otimizadas. Sua equipe foca no que importa: produzir.',
              },
              {
                img: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=350&fit=crop&q=80',
                tag: 'NPS AUTOMÁTICO',
                title: 'Clientes satisfeitos voltam. Os insatisfeitos você recupera.',
                desc: 'Pesquisa enviada automaticamente após cada entrega. Detratores identificados em tempo real para ação imediata.',
              },
              {
                img: 'https://images.unsplash.com/photo-1619454016518-697bc231e7cb?w=600&h=350&fit=crop&q=80',
                tag: 'LOGÍSTICA IA',
                title: 'Rotas inteligentes, entregas no prazo, custo mínimo',
                desc: 'Roteirização automática para motoristas. Cada km conta. O cliente acompanha em tempo real. Zero ligação perguntando "cadê".',
              },
            ].map((f) => (
              <div key={f.title} className="group rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden hover:border-blue-500/20 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/5 transition-all">
                <div className="relative h-48 overflow-hidden">
                  <img src={f.img} alt={f.title} width={600} height={350} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#070b14] to-transparent" />
                  <span className="absolute bottom-3 left-4 text-[10px] font-bold tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
                    {f.tag}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="text-base font-bold text-white mb-2 leading-snug">{f.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── NÚMEROS DE IMPACTO — STRIP ────────────────────── */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        <div className="relative max-w-6xl mx-auto px-6 py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { num: '17%', label: 'Economia média', sub: 'no primeiro ano' },
              { num: 'R$170k', label: 'Recuperados/ano', sub: 'em empresas +R$1M' },
              { num: '48h', label: 'Implantação', sub: 'do contrato ao go-live' },
              { num: '6', label: 'Painéis com IA', sub: 'cada papel, sua tela' },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-3xl md:text-4xl font-black text-white">{s.num}</p>
                <p className="text-sm font-bold text-blue-100 mt-1">{s.label}</p>
                <p className="text-xs text-blue-200/50">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ANTES vs DEPOIS — TRANSFORMAÇÃO ───────────────── */}
      <section className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-bold tracking-[0.2em] text-blue-400 uppercase mb-4">Transformação real</p>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight">
              De <span className="text-red-400">caos operacional</span> para{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">máquina de lucro</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* ANTES */}
            <div className="rounded-2xl bg-gradient-to-b from-red-500/10 to-red-500/5 border border-red-500/15 p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <p className="text-sm font-black text-red-400 tracking-widest uppercase">Sem A7X</p>
              </div>
              <ul className="space-y-4">
                {[
                  'Planilhas que mentem — dados nunca batem',
                  'SLA estoura e ninguém percebe a tempo',
                  'Insumos acabam no meio do turno',
                  'Motorista rodando sem rota, queimando diesel',
                  'NPS? Só quando o cliente vai embora',
                  'Decisões no feeling, prejuízo no bolso',
                  'Equipe gastando horas em trabalho manual',
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3 text-sm text-red-300/70">
                    <span className="text-red-500 mt-0.5 shrink-0 font-bold">✗</span> {t}
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-5 border-t border-red-500/10 text-center">
                <p className="text-2xl font-black text-red-400">-R$14k/mês</p>
                <p className="text-xs text-white/30">perdidos em custos invisíveis</p>
              </div>
            </div>

            {/* DEPOIS */}
            <div className="rounded-2xl bg-gradient-to-b from-emerald-500/10 to-emerald-500/5 border border-emerald-500/15 p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-sm font-black text-emerald-400 tracking-widest uppercase">Com A7X + IA</p>
              </div>
              <ul className="space-y-4">
                {[
                  'Dashboard em tempo real — IA alerta antes do problema',
                  'SLA com alertas automáticos por setor e cliente',
                  'Estoque com nível mínimo e custo/comanda calculado',
                  'Rotas otimizadas com rastreio em tempo real',
                  'NPS automático a cada entrega, detratores em 1 clique',
                  'Decisões baseadas em dados — zero achismo',
                  'Automação total — equipe foca em produzir',
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3 text-sm text-emerald-300/70">
                    <span className="text-emerald-400 mt-0.5 shrink-0 font-bold">✓</span> {t}
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-5 border-t border-emerald-500/10 text-center">
                <p className="text-2xl font-black text-emerald-400">+R$170k/ano</p>
                <p className="text-xs text-white/30">recuperados com automação e IA</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6 PAINÉIS — PODER ─────────────────────────────── */}
      <section className="py-20 md:py-28 relative bg-[#0c1220]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-bold tracking-[0.2em] text-blue-400 uppercase mb-4">Poder total na sua mão</p>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
              6 painéis. Cada pessoa vê
              <br /><span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">exatamente o que precisa.</span>
            </h2>
            <p className="mt-4 text-base text-white/60 max-w-xl mx-auto">Diretor, Gerente, Operador, Loja, Motorista, Cliente. Zero ruído, 100% foco.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: '◈', title: 'Painel Executivo', role: 'Diretor', desc: 'KPIs multi-unidade, tendências, alertas e comparativo em uma tela. Você vê a empresa inteira.', img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop&q=80', badge: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
              { icon: '⊞', title: 'Gestão de Unidade', role: 'Gerente', desc: 'Produção, equipamentos, insumos e equipe. O gerente tem controle total da operação.', img: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&h=200&fit=crop&q=80', badge: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
              { icon: '⊡', title: 'Operação por Setor', role: 'Operador', desc: 'Interface tablet para triagem, lavagem, secagem, passadoria. Simples como arrastar um card.', img: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=400&h=200&fit=crop&q=80', badge: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
              { icon: '◎', title: 'Loja / PDV', role: 'Atendente', desc: 'Ponto de venda, CRM de clientes e financeiro integrado. Tudo no balcão.', img: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop&q=80', badge: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
              { icon: '⬡', title: 'Motorista', role: 'Logística', desc: 'Rotas no celular, coletas e entregas com rastreio. O cliente acompanha ao vivo.', img: 'https://images.unsplash.com/photo-1619454016518-697bc231e7cb?w=400&h=200&fit=crop&q=80', badge: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
              { icon: '⚙', title: 'Portal do Cliente', role: 'Seu cliente', desc: 'Acompanhamento de pedidos, histórico e NPS. Profissionalismo que fideliza.', img: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=200&fit=crop&q=80', badge: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
            ].map((p) => (
              <div key={p.title} className="group rounded-2xl bg-white/[0.05] border border-white/[0.08] overflow-hidden hover:border-blue-500/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 transition-all">
                <div className="relative h-36 overflow-hidden">
                  <img src={p.img} alt={p.title} width={400} height={200} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c1220] via-transparent to-transparent" />
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-white">{p.title}</h3>
                    <span className={`text-[10px] font-bold tracking-wider border px-2 py-0.5 rounded-full ${p.badge}`}>
                      {p.role}
                    </span>
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SEGMENTOS ────────────────────────────────────── */}
      <section className="py-20 md:py-24 bg-[#080d18]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-bold tracking-[0.2em] text-blue-400 uppercase mb-4">Quem usa</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              Feito para quem lava <span className="text-blue-400">em escala</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { label: 'Lavanderias Comerciais', desc: '300 a 10.000+ peças/dia', img: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=400&h=250&fit=crop&q=80' },
              { label: 'Hotéis e Pousadas', desc: 'Roupas de cama, toalhas, uniformes', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=250&fit=crop&q=80' },
              { label: 'Hospitais e Clínicas', desc: 'Rastreio hospitalar obrigatório', img: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=250&fit=crop&q=80' },
              { label: 'Restaurantes e Redes', desc: 'Uniformes com controle de custos', img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=250&fit=crop&q=80' },
            ].map((s) => (
              <div key={s.label} className="group rounded-2xl overflow-hidden bg-white/[0.05] border border-white/[0.08] hover:border-white/15 hover:shadow-lg transition-all">
                <div className="h-40 overflow-hidden">
                  <img src={s.img} alt={s.label} width={400} height={250} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-5">
                  <h3 className="text-sm font-bold text-white mb-1">{s.label}</h3>
                  <p className="text-xs text-white/50">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── URGÊNCIA + PREÇO ──────────────────────────────── */}
      <section className="relative py-20 md:py-28 bg-gradient-to-b from-[#0a1025] to-[#070b14]">
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[150px] pointer-events-none" />

        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/15 border border-amber-500/25 text-amber-400 text-xs font-bold mb-8">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            VAGAS LIMITADAS — Primeiras 50 empresas
          </div>

          <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight mb-6">
            Tudo isso por menos que
            <br />
            <span className="text-white/50">o custo de 1 funcionário</span>
          </h2>

          <div className="flex items-baseline justify-center gap-3 mb-4">
            <span className="text-xl text-white/40 line-through">R$490/mês</span>
            <span className="text-6xl md:text-7xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">R$150</span>
            <span className="text-xl text-white/40">/mês</span>
          </div>

          <p className="text-sm text-white/50 mb-10">
            6 painéis completos + IA + implantação em 48h + suporte dedicado
          </p>

          <Link
            href="/oferta"
            className="inline-flex items-center gap-2 px-10 py-5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-extrabold text-lg shadow-2xl shadow-blue-600/30 hover:shadow-blue-500/40 hover:-translate-y-1 transition-all"
          >
            QUERO GARANTIR POR R$150/MÊS →
          </Link>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
            {[
              'Sem fidelidade',
              'Cancele quando quiser',
              'Implantação em 48h',
              '100% web',
            ].map((t) => (
              <span key={t} className="flex items-center gap-1.5 text-xs text-white/50">
                <span className="text-emerald-400">✓</span> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA FINAL — ÚLTIMA CHANCE ─────────────────────── */}
      <section className="py-20 md:py-28 border-t border-white/[0.08] bg-[#0c1220]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight mb-6">
            Sua concorrência já está
            <br /><span className="text-blue-400">automatizando.</span>
            <br />
            <span className="text-white/50 text-2xl md:text-3xl">E você?</span>
          </h2>

          <p className="text-base text-white/60 max-w-xl mx-auto mb-10 leading-relaxed">
            Cada mês sem automação é dinheiro perdido que <strong className="text-white/80">nunca volta</strong>.
            As primeiras 50 vagas por R$150/mês estão acabando.
          </p>

          <Link
            href="/oferta"
            className="inline-flex items-center gap-2 px-12 py-6 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-extrabold text-xl shadow-2xl shadow-blue-600/30 hover:shadow-blue-500/40 hover:-translate-y-1 transition-all"
          >
            QUERO PARAR DE PERDER DINHEIRO →
          </Link>

          <p className="mt-6 text-xs text-white/40">
            Sem cartão, sem fidelidade, resultado em 48h. Ou continue perdendo 17%.
          </p>
        </div>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-lg font-black bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">A7X</span>
              <span className="text-xs text-white/20">System&apos;s — Gestão com IA para Lavanderias</span>
            </div>
            <div className="flex items-center gap-6 text-xs text-white/20">
              <Link href="/oferta" className="hover:text-blue-400 transition-colors">Oferta Especial</Link>
              <Link href="/login" className="hover:text-white/50 transition-colors">Entrar</Link>
              <Link href="/captacao" className="hover:text-white/50 transition-colors">Contato</Link>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-xs text-white/15">© 2025 A7x TecNologia. Todos os direitos reservados.</p>
            <p className="text-xs text-white/10">Synkra AIOS v4.2</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
