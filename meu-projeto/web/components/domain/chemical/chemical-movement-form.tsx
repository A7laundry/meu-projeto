'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { registerMovement } from '@/actions/chemicals/movements'
import { MEASURE_UNIT_LABELS, type ChemicalProduct } from '@/types/chemical'

interface ChemicalMovementFormProps {
  product: ChemicalProduct
  unitId: string
  onSuccess?: () => void
}

export function ChemicalMovementForm({ product, unitId, onSuccess }: ChemicalMovementFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await registerMovement(product.id, unitId, formData)

    setLoading(false)
    if (!result.success) { setError(result.error); return }
    ;(e.target as HTMLFormElement).reset()
    onSuccess?.()
  }

  const unit = MEASURE_UNIT_LABELS[product.measure_unit]

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-3 bg-gray-50 rounded-lg border">
      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
        Registrar movimentação — {product.name}
      </p>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-1">
          <Label htmlFor={`type-${product.id}`} className="text-xs">Tipo *</Label>
          <select
            id={`type-${product.id}`}
            name="movement_type"
            required
            className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="in">Entrada (compra)</option>
            <option value="out">Saída (uso manual)</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor={`qty-${product.id}`} className="text-xs">Qtd ({unit}) *</Label>
          <Input
            id={`qty-${product.id}`}
            name="quantity"
            type="number"
            min={0.01}
            step="0.01"
            required
            className="text-xs h-8"
            placeholder="Ex: 500"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`notes-${product.id}`} className="text-xs">Nota</Label>
          <Input
            id={`notes-${product.id}`}
            name="notes"
            className="text-xs h-8"
            placeholder="Opcional"
          />
        </div>
      </div>

      <Button type="submit" disabled={loading} size="sm" className="w-full">
        {loading ? 'Registrando...' : 'Confirmar'}
      </Button>
    </form>
  )
}
