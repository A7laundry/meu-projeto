'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { requireRole } from '@/lib/auth/guards'
import type { Payable } from '@/types/financial'

export interface NetworkPayable extends Payable {
  unit_name: string
}

export interface NetworkPayableTotals {
  pending: number
  paid: number
  overdue: number
  count: number
}

export async function getNetworkPayables(): Promise<{
  payables: NetworkPayable[]
  totals: NetworkPayableTotals
}> {
  await requireRole(['director'])
  const supabase = createAdminClient()

  const { data: units } = await supabase
    .from('units')
    .select('id, name')
    .eq('active', true)

  const unitIds = (units ?? []).map((u) => u.id)
  if (unitIds.length === 0) {
    return { payables: [], totals: { pending: 0, paid: 0, overdue: 0, count: 0 } }
  }

  const unitMap = new Map<string, string>()
  for (const u of units ?? []) unitMap.set(u.id, u.name)

  const { data } = await supabase
    .from('payables')
    .select('*')
    .in('unit_id', unitIds)
    .order('due_date')

  const payables: NetworkPayable[] = (data ?? []).map((p) => ({
    ...p,
    unit_name: unitMap.get(p.unit_id) ?? 'Desconhecida',
  })) as NetworkPayable[]

  const totals: NetworkPayableTotals = { pending: 0, paid: 0, overdue: 0, count: payables.length }
  for (const p of payables) {
    if (p.status === 'pending') totals.pending += Number(p.amount)
    else if (p.status === 'paid') totals.paid += Number(p.amount)
    else if (p.status === 'overdue') totals.overdue += Number(p.amount)
  }

  return { payables, totals }
}
