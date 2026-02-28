'use client'

import Link from 'next/link'
import { ScanBarcode, ClipboardList, Truck } from 'lucide-react'

export function StoreQuickActions() {
  const actions = [
    { href: '/store/pdv', label: 'Nova Comanda', icon: ScanBarcode, desc: 'Criar pedido' },
    { href: '/store/comandas', label: 'Ver Comandas', icon: ClipboardList, desc: 'Acompanhar' },
    { href: '/store/coletas', label: 'Coletas Hoje', icon: Truck, desc: 'Romaneios' },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {actions.map(({ href, label, icon: Icon, desc }) => (
        <Link
          key={href}
          href={href}
          className="rounded-xl p-4 flex flex-col items-center gap-2 text-center transition-all group"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(52,211,153,0.06)'
            e.currentTarget.style.borderColor = 'rgba(52,211,153,0.15)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
          }}
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(52,211,153,0.10)' }}
          >
            <Icon size={18} style={{ color: '#34d399' }} />
          </div>
          <p className="text-xs font-semibold text-white/80">{label}</p>
          <p className="text-[10px] text-white/30">{desc}</p>
        </Link>
      ))}
    </div>
  )
}
