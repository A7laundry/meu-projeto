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
import { createPayable } from '@/actions/financial/payables'
import { PAYABLE_CATEGORY_LABELS } from '@/types/financial'

interface PayableFormDialogProps {
  unitId: string
}

export function PayableFormDialog({ unitId }: PayableFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)
  const [category, setCategory] = useState<string>('other')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    formData.set('category', category)

    startTransition(async () => {
      const result = await createPayable(unitId, formData)
      if (!result.success) {
        setError(result.error)
        return
      }
      setOpen(false)
      formRef.current?.reset()
      setCategory('other')
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Nova Conta a Pagar</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Conta a Pagar</DialogTitle>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="description">Descrição *</Label>
            <Input id="description" name="description" required placeholder="Ex: Compra de detergente" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="supplier">Fornecedor</Label>
              <Input id="supplier" name="supplier" placeholder="Nome do fornecedor" />
            </div>
            <div className="space-y-1">
              <Label>Categoria *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    Object.keys(PAYABLE_CATEGORY_LABELS) as Array<keyof typeof PAYABLE_CATEGORY_LABELS>
                  ).map((key) => (
                    <SelectItem key={key} value={key}>
                      {PAYABLE_CATEGORY_LABELS[key]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="amount">Valor (R$) *</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0,00"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="due_date">Vencimento *</Label>
              <Input id="due_date" name="due_date" type="date" required />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="notes">Observações</Label>
            <Input id="notes" name="notes" placeholder="Observações opcionais" />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
