'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { requireRole } from '@/lib/auth/guards'
import type { Receivable } from '@/types/financial'

export interface NetworkReceivable extends Receivable {
  unit_name: string
}

export interface NetworkReceivableTotals {
  pending: number
  paid: number
  overdue: number
  count: number
}

export async function getNetworkReceivables(): Promise<{
  receivables: NetworkReceivable[]
  totals: NetworkReceivableTotals
}> {
  await requireRole(['director'])
  const supabase = createAdminClient()

  const { data: units } = await supabase
    .from('units')
    .select('id, name')
    .eq('active', true)

  const unitIds = (units ?? []).map((u) => u.id)
  if (unitIds.length === 0) {
    return { receivables: [], totals: { pending: 0, paid: 0, overdue: 0, count: 0 } }
  }

  const unitMap = new Map<string, string>()
  for (const u of units ?? []) unitMap.set(u.id, u.name)

  const { data } = await supabase
    .from('receivables')
    .select('*, client:clients(id, name)')
    .in('unit_id', unitIds)
    .order('due_date')

  const receivables: NetworkReceivable[] = (data ?? []).map((r) => ({
    ...r,
    client_name: r.client?.name ?? null,
    unit_name: unitMap.get(r.unit_id) ?? 'Desconhecida',
  })) as NetworkReceivable[]

  const totals: NetworkReceivableTotals = { pending: 0, paid: 0, overdue: 0, count: receivables.length }
  for (const r of receivables) {
    if (r.status === 'pending') totals.pending += Number(r.amount)
    else if (r.status === 'paid') totals.paid += Number(r.amount)
    else if (r.status === 'overdue') totals.overdue += Number(r.amount)
  }

  return { receivables, totals }
}
