'use client'

import { useEffect, useState, useTransition } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { listMovements } from '@/actions/chemicals/movements'
import { MEASURE_UNIT_LABELS, type ChemicalMovement, type ChemicalProduct } from '@/types/chemical'

interface Props {
  product: ChemicalProduct
  unitId: string
}

export function ChemicalMovementHistory({ product, unitId }: Props) {
  const [open, setOpen] = useState(false)
  const [movements, setMovements] = useState<ChemicalMovement[] | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!open) return
    let cancelled = false
    startTransition(async () => {
      const data = await listMovements(unitId, product.id, 50)
      if (!cancelled) setMovements(data)
    })
    return () => { cancelled = true }
  }, [open, unitId, product.id])

  const unit = MEASURE_UNIT_LABELS[product.measure_unit]

  function handleOpenChange(value: boolean) {
    setOpen(value)
    if (!value) setMovements(null)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button className="text-xs text-[#60a5fa] hover:underline">
          Ver histórico
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Histórico — {product.name}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto mt-2">
          {isPending || movements === null ? (
            <p className="text-center text-white/40 py-8">Carregando...</p>
          ) : movements.length === 0 ? (
            <p className="text-center text-white/40 py-8">
              Nenhuma movimentação registrada.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs text-white/50 uppercase">
                  <th className="pb-2 pr-3">Data</th>
                  <th className="pb-2 pr-3">Tipo</th>
                  <th className="pb-2 pr-3 text-right">Qtd ({unit})</th>
                  <th className="pb-2">Nota</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => (
                  <tr key={m.id} className="border-b border-white/5">
                    <td className="py-2 pr-3 text-white/60 whitespace-nowrap">
                      {new Date(m.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-2 pr-3">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                          m.movement_type === 'in'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-red-500/15 text-red-400'
                        }`}
                      >
                        {m.movement_type === 'in' ? '+ Entrada' : '− Saída'}
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums text-white">
                      {m.quantity.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 text-white/40 truncate max-w-[160px]">
                      {m.notes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
