export type FinancialStatus = 'pending' | 'paid' | 'overdue'
export type PayableCategory = 'supplies' | 'equipment' | 'payroll' | 'utilities' | 'rent' | 'other'

export const FINANCIAL_STATUS_LABELS: Record<FinancialStatus, string> = {
  pending: 'Pendente',
  paid: 'Pago',
  overdue: 'Vencido',
}

export const PAYABLE_CATEGORY_LABELS: Record<PayableCategory, string> = {
  supplies: 'Insumos',
  equipment: 'Equipamentos',
  payroll: 'Folha de pagamento',
  utilities: 'Utilidades (água/luz)',
  rent: 'Aluguel',
  other: 'Outros',
}

export interface Receivable {
  id: string
  unit_id: string
  client_id: string | null
  client_name?: string | null
  quote_id: string | null
  description: string
  amount: number
  due_date: string
  status: FinancialStatus
  paid_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Payable {
  id: string
  unit_id: string
  description: string
  supplier: string | null
  amount: number
  due_date: string
  category: PayableCategory
  status: FinancialStatus
  paid_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface FinancialSummary {
  totalReceivable: number
  totalPayable: number
  balance: number
  overdueReceivable: number
  overduePayable: number
}
