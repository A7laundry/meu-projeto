import Link from 'next/link'

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#07070a] px-4">
      <div
        className="w-full max-w-md rounded-2xl p-8 text-center space-y-6"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto text-3xl"
          style={{
            background: 'rgba(248,113,113,0.10)',
            border: '1px solid rgba(248,113,113,0.22)',
          }}
        >
          🚫
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-white">Acesso Negado</h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Você não tem permissão para acessar esta página.
          </p>
        </div>

        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-xl px-6 py-2.5 text-sm font-semibold transition-all"
          style={{
            background: 'linear-gradient(135deg, #d6b25e 0%, #f0d080 100%)',
            color: '#05050a',
          }}
        >
          Voltar ao Login
        </Link>
      </div>
    </div>
  )
}
