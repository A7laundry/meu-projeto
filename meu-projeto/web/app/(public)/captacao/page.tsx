import { submitLeadForm } from './actions'

export default async function CaptacaoPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>
}) {
  const { ok, error } = await searchParams

  if (ok) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#07070a] via-[#0d0d12] to-[#111118] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-6xl mb-4">✅</p>
          <h1 className="text-2xl font-bold text-white mb-3">Recebemos seu contato!</h1>
          <p className="text-white/60 text-sm">
            Nossa equipe comercial entrará em contato em até <strong className="text-[#d6b25e]">24 horas úteis</strong>.
          </p>
          <p className="text-white/30 text-xs mt-6">A7x TecNologia - OS.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#07070a] via-[#0d0d12] to-[#111118] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <p className="text-4xl font-black tracking-tight text-[#d6b25e]">A7x</p>
          <p className="text-sm text-[#d6b25e]/60 font-medium mt-0.5">TecNologia — Lavanderia Industrial</p>
          <h1 className="text-2xl font-bold text-white mt-6">
            Quero modernizar minha lavanderia
          </h1>
          <p className="text-white/50 text-sm mt-2">
            Preencha o formulário e nossa equipe entrará em contato em até 24h.
          </p>
        </div>

        {/* Formulário */}
        <div className="bg-white/5 border border-[#d6b25e]/10 rounded-2xl p-8 backdrop-blur-sm">
          {error && (
            <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
              {error === 'dados' ? 'Nome e telefone são obrigatórios.' : 'Erro ao enviar. Tente novamente.'}
            </div>
          )}

          <form action={submitLeadForm} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs text-[#d6b25e]/70 font-medium block mb-1">
                  Seu nome *
                </label>
                <input
                  name="name"
                  required
                  placeholder="João da Silva"
                  className="w-full bg-white/5 border border-white/10 focus:border-[#d6b25e]/60 rounded-lg px-4 py-3 text-white placeholder-white/30 text-sm outline-none transition-colors"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs text-[#d6b25e]/70 font-medium block mb-1">
                  Empresa / Lavanderia
                </label>
                <input
                  name="company"
                  placeholder="Lavanderia do João"
                  className="w-full bg-white/5 border border-white/10 focus:border-[#d6b25e]/60 rounded-lg px-4 py-3 text-white placeholder-white/30 text-sm outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-xs text-[#d6b25e]/70 font-medium block mb-1">
                  WhatsApp *
                </label>
                <input
                  name="phone"
                  required
                  type="tel"
                  placeholder="(11) 99999-9999"
                  className="w-full bg-white/5 border border-white/10 focus:border-[#d6b25e]/60 rounded-lg px-4 py-3 text-white placeholder-white/30 text-sm outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-xs text-[#d6b25e]/70 font-medium block mb-1">
                  E-mail
                </label>
                <input
                  name="email"
                  type="email"
                  placeholder="joao@exemplo.com"
                  className="w-full bg-white/5 border border-white/10 focus:border-[#d6b25e]/60 rounded-lg px-4 py-3 text-white placeholder-white/30 text-sm outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-xs text-[#d6b25e]/70 font-medium block mb-1">
                  Tipo de negócio
                </label>
                <select
                  name="type"
                  className="w-full bg-[#07070a] border border-white/10 focus:border-[#d6b25e]/60 rounded-lg px-4 py-3 text-white text-sm outline-none transition-colors"
                >
                  <option value="business">Lavanderia Comercial</option>
                  <option value="hotel">Hotel / Pousada</option>
                  <option value="restaurant">Restaurante</option>
                  <option value="clinic">Clínica / Hospital</option>
                  <option value="gym">Academia / Spa</option>
                  <option value="other">Outro</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-[#d6b25e]/70 font-medium block mb-1">
                  Volume est. (peças/semana)
                </label>
                <input
                  name="estimated_monthly_value"
                  type="number"
                  min="0"
                  placeholder="ex: 500"
                  className="w-full bg-white/5 border border-white/10 focus:border-[#d6b25e]/60 rounded-lg px-4 py-3 text-white placeholder-white/30 text-sm outline-none transition-colors"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs text-[#d6b25e]/70 font-medium block mb-1">
                  Como nos encontrou?
                </label>
                <select
                  name="how_found"
                  className="w-full bg-[#07070a] border border-white/10 focus:border-[#d6b25e]/60 rounded-lg px-4 py-3 text-white text-sm outline-none transition-colors"
                >
                  <option value="">Selecione...</option>
                  <option value="instagram">Instagram</option>
                  <option value="google">Google</option>
                  <option value="referral">Indicação de amigo/parceiro</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="other">Outro</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl font-semibold text-sm text-[#07070a] bg-gradient-to-r from-[#d6b25e] to-[#f0d080] hover:from-[#c4a050] hover:to-[#e0c060] transition-all mt-2"
            >
              Quero saber mais →
            </button>

            <p className="text-center text-xs text-white/30 mt-2">
              Nossa equipe entrará em contato em até 24h úteis.
            </p>
          </form>
        </div>

        {/* Benefícios */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          {[
            { icon: '⚡', label: 'Sistema completo' },
            { icon: '📊', label: 'Gestão em tempo real' },
            { icon: '💬', label: 'Suporte dedicado' },
          ].map(({ icon, label }) => (
            <div key={label}>
              <p className="text-2xl mb-1">{icon}</p>
              <p className="text-xs text-white/40">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
