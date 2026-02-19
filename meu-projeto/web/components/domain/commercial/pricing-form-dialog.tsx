'use client'

import { useRef, useState, useTransition } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { upsertPrice } from '@/actions/pricing/crud'
import { PIECE_TYPE_LABELS } from '@/types/recipe'
import { PRICE_UNIT_LABELS, type PriceTableEntry } from '@/types/pricing'

interface PricingFormDialogProps {
  unitId: string
  entry?: PriceTableEntry
  trigger?: React.ReactNode
}

export function PricingFormDialog({ unitId, entry, trigger }: PricingFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)
  const [pieceType, setPieceType] = useState(entry?.piece_type ?? '')
  const [unitLabel, setUnitLabel] = useState<string>(entry?.unit_label ?? 'peça')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    formData.set('piece_type', pieceType)
    formData.set('unit_label', unitLabel)

    startTransition(async () => {
      const result = await upsertPrice(unitId, formData)
      if (!result.success) {
        setError(result.error)
        return
      }
      setOpen(false)
      formRef.current?.reset()
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button size="sm">{entry ? 'Editar' : 'Novo Preço'}</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{entry ? 'Editar Preço' : 'Definir Preço'}</DialogTitle>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label>Tipo de peça *</Label>
            <Select value={pieceType} onValueChange={setPieceType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar..." />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(PIECE_TYPE_LABELS) as Array<keyof typeof PIECE_TYPE_LABELS>).map(
                  (key) => (
                    <SelectItem key={key} value={key}>
                      {PIECE_TYPE_LABELS[key]}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="price">Preço (R$) *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                required
                defaultValue={entry?.price}
                placeholder="0,00"
              />
            </div>
            <div className="space-y-1">
              <Label>Unidade</Label>
              <Select value={unitLabel} onValueChange={setUnitLabel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(PRICE_UNIT_LABELS) as Array<keyof typeof PRICE_UNIT_LABELS>).map(
                    (key) => (
                      <SelectItem key={key} value={key}>
                        {PRICE_UNIT_LABELS[key]}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending || !pieceType}>
              {isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
