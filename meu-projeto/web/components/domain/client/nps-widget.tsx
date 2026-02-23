'use client'

import { useState } from 'react'

const NPS_OPTIONS = [
  { emoji: '😞', score: 1 },
  { emoji: '😐', score: 2 },
  { emoji: '🙂', score: 3 },
  { emoji: '😊', score: 4 },
  { emoji: '🤩', score: 5 },
]

export function NpsWidget({ orderNumber }: { orderNumber: string }) {
  const [selected, setSelected] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)

  if (submitted) {
    return (
      <div className="text-center py-3">
        <p className="text-3xl mb-2">{selected! >= 4 ? '🙏' : '💪'}</p>
        <p className="text-sm font-semibold text-white">
          {selected! >= 4 ? 'Oba! Obrigado pelo feedback!' : 'Anotado! Vamos melhorar.'}
        </p>
        <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.30)' }}>
          Avaliação da comanda #{orderNumber} registrada
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-5 gap-2">
        {NPS_OPTIONS.map((opt) => {
          const isSelected = selected === opt.score
          const isDimmed = selected !== null && !isSelected
          return (
            <button
              key={opt.score}
              onClick={() => setSelected(opt.score)}
              className="rounded-xl flex items-center justify-center"
              style={{
                height: 56,
                fontSize: 24,
                background: isSelected ? 'rgba(52,211,153,0.14)' : 'rgba(255,255,255,0.04)',
                border: isSelected ? '1.5px solid rgba(52,211,153,0.42)' : '1px solid rgba(255,255,255,0.08)',
                opacity: isDimmed ? 0.3 : 1,
                transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {opt.emoji}
            </button>
          )
        })}
      </div>

      <div className="flex justify-between mt-2 px-1">
        <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.22)' }}>Péssimo</span>
        <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.22)' }}>Excelente</span>
      </div>

      {selected !== null && (
        <button
          onClick={() => setSubmitted(true)}
          className="w-full mt-3 rounded-xl font-semibold text-sm"
          style={{
            height: 44,
            background: 'rgba(52,211,153,0.16)',
            color: '#34d399',
            border: '1px solid rgba(52,211,153,0.28)',
            cursor: 'pointer',
            transition: 'all 0.18s ease',
          }}
        >
          Confirmar avaliação
        </button>
      )}
    </div>
  )
}
