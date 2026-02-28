'use client'

export default function UsersError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="p-6 max-w-lg mx-auto mt-20 text-center space-y-4">
      <div className="text-4xl">⚠️</div>
      <h2 className="text-xl font-bold text-white">Erro ao carregar usuários</h2>
      <p className="text-sm text-white/50">
        {error.message || 'Ocorreu um erro inesperado.'}
      </p>
      {error.digest && (
        <p className="text-xs text-white/25 font-mono">Digest: {error.digest}</p>
      )}
      <button
        onClick={reset}
        className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#60a5fa] text-black hover:bg-[#e8cc7e] transition-colors"
      >
        Tentar novamente
      </button>
    </div>
  )
}
