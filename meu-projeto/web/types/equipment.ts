export type EquipmentType = 'washer' | 'dryer' | 'iron' | 'other'
export type EquipmentStatus = 'active' | 'maintenance' | 'inactive'

export const EQUIPMENT_TYPE_LABELS: Record<EquipmentType, string> = {
  washer: 'Lavadora',
  dryer: 'Secadora',
  iron: 'Passadeira',
  other: 'Outro',
}

export const EQUIPMENT_STATUS_LABELS: Record<EquipmentStatus, string> = {
  active: 'Operacional',
  maintenance: 'Em Manutenção',
  inactive: 'Inativa',
}

export interface Equipment {
  id: string
  unit_id: string
  name: string
  type: EquipmentType
  brand: string | null
  model: string | null
  serial_number: string | null
  capacity_kg: number | null
  status: EquipmentStatus
  created_at: string
}
