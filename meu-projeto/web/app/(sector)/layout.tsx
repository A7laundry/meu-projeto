import { getUser } from '@/lib/auth/get-user'
import { logout } from '@/app/(auth)/login/actions'

const SECTOR_LABELS: Record<string, string> = {
  sorting: 'Triagem',
  washing: 'Lavagem',
  drying: 'Secagem',
  ironing: 'Passadoria',
  shipping: 'Expedição',
}

const SECTOR_ICONS: Record<string, string> = {
  sorting: '⊟',
  washing: '◎',
  drying: '◉',
  ironing: '◈',
  shipping: '⊕',
}

const SECTOR_COLORS: Record<string, string> = {
  sorting:  'rgba(96,165,250,0.18)',
  washing:  'rgba(52,211,153,0.18)',
  drying:   'rgba(251,191,36,0.18)',
  ironing:  'rgba(167,139,250,0.18)',
  shipping: 'rgba(59,130,246,0.18)',
}

const SECTOR_TEXT: Record<string, string> = {
  sorting:  '#60a5fa',
  washing:  '#34d399',
  drying:   '#fbbf24',
  ironing:  '#a78bfa',
  shipping: '#60a5fa',
}

export default async function SectorLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()
  const sector = user?.sector ?? ''
  const sectorLabel = SECTOR_LABELS[sector] ?? 'Setor'
  const sectorIcon = SECTOR_ICONS[sector] ?? '◈'
  const sectorBg = SECTOR_COLORS[sector] ?? 'rgba(214,178,94,0.12)'
  const sectorText = SECTOR_TEXT[sector] ?? '#d6b25e'
  const initial = user?.full_name?.charAt(0).toUpperCase() ?? '?'

  return (
    <div
      className="min-h-screen flex flex-col text-white overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #071020 0%, #0d1b2e 100%)' }}
    >
      {/* Blue top border line */}
      <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.55), transparent)' }} />

      {/* Header premium do operador */}
      <header
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{
          background: 'rgba(7,16,32,0.94)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(59,130,246,0.10)',
          boxShadow: '0 1px 0 rgba(59,130,246,0.04), 0 4px 20px rgba(0,0,0,0.4)',
        }}
      >
        {/* Left — logo + setor */}
        <div className="flex items-center gap-3">
          {/* Logo A7x */}
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, rgba(59,130,246,0.20) 0%, rgba(37,99,235,0.10) 100%)',
              border: '1px solid rgba(59,130,246,0.30)',
            }}
          >
            <span className="text-xs font-black leading-none" style={{ color: '#d6b25e' }}>A</span>
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 20, background: 'rgba(59,130,246,0.15)' }} />

          {/* Sector badge */}
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
              style={{ background: sectorBg, border: `1px solid ${sectorText}30` }}
            >
              <span className="text-sm leading-none" style={{ color: sectorText }}>{sectorIcon}</span>
            </div>
            <div>
              <p className="text-xs font-semibold leading-none" style={{ color: sectorText }}>{sectorLabel}</p>
              <p className="text-[9px] text-white/30 mt-0.5 uppercase tracking-widest leading-none">Setor</p>
            </div>
          </div>
        </div>

        {/* Right — operador + sair */}
        <div className="flex items-center gap-3">
          {/* Badge ao vivo */}
          <span className="badge-live hidden sm:flex">Ao vivo</span>

          {/* Operador */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-medium leading-none text-white/75">{user?.full_name ?? 'Operador'}</p>
              <p className="text-[9px] text-white/30 mt-0.5 uppercase tracking-widest leading-none">Operador</p>
            </div>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: `${sectorBg}`,
                border: `1.5px solid ${sectorText}50`,
              }}
            >
              <span className="text-xs font-bold leading-none" style={{ color: sectorText }}>{initial}</span>
            </div>
          </div>

          <form action={logout}>
            <button
              type="submit"
              className="text-[11px] text-white/30 hover:text-white/65 transition-colors rounded-md px-2.5 py-1.5"
              style={{ border: '1px solid rgba(59,130,246,0.10)' }}
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
