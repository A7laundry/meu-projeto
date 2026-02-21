import { getUser } from '@/lib/auth/get-user'
import { logout } from '@/app/(auth)/login/actions'

const SECTOR_LABELS: Record<string, string> = {
  sorting: 'Triagem',
  washing: 'Lavagem',
  drying: 'Secagem',
  ironing: 'Passadoria',
  shipping: 'Expedição',
}

export default async function SectorLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()
  const sectorLabel = user?.sector ? (SECTOR_LABELS[user.sector] ?? user.sector) : 'Setor'

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white overflow-hidden">
      {/* Header do operador */}
      <header className="flex items-center justify-between px-4 py-2.5 bg-gray-900 border-b border-gray-800 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-blue-600/30 border border-blue-500/40 flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] font-bold text-blue-400">
              {user?.full_name?.charAt(0).toUpperCase() ?? '?'}
            </span>
          </div>
          <div>
            <p className="text-xs font-medium text-white leading-none">
              {user?.full_name ?? 'Operador'}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5 leading-none">{sectorLabel}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">
            A7x OS
          </span>
          <form action={logout}>
            <button
              type="submit"
              className="text-[10px] text-gray-500 hover:text-gray-300 border border-gray-700 hover:border-gray-500 rounded px-2 py-1 transition-colors"
            >
              Sair
            </button>
          </form>
        </div>
      </header>

      {children}
    </div>
  )
}
