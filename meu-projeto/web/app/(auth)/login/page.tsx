import { login } from './actions'
import { Input } from '@/components/ui/input'

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#07070a] px-6 py-12 relative">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-[-20%] left-[30%] w-[500px] h-[500px] rounded-full bg-[#d6b25e]/4 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[20%] w-[400px] h-[400px] rounded-full bg-[#d6b25e]/3 blur-[100px]" />
      </div>

      {/* Logo */}
      <div className="text-center mb-8 relative z-10">
        <span className="text-3xl font-black tracking-tight gold-text">A7x</span>
        <p className="text-xs text-[#d6b25e]/50 font-medium mt-1">TecNologia - OS.</p>
      </div>

      {/* Card */}
      <div className="glass rounded-2xl p-8 w-full max-w-sm border border-[#d6b25e]/20 relative z-10">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white">Bem-vindo</h2>
          <p className="text-sm text-white/40 mt-1">Acesse sua area de trabalho</p>
        </div>

        <LoginForm searchParams={searchParams} />
      </div>

      {/* Features grid */}
      <div className="grid grid-cols-2 gap-4 mt-8 max-w-sm w-full relative z-10">
        {[
          { icon: '◈', label: 'Dashboard em tempo real' },
          { icon: '⊞', label: 'Gestao multi-unidade' },
          { icon: '◎', label: 'NPS e satisfacao' },
          { icon: '⊟', label: 'Relatorios completos' },
        ].map(({ icon, label }) => (
          <div key={label} className="flex items-center gap-2 text-xs text-white/30">
            <span className="text-[#d6b25e]/40">{icon}</span>
            {label}
          </div>
        ))}
      </div>

      {/* Footer */}
      <p className="text-center text-[10px] text-white/20 mt-8 relative z-10">
        A7x TecNologia · Sistema Operacional Inteligente
      </p>
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
