export type ManifestStatus = 'pending' | 'in_progress' | 'completed'
export type StopStatus = 'pending' | 'visited' | 'skipped'

export const MANIFEST_STATUS_LABELS: Record<ManifestStatus, string> = {
  pending: 'Pendente',
  in_progress: 'Em andamento',
  completed: 'Concluído',
}

export const STOP_STATUS_LABELS: Record<StopStatus, string> = {
  pending: 'Pendente',
  visited: 'Visitado',
  skipped: 'Pulado',
}

export interface ManifestStop {
  id: string
  manifest_id: string
  client_id: string
  client_name?: string | null
  client_address?: string | null
  position: number
  status: StopStatus
  notes: string | null
  visited_at: string | null
  created_at: string
}

export interface DailyManifest {
  id: string
  unit_id: string
  route_id: string
  route_name?: string
  route_shift?: string
  date: string
  status: ManifestStatus
  driver_id: string | null
  driver_name?: string | null
  notes: string | null
  created_at: string
  updated_at: string
  stops?: ManifestStop[]
}
