'use client'

import { useRef, useState, useTransition } from 'react'
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
import type { PriceTableEntry } from '@/types/pricing'

const PIECE_TYPES = [
  { value: 'clothing',   label: 'Roupa comum',         icon: '👕' },
  { value: 'costume',    label: 'Fantasia / Uniforme',  icon: '🎭' },
  { value: 'sneaker',    label: 'Tênis / Calçado',      icon: '👟' },
  { value: 'rug',        label: 'Tapete',               icon: '🪨' },
  { value: 'curtain',    label: 'Cortina / Persiana',   icon: '🪟' },
  { value: 'industrial', label: 'Industrial',           icon: '🏭' },
  { value: 'other',      label: 'Outro',                icon: '📦' },
]

const UNIT_LABELS = [
  { value: 'peça', label: 'por peça' },
  { value: 'par',  label: 'por par' },
  { value: 'kg',   label: 'por kg' },
]

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
      if (!result.success) { setError(result.error); return }
      setOpen(false)
      formRef.current?.reset()
    })
  }

  const selectedPiece = PIECE_TYPES.find(p => p.value === pieceType)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <button
            className="btn-gold px-4 py-2 rounded-lg text-sm font-semibold"
          >
            + Novo Preço
          </button>
        )}
      </DialogTrigger>

      <DialogContent
        className="max-w-md"
        style={{
          background: '#0d0d14',
          border: '1px solid rgba(214,178,94,0.15)',
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-white font-semibold">
            {entry ? 'Editar Preço' : 'Cadastrar Preço'}
          </DialogTitle>
        </DialogHeader>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Família / Tipo de peça */}
          <div className="space-y-1.5">
            <Label className="text-white/50 text-xs uppercase tracking-wider">Família *</Label>
            <Select value={pieceType} onValueChange={setPieceType}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Selecionar família..." />
              </SelectTrigger>
              <SelectContent>
                {PIECE_TYPES.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    <span className="flex items-center gap-2">
                      <span>{p.icon}</span>
                      <span>{p.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Item específico e tecido (visíveis após selecionar família) */}
          {pieceType && (
            <div className="space-y-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-xs text-white/40 uppercase tracking-wider font-semibold">
                Detalhes do item (opcional)
              </p>

              <div className="space-y-1.5">
                <Label className="text-white/50 text-xs">Nome do item</Label>
                <Input
                  name="item_name"
                  defaultValue={entry?.item_name ?? ''}
                  placeholder={`Ex: Camisa Social M/L, Calça Jeans, Tênis Nike...`}
                  className="h-10 text-sm"
                />
                <p className="text-[11px] text-white/30">
                  Deixe em branco para preço genérico da família
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-white/50 text-xs">Tecido / Material</Label>
                <Input
                  name="fabric_type"
                  defaultValue={entry?.fabric_type ?? ''}
                  placeholder="Ex: Algodão, Sarja, Linho, Sintético..."
                  className="h-10 text-sm"
                />
              </div>
            </div>
          )}

          {/* Preço + Unidade */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-white/50 text-xs uppercase tracking-wider">
                Preço (R$) *
              </Label>
              <Input
                name="price"
                type="number"
                step="0.01"
                min="0"
                required
                defaultValue={entry?.price}
                placeholder="0,00"
                className="h-11 text-base font-semibold"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-white/50 text-xs uppercase tracking-wider">Unidade</Label>
              <Select value={unitLabel} onValueChange={setUnitLabel}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNIT_LABELS.map((u) => (
                    <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Preview */}
          {pieceType && (
            <div
              className="rounded-xl p-3 flex items-center gap-3"
              style={{
                background: 'rgba(214,178,94,0.06)',
                border: '1px solid rgba(214,178,94,0.12)',
              }}
            >
              <span className="text-xl">{selectedPiece?.icon}</span>
              <div>
                <p className="text-xs text-white/40">{selectedPiece?.label}</p>
                <p className="text-sm font-semibold text-white/80">
                  cobrado{' '}
                  <span style={{ color: '#d6b25e' }}>
                    {UNIT_LABELS.find(u => u.value === unitLabel)?.label}
                  </span>
                </p>
              </div>
            </div>
          )}

          {error && (
            <p className="text-sm px-3 py-2 rounded-lg"
              style={{ background: 'rgba(248,113,113,0.08)', color: '#fca5a5', border: '1px solid rgba(248,113,113,0.20)' }}>
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 py-2.5 rounded-lg text-sm text-white/40 hover:text-white/60 transition-colors"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending || !pieceType}
              className="flex-1 btn-gold py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50"
            >
              {isPending ? 'Salvando...' : 'Salvar Preço'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
