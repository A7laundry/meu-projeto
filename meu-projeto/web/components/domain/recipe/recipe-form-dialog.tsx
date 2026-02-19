'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createRecipe, updateRecipe } from '@/actions/recipes/crud'
import { PIECE_TYPE_LABELS, type Recipe } from '@/types/recipe'

const PIECE_TYPES = Object.entries(PIECE_TYPE_LABELS).map(([value, label]) => ({ value, label }))

interface RecipeFormDialogProps {
  unitId: string
  mode: 'create' | 'edit'
  recipe?: Recipe
}

export function RecipeFormDialog({ unitId, mode, recipe }: RecipeFormDialogProps) {
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
        ? await createRecipe(unitId, formData)
        : await updateRecipe(recipe!.id, unitId, formData)

    setLoading(false)
    if (!result.success) { setError(result.error); return }
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={mode === 'create' ? 'default' : 'outline'} size="sm">
          {mode === 'create' ? '+ Nova Receita' : 'Editar'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Nova Receita de Lavagem' : `Editar: ${recipe?.name}`}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {error && <p className="text-sm text-red-600 bg-red-50 rounded p-2">{error}</p>}

          <div className="space-y-1">
            <Label htmlFor="name">Nome *</Label>
            <Input id="name" name="name" defaultValue={recipe?.name} placeholder="Ex: Lavagem Padrão Roupas" required />
          </div>

          <div className="space-y-1">
            <Label htmlFor="piece_type">Tipo de Peça *</Label>
            <select
              id="piece_type"
              name="piece_type"
              defaultValue={recipe?.piece_type ?? ''}
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="" disabled>Selecione o tipo</option>
              {PIECE_TYPES.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="temperature_celsius">Temperatura (°C)</Label>
              <Input
                id="temperature_celsius"
                name="temperature_celsius"
                type="number"
                min={0}
                max={200}
                defaultValue={recipe?.temperature_celsius ?? ''}
                placeholder="Ex: 40"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="duration_minutes">Duração (min)</Label>
              <Input
                id="duration_minutes"
                name="duration_minutes"
                type="number"
                min={1}
                defaultValue={recipe?.duration_minutes ?? ''}
                placeholder="Ex: 45"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              name="description"
              defaultValue={recipe?.description ?? ''}
              placeholder="Instruções gerais sobre esta receita"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="chemical_notes">Notas sobre Insumos</Label>
            <Input
              id="chemical_notes"
              name="chemical_notes"
              defaultValue={recipe?.chemical_notes ?? ''}
              placeholder="Ex: 50ml detergente neutro + 20ml alvejante"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : mode === 'create' ? 'Criar Receita' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
