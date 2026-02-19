'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { completeSector, type SectorCompletionData } from '@/actions/production/complete-sector'
import type { Order } from '@/types/order'

const SECTOR_CONFIG = {
  washing: {
    label: 'Lavagem',
    nextLabel: 'Secagem',
    color: 'bg-blue-600 hover:bg-blue-500',
  },
  drying: {
    label: 'Secagem',
    nextLabel: 'Passadoria',
    color: 'bg-orange-600 hover:bg-orange-500',
  },
  ironing: {
    label: 'Passadoria',
    nextLabel: 'Pronto',
    color: 'bg-purple-600 hover:bg-purple-500',
  },
  shipping: {
    label: 'Expedição',
    nextLabel: 'Enviado',
    color: 'bg-emerald-600 hover:bg-emerald-500',
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

  // Washing fields
  const [cycles, setCycles] = useState(1)
  const [weightKg, setWeightKg] = useState('')

  // Drying fields
  const [tempLevel, setTempLevel] = useState<'low' | 'medium' | 'high'>('medium')

  // Ironing fields — automatic from order items
  // Shipping fields
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
      ...(sectorKey === 'drying' && {
        temperatureLevel: tempLevel,
      }),
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
      if (result.success) {
        onComplete()
      } else {
        setError(result.error)
      }
    })
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">{config.label}</p>
          <h2 className="text-2xl font-bold font-mono">{order.order_number}</h2>
          <p className="text-gray-300">{order.client_name} — {totalPieces} peças</p>
        </div>
        <button onClick={onCancel} className="text-gray-500 hover:text-white text-sm">
          ← Voltar
        </button>
      </div>

      {/* Campos específicos por setor */}
      <div className="flex-1 overflow-auto p-6 space-y-4">
        {sectorKey === 'washing' && (
          <>
            <div className="bg-gray-800 rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Dados da Lavagem</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Ciclos realizados</label>
                  <input
                    type="number"
                    min={1}
                    value={cycles}
                    onChange={(e) => setCycles(Number(e.target.value))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-3 text-white text-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Peso processado (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min={0}
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    placeholder="Opcional"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-3 text-white text-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {sectorKey === 'drying' && (
          <div className="bg-gray-800 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Temperatura</h3>
            <div className="grid grid-cols-3 gap-3">
              {(['low', 'medium', 'high'] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setTempLevel(level)}
                  className={`py-4 rounded-xl text-sm font-semibold border-2 transition-all ${
                    tempLevel === level
                      ? 'border-orange-500 bg-orange-500/20 text-white'
                      : 'border-gray-700 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  {level === 'low' ? '🌡️ Baixa' : level === 'medium' ? '🌡️🌡️ Média' : '🌡️🌡️🌡️ Alta'}
                </button>
              ))}
            </div>
          </div>
        )}

        {sectorKey === 'ironing' && (
          <div className="bg-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400 mb-3">Itens Passados</h3>
            <div className="space-y-2">
              {order.items?.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-sm py-2 border-b border-gray-700">
                  <span className="text-gray-300">{item.piece_type}</span>
                  <span className="text-white font-semibold">{item.quantity}×</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {sectorKey === 'shipping' && (
          <div className="bg-gray-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Embalagem</h3>
            <div className="grid grid-cols-2 gap-3">
              {(['bag', 'box', 'hanger', 'other'] as const).map((type) => {
                const labels = { bag: '🛍️ Sacola', box: '📦 Caixa', hanger: '👗 Cabide', other: '📦 Outro' }
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setPackagingType(type)}
                    className={`py-4 rounded-xl text-sm font-semibold border-2 transition-all ${
                      packagingType === type
                        ? 'border-emerald-500 bg-emerald-500/20 text-white'
                        : 'border-gray-700 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    {labels[type]}
                  </button>
                )
              })}
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Quantidade de embalagens</label>
              <input
                type="number"
                min={1}
                value={packagingQty}
                onChange={(e) => setPackagingQty(Number(e.target.value))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-3 text-white text-lg focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        )}

        <div>
          <label className="text-sm text-gray-400 mb-1 block">Observações</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-gray-500 resize-none"
            rows={2}
            placeholder="Observações opcionais..."
          />
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-700 space-y-3">
        {error && (
          <p className="text-sm text-red-400 bg-red-400/10 rounded-lg px-3 py-2">{error}</p>
        )}
        <Button
          onClick={handleSubmit}
          disabled={isPending}
          className={`w-full h-14 text-lg text-white ${config.color}`}
        >
          {isPending ? 'Registrando...' : `✓ Concluir ${config.label} → ${config.nextLabel}`}
        </Button>
      </div>
    </div>
  )
}
