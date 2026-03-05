'use client'

import { useState } from 'react'

interface OrderItem {
  id: string
  piece_type: string
  piece_type_label?: string | null
  quantity: number
}

const PIECE_LABELS: Record<string, string> = {
  clothing: 'Roupa',
  costume: 'Fantasia',
  sneaker: 'Tenis',
  rug: 'Tapete',
  curtain: 'Cortina',
  industrial: 'Industrial',
  other: 'Outro',
}

interface PieceChecklistProps {
  items: OrderItem[]
  accentColor: string
  accentBg: string
  accentBorder: string
  onAllChecked: (allChecked: boolean) => void
}

export function PieceChecklist({
  items,
  accentColor,
  accentBg,
  accentBorder,
  onAllChecked,
}: PieceChecklistProps) {
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  const totalPieces = items.reduce((s, i) => s + i.quantity, 0)
  const checkedPieces = items
    .filter((i) => checked[i.id])
    .reduce((s, i) => s + i.quantity, 0)

  const allDone = checkedPieces === totalPieces

  function toggle(itemId: string) {
    setChecked((prev) => {
      const next = { ...prev, [itemId]: !prev[itemId] }
      const nextCheckedPieces = items
        .filter((i) => next[i.id])
        .reduce((s, i) => s + i.quantity, 0)
      onAllChecked(nextCheckedPieces === totalPieces)
      return next
    })
  }

  return (
    <div>
      {/* Progress bar */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] uppercase tracking-widest text-white/30 font-semibold">
          Conferencia de pecas
        </span>
        <span
          className="text-sm font-bold tabular-nums"
          style={{ color: allDone ? '#34d399' : accentColor }}
        >
          {checkedPieces}/{totalPieces}
        </span>
      </div>

      <div
        className="h-1.5 rounded-full mb-4 overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.06)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${totalPieces > 0 ? (checkedPieces / totalPieces) * 100 : 0}%`,
            background: allDone
              ? '#34d399'
              : `linear-gradient(90deg, ${accentColor}, ${accentColor}88)`,
          }}
        />
      </div>

      {/* Items */}
      <div className="space-y-1.5">
        {items.map((item) => {
          const isChecked = checked[item.id] ?? false
          const label = item.piece_type_label || PIECE_LABELS[item.piece_type] || item.piece_type
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggle(item.id)}
              className="w-full flex items-center justify-between py-3 px-4 rounded-xl transition-all active:scale-[0.98]"
              style={{
                background: isChecked ? accentBg : 'rgba(255,255,255,0.03)',
                border: `1.5px solid ${isChecked ? accentBorder : 'rgba(255,255,255,0.06)'}`,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-sm transition-all"
                  style={{
                    background: isChecked ? accentColor : 'rgba(255,255,255,0.06)',
                    color: isChecked ? '#fff' : 'transparent',
                    border: isChecked ? 'none' : '1.5px solid rgba(255,255,255,0.12)',
                  }}
                >
                  {isChecked ? '\u2713' : ''}
                </div>
                <span
                  className="text-sm font-medium transition-colors"
                  style={{
                    color: isChecked ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.55)',
                    textDecoration: isChecked ? 'line-through' : 'none',
                    textDecorationColor: 'rgba(255,255,255,0.15)',
                  }}
                >
                  {label}
                </span>
              </div>
              <span
                className="text-sm font-bold tabular-nums px-2.5 py-0.5 rounded-lg"
                style={{
                  background: isChecked ? 'rgba(255,255,255,0.08)' : accentBg,
                  color: isChecked ? 'rgba(255,255,255,0.40)' : accentColor,
                }}
              >
                {item.quantity}x
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
