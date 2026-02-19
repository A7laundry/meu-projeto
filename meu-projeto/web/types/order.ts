export type OrderStatus =
  | 'received'
  | 'sorting'
  | 'washing'
  | 'drying'
  | 'ironing'
  | 'ready'
  | 'shipped'
  | 'delivered'

export type PieceType =
  | 'clothing'
  | 'costume'
  | 'sneaker'
  | 'rug'
  | 'curtain'
  | 'industrial'
  | 'other'

export interface OrderItem {
  id: string
  order_id: string
  piece_type: PieceType
  piece_type_label: string | null
  quantity: number
  recipe_id: string | null
  notes: string | null
}

export interface OrderEvent {
  id: string
  order_id: string
  unit_id: string
  sector: string
  event_type: 'entry' | 'exit' | 'alert'
  operator_id: string | null
  equipment_id: string | null
  quantity_processed: number | null
  notes: string | null
  occurred_at: string
}

export interface Order {
  id: string
  unit_id: string
  client_id: string | null
  client_name: string
  order_number: string
  status: OrderStatus
  promised_at: string
  notes: string | null
  created_by: string | null
  created_at: string
  items?: OrderItem[]
  events?: OrderEvent[]
}
