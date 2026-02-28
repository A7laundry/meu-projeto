'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { StoreFinancialSummary } from '@/components/domain/store/store-financial-summary'
import { StoreReceivableList } from '@/components/domain/store/store-receivable-list'
import { StorePayableList } from '@/components/domain/store/store-payable-list'
import { StorePayableForm } from '@/components/domain/store/store-payable-form'
import type { Receivable, Payable } from '@/types/financial'

interface FinanceiroPageClientProps {
  receivables: Receivable[]
  payables: Payable[]
  unitId: string
}

type Tab = 'resumo' | 'receber' | 'pagar'

const TABS: { value: Tab; label: string }[] = [
  { value: 'resumo', label: 'Resumo' },
  { value: 'receber', label: 'A Receber' },
  { value: 'pagar', label: 'A Pagar' },
]

export function FinanceiroPageClient({ receivables, payables, unitId }: FinanceiroPageClientProps) {
  const [tab, setTab] = useState<Tab>('resumo')

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p
            className="text-[10px] uppercase tracking-widest font-semibold mb-1"
            style={{ color: 'rgba(52,211,153,0.40)' }}
          >
            Financeiro
          </p>
          <h1 className="text-xl font-bold text-white tracking-tight">Controle Financeiro</h1>
        </div>
        <div className="flex gap-2">
          <StorePayableForm unitId={unitId} />
          <Link
            href="/store/financeiro/cashflow"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.10)',
              color: 'rgba(255,255,255,0.55)',
            }}
          >
            <ExternalLink size={14} />
            Fluxo de Caixa
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1">
        {TABS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className="px-5 py-2.5 rounded-lg text-xs font-semibold transition-all"
            style={tab === value ? {
              background: 'rgba(52,211,153,0.12)',
              border: '1px solid rgba(52,211,153,0.25)',
              color: '#34d399',
            } : {
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.45)',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'resumo' && (
        <StoreFinancialSummary receivables={receivables} payables={payables} />
      )}
      {tab === 'receber' && (
        <StoreReceivableList receivables={receivables} unitId={unitId} />
      )}
      {tab === 'pagar' && (
        <StorePayableList payables={payables} unitId={unitId} />
      )}
    </div>
  )
}
