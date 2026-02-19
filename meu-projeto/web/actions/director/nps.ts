'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { calcNps, type UnitNpsScore } from '@/types/nps'

export async function getNpsScoreByUnit(
  units: Array<{ id: string; name: string }>,
  daysBack = 90,
): Promise<UnitNpsScore[]> {
  if (units.length === 0) return []

  const supabase = createAdminClient()
  const since = new Date(Date.now() - daysBack * 24 * 3600 * 1000).toISOString()
  const unitIds = units.map((u) => u.id)

  const { data: surveys } = await supabase
    .from('nps_surveys')
    .select('id, unit_id, nps_responses(score)')
    .in('unit_id', unitIds)
    .gte('sent_at', since)

  return units.map(({ id: unitId, name: unitName }) => {
    const unitSurveys = (surveys ?? []).filter((s) => s.unit_id === unitId)
    const responses = unitSurveys
      .map((s) => (s.nps_responses as unknown as { score: number }[])?.[0])
      .filter(Boolean)

    const promoters = responses.filter((r) => r.score >= 9).length
    const detractors = responses.filter((r) => r.score <= 6).length
    const passives = responses.filter((r) => r.score >= 7 && r.score <= 8).length

    return {
      unitId,
      unitName,
      score: calcNps(promoters, detractors, responses.length),
      totalResponses: responses.length,
      promoters,
      passives,
      detractors,
    }
  })
}

export async function getRecentNpsSurveys(unitIds: string[], limit = 20) {
  const supabase = createAdminClient()

  const { data } = await supabase
    .from('nps_surveys')
    .select(`
      id, unit_id, sent_at,
      clients(name),
      nps_responses(score, comment, answered_at)
    `)
    .in('unit_id', unitIds)
    .order('sent_at', { ascending: false })
    .limit(limit)

  return data ?? []
}
