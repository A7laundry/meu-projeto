export type CrmNoteCategory = 'visit' | 'call' | 'email' | 'other'

export const CRM_NOTE_CATEGORY_LABELS: Record<CrmNoteCategory, string> = {
  visit: 'Visita',
  call: 'Ligação',
  email: 'E-mail',
  other: 'Outro',
}

export interface CrmNote {
  id: string
  unit_id: string
  client_id: string
  author_id: string | null
  author_name?: string | null
  category: CrmNoteCategory
  content: string
  created_at: string
}

export interface ClientStats {
  totalOrders: number
  totalSpent: number
  avgTicket: number
  lastOrderAt: string | null
}
