'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { requireRole } from '@/lib/auth/guards'

export interface ConsolidatedDreUnit {
  unitId: string
  unitName: string
  revenue: number
  suppliesCost: number
  payrollCost: number
  overheadCost: number
  ebit: number
}

export interface ConsolidatedDreReport {
  year: number
  month: number
  units: ConsolidatedDreUnit[]
  totals: {
    revenue: number
    suppliesCost: number
    payrollCost: number
    overheadCost: number
    ebit: number
  }
}

export async function getConsolidatedDre(
  year: number,
  month: number
): Promise<ConsolidatedDreReport> {
  await requireRole(['director'])

  const supabase = createAdminClient()
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate = new Date(year, month, 0).toISOString().split('T')[0]

  // Buscar todas as unidades ativas
  const { data: units } = await supabase
    .from('units')
    .select('id, name')
    .eq('active', true)
    .order('name')

  if (!units || units.length === 0) {
    return { year, month, units: [], totals: { revenue: 0, suppliesCost: 0, payrollCost: 0, overheadCost: 0, ebit: 0 } }
  }

  // Buscar receitas e despesas de todas as unidades de uma vez
  const [receivablesRes, payablesRes] = await Promise.all([
    supabase
      .from('receivables')
      .select('unit_id, amount')
      .eq('status', 'paid')
      .gte('paid_at', startDate + 'T00:00:00')
      .lte('paid_at', endDate + 'T23:59:59'),
    supabase
      .from('payables')
      .select('unit_id, amount, category')
      .eq('status', 'paid')
      .gte('paid_at', startDate + 'T00:00:00')
      .lte('paid_at', endDate + 'T23:59:59'),
  ])

  // Agregar por unidade
  const revenueByUnit = new Map<string, number>()
  for (const r of receivablesRes.data ?? []) {
    revenueByUnit.set(r.unit_id, (revenueByUnit.get(r.unit_id) ?? 0) + Number(r.amount))
  }

  const costsByUnit = new Map<string, { supplies: number; payroll: number; overhead: number }>()
  for (const p of payablesRes.data ?? []) {
    const entry = costsByUnit.get(p.unit_id) ?? { supplies: 0, payroll: 0, overhead: 0 }
    const amount = Number(p.amount)
    if (p.category === 'supplies') entry.supplies += amount
    else if (p.category === 'payroll') entry.payroll += amount
    else entry.overhead += amount
    costsByUnit.set(p.unit_id, entry)
  }

  const dreUnits: ConsolidatedDreUnit[] = units.map((u) => {
    const revenue = revenueByUnit.get(u.id) ?? 0
    const costs = costsByUnit.get(u.id) ?? { supplies: 0, payroll: 0, overhead: 0 }
    return {
      unitId: u.id,
      unitName: u.name,
      revenue,
      suppliesCost: costs.supplies,
      payrollCost: costs.payroll,
      overheadCost: costs.overhead,
      ebit: revenue - costs.supplies - costs.payroll - costs.overhead,
    }
  })

  const totals = dreUnits.reduce(
    (acc, u) => ({
      revenue: acc.revenue + u.revenue,
      suppliesCost: acc.suppliesCost + u.suppliesCost,
      payrollCost: acc.payrollCost + u.payrollCost,
      overheadCost: acc.overheadCost + u.overheadCost,
      ebit: acc.ebit + u.ebit,
    }),
    { revenue: 0, suppliesCost: 0, payrollCost: 0, overheadCost: 0, ebit: 0 }
  )

  return { year, month, units: dreUnits, totals }
}
