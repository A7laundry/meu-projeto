import type { PieceType } from '@/types/recipe'

export type PriceUnit = 'peça' | 'kg' | 'par'
export type QuoteStatus = 'draft' | 'sent' | 'approved' | 'rejected'

export const PRICE_UNIT_LABELS: Record<PriceUnit, string> = {
  peça: 'por peça',
  kg: 'por kg',
  par: 'por par',
}

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  draft: 'Rascunho',
  sent: 'Enviado',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
}

export interface PriceTableEntry {
  id: string
  unit_id: string
  piece_type: PieceType
  item_name: string       // '' = preço genérico da família; 'Camisa Social M/L' = item específico
  fabric_type: string | null // tecido/material (opcional)
  price: number
  unit_label: PriceUnit
  active: boolean
  created_at: string
  updated_at: string
}

export interface ClientPrice {
  id: string
  unit_id: string
  client_id: string
  piece_type: PieceType
  price: number
  active: boolean
  created_at: string
}

export interface QuoteItem {
  id: string
  quote_id: string
  piece_type: PieceType
  quantity: number
  unit_price: number
  subtotal: number
  created_at: string
}

export interface Quote {
  id: string
  unit_id: string
  client_id: string
  client_name?: string | null
  status: QuoteStatus
  notes: string | null
  total: number
  order_id: string | null
  created_at: string
  updated_at: string
  items?: QuoteItem[]
}
