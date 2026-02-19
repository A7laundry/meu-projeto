import type { PieceType } from '@/types/order'

export type { PieceType }

export const PIECE_TYPE_LABELS: Record<PieceType, string> = {
  clothing: 'Roupas / Cama / Banho',
  costume: 'Fantasia',
  sneaker: 'Tênis',
  rug: 'Tapete',
  curtain: 'Cortina',
  industrial: 'Industrial (B2B)',
  other: 'Outro',
}

export interface Recipe {
  id: string
  unit_id: string
  name: string
  piece_type: PieceType
  description: string | null
  temperature_celsius: number | null
  duration_minutes: number | null
  chemical_notes: string | null
  active: boolean
  created_at: string
}
