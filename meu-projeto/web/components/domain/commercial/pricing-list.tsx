'use client'

import { PricingFormDialog } from '@/components/domain/commercial/pricing-form-dialog'
import type { PriceTableEntry } from '@/types/pricing'

const PIECE_LABELS: Record<string, string> = {
  clothing:  'Roupa comum',
  costume:   'Fantasia / Uniforme',
  sneaker:   'Tênis / Calçado',
  rug:       'Tapete',
  curtain:   'Cortina / Persiana',
  industrial:'Industrial',
  other:     'Outro',
}

const PIECE_ICONS: Record<string, string> = {
  clothing:  '👕',
  costume:   '🎭',
  sneaker:   '👟',
  rug:       '🪨',
  curtain:   '🪟',
  industrial:'🏭',
  other:     '📦',
}

const UNIT_LABELS: Record<string, string> = {
  'peça': 'por peça',
  'kg':   'por kg',
  'par':  'por par',
}

function fmtBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

interface PricingListProps {
  unitId: string
  entries: PriceTableEntry[]
}

export function PricingList({ unitId, entries }: PricingListProps) {
  const sorted = [...entries].sort((a, b) => {
    const order = ['clothing', 'costume', 'sneaker', 'rug', 'curtain', 'industrial', 'other']
    const typeDiff = order.indexOf(a.piece_type) - order.indexOf(b.piece_type)
    if (typeDiff !== 0) return typeDiff
    // Itens genéricos (item_name='') primeiro, depois específicos em ordem alfabética
    if (!a.item_name && b.item_name) return -1
    if (a.item_name && !b.item_name) return 1
    return a.item_name.localeCompare(b.item_name)
  })

  return (
    <div className="space-y-6">
      {/* Header com botão */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/35">
          {entries.length} item{entries.length !== 1 ? 'ns' : ''} na tabela de preços
        </p>
        <PricingFormDialog unitId={unitId} />
      </div>

      {/* Grid de cards */}
      {entries.length === 0 ? (
        <div
          className="rounded-2xl p-12 text-center"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <p className="text-3xl mb-3">💰</p>
          <p className="text-white/60 font-medium mb-1">Nenhum preço cadastrado</p>
          <p className="text-sm text-white/30">
            Clique em &quot;Novo Preço&quot; para começar a configurar sua tabela de serviços.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sorted.map((entry) => (
            <PriceCard key={entry.id} entry={entry} unitId={unitId} />
          ))}
        </div>
      )}

      {/* Legenda */}
      {entries.length > 0 && (
        <p className="text-xs text-white/25 text-center pt-2">
          Os preços são usados para calcular o valor estimado das comandas.
          Itens específicos (com nome) aparecem na seleção ao criar comandas.
        </p>
      )}
    </div>
  )
}

function PriceCard({ entry, unitId }: { entry: PriceTableEntry; unitId: string }) {
  const icon = PIECE_ICONS[entry.piece_type] ?? '📦'
  const familyLabel = PIECE_LABELS[entry.piece_type] ?? entry.piece_type
  const unitLabel = UNIT_LABELS[entry.unit_label] ?? entry.unit_label
  const isSpecific = Boolean(entry.item_name)

  return (
    <div
      className="rounded-xl p-4 flex items-start gap-3 group transition-all"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: isSpecific
          ? '1px solid rgba(214,178,94,0.12)'
          : '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {/* Ícone */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
        style={{
          background: 'rgba(214,178,94,0.08)',
          border: '1px solid rgba(214,178,94,0.14)',
        }}
      >
        {icon}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        {/* Nome específico ou família */}
        {isSpecific ? (
          <>
            <p className="text-sm font-semibold text-white/90 leading-tight truncate">
              {entry.item_name}
            </p>
            <p className="text-[11px] text-white/35 mt-0.5">
              {familyLabel}
              {entry.fabric_type && ` · ${entry.fabric_type}`}
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold text-white/80 leading-tight">{familyLabel}</p>
            <p className="text-[11px] text-white/35 mt-0.5">Preço genérico · {unitLabel}</p>
          </>
        )}
        <p className="text-xl font-bold mt-1.5 tabular-nums" style={{ color: '#d6b25e' }}>
          {fmtBRL(entry.price)}
          {isSpecific && (
            <span className="text-xs font-normal text-white/35 ml-1">{unitLabel}</span>
          )}
        </p>
      </div>

      {/* Editar */}
      <PricingFormDialog
        unitId={unitId}
        entry={entry}
        trigger={
          <button
            className="opacity-0 group-hover:opacity-100 transition-opacity text-xs px-2 py-1 rounded-lg flex-shrink-0"
            style={{
              background: 'rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.45)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            Editar
          </button>
        }
      />
    </div>
  )
}
