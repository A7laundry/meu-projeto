export type EquipmentLogType = 'use' | 'maintenance' | 'incident' | 'repair_completed'

export const EQUIPMENT_LOG_TYPE_LABELS: Record<EquipmentLogType, string> = {
  use: 'Uso normal',
  maintenance: 'Manutenção',
  incident: 'Incidente',
  repair_completed: 'Reparo concluído',
}

export interface EquipmentLog {
  id: string
  equipment_id: string
  unit_id: string
  operator_id: string | null
  operator_name: string | null
  log_type: EquipmentLogType
  cycles: number | null
  notes: string
  occurred_at: string
  created_at: string
}
