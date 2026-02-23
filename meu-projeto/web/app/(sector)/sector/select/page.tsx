import { getUser } from '@/lib/auth/get-user'
import Link from 'next/link'

const SECTORS = [
  {
    key: 'sorting',
    href: '/sector/sorting',
    label: 'Triagem',
    description: 'Separar peças por tipo e cor',
    icon: '🔍',
    color: '#60a5fa',
    bg: 'rgba(96,165,250,0.08)',
    border: 'rgba(96,165,250,0.20)',
    glow: 'rgba(96,165,250,0.12)',
  },
  {
    key: 'washing',
    href: '/sector/washing',
    label: 'Lavagem',
    description: 'Lavagem com fórmulas especiais',
    icon: '🫧',
    color: '#34d399',
    bg: 'rgba(52,211,153,0.08)',
    border: 'rgba(52,211,153,0.20)',
    glow: 'rgba(52,211,153,0.10)',
  },
  {
    key: 'drying',
    href: '/sector/drying',
    label: 'Secagem',
    description: 'Secagem controlada por tecido',
    icon: '💨',
    color: '#fbbf24',
    bg: 'rgba(251,191,36,0.08)',
    border: 'rgba(251,191,36,0.20)',
    glow: 'rgba(251,191,36,0.10)',
  },
  {
    key: 'ironing',
    href: '/sector/ironing',
    label: 'Passadoria',
    description: 'Passar e dobrar as peças',
    icon: '🌡️',
    color: '#a78bfa',
    bg: 'rgba(167,139,250,0.08)',
    border: 'rgba(167,139,250,0.20)',
    glow: 'rgba(167,139,250,0.10)',
  },
  {
    key: 'shipping',
    href: '/sector/shipping',
    label: 'Expedição',
    description: 'Embalar e liberar para entrega',
    icon: '📦',
    color: '#60a5fa',
    bg: 'rgba(59,130,246,0.08)',
    border: 'rgba(59,130,246,0.20)',
    glow: 'rgba(59,130,246,0.10)',
  },
]

export default async function SectorSelectPage() {
  const user = await getUser()
  const firstName = user?.full_name?.split(' ')[0] ?? 'Operador'
  const currentSector = user?.sector ?? null

  return (
    <div className="flex-1 flex flex-col px-4 py-8 max-w-lg mx-auto w-full">

      {/* Header */}
      <div className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.15em] font-semibold mb-2"
          style={{ color: 'rgba(96,165,250,0.45)' }}>
          Bem-vindo, {firstName}
        </p>
        <h1 className="text-2xl font-bold text-white tracking-tight leading-tight">
          Selecione seu setor
        </h1>
        <p className="text-sm mt-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Escolha o setor em que você vai operar agora
        </p>
      </div>

      {/* Grid de setores */}
      <div className="grid grid-cols-1 gap-3">
        {SECTORS.map((sector) => {
          const isCurrent = sector.key === currentSector
          return (
            <Link
              key={sector.key}
              href={sector.href}
              className="group flex items-center gap-4 rounded-2xl px-5 py-4 transition-all active:scale-[0.98]"
              style={{
                background: isCurrent
                  ? sector.bg.replace('0.08', '0.14')
                  : sector.bg,
                border: `1px solid ${isCurrent ? sector.border.replace('0.20', '0.35') : sector.border}`,
                boxShadow: isCurrent ? `0 0 24px ${sector.glow}` : 'none',
                textDecoration: 'none',
              }}
            >
              {/* Ícone */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: sector.bg.replace('0.08', '0.15'),
                  border: `1px solid ${sector.border}`,
                  fontSize: 24,
                }}
              >
                {sector.icon}
              </div>

              {/* Texto */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-white text-base leading-tight">
                    {sector.label}
                  </p>
                  {isCurrent && (
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide"
                      style={{
                        background: `${sector.color}22`,
                        color: sector.color,
                        border: `1px solid ${sector.color}33`,
                      }}
                    >
                      Atual
                    </span>
                  )}
                </div>
                <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.36)' }}>
                  {sector.description}
                </p>
              </div>

              {/* Seta */}
              <div
                className="flex-shrink-0 text-lg transition-transform group-hover:translate-x-0.5"
                style={{ color: `${sector.color}60` }}
              >
                →
              </div>
            </Link>
          )
        })}
      </div>

    </div>
  )
}
