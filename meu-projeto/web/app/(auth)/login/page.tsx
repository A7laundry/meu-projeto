import { login } from './actions'
import { Input } from '@/components/ui/input'

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  return (
    <div className="min-h-screen flex bg-[#07070a]">
      {/* Painel esquerdo — branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#d6b25e]/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#d6b25e]/5 blur-3xl pointer-events-none" />

        {/* Logo */}
        <div>
          <span className="text-3xl font-black tracking-tight gold-text">A7x</span>
          <span className="ml-2 text-sm text-[#d6b25e]/50 font-medium">TecNologia</span>
        </div>

        {/* Headline */}
        <div>
          <h1 className="text-4xl font-black text-white leading-tight mb-4">
            Sistema Operacional<br />
            <span className="gold-text">Inteligente</span>
          </h1>
          <p className="text-white/40 text-base leading-relaxed max-w-sm">
            Controle total da sua operação de lavanderia industrial.
            Do chão de fábrica ao painel executivo.
          </p>

          <div className="mt-10 space-y-3">
            {[
              { icon: '◈', label: 'Dashboard executivo em tempo real' },
              { icon: '⊞', label: 'Gestão multi-unidade centralizada' },
              { icon: '◎', label: 'NPS e satisfação dos clientes' },
              { icon: '⊟', label: 'Relatórios financeiros completos' },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-3 text-sm text-white/50">
                <span className="text-[#d6b25e]/60">{icon}</span>
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-[10px] text-white/20 tracking-widest uppercase">
          A7x TecNologia — OS. · v1.0
        </p>
      </div>

      {/* Painel direito — formulário */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="text-center mb-8 lg:hidden">
            <span className="text-2xl font-black gold-text">A7x</span>
            <p className="text-xs text-white/40 mt-1">TecNologia - OS.</p>
          </div>

          {/* Card */}
          <div className="glass rounded-2xl p-8 border border-[#d6b25e]/20">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white">Bem-vindo</h2>
              <p className="text-sm text-white/40 mt-1">Acesse sua área de trabalho</p>
            </div>

            <LoginForm searchParams={searchParams} />
          </div>

          <p className="text-center text-xs text-white/20 mt-6">
            A7x TecNologia · Sistema Operacional Inteligente
          </p>
        </div>
      </div>
    </div>
  )
}

async function LoginForm({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  const params = await searchParams

  return (
    <form action={login} className="space-y-5">
      {params?.error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
          {params.error}
        </div>
      )}
      {params?.message && (
        <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3 text-sm text-blue-400">
          {params.message}
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="email" className="text-xs font-medium text-white/60 uppercase tracking-wide">
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="seu@email.com"
          required
          autoComplete="email"
          className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#d6b25e]/50 focus:ring-[#d6b25e]/20"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-xs font-medium text-white/60 uppercase tracking-wide">
          Senha
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          autoComplete="current-password"
          className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#d6b25e]/50 focus:ring-[#d6b25e]/20"
        />
      </div>

      <button
        type="submit"
        className="btn-gold w-full rounded-lg py-2.5 text-sm font-semibold mt-2"
      >
        Entrar no Sistema
      </button>
    </form>
  )
}
