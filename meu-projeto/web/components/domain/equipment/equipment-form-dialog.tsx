'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createEquipment, updateEquipment } from '@/actions/equipment/crud'
import { EQUIPMENT_STATUS_LABELS, type Equipment } from '@/types/equipment'

const EQUIPMENT_TYPES = [
  { value: 'washer', label: 'Lavadora' },
  { value: 'dryer',  label: 'Secadora' },
  { value: 'iron',   label: 'Passadeira' },
  { value: 'other',  label: 'Outro' },
]

const STATUSES = Object.entries(EQUIPMENT_STATUS_LABELS).map(([value, label]) => ({ value, label }))

interface EquipmentFormDialogProps {
  unitId: string
  mode: 'create' | 'edit'
  equipment?: Equipment
}

export function EquipmentFormDialog({ unitId, mode, equipment }: EquipmentFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = mode === 'create'
      ? await createEquipment(unitId, formData)
      : await updateEquipment(equipment!.id, unitId, formData)

    setLoading(false)
    if (!result.success) { setError(result.error); return }
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={mode === 'create' ? 'default' : 'outline'} size="sm">
          {mode === 'create' ? '+ Novo Equipamento' : 'Editar'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Novo Equipamento' : `Editar: ${equipment?.name}`}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {error && <p className="text-sm text-red-600 bg-red-50 rounded p-2">{error}</p>}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1 col-span-2">
              <Label htmlFor="name">Nome *</Label>
              <Input id="name" name="name" defaultValue={equipment?.name} required placeholder="Lavadora 01" />
            </div>

            <div className="space-y-1">
              <Label htmlFor="type">Tipo *</Label>
              <select id="type" name="type" defaultValue={equipment?.type ?? 'washer'} required
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs">
                {EQUIPMENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="capacity_kg">Capacidade (kg)</Label>
              <Input id="capacity_kg" name="capacity_kg" type="number" step="0.1"
                defaultValue={equipment?.capacity_kg ?? ''} placeholder="15" />
            </div>

            <div className="space-y-1">
              <Label htmlFor="brand">Marca</Label>
              <Input id="brand" name="brand" defaultValue={equipment?.brand ?? ''} placeholder="Electrolux" />
            </div>

            <div className="space-y-1">
              <Label htmlFor="model">Modelo</Label>
              <Input id="model" name="model" defaultValue={equipment?.model ?? ''} placeholder="LM15" />
            </div>

            <div className="space-y-1 col-span-2">
              <Label htmlFor="serial_number">Número de Série</Label>
              <Input id="serial_number" name="serial_number" defaultValue={equipment?.serial_number ?? ''} placeholder="SN-12345678" />
            </div>

            {mode === 'edit' && (
              <div className="space-y-1 col-span-2">
                <Label htmlFor="status">Status</Label>
                <select id="status" name="status" defaultValue={equipment?.status ?? 'active'}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs">
                  {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
