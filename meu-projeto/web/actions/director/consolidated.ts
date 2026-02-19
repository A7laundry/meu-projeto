'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getSlaAlerts } from '@/lib/queries/sla-alerts'

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
  const results = await Promise.all(
    unitIds.map(async (unitId) => {
      const alerts = await getSlaAlerts(unitId)
      return { unitId, alertCount: alerts.length }
    }),
  )
  return results
}

export async function getNetworkManifests(unitIds: string[]): Promise<UnitManifestSummary[]> {
  if (unitIds.length === 0) return []

  const supabase = createAdminClient()
  const today = new Date().toISOString().split('T')[0]

  const { data } = await supabase
    .from('daily_manifests')
    .select('unit_id, status')
    .in('unit_id', unitIds)
    .eq('date', today)

  return unitIds.map((unitId) => {
    const unitManifests = (data ?? []).filter((m) => m.unit_id === unitId)
    return {
      unitId,
      totalManifests: unitManifests.length,
      completedManifests: unitManifests.filter((m) => m.status === 'completed').length,
    }
  })
}

export async function exportNetworkKpisCsv(
  units: Array<{ id: string; name: string }>,
  days = 0,
): Promise<string> {
  void days // parâmetro reservado para filtro futuro por período
  const supabase = createAdminClient()
  const today = new Date().toISOString().split('T')[0]

  const rows: string[][] = [
    ['Unidade', 'Comandas hoje', 'A receber (R$)', 'A pagar (R$)', 'Saldo (R$)', 'Alertas SLA', 'Romaneios hoje'],
  ]

  await Promise.all(
    units.map(async (unit) => {
      const [
        { data: orders },
        { data: receivables },
        { data: payables },
        alerts,
        { data: manifests },
      ] = await Promise.all([
        supabase.from('orders').select('id', { count: 'exact', head: true }).eq('unit_id', unit.id).gte('created_at', today),
        supabase.from('receivables').select('amount').eq('unit_id', unit.id).eq('status', 'pending'),
        supabase.from('payables').select('amount').eq('unit_id', unit.id).eq('status', 'pending'),
        getSlaAlerts(unit.id),
        supabase.from('daily_manifests').select('id').eq('unit_id', unit.id).eq('date', today),
      ])

      const totalR = (receivables ?? []).reduce((s, r) => s + Number(r.amount), 0)
      const totalP = (payables ?? []).reduce((s, p) => s + Number(p.amount), 0)

      rows.push([
        unit.name,
        String((orders as unknown as { length: number })?.length ?? 0),
        totalR.toFixed(2),
        totalP.toFixed(2),
        (totalR - totalP).toFixed(2),
        String(alerts.length),
        String((manifests ?? []).length),
      ])
    }),
  )

  return rows.map((r) => r.join(';')).join('\n')
}
