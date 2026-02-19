export type ChemicalCategory = 'detergent' | 'bleach' | 'softener' | 'starch' | 'other'
export type MeasureUnit = 'ml' | 'g' | 'unit'

export const CHEMICAL_CATEGORY_LABELS: Record<ChemicalCategory, string> = {
  detergent: 'Detergente',
  bleach: 'Alvejante',
  softener: 'Amaciante',
  starch: 'Goma / Amido',
  other: 'Outro',
}

export const MEASURE_UNIT_LABELS: Record<MeasureUnit, string> = {
  ml: 'ml',
  g: 'gramas',
  unit: 'unidade',
}

export interface ChemicalProduct {
  id: string
  unit_id: string
  name: string
  category: ChemicalCategory
  measure_unit: MeasureUnit
  cost_per_unit: number | null
  minimum_stock: number
  supplier: string | null
  active: boolean
  current_stock?: number
  created_at: string
}

export interface ChemicalMovement {
  id: string
  product_id: string
  unit_id: string
  movement_type: 'in' | 'out'
  quantity: number
  notes: string | null
  operator_id: string | null
  created_at: string
}
