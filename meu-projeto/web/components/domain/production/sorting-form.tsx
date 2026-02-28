'use client'

import { useState, useTransition } from 'react'
import { completeSorting } from '@/actions/production/complete-sorting'
import { uploadOrderPhotos } from '@/actions/orders/photos'
import { PhotoCapture } from '@/components/ui/photo-capture'
import type { Order, PieceType } from '@/types/order'
import type { Recipe } from '@/types/recipe'

const PIECE_LABEL: Record<PieceType, string> = {
  clothing: 'Roupa comum',
  costume: 'Fantasia',
  sneaker: 'Tênis',
  rug: 'Tapete',
  curtain: 'Cortina',
  industrial: 'Industrial',
  other: 'Outro',
}

const ALL_PIECE_TYPES: PieceType[] = [
  'clothing', 'costume', 'sneaker', 'rug', 'curtain', 'industrial', 'other',
]

interface SortingFormProps {
  order: Order
  unitId: string
  recipes: Recipe[]
  onComplete: () => void
  onCancel: () => void
}

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 14,
  padding: '18px',
}

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: 10,
  color: 'white',
  padding: '10px 12px',
  fontSize: 14,
  width: '100%',
  outline: 'none',
}

export function SortingForm({ order, unitId, recipes, onComplete, onCancel }: SortingFormProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [selectedRecipes, setSelectedRecipes] = useState<Record<string, string>>({})

  // Quantities editáveis por item (inicializado dos items da comanda)
  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {}
    for (const item of order.items ?? []) {
      init[item.id] = item.quantity
    }
    return init
  })

  // Fotos de evidencia
  const [photos, setPhotos] = useState<File[]>([])

  // Itens extras adicionados pelo operador
  const [extraItems, setExtraItems] = useState<Array<{ piece_type: PieceType; quantity: number }>>([])
  const [showAddPiece, setShowAddPiece] = useState(false)
  const [newPieceType, setNewPieceType] = useState<PieceType>('clothing')
  const [newPieceQty, setNewPieceQty] = useState(1)

  function setRecipe(itemId: string, recipeId: string) {
    setSelectedRecipes((prev) => ({ ...prev, [itemId]: recipeId }))
  }

  function adjustQty(itemId: string, delta: number) {
    setQuantities((prev) => ({ ...prev, [itemId]: Math.max(1, (prev[itemId] ?? 1) + delta) }))
  }

  function getRecipesForType(pieceType: PieceType): Recipe[] {
    return recipes.filter((r) => r.active && r.piece_type === pieceType)
  }

  function addExtraItem() {
    setExtraItems((prev) => [...prev, { piece_type: newPieceType, quantity: newPieceQty }])
    setNewPieceQty(1)
    setShowAddPiece(false)
  }

  function removeExtraItem(idx: number) {
    setExtraItems((prev) => prev.filter((_, i) => i !== idx))
  }

  function handleSubmit() {
    setError(null)
    const items = (order.items ?? []).map((item) => ({
      itemId: item.id,
      recipeId: selectedRecipes[item.id] ?? null,
      quantity: quantities[item.id] ?? item.quantity,
    }))

    startTransition(async () => {
      const result = await completeSorting(order.id, unitId, items, notes, extraItems)
      if (result.success) {
        // Upload fotos de evidencia apos triagem concluida
        if (photos.length > 0) {
          const formData = new FormData()
          for (const photo of photos) {
            formData.append('photos', photo)
          }
          await uploadOrderPhotos(order.id, formData)
        }
        onComplete()
      } else {
        setError(result.error)
      }
    })
  }

  const totalPieces = (order.items ?? []).reduce((s, i) => s + (quantities[i.id] ?? i.quantity), 0)
    + extraItems.reduce((s, e) => s + e.quantity, 0)

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
          <p className="text-[10px] uppercase tracking-widest font-semibold mb-0.5" style={{ color: '#34d399' }}>
            Triagem
          </p>
          <h2 className="text-2xl font-black font-mono tracking-tight text-white">
            {order.order_number}
          </h2>
          <p className="text-sm text-white/55 mt-0.5">
            {order.client_name} · {totalPieces} peça{totalPieces !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={onCancel}
          className="text-sm text-white/30 hover:text-white/65 transition-colors"
        >
          ← Voltar
        </button>
      </div>

      {/* Itens */}
      <div className="flex-1 overflow-auto p-5 space-y-4">
        <h3
          className="text-[10px] uppercase tracking-widest font-semibold"
          style={{ color: 'rgba(255,255,255,0.30)' }}
        >
          Itens para classificar
        </h3>

        {/* Itens da comanda */}
        {(order.items ?? []).map((item) => {
          const availableRecipes = getRecipesForType(item.piece_type)
          const qty = quantities[item.id] ?? item.quantity
          return (
            <div key={item.id} style={cardStyle} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-white">
                  {item.piece_type === 'other'
                    ? (item.piece_type_label ?? 'Outro')
                    : PIECE_LABEL[item.piece_type]}
                </span>
                {item.notes && (
                  <span
                    className="text-xs px-2 py-1 rounded"
                    style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24' }}
                  >
                    {item.notes}
                  </span>
                )}
              </div>

              {/* Quantidade editável */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-white/40">Qtd:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => adjustQty(item.id, -1)}
                    className="w-8 h-8 rounded-lg text-white/60 hover:text-white text-lg font-bold transition-colors"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
                  >
                    −
                  </button>
                  <span className="text-base font-bold text-white w-6 text-center">{qty}</span>
                  <button
                    type="button"
                    onClick={() => adjustQty(item.id, 1)}
                    className="w-8 h-8 rounded-lg text-white/60 hover:text-white text-lg font-bold transition-colors"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Receita */}
              <div>
                <label className="text-xs text-white/40 mb-1 block">
                  Receita de lavagem
                  {availableRecipes.length === 0 && (
                    <span className="text-white/20 ml-1">(sem receitas para este tipo)</span>
                  )}
                </label>
                <select
                  style={inputStyle}
                  value={selectedRecipes[item.id] ?? ''}
                  onChange={(e) => setRecipe(item.id, e.target.value)}
                >
                  <option value="">Sem receita</option>
                  {availableRecipes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                      {r.temperature_celsius ? ` — ${r.temperature_celsius}°C` : ''}
                      {r.duration_minutes ? ` · ${r.duration_minutes}min` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )
        })}

        {/* Itens extras adicionados */}
        {extraItems.map((extra, idx) => (
          <div key={idx} style={{ ...cardStyle, borderColor: 'rgba(52,211,153,0.18)' }} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white">
                {extra.quantity}× {PIECE_LABEL[extra.piece_type]}
                <span className="ml-2 text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(52,211,153,0.12)', color: '#34d399' }}>
                  + adicionado
                </span>
              </span>
              <button
                type="button"
                onClick={() => removeExtraItem(idx)}
                className="text-xs text-white/30 hover:text-red-400 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        ))}

        {/* Adicionar peça */}
        {showAddPiece ? (
          <div style={{ ...cardStyle, borderColor: 'rgba(52,211,153,0.20)' }} className="space-y-3">
            <p className="text-[10px] uppercase tracking-widest text-white/30 font-semibold">Nova peça</p>
            <div>
              <label className="text-xs text-white/40 block mb-1">Tipo</label>
              <select
                style={inputStyle}
                value={newPieceType}
                onChange={(e) => setNewPieceType(e.target.value as PieceType)}
              >
                {ALL_PIECE_TYPES.map((pt) => (
                  <option key={pt} value={pt}>{PIECE_LABEL[pt]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-white/40 block mb-1">Quantidade</label>
              <input
                type="number"
                min={1}
                value={newPieceQty}
                onChange={(e) => setNewPieceQty(Math.max(1, Number(e.target.value)))}
                style={inputStyle}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={addExtraItem}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: 'rgba(52,211,153,0.14)',
                  border: '1px solid rgba(52,211,153,0.28)',
                  color: '#34d399',
                }}
              >
                ✓ Adicionar
              </button>
              <button
                type="button"
                onClick={() => setShowAddPiece(false)}
                className="py-2.5 px-4 rounded-xl text-sm text-white/30 hover:text-white/60 transition-colors"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowAddPiece(true)}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: 'rgba(52,211,153,0.06)',
              border: '1px dashed rgba(52,211,153,0.20)',
              color: 'rgba(52,211,153,0.60)',
            }}
          >
            + Adicionar Peça
          </button>
        )}

        {/* Observações */}
        <div>
          <label className="text-xs text-white/35 mb-1.5 block uppercase tracking-wide">
            Observações da triagem
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={{ ...inputStyle, resize: 'none' }}
            rows={2}
            placeholder="Manchas, danos, instruções especiais..."
          />
        </div>

        {/* Evidências fotográficas */}
        <PhotoCapture
          photos={photos}
          onPhotosChange={setPhotos}
          maxPhotos={5}
          label="Evidências fotográficas"
        />
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
              : 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
            color: '#07070a',
            border: '1px solid rgba(52,211,153,0.40)',
            boxShadow: isPending ? 'none' : '0 0 24px rgba(52,211,153,0.16)',
          }}
        >
          {isPending ? 'Registrando...' : '✓ Concluir Triagem → Lavagem'}
        </button>
      </div>
    </div>
  )
}
