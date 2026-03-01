'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import type { KpiAlert } from '@/lib/kpi-thresholds'

/**
 * Persiste alertas executivos no banco.
 * Usa UPSERT com constraint (alert_date, category, level) para idempotência.
 * Retorna quantos alertas novos foram inseridos (não existiam antes).
 */
export async function persistExecutiveAlerts(
  alerts: KpiAlert[]
): Promise<{ newAlerts: number }> {
  if (alerts.length === 0) return { newAlerts: 0 }

  const supabase = createAdminClient()
  const today = new Date().toISOString().split('T')[0]

  // Buscar alertas já existentes hoje para saber quais são novos
  const { data: existing } = await supabase
    .from('executive_alerts')
    .select('category, level')
    .eq('alert_date', today)

  const existingSet = new Set(
    (existing ?? []).map((e) => `${e.category}::${e.level}`)
  )

  const toInsert = alerts
    .filter((a) => !existingSet.has(`${a.category}::${a.level}`))
    .map((a) => ({
      alert_date: today,
      category: a.category,
      level: a.level,
      message: a.message,
      notified: false,
    }))

  if (toInsert.length === 0) return { newAlerts: 0 }

  await supabase
    .from('executive_alerts')
    .upsert(toInsert, { onConflict: 'alert_date,category,level' })

  return { newAlerts: toInsert.length }
}

/**
 * Marca alertas como notificados.
 * Chamado após envio de email para evitar re-disparo.
 */
export async function markAlertsNotified(): Promise<void> {
  const supabase = createAdminClient()
  const today = new Date().toISOString().split('T')[0]

  await supabase
    .from('executive_alerts')
    .update({ notified: true })
    .eq('alert_date', today)
    .eq('notified', false)
}
