'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { PriceTableEntry } from '@/types/pricing'

export interface PdvItem {
  piece_type: string
  label: string
  quantity: number
  unit_price: number
  isCustom?: boolean
}

interface PdvItemPickerProps {
  prices: PriceTableEntry[]
  items: PdvItem[]
  onItemsChange: (items: PdvItem[]) => void
}

const PIECE_TYPE_ICONS: Record<string, string> = {
  clothing: '👔',
  costume: '🎭',
  sneaker: '👟',
  rug: '🧶',
  curtain: '🪟',
  industrial: '🏭',
  other: '📦',
}

const PIECE_TYPE_SHORT_LABELS: Record<string, string> = {
  clothing: 'Roupa',
  costume: 'Fantasia',
  sneaker: 'Tênis',
  rug: 'Tapete',
  curtain: 'Cortina',
  industrial: 'Industrial',
  other: 'Outro',
}

export function PdvItemPicker({ prices, items, onItemsChange }: PdvItemPickerProps) {
  const [customOpen, setCustomOpen] = useState(false)
  const [customLabel, setCustomLabel] = useState('')
  const [customPrice, setCustomPrice] = useState('')

  function getItemIndex(pieceType: string, isCustom?: boolean, label?: string) {
    return items.findIndex(i =>
      i.piece_type === pieceType &&
      Boolean(i.isCustom) === Boolean(isCustom) &&
      (!isCustom || i.label === label)
    )
  }

  function addOrIncrement(pieceType: string, label: string, unitPrice: number, isCustom = false) {
    const idx = getItemIndex(pieceType, isCustom, isCustom ? label : undefined)
    const next = [...items]
    if (idx >= 0) {
      next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 }
    } else {
      next.push({ piece_type: pieceType, label, quantity: 1, unit_price: unitPrice, isCustom })
    }
    onItemsChange(next)
  }

  function decrement(pieceType: string, isCustom?: boolean, label?: string) {
    const idx = getItemIndex(pieceType, isCustom, label)
    if (idx < 0) return
    const next = [...items]
    if (next[idx].quantity <= 1) {
      next.splice(idx, 1)
    } else {
      next[idx] = { ...next[idx], quantity: next[idx].quantity - 1 }
    }
    onItemsChange(next)
  }

  function getQuantity(pieceType: string) {
    const item = items.find(i => i.piece_type === pieceType && !i.isCustom)
    return item?.quantity ?? 0
  }

  // Group prices by piece_type (use first/generic price)
  const priceMap = new Map<string, PriceTableEntry>()
  for (const p of prices) {
    if (!priceMap.has(p.piece_type) && p.active) {
      priceMap.set(p.piece_type, p)
    }
  }

  const pieceTypes = Array.from(priceMap.entries())

  function handleCustomSubmit() {
    if (!customLabel.trim() || !customPrice) return
    const price = parseFloat(customPrice)
    if (isNaN(price) || price < 0) return
    addOrIncrement('other', customLabel.trim(), price, true)
    setCustomLabel('')
    setCustomPrice('')
    setCustomOpen(false)
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {pieceTypes.map(([type, entry]) => {
          const qty = getQuantity(type)
          const icon = PIECE_TYPE_ICONS[type] ?? '📦'
          const label = PIECE_TYPE_SHORT_LABELS[type] ?? (entry.item_name || type)

          return (
            <div
              key={type}
              className="rounded-xl p-4 flex flex-col items-center gap-2.5 transition-all select-none"
              style={{
                background: qty > 0
                  ? 'rgba(52,211,153,0.08)'
                  : 'rgba(255,255,255,0.03)',
                border: qty > 0
                  ? '1.5px solid rgba(52,211,153,0.30)'
                  : '1px solid rgba(255,255,255,0.07)',
                minHeight: 120,
                boxShadow: qty > 0 ? '0 0 20px rgba(52,211,153,0.06)' : 'none',
              }}
            >
              <span className="text-3xl">{icon}</span>
              <p className="text-xs font-medium text-white/70 text-center leading-tight">{label}</p>
              <p className="text-[11px] font-semibold" style={{ color: '#34d399' }}>
                R$ {Number(entry.price).toFixed(2)}
              </p>

              {/* Quantity controls — 48px touch targets */}
              <div className="flex items-center gap-1.5 mt-auto">
                <button
                  type="button"
                  onClick={() => decrement(type)}
                  disabled={qty === 0}
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold transition-all disabled:opacity-20"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.10)',
                    color: '#fff',
                  }}
                >
                  -
                </button>
                <span
                  className="w-8 text-center text-sm font-bold num-stat"
                  style={{ color: qty > 0 ? '#34d399' : 'rgba(255,255,255,0.25)' }}
                >
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => addOrIncrement(type, label, Number(entry.price))}
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold transition-all"
                  style={{
                    background: 'rgba(52,211,153,0.12)',
                    border: '1px solid rgba(52,211,153,0.30)',
                    color: '#34d399',
                  }}
                >
                  +
                </button>
              </div>
            </div>
          )
        })}

        {/* Custom item button */}
        <button
          type="button"
          onClick={() => setCustomOpen(true)}
          className="rounded-xl p-4 flex flex-col items-center justify-center gap-2.5 transition-all"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px dashed rgba(255,255,255,0.12)',
            minHeight: 120,
            cursor: 'pointer',
          }}
        >
          <span className="text-2xl">✏️</span>
          <p className="text-xs font-medium text-white/40">Outro</p>
          <p className="text-[10px] text-white/25">Preço manual</p>
        </button>
      </div>

      {/* Custom items summary */}
      {items.filter(i => i.isCustom).length > 0 && (
        <div className="mt-3 space-y-1">
          {items.filter(i => i.isCustom).map((item, idx) => (
            <div
              key={`custom-${idx}`}
              className="flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <span className="text-xs text-white/60 flex-1">{item.label}</span>
              <span className="text-[11px] font-semibold" style={{ color: '#34d399' }}>
                R$ {item.unit_price.toFixed(2)}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => decrement(item.piece_type, true, item.label)}
                  className="w-7 h-7 rounded flex items-center justify-center text-sm font-bold"
                  style={{ background: 'rgba(255,255,255,0.06)', color: '#fff' }}
                >
                  -
                </button>
                <span className="w-6 text-center text-xs font-bold" style={{ color: '#34d399' }}>
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => addOrIncrement(item.piece_type, item.label, item.unit_price, true)}
                  className="w-7 h-7 rounded flex items-center justify-center text-sm font-bold"
                  style={{ background: 'rgba(52,211,153,0.12)', color: '#34d399' }}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Custom item dialog */}
      <Dialog open={customOpen} onOpenChange={setCustomOpen}>
        <DialogContent
          className="max-w-sm p-0 overflow-hidden"
          style={{
            background: '#09090f',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 20,
          }}
        >
          <div className="px-6 pt-6 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <DialogHeader>
              <DialogTitle className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(52,211,153,0.55)' }}>
                Item personalizado
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-white/55">Nome do item</label>
              <input
                value={customLabel}
                onChange={e => setCustomLabel(e.target.value)}
                placeholder="Ex: Edredom King"
                className="input-premium w-full"
                style={{ padding: '10px 14px', borderRadius: 10, fontSize: 14 }}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-white/55">Preço unitário (R$)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={customPrice}
                onChange={e => setCustomPrice(e.target.value)}
                placeholder="0.00"
                className="input-premium w-full"
                style={{ padding: '10px 14px', borderRadius: 10, fontSize: 14 }}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCustomOpen(false)}
                className="flex-1 py-3 rounded-xl text-sm font-medium"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.65)' }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCustomSubmit}
                disabled={!customLabel.trim() || !customPrice}
                className="flex-1 py-3 rounded-xl text-sm font-bold btn-emerald disabled:opacity-40"
              >
                Adicionar
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
