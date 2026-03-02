'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAuth, requireRole } from '@/lib/auth/guards'
import { actionError, actionSuccess } from '@/lib/auth/action-result'
import type { ActionResult } from '@/lib/auth/action-result'
import type { UatFeedback, FeedbackCategory, FeedbackSeverity, FeedbackStatus } from '@/types/feedback'
import { z } from 'zod'

const feedbackSchema = z.object({
  category: z.enum(['bug', 'improvement', 'missing_feature', 'positive']),
  severity: z.enum(['low', 'medium', 'high', 'critical']).nullable(),
  page_section: z.string().min(1, 'Selecione a página/seção'),
  description: z.string().min(10, 'Descreva com pelo menos 10 caracteres'),
})

export async function createFeedback(formData: FormData): Promise<ActionResult<UatFeedback>> {
  const ctx = await requireAuth()

  const category = formData.get('category') as string
  const severity = formData.get('severity') as string | null

  const raw = {
    category,
    severity: category === 'bug' && severity ? severity : null,
    page_section: formData.get('page_section') as string,
    description: formData.get('description') as string,
  }

  const parsed = feedbackSchema.safeParse(raw)
  if (!parsed.success) {
    return actionError(parsed.error.issues[0].message)
  }

  if (parsed.data.category === 'bug' && !parsed.data.severity) {
    return actionError('Severidade é obrigatória para bugs')
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('uat_feedback')
    .insert({
      user_id: ctx.user.id,
      user_name: ctx.profile.full_name,
      user_role: ctx.profile.role,
      user_sector: ctx.profile.sector,
      ...parsed.data,
    })
    .select()
    .single()

  if (error) {
    return actionError(`Erro ao enviar feedback: ${error.message}`)
  }

  revalidatePath('/feedback')
  return actionSuccess(data as UatFeedback)
}

export async function listMyFeedback(): Promise<UatFeedback[]> {
  const ctx = await requireAuth()
  const admin = createAdminClient()

  const { data, error } = await admin
    .from('uat_feedback')
    .select('*')
    .eq('user_id', ctx.user.id)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Erro ao listar feedback: ${error.message}`)
  return data as UatFeedback[]
}

export async function listAllFeedback(filters?: {
  category?: FeedbackCategory
  severity?: FeedbackSeverity
  status?: FeedbackStatus
  user_role?: string
}): Promise<UatFeedback[]> {
  await requireRole(['director'])
  const admin = createAdminClient()

  let query = admin
    .from('uat_feedback')
    .select('*')
    .order('created_at', { ascending: false })

  if (filters?.category) {
    query = query.eq('category', filters.category)
  }
  if (filters?.severity) {
    query = query.eq('severity', filters.severity)
  }
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  if (filters?.user_role) {
    query = query.eq('user_role', filters.user_role)
  }

  const { data, error } = await query

  if (error) throw new Error(`Erro ao listar feedback: ${error.message}`)
  return data as UatFeedback[]
}

export async function getFeedbackStats(): Promise<{
  open: number
  in_progress: number
  resolved: number
  critical_bugs: number
}> {
  await requireRole(['director'])
  const admin = createAdminClient()

  const { data, error } = await admin
    .from('uat_feedback')
    .select('status, category, severity')

  if (error) throw new Error(`Erro ao buscar estatísticas: ${error.message}`)

  const items = data as Pick<UatFeedback, 'status' | 'category' | 'severity'>[]

  return {
    open: items.filter(i => i.status === 'open').length,
    in_progress: items.filter(i => i.status === 'in_progress').length,
    resolved: items.filter(i => i.status === 'resolved').length,
    critical_bugs: items.filter(i => i.category === 'bug' && i.severity === 'critical' && i.status !== 'resolved' && i.status !== 'closed').length,
  }
}

export async function updateFeedbackStatus(
  id: string,
  status: FeedbackStatus,
  adminNotes?: string,
): Promise<ActionResult<UatFeedback>> {
  await requireRole(['director'])
  const admin = createAdminClient()

  const updateData: Record<string, unknown> = { status }
  if (adminNotes !== undefined) {
    updateData.admin_notes = adminNotes
  }

  const { data, error } = await admin
    .from('uat_feedback')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return actionError(`Erro ao atualizar feedback: ${error.message}`)
  }

  revalidatePath('/director/feedback')
  revalidatePath('/feedback')
  return actionSuccess(data as UatFeedback)
}
