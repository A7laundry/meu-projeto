'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { completeSorting } from '@/actions/production/complete-sorting'
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

interface SortingFormProps {
  order: Order
  unitId: string
  recipes: Recipe[]
  onComplete: () => void
  onCancel: () => void
}

export function SortingForm({ order, unitId, recipes, onComplete, onCancel }: SortingFormProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [selectedRecipes, setSelectedRecipes] = useState<Record<string, string>>({})

  function setRecipe(itemId: string, recipeId: string) {
    setSelectedRecipes((prev) => ({ ...prev, [itemId]: recipeId }))
  }

  function getRecipesForType(pieceType: PieceType): Recipe[] {
    return recipes.filter((r) => r.active && r.piece_type === pieceType)
  }

  function handleSubmit() {
    setError(null)
    const items = (order.items ?? []).map((item) => ({
      itemId: item.id,
      recipeId: selectedRecipes[item.id] ?? null,
    }))

    startTransition(async () => {
      const result = await completeSorting(order.id, unitId, items, notes)
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
          <p className="text-sm text-gray-400">Triagem</p>
          <h2 className="text-2xl font-bold font-mono">{order.order_number}</h2>
          <p className="text-gray-300">{order.client_name}</p>
        </div>
        <button onClick={onCancel} className="text-gray-500 hover:text-white text-sm">
          ← Voltar
        </button>
      </div>

      {/* Itens */}
      <div className="flex-1 overflow-auto p-6 space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
          Itens para classificar
        </h3>
        {(order.items ?? []).map((item) => {
          const availableRecipes = getRecipesForType(item.piece_type)
          return (
            <div key={item.id} className="bg-gray-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-white">
                  {item.quantity}×{' '}
                  {item.piece_type === 'other'
                    ? (item.piece_type_label ?? 'Outro')
                    : PIECE_LABEL[item.piece_type]}
                </span>
                {item.notes && (
                  <span className="text-xs text-amber-400 bg-amber-400/10 px-2 py-1 rounded">
                    {item.notes}
                  </span>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">
                  Receita de lavagem
                  {availableRecipes.length === 0 && (
                    <span className="text-gray-600 ml-1">(sem receitas cadastradas para este tipo)</span>
                  )}
                </label>
                <select
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
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

        <div>
          <label className="text-sm text-gray-400 mb-1 block">Observações da triagem</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-emerald-500 resize-none"
            rows={2}
            placeholder="Manchas, danos, instruções especiais..."
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
          className="w-full h-14 text-lg bg-emerald-600 hover:bg-emerald-500 text-white"
        >
          {isPending ? 'Registrando...' : '✓ Concluir Triagem → Lavagem'}
        </Button>
      </div>
    </div>
  )
}
