export type ClientType = 'pf' | 'pj'
export type RouteShift = 'morning' | 'afternoon' | 'evening'

export const CLIENT_TYPE_LABELS: Record<ClientType, string> = {
  pf: 'Pessoa Física',
  pj: 'Pessoa Jurídica',
}

export const ROUTE_SHIFT_LABELS: Record<RouteShift, string> = {
  morning: 'Manhã',
  afternoon: 'Tarde',
  evening: 'Noite',
}

export const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export interface Client {
  id: string
  unit_id: string
  name: string
  type: ClientType
  document: string | null
  phone: string | null
  email: string | null
  address_street: string | null
  address_number: string | null
  address_complement: string | null
  address_neighborhood: string | null
  address_city: string | null
  address_state: string | null
  address_zip: string | null
  notes: string | null
  active: boolean
  created_at: string
  updated_at: string
}

export interface LogisticsRoute {
  id: string
  unit_id: string
  name: string
  shift: RouteShift
  weekdays: number[]
  driver_id: string | null
  driver_name?: string | null
  active: boolean
  created_at: string
  updated_at: string
  stops?: RouteStop[]
}

export interface RouteStop {
  id: string
  route_id: string
  client_id: string
  client_name?: string
  position: number
  notes: string | null
  created_at: string
}
