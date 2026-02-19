export type ClientType = 'individual' | 'business'

export interface Client {
  id: string
  unit_id: string
  name: string
  document: string | null
  phone: string | null
  email: string | null
  type: ClientType
  active: boolean
  created_at: string
}
