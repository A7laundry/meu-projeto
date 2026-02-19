'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createUnit, updateUnit } from '@/actions/units/crud'
import type { Unit } from '@/types/unit'

interface UnitFormDialogProps {
  mode: 'create' | 'edit'
  unit?: Unit
}

const STATES = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS',
  'MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC',
  'SP','SE','TO',
]

export function UnitFormDialog({ mode, unit }: UnitFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    const result = mode === 'create'
      ? await createUnit(formData)
      : await updateUnit(unit!.id, formData)

    setLoading(false)

    if (!result.success) {
      setError(result.error)
      return
    }

    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={mode === 'create' ? 'default' : 'outline'} size="sm">
          {mode === 'create' ? '+ Nova Unidade' : 'Editar'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Nova Unidade' : `Editar: ${unit?.name}`}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded p-2">{error}</p>
          )}

          <div className="space-y-1">
            <Label htmlFor="name">Nome *</Label>
            <Input id="name" name="name" defaultValue={unit?.name} required placeholder="Synkra - Paulista" />
          </div>

          <div className="space-y-1">
            <Label htmlFor="slug">Slug * <span className="text-gray-400 text-xs">(URL, sem espaços)</span></Label>
            <Input id="slug" name="slug" defaultValue={unit?.slug} required placeholder="paulista" pattern="[a-z0-9-]+" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="city">Cidade *</Label>
              <Input id="city" name="city" defaultValue={unit?.city} required placeholder="São Paulo" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="state">UF *</Label>
              <select
                id="state"
                name="state"
                defaultValue={unit?.state ?? 'SP'}
                required
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="address">Endereço</Label>
            <Input id="address" name="address" defaultValue={unit?.address ?? ''} placeholder="Av. Paulista, 1000" />
          </div>

          <div className="space-y-1">
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" name="phone" defaultValue={unit?.phone ?? ''} placeholder="(11) 99999-9999" />
          </div>

          {mode === 'edit' && (
            <input type="hidden" name="active" value={unit?.active ? 'true' : 'false'} />
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
