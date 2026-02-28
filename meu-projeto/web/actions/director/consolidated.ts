'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { requireRole } from '@/lib/auth/guards'
import { getSlaAlertsByUnit } from '@/lib/queries/sla-alerts'

export interface UnitFinancial {
  unitId: string
  totalReceivable: number
  totalPayable: number
  balance: number
}

export interface UnitSlaCount {
  unitId: string
  alertCount: number
}

export interface UnitManifestSummary {
  unitId: string
  totalManifests: number
  completedManifests: number
}

export interface NetworkFinancial {
  totalReceivable: number
  totalPayable: number
  balance: number
}

export async function getNetworkFinancial(unitIds: string[]): Promise<NetworkFinancial> {
  await requireRole(['director'])
  if (unitIds.length === 0) return { totalReceivable: 0, totalPayable: 0, balance: 0 }

  const supabase = createAdminClient()
  const [{ data: receivables }, { data: payables }] = await Promise.all([
    supabase
      .from('receivables')
      .select('amount')
      .in('unit_id', unitIds)
      .eq('status', 'pending'),
    supabase
      .from('payables')
      .select('amount')
      .in('unit_id', unitIds)
      .eq('status', 'pending'),
  ])

  const totalReceivable = (receivables ?? []).reduce((s, r) => s + Number(r.amount), 0)
  const totalPayable = (payables ?? []).reduce((s, p) => s + Number(p.amount), 0)

  return { totalReceivable, totalPayable, balance: totalReceivable - totalPayable }
}

export async function getNetworkSlaAlerts(unitIds: string[]): Promise<UnitSlaCount[]> {
  await requireRole(['director'])
  if (unitIds.length === 0) return []

  const alertsByUnit = await getSlaAlertsByUnit(unitIds)
  return unitIds.map((unitId) => ({
    unitId,
    alertCount: alertsByUnit.get(unitId)?.length ?? 0,
  }))
}

export async function getNetworkManifests(unitIds: string[]): Promise<UnitManifestSummary[]> {
  await requireRole(['director'])
  if (unitIds.length === 0) return []

  const supabase = createAdminClient()
  const today = new Date().toISOString().split('T')[0]

  const { data } = await supabase
    .from('daily_manifests')
    .select('unit_id, status')
    .in('unit_id', unitIds)
    .eq('date', today)

  const manifestsByUnit = new Map<string, Array<{ status: string }>>()
  for (const uid of unitIds) manifestsByUnit.set(uid, [])
  for (const m of data ?? []) {
    const arr = manifestsByUnit.get(m.unit_id)
    if (arr) arr.push(m)
  }

  return unitIds.map((unitId) => {
    const unitManifests = manifestsByUnit.get(unitId) ?? []
    return {
      unitId,
      totalManifests: unitManifests.length,
      completedManifests: unitManifests.filter((m) => m.status === 'completed').length,
    }
  })
}

function sanitizeCsvValue(value: string): string {
  // Protect against CSV/formula injection in Excel
  if (/^[=+\-@\t\r]/.test(value)) {
    return `'${value}`
  }
  // Escape double quotes and wrap in quotes if contains separator or special chars
  if (value.includes(';') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export async function exportNetworkKpisCsv(
  units: Array<{ id: string; name: string }>,
  days = 0,
): Promise<string> {
  await requireRole(['director'])
  void days // parâmetro reservado para filtro futuro por período
  if (units.length === 0) return ''

  const supabase = createAdminClient()
  const today = new Date().toISOString().split('T')[0]
  const unitIds = units.map((u) => u.id)

  const [
    { data: allOrders },
    { data: allReceivables },
    { data: allPayables },
    alertsByUnit,
    { data: allManifests },
  ] = await Promise.all([
    supabase.from('orders').select('unit_id').in('unit_id', unitIds).gte('created_at', today),
    supabase.from('receivables').select('unit_id, amount').in('unit_id', unitIds).eq('status', 'pending'),
    supabase.from('payables').select('unit_id, amount').in('unit_id', unitIds).eq('status', 'pending'),
    getSlaAlertsByUnit(unitIds),
    supabase.from('daily_manifests').select('unit_id').in('unit_id', unitIds).eq('date', today),
  ])

  const rows: string[][] = [
    ['Unidade', 'Comandas hoje', 'A receber (R$)', 'A pagar (R$)', 'Saldo (R$)', 'Alertas SLA', 'Romaneios hoje'],
  ]

  for (const unit of units) {
    const orderCount = (allOrders ?? []).filter((o) => o.unit_id === unit.id).length
    const totalR = (allReceivables ?? []).filter((r) => r.unit_id === unit.id).reduce((s, r) => s + Number(r.amount), 0)
    const totalP = (allPayables ?? []).filter((p) => p.unit_id === unit.id).reduce((s, p) => s + Number(p.amount), 0)
    const alertCount = alertsByUnit.get(unit.id)?.length ?? 0
    const manifestCount = (allManifests ?? []).filter((m) => m.unit_id === unit.id).length

    rows.push([
      sanitizeCsvValue(unit.name),
      String(orderCount),
      totalR.toFixed(2),
      totalP.toFixed(2),
      (totalR - totalP).toFixed(2),
      String(alertCount),
      String(manifestCount),
    ])
  }

  return rows.map((r) => r.join(';')).join('\n')
}
