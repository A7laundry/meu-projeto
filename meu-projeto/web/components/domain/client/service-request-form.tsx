'use client'

import { useState, useTransition } from 'react'
import { createServiceRequest, type ServiceRequestInput } from '@/actions/client/service-request'

const PIECE_TYPES = [
  { value: 'clothing', label: 'Roupas' },
  { value: 'costume', label: 'Fantasias' },
  { value: 'sneaker', label: 'Tênis' },
  { value: 'rug', label: 'Tapetes' },
  { value: 'curtain', label: 'Cortinas' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'other', label: 'Outros' },
]

interface ServiceRequestFormProps {
  clientId: string
  unitId: string
  onClose: () => void
}

export function ServiceRequestForm({ clientId, unitId, onClose }: ServiceRequestFormProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [items, setItems] = useState<{ piece_type: string; quantity: number }[]>([
    { piece_type: 'clothing', quantity: 1 },
  ])
  const [address, setAddress] = useState('')
  const [date, setDate] = useState('')
  const [notes, setNotes] = useState('')

  function addItem() {
    setItems([...items, { piece_type: 'clothing', quantity: 1 }])
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index))
  }

  function updateItem(index: number, field: 'piece_type' | 'quantity', value: string | number) {
    setItems(items.map((item, i) => i === index ? { ...item, [field]: value } : item))
  }

  function handleSubmit() {
    setError(null)
    const input: ServiceRequestInput = {
      unitId,
      clientId,
      pieceTypes: items,
      pickupAddress: address,
      preferredDate: date,
      notes: notes || undefined,
    }
    startTransition(async () => {
      const result = await createServiceRequest(input)
      if (result.success) {
        setSuccess(true)
      } else {
        setError(result.error)
      }
    })
  }

  const inputStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: 10,
    color: 'white',
    padding: '12px 14px',
    fontSize: 15,
    width: '100%',
    outline: 'none',
  }

  if (success) {
    return (
      <div className="px-5 py-8 text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4"
          style={{ background: 'rgba(52,211,153,0.10)', border: '1px solid rgba(52,211,153,0.20)' }}
        >
          ✓
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Solicitação enviada!</h3>
        <p className="text-sm text-white/40 mb-6">
          A lavanderia vai analisar e entrar em contato para confirmar a coleta.
        </p>
        <button
          onClick={onClose}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold"
          style={{
            background: 'rgba(59,130,246,0.12)',
            color: '#60a5fa',
            border: '1px solid rgba(59,130,246,0.25)',
          }}
        >
          Voltar ao início
        </button>
      </div>
    )
  }

  return (
    <div className="px-5 py-4 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Nova Solicitação</h3>
        <button onClick={onClose} className="text-sm text-white/30 hover:text-white/60">
          Cancelar
        </button>
      </div>

      {error && (
        <p
          className="text-sm rounded-xl px-4 py-2.5"
          style={{ background: 'rgba(248,113,113,0.10)', color: '#fca5a5', border: '1px solid rgba(248,113,113,0.22)' }}
        >
          {error}
        </p>
      )}

      {/* Itens */}
      <div>
        <label className="text-xs text-white/35 uppercase tracking-wide block mb-2">Peças para lavar</label>
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex gap-2 items-center">
              <select
                value={item.piece_type}
                onChange={(e) => updateItem(i, 'piece_type', e.target.value)}
                style={{ ...inputStyle, flex: 1 }}
              >
                {PIECE_TYPES.map(({ value, label }) => (
                  <option key={value} value={value} style={{ background: '#111', color: '#fff' }}>
                    {label}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) => updateItem(i, 'quantity', parseInt(e.target.value) || 1)}
                style={{ ...inputStyle, width: 70, textAlign: 'center' }}
              />
              {items.length > 1 && (
                <button onClick={() => removeItem(i)} className="text-white/25 hover:text-red-400 text-lg px-1">
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={addItem}
          className="mt-2 text-xs font-medium px-3 py-1.5 rounded-lg"
          style={{ color: '#60a5fa', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.18)' }}
        >
          + Adicionar tipo
        </button>
      </div>

      {/* Endereço */}
      <div>
        <label className="text-xs text-white/35 uppercase tracking-wide block mb-1.5">Endereço para coleta</label>
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Rua, número, bairro..."
          style={inputStyle}
        />
      </div>

      {/* Data */}
      <div>
        <label className="text-xs text-white/35 uppercase tracking-wide block mb-1.5">Data preferida</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          style={inputStyle}
        />
      </div>

      {/* Observações */}
      <div>
        <label className="text-xs text-white/35 uppercase tracking-wide block mb-1.5">Observações</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Instruções especiais, cuidados..."
          rows={2}
          style={{ ...inputStyle, resize: 'none', fontSize: 14 }}
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={isPending || !address || !date || items.length === 0}
        className="w-full py-3.5 rounded-xl text-base font-bold transition-all disabled:opacity-40"
        style={{
          background: isPending ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #3b82f6, #60a5fa)',
          color: 'white',
          border: '1px solid rgba(59,130,246,0.30)',
        }}
      >
        {isPending ? 'Enviando...' : 'Enviar solicitação'}
      </button>
    </div>
  )
}
