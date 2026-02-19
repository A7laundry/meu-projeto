'use server'

import { KPI_THRESHOLDS, type KpiAlert } from '@/lib/kpi-thresholds'
import type { AdvancedKpis } from '@/actions/director/kpis-advanced'
import type { UnitSlaCount, UnitManifestSummary } from '@/actions/director/consolidated'
import type { UnitNpsScore } from '@/types/nps'

interface EvaluateInput {
  advancedKpis: AdvancedKpis
  slaAlerts: UnitSlaCount[]
  manifestSummaries: UnitManifestSummary[]
  npsScores: UnitNpsScore[]
}

export function evaluateKpiAlerts({
  advancedKpis,
  slaAlerts,
  manifestSummaries,
  npsScores,
}: EvaluateInput): KpiAlert[] {
  const alerts: KpiAlert[] = []
  const t = KPI_THRESHOLDS

  // Ruptura de entrega
  if (advancedKpis.deliveryBreakageRate >= t.deliveryBreakageCritical) {
    alerts.push({
      level: 'critical',
      category: 'Ruptura de Entrega',
      message: `Taxa de ruptura em ${advancedKpis.deliveryBreakageRate}% — acima do limite crítico de ${t.deliveryBreakageCritical}%`,
    })
  } else if (advancedKpis.deliveryBreakageRate >= t.deliveryBreakageWarning) {
    alerts.push({
      level: 'warning',
      category: 'Ruptura de Entrega',
      message: `Taxa de ruptura em ${advancedKpis.deliveryBreakageRate}% — acima do alerta de ${t.deliveryBreakageWarning}%`,
    })
  }

  // SLA alerts
  const totalSla = slaAlerts.reduce((s, u) => s + u.alertCount, 0)
  if (totalSla >= t.slaAlertsCritical) {
    alerts.push({
      level: 'critical',
      category: 'Alertas SLA',
      message: `${totalSla} alertas SLA ativos na rede — acima do limite crítico de ${t.slaAlertsCritical}`,
    })
  } else if (totalSla >= t.slaAlertsWarning) {
    alerts.push({
      level: 'warning',
      category: 'Alertas SLA',
      message: `${totalSla} alertas SLA ativos na rede`,
    })
  }

  // NPS abaixo do mínimo
  const hour = new Date().getHours()
  if (hour >= 14) {
    for (const unit of npsScores) {
      if (unit.score === null || unit.totalResponses === 0) continue
      if (unit.score <= t.npsMinCritical) {
        alerts.push({
          level: 'critical',
          category: 'NPS',
          message: `NPS de "${unit.unitName}" em ${unit.score} — score negativo`,
        })
      } else if (unit.score < t.npsMinWarning) {
        alerts.push({
          level: 'warning',
          category: 'NPS',
          message: `NPS de "${unit.unitName}" em ${unit.score} — abaixo de ${t.npsMinWarning}`,
        })
      }
    }
  }

  // Romaneios com baixa conclusão (apenas após 14h)
  if (hour >= 14) {
    for (const m of manifestSummaries) {
      if (m.totalManifests === 0) continue
      const rate = m.completedManifests / m.totalManifests
      if (rate < t.manifestCompletionCritical) {
        alerts.push({
          level: 'critical',
          category: 'Romaneios',
          message: `Unidade com apenas ${m.completedManifests}/${m.totalManifests} romaneios concluídos`,
        })
      } else if (rate < t.manifestCompletionWarning) {
        alerts.push({
          level: 'warning',
          category: 'Romaneios',
          message: `Unidade com ${m.completedManifests}/${m.totalManifests} romaneios concluídos`,
        })
      }
    }
  }

  return alerts
}
