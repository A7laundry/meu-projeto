'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createOrder, type CreateOrderInput } from '@/actions/orders/create'
import type { PieceType } from '@/types/order'

const PIECE_TYPE_LABELS: Record<PieceType, string> = {
  clothing: 'Roupa comum',
  costume: 'Fantasia',
  sneaker: 'Tênis',
  rug: 'Tapete',
  curtain: 'Cortina',
  industrial: 'Industrial',
  other: 'Outro',
}

interface OrderItem {
  piece_type: PieceType
  piece_type_label: string
  quantity: number
  notes: string
}

interface OrderFormProps {
  unitId: string
  unitSlug: string
}

export function OrderForm({ unitId, unitSlug }: OrderFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [clientName, setClientName] = useState('')
  const [promisedAt, setPromisedAt] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<OrderItem[]>([
    { piece_type: 'clothing', piece_type_label: '', quantity: 1, notes: '' },
  ])

  function addItem() {
    setItems((prev) => [
      ...prev,
      { piece_type: 'clothing', piece_type_label: '', quantity: 1, notes: '' },
    ])
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  function updateItem(index: number, field: keyof OrderItem, value: string | number) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const input: CreateOrderInput = {
      client_name: clientName,
      promised_at: promisedAt,
      notes: notes || null,
      items: items.map((i) => ({
        piece_type: i.piece_type,
        piece_type_label: i.piece_type === 'other' ? i.piece_type_label : null,
        quantity: i.quantity,
        notes: i.notes || null,
        recipe_id: null,
      })),
    }

    startTransition(async () => {
      const result = await createOrder(unitId, unitSlug, input)
      if (result.success) {
        router.push(`/unit/${unitId}/production/orders/${result.data.orderId}`)
      } else {
        setError(result.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Dados do cliente */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-gray-800 border-b pb-2">Dados do Cliente</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="client_name">Nome do cliente *</Label>
            <Input
              id="client_name"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Nome ou razão social"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="promised_at">Data de promessa *</Label>
            <Input
              id="promised_at"
              type="datetime-local"
              value={promisedAt}
              onChange={(e) => setPromisedAt(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="notes">Observações gerais</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Instruções especiais, alergias a produtos, etc."
            rows={2}
          />
        </div>
      </section>

      {/* Itens da comanda */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <h2 className="text-base font-semibold text-gray-800">
            Itens da Comanda ({items.length})
          </h2>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            + Adicionar item
          </Button>
        </div>

        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="rounded-lg border border-gray-200 p-4 space-y-3 bg-gray-50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Item {index + 1}</span>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-xs text-red-400 hover:text-red-600"
                  >
                    Remover
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label>Tipo de peça *</Label>
                  <Select
                    value={item.piece_type}
                    onValueChange={(v) => updateItem(index, 'piece_type', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(PIECE_TYPE_LABELS) as PieceType[]).map((type) => (
                        <SelectItem key={type} value={type}>
                          {PIECE_TYPE_LABELS[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Quantidade *</Label>
                  <Input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Obs. do item</Label>
                  <Input
                    value={item.notes}
                    onChange={(e) => updateItem(index, 'notes', e.target.value)}
                    placeholder="Manchas, cores especiais..."
                  />
                </div>
              </div>
              {item.piece_type === 'other' && (
                <div className="space-y-1.5">
                  <Label>Descreva o item</Label>
                  <Input
                    value={item.piece_type_label}
                    onChange={(e) => updateItem(index, 'piece_type_label', e.target.value)}
                    placeholder="Ex: Edredom, almofada..."
                    required
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Salvando...' : 'Criar Comanda'}
        </Button>
      </div>
    </form>
  )
}
