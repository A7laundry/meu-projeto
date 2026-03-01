'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { requireRole } from '@/lib/auth/guards'

export interface ClientBilling {
  clientId: string
  clientName: string
  unitName: string
  totalBilled: number
  totalPaid: number
  totalPending: number
}

export interface AgingBucket {
  label: string
  count: number
  amount: number
}

export interface UnitAging {
  unitName: string
  buckets: AgingBucket[]
}

export async function getNetworkBilling(): Promise<{
  clients: ClientBilling[]
  totals: { billed: number; paid: number; pending: number }
}> {
  await requireRole(['director'])
  const supabase = createAdminClient()

  const { data: units } = await supabase
    .from('units')
    .select('id, name')
    .eq('active', true)

  const unitIds = (units ?? []).map((u) => u.id)
  if (unitIds.length === 0) {
    return { clients: [], totals: { billed: 0, paid: 0, pending: 0 } }
  }

  const unitMap = new Map<string, string>()
  for (const u of units ?? []) unitMap.set(u.id, u.name)

  const { data } = await supabase
    .from('receivables')
    .select('client_id, amount, status, unit_id, client:clients(id, name)')
    .in('unit_id', unitIds)

  type ClientKey = string
  const clientAgg = new Map<
    ClientKey,
    { clientId: string; clientName: string; unitName: string; billed: number; paid: number; pending: number }
  >()

  for (const r of data ?? []) {
    if (!r.client_id) continue
    const key = `${r.client_id}__${r.unit_id}`
    const clientArr = r.client as unknown as { id: string; name: string }[] | null
    const client = Array.isArray(clientArr) ? clientArr[0] : clientArr
    const existing = clientAgg.get(key) ?? {
      clientId: r.client_id,
      clientName: client?.name ?? 'Sem nome',
      unitName: unitMap.get(r.unit_id) ?? 'Desconhecida',
      billed: 0,
      paid: 0,
      pending: 0,
    }
    const amount = Number(r.amount)
    existing.billed += amount
    if (r.status === 'paid') existing.paid += amount
    else existing.pending += amount
    clientAgg.set(key, existing)
  }

  const clients: ClientBilling[] = Array.from(clientAgg.values()).map((c) => ({
    clientId: c.clientId,
    clientName: c.clientName,
    unitName: c.unitName,
    totalBilled: c.billed,
    totalPaid: c.paid,
    totalPending: c.pending,
  }))

  clients.sort((a, b) => b.totalBilled - a.totalBilled)

  const totals = { billed: 0, paid: 0, pending: 0 }
  for (const c of clients) {
    totals.billed += c.totalBilled
    totals.paid += c.totalPaid
    totals.pending += c.totalPending
  }

  return { clients, totals }
}

export async function getNetworkAging(): Promise<{
  buckets: AgingBucket[]
  byUnit: UnitAging[]
  grandTotal: number
}> {
  await requireRole(['director'])
  const supabase = createAdminClient()

  const { data: units } = await supabase
    .from('units')
    .select('id, name')
    .eq('active', true)

  const unitIds = (units ?? []).map((u) => u.id)
  if (unitIds.length === 0) {
    return { buckets: [], byUnit: [], grandTotal: 0 }
  }

  const unitMap = new Map<string, string>()
  for (const u of units ?? []) unitMap.set(u.id, u.name)

  const { data } = await supabase
    .from('receivables')
    .select('amount, due_date, unit_id, status')
    .in('unit_id', unitIds)
    .in('status', ['pending', 'overdue'])

  const today = new Date()

  function getBucketIndex(dueDate: string): number {
    const diff = Math.floor((today.getTime() - new Date(dueDate).getTime()) / (1000 * 60 * 60 * 24))
    if (diff <= 30) return 0
    if (diff <= 60) return 1
    if (diff <= 90) return 2
    return 3
  }

  const BUCKET_LABELS = ['0–30 dias', '31–60 dias', '61–90 dias', '90+ dias']

  // Global buckets
  const globalBuckets: AgingBucket[] = BUCKET_LABELS.map((label) => ({ label, count: 0, amount: 0 }))

  // Per-unit buckets
  const unitBuckets = new Map<string, AgingBucket[]>()
  for (const uid of unitIds) {
    unitBuckets.set(uid, BUCKET_LABELS.map((label) => ({ label, count: 0, amount: 0 })))
  }

  let grandTotal = 0
  for (const r of data ?? []) {
    const idx = getBucketIndex(r.due_date)
    const amount = Number(r.amount)
    grandTotal += amount

    globalBuckets[idx].count++
    globalBuckets[idx].amount += amount

    const ub = unitBuckets.get(r.unit_id)
    if (ub) {
      ub[idx].count++
      ub[idx].amount += amount
    }
  }

  const byUnit: UnitAging[] = unitIds
    .map((uid) => ({
      unitName: unitMap.get(uid) ?? 'Desconhecida',
      buckets: unitBuckets.get(uid) ?? [],
    }))
    .filter((u) => u.buckets.some((b) => b.count > 0))

  return { buckets: globalBuckets, byUnit, grandTotal }
}
