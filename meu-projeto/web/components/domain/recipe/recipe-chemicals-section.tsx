'use client'

import { useEffect, useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Trash2 } from 'lucide-react'
import {
  listRecipeChemicals,
  addChemicalToRecipe,
  removeChemicalFromRecipe,
  type RecipeChemical,
} from '@/actions/recipes/chemicals'
import { listChemicalProducts } from '@/actions/chemicals/crud'
import { MEASURE_UNIT_LABELS, type ChemicalProduct } from '@/types/chemical'

interface Props {
  recipeId: string
  unitId: string
}

export function RecipeChemicalsSection({ recipeId, unitId }: Props) {
  const [chemicals, setChemicals] = useState<RecipeChemical[]>([])
  const [products, setProducts] = useState<ChemicalProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    Promise.all([
      listRecipeChemicals(recipeId, unitId),
      listChemicalProducts(unitId),
    ]).then(([chems, prods]) => {
      setChemicals(chems)
      setProducts(prods.filter((p) => p.active))
      setLoading(false)
    })
  }, [recipeId, unitId])

  const linkedIds = new Set(chemicals.map((c) => c.product_id))
  const available = products.filter((p) => !linkedIds.has(p.id))

  function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await addChemicalToRecipe(recipeId, unitId, formData)
      if (!result.success) {
        setError(result.error)
        return
      }
      setChemicals((prev) => [...prev, result.data])
      ;(e.target as HTMLFormElement).reset()
    })
  }

  function handleRemove(id: string) {
    startTransition(async () => {
      const result = await removeChemicalFromRecipe(id, unitId)
      if (result.success) {
        setChemicals((prev) => prev.filter((c) => c.id !== id))
      }
    })
  }

  if (loading) {
    return <p className="text-xs text-white/40 py-4">Carregando insumos...</p>
  }

  return (
    <div className="space-y-3 mt-2">
      <p className="text-xs font-semibold text-white/50 uppercase tracking-wide">
        Insumos vinculados
      </p>

      {chemicals.length === 0 ? (
        <p className="text-xs text-white/30">Nenhum insumo vinculado a esta receita.</p>
      ) : (
        <div className="space-y-1.5">
          {chemicals.map((c) => {
            const unitLabel = MEASURE_UNIT_LABELS[c.measure_unit as keyof typeof MEASURE_UNIT_LABELS] ?? c.measure_unit
            return (
              <div
                key={c.id}
                className="flex items-center justify-between gap-2 rounded-lg bg-[rgba(255,255,255,0.03)] border border-white/8 px-3 py-2"
              >
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-white">{c.product_name}</span>
                  <span className="text-xs text-white/40 ml-2">
                    {c.quantity_per_cycle} {unitLabel}/ciclo
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  disabled={isPending}
                  onClick={() => handleRemove(c.id)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            )
          })}
        </div>
      )}

      {available.length > 0 && (
        <form onSubmit={handleAdd} className="flex items-end gap-2 pt-1">
          <div className="flex-1 space-y-1">
            <Label htmlFor={`prod-${recipeId}`} className="text-xs">Produto</Label>
            <select
              id={`prod-${recipeId}`}
              name="product_id"
              required
              className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Selecione</option>
              {available.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({MEASURE_UNIT_LABELS[p.measure_unit]})
                </option>
              ))}
            </select>
          </div>
          <div className="w-24 space-y-1">
            <Label htmlFor={`qty-${recipeId}`} className="text-xs">Qtd/ciclo</Label>
            <Input
              id={`qty-${recipeId}`}
              name="quantity_per_cycle"
              type="number"
              min={0.01}
              step="0.01"
              required
              className="text-xs h-8"
              placeholder="Ex: 50"
            />
          </div>
          <Button type="submit" size="sm" disabled={isPending} className="h-8">
            Vincular
          </Button>
        </form>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}

      {available.length === 0 && chemicals.length > 0 && (
        <p className="text-xs text-white/25">Todos os produtos ativos já estão vinculados.</p>
      )}
    </div>
  )
}
