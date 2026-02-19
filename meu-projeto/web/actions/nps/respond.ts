'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'

const schema = z.object({
  surveyId: z.string().uuid(),
  score: z.number().int().min(0).max(10),
  comment: z.string().max(500).optional(),
})

export type NpsRespondResult = { success: true } | { success: false; error: string }

export async function submitNpsResponse(formData: FormData): Promise<NpsRespondResult> {
  const parsed = schema.safeParse({
    surveyId: formData.get('surveyId'),
    score: Number(formData.get('score')),
    comment: formData.get('comment') || undefined,
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const { surveyId, score, comment } = parsed.data
  const supabase = createAdminClient()

  const { error } = await supabase.from('nps_responses').upsert(
    {
      survey_id: surveyId,
      score,
      comment: comment ?? null,
      answered_at: new Date().toISOString(),
    },
    { onConflict: 'survey_id' },
  )

  if (error) return { success: false, error: error.message }
  return { success: true }
}

export async function createNpsSurvey(unitId: string, clientId?: string): Promise<{ id: string } | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('nps_surveys')
    .insert({ unit_id: unitId, client_id: clientId ?? null })
    .select('id')
    .single()

  if (error) return null
  return data
}
