'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { requireRole } from '@/lib/auth/guards'
import type { CashflowWeek } from '@/actions/financial/cashflow'

export interface UnitCashflow {
  unitId: string
  unitName: string
  inflows: number
  outflows: number
  net: number
}

export async function getNetworkCashflow(
  year: number,
  month: number,
): Promise<{
  weeks: CashflowWeek[]
  totalInflows: number
  totalOutflows: number
  net: number
  byUnit: UnitCashflow[]
}> {
  await requireRole(['director'])
  const supabase = createAdminClient()

  const { data: units } = await supabase
    .from('units')
    .select('id, name')
    .eq('active', true)
    .order('name')

  const unitIds = (units ?? []).map((u) => u.id)
  if (unitIds.length === 0) {
    return { weeks: [], totalInflows: 0, totalOutflows: 0, net: 0, byUnit: [] }
  }

  const unitMap = new Map<string, string>()
  for (const u of units ?? []) unitMap.set(u.id, u.name)

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate = new Date(year, month, 0).toISOString().split('T')[0]

  const [{ data: receivables }, { data: payables }] = await Promise.all([
    supabase
      .from('receivables')
      .select('amount, paid_at, unit_id')
      .in('unit_id', unitIds)
      .eq('status', 'paid')
      .gte('paid_at', startDate + 'T00:00:00')
      .lte('paid_at', endDate + 'T23:59:59'),
    supabase
      .from('payables')
      .select('amount, paid_at, unit_id')
      .in('unit_id', unitIds)
      .eq('status', 'paid')
      .gte('paid_at', startDate + 'T00:00:00')
      .lte('paid_at', endDate + 'T23:59:59'),
  ])

  function weekOfMonth(dateStr: string): number {
    const day = new Date(dateStr).getDate()
    return Math.ceil(day / 7)
  }

  // Aggregate by week
  const weekMap = new Map<number, { inflows: number; outflows: number }>()
  for (let w = 1; w <= 5; w++) weekMap.set(w, { inflows: 0, outflows: 0 })

  // Aggregate by unit
  const unitAgg = new Map<string, { inflows: number; outflows: number }>()
  for (const uid of unitIds) unitAgg.set(uid, { inflows: 0, outflows: 0 })

  for (const r of receivables ?? []) {
    if (!r.paid_at) continue
    const w = weekOfMonth(r.paid_at)
    const weekEntry = weekMap.get(w) ?? { inflows: 0, outflows: 0 }
    weekEntry.inflows += Number(r.amount)
    weekMap.set(w, weekEntry)

    const unitEntry = unitAgg.get(r.unit_id)
    if (unitEntry) unitEntry.inflows += Number(r.amount)
  }

  for (const p of payables ?? []) {
    if (!p.paid_at) continue
    const w = weekOfMonth(p.paid_at)
    const weekEntry = weekMap.get(w) ?? { inflows: 0, outflows: 0 }
    weekEntry.outflows += Number(p.amount)
    weekMap.set(w, weekEntry)

    const unitEntry = unitAgg.get(p.unit_id)
    if (unitEntry) unitEntry.outflows += Number(p.amount)
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

  const byUnit: UnitCashflow[] = unitIds.map((uid) => {
    const agg = unitAgg.get(uid) ?? { inflows: 0, outflows: 0 }
    return {
      unitId: uid,
      unitName: unitMap.get(uid) ?? 'Desconhecida',
      inflows: agg.inflows,
      outflows: agg.outflows,
      net: agg.inflows - agg.outflows,
    }
  })

  return { weeks, totalInflows, totalOutflows, net: totalInflows - totalOutflows, byUnit }
}
