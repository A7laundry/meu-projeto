import { logout } from '@/app/(auth)/login/actions'
import { NetworkIndicator } from '@/components/layout/network-indicator'

interface SectorHeaderProps {
  sectorName: string
  operatorName?: string
}

export function SectorHeader({ sectorName, operatorName }: SectorHeaderProps) {
  return (
    <header className="bg-gray-900 border-b border-gray-700 px-6 py-3 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-4">
        <span className="text-xs text-gray-500 font-medium uppercase tracking-widest">A7x OS</span>
        <span className="text-gray-600">|</span>
        <h1 className="text-lg font-bold text-white">{sectorName}</h1>
        {operatorName && (
          <span className="text-sm text-gray-400">{operatorName}</span>
        )}
      </div>
      <div className="flex items-center gap-6">
        <NetworkIndicator />
        <form action={logout}>
          <button
            type="submit"
            className="text-sm text-gray-400 hover:text-white transition-colors min-h-[48px] px-3"
          >
            Sair
          </button>
        </form>
      </div>
    </header>
  )
}
