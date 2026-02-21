'use client'

import { useState, useTransition } from 'react'
import { completeSector, type SectorCompletionData } from '@/actions/production/complete-sector'
import type { Order } from '@/types/order'

const SECTOR_CONFIG = {
  washing: {
    label: 'Lavagem',
    nextLabel: 'Secagem',
    accentColor: '#60a5fa',
    accentBg: 'rgba(96,165,250,0.14)',
    accentBorder: 'rgba(96,165,250,0.28)',
  },
  drying: {
    label: 'Secagem',
    nextLabel: 'Passadoria',
    accentColor: '#fbbf24',
    accentBg: 'rgba(251,191,36,0.12)',
    accentBorder: 'rgba(251,191,36,0.25)',
  },
  ironing: {
    label: 'Passadoria',
    nextLabel: 'Pronto',
    accentColor: '#a78bfa',
    accentBg: 'rgba(167,139,250,0.12)',
    accentBorder: 'rgba(167,139,250,0.25)',
  },
  shipping: {
    label: 'Expedição',
    nextLabel: 'Enviado',
    accentColor: '#34d399',
    accentBg: 'rgba(52,211,153,0.12)',
    accentBorder: 'rgba(52,211,153,0.25)',
  },
} as const

type SectorKey = keyof typeof SECTOR_CONFIG

interface GenericSectorFormProps {
  order: Order
  unitId: string
  sectorKey: SectorKey
  onComplete: () => void
  onCancel: () => void
}

