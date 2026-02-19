// Thresholds para alertas executivos
// Estes valores são configuráveis aqui sem necessidade de banco de dados

export const KPI_THRESHOLDS = {
  // Taxa de ruptura de entrega: acima disso dispara alerta
  deliveryBreakageWarning: 10,   // % — warning
  deliveryBreakageCritical: 20,  // % — critical

  // Alertas SLA: total de alertas ativos na rede
  slaAlertsWarning: 5,
  slaAlertsCritical: 15,

  // NPS mínimo aceitável (por unidade)
  npsMinWarning: 30,
  npsMinCritical: 0,

  // Romaneios: percentual de conclusão esperado após 14h
  manifestCompletionWarning: 0.7,   // 70%
  manifestCompletionCritical: 0.5,  // 50%
} as const

export type AlertLevel = 'warning' | 'critical'

export interface KpiAlert {
  level: AlertLevel
  category: string
  message: string
}
