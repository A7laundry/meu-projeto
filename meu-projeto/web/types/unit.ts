export interface Unit {
  id: string
  name: string
  slug: string
  address: string | null
  city: string
  state: string
  phone: string | null
  active: boolean
  created_at: string
}
