export interface NpsSurvey {
  id: string
  unit_id: string
  client_id: string | null
  sent_at: string
  created_at: string
  response?: NpsResponse | null
  client?: { name: string } | null
}

export interface NpsResponse {
  id: string
  survey_id: string
  score: number
  comment: string | null
  answered_at: string
}

export interface UnitNpsScore {
  unitId: string
  unitName: string
  score: number | null  // NPS calculado: %promotores - %detratores
  totalResponses: number
  promoters: number    // score >= 9
  passives: number     // score 7-8
  detractors: number   // score <= 6
}

export function calcNps(promoters: number, detractors: number, total: number): number | null {
  if (total === 0) return null
  return Math.round(((promoters - detractors) / total) * 100)
}
