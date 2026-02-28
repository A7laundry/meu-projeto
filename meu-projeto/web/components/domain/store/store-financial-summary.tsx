'use client'

import { DollarSign, TrendingUp, TrendingDown, AlertTriangle, Wallet } from 'lucide-react'
import type { Receivable, Payable } from '@/types/financial'

interface StoreFinancialSummaryProps {
  receivables: Receivable[]
  payables: Payable[]
}

export function StoreFinancialSummary({ receivables, payables }: StoreFinancialSummaryProps) {
  const totalReceivable = receivables
    .filter(r => r.status !== 'paid')
    .reduce((s, r) => s + Number(r.amount), 0)
  const totalPayable = payables
    .filter(p => p.status !== 'paid')
    .reduce((s, p) => s + Number(p.amount), 0)
  const balance = totalReceivable - totalPayable
  const overdue = [
    ...receivables.filter(r => r.status === 'overdue'),
    ...payables.filter(p => p.status === 'overdue'),
  ].reduce((s, item) => s + Number(item.amount), 0)
  const paidThisMonth = receivables
    .filter(r => r.status === 'paid' && r.paid_at && new Date(r.paid_at).getMonth() === new Date().getMonth())
    .reduce((s, r) => s + Number(r.amount), 0)

  const cards = [
    { label: 'A Receber', value: totalReceivable, icon: TrendingUp, color: '#34d399' },
    { label: 'A Pagar', value: totalPayable, icon: TrendingDown, color: '#f87171' },
    { label: 'Saldo', value: balance, icon: Wallet, color: balance >= 0 ? '#34d399' : '#f87171' },
    { label: 'Vencidos', value: overdue, icon: AlertTriangle, color: '#fbbf24' },
    { label: 'Recebido (mês)', value: paidThisMonth, icon: DollarSign, color: '#60a5fa' },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      {cards.map(({ label, value, icon: Icon, color }) => (
        <div
          key={label}
          className="card-emerald rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Icon size={14} style={{ color }} />
            <p className="text-[10px] uppercase tracking-wider text-white/35 font-semibold">{label}</p>
          </div>
          <p className="text-xl font-bold num-stat" style={{ color }}>
            R$ {value.toFixed(0)}
          </p>
        </div>
      ))}
    </div>
  )
}
