'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createChemicalProduct, updateChemicalProduct } from '@/actions/chemicals/crud'
import {
  CHEMICAL_CATEGORY_LABELS,
  MEASURE_UNIT_LABELS,
  type ChemicalProduct,
} from '@/types/chemical'

const CATEGORIES = Object.entries(CHEMICAL_CATEGORY_LABELS).map(([value, label]) => ({
  value,
  label,
}))
const MEASURE_UNITS = Object.entries(MEASURE_UNIT_LABELS).map(([value, label]) => ({
  value,
  label,
}))

interface ChemicalFormDialogProps {
  unitId: string
  mode: 'create' | 'edit'
  product?: ChemicalProduct
}

export function ChemicalFormDialog({ unitId, mode, product }: ChemicalFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result =
      mode === 'create'
        ? await createChemicalProduct(unitId, formData)
        : await updateChemicalProduct(product!.id, unitId, formData)

    setLoading(false)
    if (!result.success) { setError(result.error); return }
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={mode === 'create' ? 'default' : 'outline'} size="sm">
          {mode === 'create' ? '+ Novo Insumo' : 'Editar'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Novo Produto Químico' : `Editar: ${product?.name}`}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {error && <p className="text-sm text-red-600 bg-red-50 rounded p-2">{error}</p>}

          <div className="space-y-1">
            <Label htmlFor="name">Nome *</Label>
            <Input id="name" name="name" defaultValue={product?.name} required placeholder="Ex: Detergente Neutro Concentrado" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="category">Categoria *</Label>
              <select
                id="category"
                name="category"
                defaultValue={product?.category ?? ''}
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="" disabled>Selecione</option>
                {CATEGORIES.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="measure_unit">Unidade *</Label>
              <select
                id="measure_unit"
                name="measure_unit"
                defaultValue={product?.measure_unit ?? ''}
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="" disabled>Selecione</option>
                {MEASURE_UNITS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="cost_per_unit">Custo por unidade (R$)</Label>
              <Input
                id="cost_per_unit"
                name="cost_per_unit"
                type="number"
                step="0.0001"
                min={0}
                defaultValue={product?.cost_per_unit ?? ''}
                placeholder="Ex: 0.05"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="minimum_stock">Estoque mínimo</Label>
              <Input
                id="minimum_stock"
                name="minimum_stock"
                type="number"
                min={0}
                defaultValue={product?.minimum_stock ?? 0}
                placeholder="Ex: 1000"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="supplier">Fornecedor</Label>
            <Input
              id="supplier"
              name="supplier"
              defaultValue={product?.supplier ?? ''}
              placeholder="Ex: Química Brasil Ltda"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : mode === 'create' ? 'Criar Produto' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