export function GenericSectorForm({
  order,
  unitId,
  sectorKey,
  onComplete,
  onCancel,
}: GenericSectorFormProps) {
  const config = SECTOR_CONFIG[sectorKey]
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [notes, setNotes] = useState('')

  const [cycles, setCycles] = useState(1)
  const [weightKg, setWeightKg] = useState('')
  const [tempLevel, setTempLevel] = useState<'low' | 'medium' | 'high'>('medium')
  const [packagingType, setPackagingType] = useState<'bag' | 'box' | 'hanger' | 'other'>('bag')
  const [packagingQty, setPackagingQty] = useState(1)

  const totalPieces = order.items?.reduce((s, i) => s + i.quantity, 0) ?? 0

  function handleSubmit() {
    setError(null)
    const data: SectorCompletionData = {
      sectorKey,
      orderId: order.id,
      unitId,
      notes: notes || undefined,
      ...(sectorKey === 'washing' && {
        cycles,
        weightKg: weightKg ? parseFloat(weightKg) : undefined,
      }),
      ...(sectorKey === 'drying' && { temperatureLevel: tempLevel }),
      ...(sectorKey === 'ironing' && {
        piecesByType: order.items?.map((i) => ({ piece_type: i.piece_type, quantity: i.quantity })),
      }),
      ...(sectorKey === 'shipping' && {
        packagingType,
        packagingQuantity: packagingQty,
      }),
    }
    startTransition(async () => {
      const result = await completeSector(data)
      if (result.success) onComplete()
      else setError(result.error)
    })
  }

  const inputStyle = {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: 10,
    color: 'white',
    padding: '12px 14px',
    fontSize: 16,
    width: '100%',
    outline: 'none',
  }

  const cardStyle = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 14,
    padding: '18px',
  }

  return (
    <div
      className="flex flex-col h-full text-white"
      style={{ background: 'linear-gradient(180deg, #060609 0%, #07070a 100%)' }}
    >
      {/* Header */}
      <div
        className="px-5 py-4 flex items-center justify-between flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div>
          <p className="text-[10px] uppercase tracking-widest font-semibold mb-0.5" style={{ color: config.accentColor }}>
            {config.label}
          </p>
          <h2 className="text-2xl font-black font-mono tracking-tight" style={{ color: '#d6b25e' }}>
            {order.order_number}
          </h2>
          <p className="text-sm text-white/55 mt-0.5">
            {order.client_name} · {totalPieces} peça{totalPieces !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={onCancel}
          className="text-sm text-white/30 hover:text-white/65 transition-colors flex items-center gap-1"
        >
          ← Voltar
        </button>
      </div>

      {/* Campos */}
      <div className="flex-1 overflow-auto p-5 space-y-4">
        {sectorKey === 'washing' && (
          <div style={cardStyle}>
            <p className="text-[10px] uppercase tracking-widest text-white/30 font-semibold mb-4">Dados da Lavagem</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/40 block mb-1.5">Ciclos realizados</label>
                <input
                  type="number" min={1} value={cycles}
                  onChange={(e) => setCycles(Number(e.target.value))}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="text-xs text-white/40 block mb-1.5">Peso (kg)</label>
                <input
                  type="number" step="0.1" min={0} value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  placeholder="Opcional"
                  style={inputStyle}
                />
              </div>
            </div>
          </div>
        )}

        {sectorKey === 'drying' && (
          <div style={cardStyle}>
            <p className="text-[10px] uppercase tracking-widest text-white/30 font-semibold mb-4">Temperatura de Secagem</p>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'medium', 'high'] as const).map((level) => (
                <button
                  key={level} type="button"
                  onClick={() => setTempLevel(level)}
                  className="py-4 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: tempLevel === level ? config.accentBg : 'rgba(255,255,255,0.04)',
                    border: `2px solid ${tempLevel === level ? config.accentBorder : 'rgba(255,255,255,0.08)'}`,
                    color: tempLevel === level ? config.accentColor : 'rgba(255,255,255,0.40)',
                  }}
                >
                  {level === 'low' ? '🌡️ Baixa' : level === 'medium' ? '🌡️ Média' : '🌡️ Alta'}
                </button>
              ))}
            </div>
          </div>
        )}

        {sectorKey === 'ironing' && (
          <div style={cardStyle}>
            <p className="text-[10px] uppercase tracking-widest text-white/30 font-semibold mb-3">Itens Passados</p>
            <div className="space-y-2">
              {order.items?.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center py-2"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <span className="text-sm text-white/55">{item.piece_type}</span>
                  <span
                    className="text-sm font-bold px-2.5 py-0.5 rounded-lg"
                    style={{ background: config.accentBg, color: config.accentColor }}
                  >
                    {item.quantity}×
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {sectorKey === 'shipping' && (
          <div style={cardStyle} className="space-y-4">
            <p className="text-[10px] uppercase tracking-widest text-white/30 font-semibold">Embalagem</p>
            <div className="grid grid-cols-2 gap-2">
              {(['bag', 'box', 'hanger', 'other'] as const).map((type) => {
                const labels = { bag: '🛍️ Sacola', box: '📦 Caixa', hanger: '👗 Cabide', other: '📦 Outro' }
                return (
                  <button
                    key={type} type="button"
                    onClick={() => setPackagingType(type)}
                    className="py-4 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      background: packagingType === type ? config.accentBg : 'rgba(255,255,255,0.04)',
                      border: `2px solid ${packagingType === type ? config.accentBorder : 'rgba(255,255,255,0.08)'}`,
                      color: packagingType === type ? config.accentColor : 'rgba(255,255,255,0.40)',
                    }}
                  >
                    {labels[type]}
                  </button>
                )
              })}
            </div>
            <div>
              <label className="text-xs text-white/40 block mb-1.5">Quantidade de embalagens</label>
              <input
                type="number" min={1} value={packagingQty}
                onChange={(e) => setPackagingQty(Number(e.target.value))}
                style={inputStyle}
              />
            </div>
          </div>
        )}

        {/* Observações */}
        <div>
          <label className="text-xs text-white/35 mb-1.5 block uppercase tracking-wide">Observações</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={{ ...inputStyle, resize: 'none', fontSize: 14 }}
            rows={2}
            placeholder="Observações opcionais..."
          />
        </div>
      </div>

      {/* Footer */}
      <div
        className="px-5 py-4 space-y-3 flex-shrink-0"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        {error && (
          <p
            className="text-sm rounded-xl px-4 py-2.5"
            style={{ background: 'rgba(248,113,113,0.10)', color: '#fca5a5', border: '1px solid rgba(248,113,113,0.22)' }}
          >
            {error}
          </p>
        )}
        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="w-full h-14 text-base font-bold rounded-xl transition-all disabled:opacity-50"
          style={{
            background: isPending
              ? 'rgba(255,255,255,0.08)'
              : `linear-gradient(135deg, ${config.accentColor} 0%, ${config.accentColor}bb 100%)`,
            color: sectorKey === 'drying' ? '#07070a' : 'white',
            border: `1px solid ${config.accentBorder}`,
            boxShadow: isPending ? 'none' : `0 0 20px ${config.accentBg}`,
          }}
        >
          {isPending ? 'Registrando...' : `✓ Concluir ${config.label} → ${config.nextLabel}`}
        </button>
      </div>
    </div>
  )
}
