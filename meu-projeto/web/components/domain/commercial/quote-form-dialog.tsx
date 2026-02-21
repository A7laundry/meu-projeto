'use client'

import { useState, useTransition } from 'react'
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
import { createQuote } from '@/actions/quotes/crud'
import { PIECE_TYPE_LABELS } from '@/types/recipe'
import type { Client } from '@/types/logistics'
import type { PriceTableEntry } from '@/types/pricing'

interface QuoteItem {
  piece_type: string
  quantity: number
  unit_price: number
}

interface QuoteFormDialogProps {
  unitId: string
  activeClients: Client[]
  priceTable: PriceTableEntry[]
}

function formatCurrency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function QuoteFormDialog({ unitId, activeClients, priceTable }: QuoteFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [clientId, setClientId] = useState('')
  const [items, setItems] = useState<QuoteItem[]>([])
  const [notes, setNotes] = useState('')

  // Linha de item sendo adicionada
  const [newPieceType, setNewPieceType] = useState('')
  const [newQty, setNewQty] = useState(1)
  const [newPrice, setNewPrice] = useState(0)

  function handleSelectPieceType(pt: string) {
    setNewPieceType(pt)
    const entry = priceTable.find((p) => p.piece_type === pt)
    if (entry) setNewPrice(entry.price)
  }

  function addItem() {
    if (!newPieceType || newQty < 1 || newPrice < 0) return
    setItems((prev) => [...prev, { piece_type: newPieceType, quantity: newQty, unit_price: newPrice }])
    setNewPieceType('')
    setNewQty(1)
    setNewPrice(0)
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx))
  }

  const total = items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0)

  function handleSubmit() {
    setError(null)
    const formData = new FormData()
    formData.set('client_id', clientId)
    formData.set('notes', notes)
    formData.set('items', JSON.stringify(items))

    startTransition(async () => {
      const result = await createQuote(unitId, formData)
      if (!result.success) {
        setError(result.error)
        return
      }
      setOpen(false)
      setClientId('')
      setItems([])
      setNotes('')
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Novo Orçamento</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Orçamento</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1">
            <Label>Cliente *</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar cliente..." />
              </SelectTrigger>
              <SelectContent>
                {activeClients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Adicionar item */}
          <div className="space-y-2 border rounded-lg p-3">
            <p className="text-sm font-medium text-white/75">Adicionar item</p>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-1">
                <Select value={newPieceType} onValueChange={handleSelectPieceType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo de peça" />
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
              <div>
                <Input
                  type="number"
                  min={1}
                  value={newQty}
                  onChange={(e) => setNewQty(Number(e.target.value))}
                  placeholder="Qtd"
                />
              </div>
              <div>
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  value={newPrice}
                  onChange={(e) => setNewPrice(Number(e.target.value))}
                  placeholder="Preço unit."
                />
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addItem}
              disabled={!newPieceType}
            >
              + Adicionar
            </Button>
          </div>

          {/* Lista de itens */}
          {items.length > 0 && (
            <div className="space-y-1">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between rounded bg-[rgba(255,255,255,0.03)] px-3 py-2 text-sm">
                  <span>
                    {PIECE_TYPE_LABELS[item.piece_type as keyof typeof PIECE_TYPE_LABELS] ?? item.piece_type}
                    {' · '}
                    {item.quantity}x @ {formatCurrency(item.unit_price)}
                  </span>
                  <span className="font-medium">
                    {formatCurrency(item.quantity * item.unit_price)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="ml-3 text-red-500 hover:text-red-700 text-xs"
                  >
                    Remover
                  </button>
                </div>
              ))}
              <div className="flex justify-end font-semibold pt-1">
                Total: {formatCurrency(total)}
              </div>
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="notes">Observações</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observações internas ou para o cliente"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              disabled={isPending || !clientId || items.length === 0}
              onClick={handleSubmit}
            >
              {isPending ? 'Criando...' : 'Criar Orçamento'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
