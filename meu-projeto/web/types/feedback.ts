export type FeedbackCategory = 'bug' | 'improvement' | 'missing_feature' | 'positive'
export type FeedbackSeverity = 'low' | 'medium' | 'high' | 'critical'
export type FeedbackStatus = 'open' | 'in_progress' | 'resolved' | 'closed'

export interface UatFeedback {
  id: string
  user_id: string
  user_name: string
  user_role: string
  user_sector: string | null
  category: FeedbackCategory
  severity: FeedbackSeverity | null
  page_section: string
  description: string
  status: FeedbackStatus
  admin_notes: string | null
  created_at: string
  updated_at: string
}

export const CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  bug: 'Bug',
  improvement: 'Melhoria',
  missing_feature: 'Funcionalidade Faltando',
  positive: 'Ponto Positivo',
}

export const CATEGORY_COLORS: Record<FeedbackCategory, string> = {
  bug: 'bg-red-500/15 text-red-400 border-red-500/20',
  improvement: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  missing_feature: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  positive: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
}

export const SEVERITY_LABELS: Record<FeedbackSeverity, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  critical: 'Crítica',
}

export const SEVERITY_COLORS: Record<FeedbackSeverity, string> = {
  low: 'bg-slate-500/15 text-slate-400 border-slate-500/20',
  medium: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  high: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
  critical: 'bg-red-500/15 text-red-400 border-red-500/20',
}

export const STATUS_LABELS: Record<FeedbackStatus, string> = {
  open: 'Aberto',
  in_progress: 'Em Andamento',
  resolved: 'Resolvido',
  closed: 'Fechado',
}

export const STATUS_COLORS: Record<FeedbackStatus, string> = {
  open: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  in_progress: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  resolved: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  closed: 'bg-slate-500/15 text-slate-400 border-slate-500/20',
}

export const PAGE_SECTIONS = [
  'Dashboard',
  'Pedidos/Comandas',
  'Setor Triagem',
  'Setor Lavagem',
  'Setor Secagem',
  'Setor Passadoria',
  'Setor Expedição',
  'Logística/Romaneios',
  'Financeiro',
  'Clientes/CRM',
  'Equipamentos',
  'Estoque/Químicos',
  'NPS',
  'Tabela de Preços',
  'Usuários',
  'Login/Autenticação',
  'Outro',
] as const

export type PageSection = (typeof PAGE_SECTIONS)[number]

export const ROLE_LABELS: Record<string, string> = {
  director: 'Diretor',
  unit_manager: 'Gerente',
  operator: 'Operador',
  driver: 'Motorista',
  store: 'Loja',
  customer: 'Cliente',
  sdr: 'SDR',
  closer: 'Closer',
  copywriter: 'Copywriter',
}
