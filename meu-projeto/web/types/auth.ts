export type UserRole =
  | 'director'
  | 'unit_manager'
  | 'operator'
  | 'driver'
  | 'store'
  | 'customer'
  | 'sdr'
  | 'closer'
  | 'copywriter'

export type Sector =
  | 'sorting'
  | 'washing'
  | 'drying'
  | 'ironing'
  | 'shipping'

export interface UserProfile {
  id: string
  full_name: string
  role: UserRole
  unit_id: string | null
  sector: Sector | null
  active: boolean
  created_at: string
}
