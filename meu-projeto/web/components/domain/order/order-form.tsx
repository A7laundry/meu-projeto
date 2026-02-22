'use client'

import { useState, useTransition, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createOrder, searchClients, type CreateOrderInput } from '@/actions/orders/create'
import type { PieceType } from '@/types/order'
import type { PriceTableEntry } from '@/types/pricing'

const PIECE_TYPE_LABELS: Record<PieceType, string> = {
  clothing: 'Roupa comum',
  costume: 'Fantasia / Uniforme',
  sneaker: 'Tênis / Calçado',
  rug: 'Tapete',
  curtain: 'Cortina / Persiana',
  industrial: 'Industrial',
  other: 'Outro',
}

interface OrderItem {
  piece_type: PieceType
  piece_type_label: string
  quantity: number
  notes: string
}

interface ClientSuggestion {
  id: string
  name: string
  document: string | null
  phone: string | null
}

interface OrderFormProps {
  unitId: string
  unitSlug: string
  prices: PriceTableEntry[]
}

function getUnitPrice(type: PieceType, prices: PriceTableEntry[]): number | null {
  return prices.find((p) => p.piece_type === type)?.price ?? null
}

function fmtBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function OrderForm({ unitId, unitSlug, prices }: OrderFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // ── Cliente
  const [clientName, setClientName] = useState('')
  const [clientId, setClientId] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<ClientSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Comanda
  const [promisedAt, setPromisedAt] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<OrderItem[]>([
    { piece_type: 'clothing', piece_type_label: '', quantity: 1, notes: '' },
  ])

  // ── Autocomplete
  const handleClientInput = useCallback((value: string) => {
    setClientName(value)
    setClientId(null) // deslinka se digitar livremente

    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (value.length < 2) { setSuggestions([]); setShowSuggestions(false); return }

    debounceRef.current = setTimeout(async () => {
      const results = await searchClients(unitId, value)
      setSuggestions(results as ClientSuggestion[])
      setShowSuggestions(true)
    }, 300)
  }, [unitId])

  function selectClient(client: ClientSuggestion) {
    setClientName(client.name)
    setClientId(client.id)
    setSuggestions([])
    setShowSuggestions(false)
  }

  // ── Itens
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

  // ── Totais
  const totalPieces = items.reduce((s, i) => s + i.quantity, 0)
  const estimatedTotal = items.reduce((s, i) => {
    const price = getUnitPrice(i.piece_type, prices)
    return s + (price ?? 0) * i.quantity
  }, 0)
  const hasPrices = prices.length > 0

  // ── Submit
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const input: CreateOrderInput = {
      client_name: clientName,
      client_id: clientId ?? null,
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

      {/* ── Dados do cliente ─────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-white/90 border-b border-white/08 pb-2">
          Dados do Cliente
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Autocomplete de cliente */}
          <div className="space-y-1.5 relative">
            <Label htmlFor="client_name">Nome do cliente *</Label>
            <Input
              id="client_name"
              value={clientName}
              onChange={(e) => handleClientInput(e.target.value)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="Digite para buscar cliente cadastrado..."
              required
              autoComplete="off"
            />

            {/* Badge de cliente vinculado */}
            {clientId && (
              <p className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
                <span>✓</span> Cliente cadastrado vinculado
              </p>
            )}

            {/* Dropdown de sugestões */}
            {showSuggestions && suggestions.length > 0 && (
              <div
                className="absolute z-50 w-full mt-1 rounded-xl overflow-hidden shadow-2xl"
                style={{
                  background: '#111118',
                  border: '1px solid rgba(255,255,255,0.10)',
                  top: '100%',
                }}
              >
                {suggestions.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onMouseDown={() => selectClient(c)}
                    className="w-full text-left px-4 py-3 hover:bg-white/05 transition-colors border-b border-white/04 last:border-0"
                  >
                    <p className="text-sm font-medium text-white/85">{c.name}</p>
                    <p className="text-xs text-white/35 mt-0.5">
                      {[c.document, c.phone].filter(Boolean).join(' · ') || 'Sem doc/telefone'}
                    </p>
                  </button>
                ))}
                <button
                  type="button"
                  onMouseDown={() => setShowSuggestions(false)}
                  className="w-full text-left px-4 py-2.5 text-xs text-white/30 hover:text-white/50 transition-colors"
                >
                  Usar &quot;{clientName}&quot; sem vincular
                </button>
              </div>
            )}
          </div>

          {/* Data de promessa */}
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

      {/* ── Itens da comanda ─────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/08 pb-2">
          <h2 className="text-base font-semibold text-white/90">
            Itens da Comanda
            <span className="ml-2 text-xs font-normal text-white/35">
              {totalPieces} peça{totalPieces !== 1 ? 's' : ''}
            </span>
          </h2>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            + Adicionar item
          </Button>
        </div>

        <div className="space-y-3">
          {items.map((item, index) => {
            const unitPrice = getUnitPrice(item.piece_type, prices)
            const subtotal = unitPrice != null ? unitPrice * item.quantity : null

            return (
              <div
                key={index}
                className="rounded-xl p-4 space-y-3"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                    Item {index + 1}
                  </span>
                  <div className="flex items-center gap-3">
                    {/* Preço do item */}
                    {subtotal != null && (
                      <span className="text-sm font-semibold" style={{ color: '#d6b25e' }}>
                        {fmtBRL(subtotal)}
                      </span>
                    )}
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-xs text-red-400/60 hover:text-red-400 transition-colors"
                      >
                        Remover
                      </button>
                    )}
                  </div>
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
                        {(Object.keys(PIECE_TYPE_LABELS) as PieceType[]).map((type) => {
                          const p = getUnitPrice(type, prices)
                          return (
                            <SelectItem key={type} value={type}>
                              <span>{PIECE_TYPE_LABELS[type]}</span>
                              {p != null && (
                                <span className="ml-2 text-xs opacity-50">
                                  {fmtBRL(p)}
                                </span>
                              )}
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                    {unitPrice != null && (
                      <p className="text-[11px] text-white/30">
                        {fmtBRL(unitPrice)}/{prices.find(p => p.piece_type === item.piece_type)?.unit_label ?? 'peça'}
                      </p>
                    )}
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
                    <Label>Descreva o item *</Label>
                    <Input
                      value={item.piece_type_label}
                      onChange={(e) => updateItem(index, 'piece_type_label', e.target.value)}
                      placeholder="Ex: Edredom, almofada, cortina especial..."
                      required
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Resumo financeiro ─────────────────────────────── */}
      {hasPrices && (
        <section
          className="rounded-xl p-5"
          style={{
            background: 'linear-gradient(135deg, rgba(214,178,94,0.06) 0%, rgba(5,5,8,0.8) 100%)',
            border: '1px solid rgba(214,178,94,0.14)',
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-white/35 font-semibold mb-0.5">
                Valor estimado da comanda
              </p>
              <p className="text-2xl font-bold tracking-tight" style={{ color: '#d6b25e' }}>
                {fmtBRL(estimatedTotal)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/30">{totalPieces} peça{totalPieces !== 1 ? 's' : ''}</p>
              {items.filter(i => getUnitPrice(i.piece_type, prices) == null).length > 0 && (
                <p className="text-[11px] text-amber-400/60 mt-1">
                  * Alguns itens sem preço cadastrado
                </p>
              )}
            </div>
          </div>

          {/* Breakdown por tipo */}
          {items.length > 1 && (
            <div className="mt-4 pt-3 border-t border-white/06 space-y-1.5">
              {items.map((item, i) => {
                const price = getUnitPrice(item.piece_type, prices)
                const sub = price != null ? price * item.quantity : null
                return (
                  <div key={i} className="flex justify-between text-xs text-white/40">
                    <span>
                      {item.quantity}× {PIECE_TYPE_LABELS[item.piece_type]}
                      {item.piece_type === 'other' && item.piece_type_label
                        ? ` (${item.piece_type_label})`
                        : ''}
                    </span>
                    <span className="text-white/55">
                      {sub != null ? fmtBRL(sub) : '–'}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      )}

      {error && (
        <div
          className="text-sm px-4 py-3 rounded-xl"
          style={{
            background: 'rgba(248,113,113,0.08)',
            border: '1px solid rgba(248,113,113,0.22)',
            color: '#fca5a5',
          }}
        >
          {error}
        </div>
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
        <button
          type="submit"
          disabled={isPending}
          className="btn-gold px-6 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50"
        >
          {isPending ? 'Salvando...' : 'Criar Comanda →'}
        </button>
      </div>
    </form>
  )
}
