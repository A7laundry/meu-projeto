'use client'

import { useCallback, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { searchClients, createOrder, type CreateOrderInput } from '@/actions/orders/create'
import { ClientFormDialog } from '@/components/domain/client/client-form-dialog'
import { PdvItemPicker, type PdvItem } from '@/components/domain/store/pdv-item-picker'
import { PdvSummaryPanel, type PaymentMethod } from '@/components/domain/store/pdv-summary-panel'
import type { PriceTableEntry } from '@/types/pricing'

interface PdvPageClientProps {
  unitId: string
  unitSlug: string
  prices: PriceTableEntry[]
}

interface ClientResult {
  id: string
  name: string
  document: string | null
  phone: string | null
}

export function PdvPageClient({ unitId, unitSlug, prices }: PdvPageClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Client state
  const [clientQuery, setClientQuery] = useState('')
  const [clientResults, setClientResults] = useState<ClientResult[]>([])
  const [selectedClient, setSelectedClient] = useState<ClientResult | null>(null)
  const [showResults, setShowResults] = useState(false)

  // Items state
  const [items, setItems] = useState<PdvItem[]>([])

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null)

  // Order state
  const [notes, setNotes] = useState('')
  const [promisedDate, setPromisedDate] = useState(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  })

  // Result state
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<{ orderNumber: string } | null>(null)

  const total = items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0)

  // Client search with debounce
  const handleClientSearch = useCallback((query: string) => {
    setClientQuery(query)
    setSelectedClient(null)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (query.length < 2) {
      setClientResults([])
      setShowResults(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      const results = await searchClients(unitId, query)
      setClientResults(results)
      setShowResults(true)
    }, 300)
  }, [unitId])

  function selectClient(client: ClientResult) {
    setSelectedClient(client)
    setClientQuery(client.name)
    setShowResults(false)
    setClientResults([])
  }

  function handleSubmit() {
    if (!clientQuery.trim()) {
      setError('Informe o nome do cliente')
      return
    }
    if (items.length === 0) {
      setError('Adicione ao menos 1 item')
      return
    }

    setError(null)

    const input: CreateOrderInput = {
      client_name: selectedClient?.name ?? clientQuery.trim(),
      client_id: selectedClient?.id ?? null,
      promised_at: promisedDate,
      notes: notes || null,
      payment_method: paymentMethod,
      items: items.map(i => ({
        piece_type: i.piece_type as CreateOrderInput['items'][number]['piece_type'],
        piece_type_label: i.isCustom ? i.label : null,
        quantity: i.quantity,
        recipe_id: null,
        notes: null,
      })),
    }

    startTransition(async () => {
      const result = await createOrder(unitId, unitSlug, input)
      if (!result.success) {
        setError(result.error)
        return
      }
      setSuccess({ orderNumber: result.data.orderNumber })
    })
  }

  function resetForm() {
    setItems([])
    setClientQuery('')
    setSelectedClient(null)
    setNotes('')
    setPaymentMethod(null)
    setError(null)
    setSuccess(null)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    setPromisedDate(tomorrow.toISOString().split('T')[0])
    router.refresh()
  }

  // Success screen
  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] p-6">
        <div
          className="text-center space-y-5 p-10 rounded-2xl max-w-md w-full animate-fade-up"
          style={{
            background: 'rgba(52,211,153,0.08)',
            border: '1.5px solid rgba(52,211,153,0.25)',
            boxShadow: '0 0 60px rgba(52,211,153,0.08)',
          }}
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
            style={{
              background: 'rgba(52,211,153,0.12)',
              boxShadow: '0 0 40px rgba(52,211,153,0.15)',
            }}
          >
            <span className="text-4xl" style={{ color: '#34d399' }}>✓</span>
          </div>
          <h2 className="text-2xl font-bold text-white">Comanda Criada!</h2>
          <p className="text-lg font-bold" style={{ color: '#34d399' }}>
            {success.orderNumber}
          </p>
          <p className="text-sm text-white/40">
            Total: R$ {total.toFixed(2)}
          </p>
          <button
            onClick={resetForm}
            className="w-full py-4 rounded-xl text-base font-bold btn-emerald"
          >
            Nova Comanda
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="mb-5">
        <p
          className="text-[10px] uppercase tracking-widest font-semibold mb-1"
          style={{ color: 'rgba(52,211,153,0.40)' }}
        >
          PDV Rápido
        </p>
        <h1 className="text-xl font-bold text-white tracking-tight">Nova Comanda</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Left column — Items */}
        <div className="flex-1 space-y-5 lg:w-[65%]">
          {/* Client search */}
          <div className="relative">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none" style={{ color: 'rgba(255,255,255,0.30)' }}>
                  🔍
                </span>
                <input
                  placeholder="Buscar cliente..."
                  value={clientQuery}
                  onChange={e => handleClientSearch(e.target.value)}
                  onFocus={() => clientResults.length > 0 && setShowResults(true)}
                  onBlur={() => setTimeout(() => setShowResults(false), 200)}
                  className="input-premium w-full"
                  style={{ padding: '12px 14px 12px 36px', borderRadius: 12, fontSize: 14 }}
                />
                {selectedClient && (
                  <span
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(52,211,153,0.12)', color: '#34d399', border: '1px solid rgba(52,211,153,0.25)' }}
                  >
                    Vinculado
                  </span>
                )}
              </div>
              <ClientFormDialog unitId={unitId} />
            </div>

            {/* Autocomplete dropdown */}
            {showResults && clientResults.length > 0 && (
              <div
                className="absolute z-20 w-full mt-1 rounded-xl overflow-hidden shadow-2xl"
                style={{ background: '#0d0d14', border: '1px solid rgba(255,255,255,0.10)' }}
              >
                {clientResults.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => selectClient(c)}
                    className="w-full text-left px-4 py-3 flex items-center gap-3 transition-all"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(52,211,153,0.08)')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: 'rgba(52,211,153,0.12)', color: '#34d399' }}
                    >
                      {c.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white/85 truncate">{c.name}</p>
                      <p className="text-[11px] text-white/35 truncate">
                        {[c.phone, c.document].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Item picker grid */}
          <PdvItemPicker
            prices={prices}
            items={items}
            onItemsChange={setItems}
          />

          {/* Notes */}
          <input
            placeholder="Observações (opcional)..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="input-premium w-full"
            style={{ padding: '10px 14px', borderRadius: 10, fontSize: 14 }}
          />
        </div>

        {/* Right column — Summary */}
        <div className="lg:w-[35%] lg:max-w-sm">
          <PdvSummaryPanel
            items={items}
            promisedDate={promisedDate}
            onPromisedDateChange={setPromisedDate}
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
            error={error}
            isPending={isPending}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  )
}
