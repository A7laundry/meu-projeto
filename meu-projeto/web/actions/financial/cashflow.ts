'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export interface CashflowWeek {
  week: number
  label: string
  inflows: number
  outflows: number
  net: number
}

export interface DreRow {
  label: string
  amount: number
  isPositive: boolean
  isTotal?: boolean
  isSeparator?: boolean
}

export async function getCashflowData(
  unitId: string,
  year: number,
  month: number,
): Promise<{ weeks: CashflowWeek[]; totalInflows: number; totalOutflows: number; net: number }> {
  const supabase = createAdminClient()

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate = new Date(year, month, 0).toISOString().split('T')[0] // last day

  const [{ data: receivables }, { data: payables }] = await Promise.all([
    supabase
      .from('receivables')
      .select('amount, paid_at')
      .eq('unit_id', unitId)
      .eq('status', 'paid')
      .gte('paid_at', startDate + 'T00:00:00')
      .lte('paid_at', endDate + 'T23:59:59'),
    supabase
      .from('payables')
      .select('amount, paid_at')
      .eq('unit_id', unitId)
      .eq('status', 'paid')
      .gte('paid_at', startDate + 'T00:00:00')
      .lte('paid_at', endDate + 'T23:59:59'),
  ])

  // Agrupa por semana do mês (1-5)
  function weekOfMonth(dateStr: string): number {
    const day = new Date(dateStr).getDate()
    return Math.ceil(day / 7)
  }

  const weekMap = new Map<number, { inflows: number; outflows: number }>()
  for (let w = 1; w <= 5; w++) weekMap.set(w, { inflows: 0, outflows: 0 })

  for (const r of receivables ?? []) {
    if (!r.paid_at) continue
    const w = weekOfMonth(r.paid_at)
    const entry = weekMap.get(w) ?? { inflows: 0, outflows: 0 }
    entry.inflows += Number(r.amount)
    weekMap.set(w, entry)
  }

  for (const p of payables ?? []) {
    if (!p.paid_at) continue
    const w = weekOfMonth(p.paid_at)
    const entry = weekMap.get(w) ?? { inflows: 0, outflows: 0 }
    entry.outflows += Number(p.amount)
    weekMap.set(w, entry)
  }

  const weeks: CashflowWeek[] = Array.from(weekMap.entries()).map(([w, d]) => ({
    week: w,
    label: `Semana ${w}`,
    inflows: d.inflows,
    outflows: d.outflows,
    net: d.inflows - d.outflows,
  }))

  const totalInflows = weeks.reduce((s, w) => s + w.inflows, 0)
  const totalOutflows = weeks.reduce((s, w) => s + w.outflows, 0)

  return { weeks, totalInflows, totalOutflows, net: totalInflows - totalOutflows }
}

export async function getDreData(
  unitId: string,
  year: number,
  month: number,
): Promise<DreRow[]> {
  const supabase = createAdminClient()

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate = new Date(year, month, 0).toISOString().split('T')[0]

  const [{ data: receivables }, { data: payables }] = await Promise.all([
    supabase
      .from('receivables')
      .select('amount')
      .eq('unit_id', unitId)
      .eq('status', 'paid')
      .gte('paid_at', startDate + 'T00:00:00')
      .lte('paid_at', endDate + 'T23:59:59'),
    supabase
      .from('payables')
      .select('amount, category')
      .eq('unit_id', unitId)
      .eq('status', 'paid')
      .gte('paid_at', startDate + 'T00:00:00')
      .lte('paid_at', endDate + 'T23:59:59'),
  ])

  const revenue = (receivables ?? []).reduce((s, r) => s + Number(r.amount), 0)

  const costByCategory = new Map<string, number>()
  for (const p of payables ?? []) {
    costByCategory.set(p.category, (costByCategory.get(p.category) ?? 0) + Number(p.amount))
  }

  const supplies = costByCategory.get('supplies') ?? 0
  const payroll = costByCategory.get('payroll') ?? 0
  const rent = costByCategory.get('rent') ?? 0
  const utilities = costByCategory.get('utilities') ?? 0
  const equipment = costByCategory.get('equipment') ?? 0
  const other = costByCategory.get('other') ?? 0

  const grossProfit = revenue - supplies
  const totalOverhead = rent + utilities + equipment + other
  const ebit = grossProfit - payroll - totalOverhead

  return [
    { label: '(+) Receita bruta', amount: revenue, isPositive: true },
    { label: '(-) Custo de insumos', amount: -supplies, isPositive: supplies === 0 },
    { label: 'Lucro bruto', amount: grossProfit, isPositive: grossProfit >= 0, isTotal: true },
    { label: '(-) Folha de pagamento', amount: -payroll, isPositive: payroll === 0 },
    { label: '(-) Aluguel', amount: -rent, isPositive: rent === 0 },
    { label: '(-) Utilidades', amount: -utilities, isPositive: utilities === 0 },
    { label: '(-) Equipamentos', amount: -equipment, isPositive: equipment === 0 },
    { label: '(-) Outros', amount: -other, isPositive: other === 0 },
    { label: 'Resultado Operacional (EBIT)', amount: ebit, isPositive: ebit >= 0, isTotal: true },
  ]
}
