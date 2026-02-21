import Link from 'next/link'

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-obsidian px-4">
      <div className="w-full max-w-md glass rounded-2xl p-8 text-center">
        <div className="text-4xl mb-4">⚠</div>
        <h1 className="text-2xl font-bold text-white mb-2">Acesso Negado</h1>
        <p className="text-white/50 mb-6">
          Você não tem permissão para acessar esta página.
        </p>
        <Link
          href="/login"
          className="btn-gold inline-flex items-center justify-center rounded-lg px-6 py-2.5 text-sm font-semibold"
        >
          Voltar ao Login
        </Link>
      </div>
    </div>
  )
}
