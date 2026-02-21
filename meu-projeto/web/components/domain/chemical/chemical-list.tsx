'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { ChemicalFormDialog } from '@/components/domain/chemical/chemical-form-dialog'
import { ChemicalMovementForm } from '@/components/domain/chemical/chemical-movement-form'
import {
  CHEMICAL_CATEGORY_LABELS,
  MEASURE_UNIT_LABELS,
  type ChemicalProduct,
} from '@/types/chemical'

interface ChemicalListProps {
  unitId: string
  products: ChemicalProduct[]
}

export function ChemicalList({ unitId, products }: ChemicalListProps) {
  const [expanded, setExpanded] = useState<string | null>(null)

  if (products.length === 0) {
    return (
      <p className="text-center text-white/35 py-16">
        Nenhum produto cadastrado. Adicione o primeiro insumo.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {products.map((p) => {
        const belowMin = (p.current_stock ?? 0) < p.minimum_stock
        const isExpanded = expanded === p.id
        const unit = MEASURE_UNIT_LABELS[p.measure_unit]

        return (
          <div
            key={p.id}
            className={`rounded-xl border bg-[rgba(255,255,255,0.04)] p-4 space-y-3 ${belowMin ? 'border-red-300' : ''}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-white">{p.name}</span>
                  <Badge variant="secondary">{CHEMICAL_CATEGORY_LABELS[p.category]}</Badge>
                  {!p.active && <Badge variant="destructive">Inativo</Badge>}
                  {belowMin && (
                    <Badge variant="destructive">
                      ⚠ Estoque baixo
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-white/40 mt-0.5">
                  {p.supplier ? `Fornecedor: ${p.supplier} · ` : ''}
                  {p.cost_per_unit != null
                    ? `R$ ${p.cost_per_unit.toFixed(4)}/${unit}`
                    : 'Sem custo cadastrado'}
                </p>
              </div>

              <div className="text-right flex-shrink-0">
                <p
                  className={`text-2xl font-bold tabular-nums ${belowMin ? 'text-red-600' : 'text-white'}`}
                >
                  {(p.current_stock ?? 0).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-white/35">{unit}</p>
                {p.minimum_stock > 0 && (
                  <p className="text-xs text-white/35">Mín: {p.minimum_stock} {unit}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setExpanded(isExpanded ? null : p.id)}
                className="text-xs text-[#60a5fa] hover:underline"
              >
                {isExpanded ? 'Fechar movimentação' : 'Registrar entrada/saída'}
              </button>
              <span className="text-white/60">·</span>
              <ChemicalFormDialog unitId={unitId} mode="edit" product={p} />
            </div>

            {isExpanded && (
              <ChemicalMovementForm
                product={p}
                unitId={unitId}
                onSuccess={() => setExpanded(null)}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
