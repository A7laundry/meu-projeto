'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const PERIODS = [
  { value: 'today', label: 'Hoje' },
  { value: 'week', label: '7 dias' },
  { value: 'month', label: '30 dias' },
] as const

export function PeriodFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const current = searchParams.get('period') ?? 'today'

  function handleChange(period: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (period === 'today') params.delete('period')
    else params.set('period', period)
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-1 rounded-lg p-0.5" style={{ background: 'rgba(255,255,255,0.04)' }}>
      {PERIODS.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => handleChange(value)}
          className="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
          style={{
            background: current === value ? 'rgba(96,165,250,0.15)' : 'transparent',
            color: current === value ? '#60a5fa' : 'rgba(255,255,255,0.40)',
          }}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

export function getDateFromPeriod(period?: string | null): string {
  const now = new Date()
  switch (period) {
    case 'week':
      return new Date(now.getTime() - 7 * 86400_000).toISOString().split('T')[0]
    case 'month':
      return new Date(now.getTime() - 30 * 86400_000).toISOString().split('T')[0]
    default:
      return now.toISOString().split('T')[0]
  }
}
