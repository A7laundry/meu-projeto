'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { getUser } from '@/lib/auth/get-user'
import { calculateQualityBonus } from '@/lib/gamification'
import type { Submission, SubmissionComment } from '@/types/copywriter'

export async function claimBriefing(briefingId: string) {
  const user = await getUser()
  if (!user) throw new Error('Não autenticado')

  const supabase = createAdminClient()

  // Verificar se briefing está published e tem vagas
  const { data: briefing } = await supabase
    .from('briefings')
    .select('id, max_writers, status')
    .eq('id', briefingId)
    .single()
  if (!briefing || briefing.status !== 'published') throw new Error('Missão não disponível')

  const { count } = await supabase
    .from('submissions')
    .select('id', { count: 'exact', head: true })
    .eq('briefing_id', briefingId)
  if ((count ?? 0) >= briefing.max_writers) throw new Error('Sem vagas disponíveis')

  const { error } = await supabase.from('submissions').insert({
    briefing_id: briefingId,
    writer_id: user.id,
    status: 'claimed',
  })
  if (error) {
    if (error.code === '23505') throw new Error('Você já aceitou esta missão')
    throw new Error(error.message)
  }

  // Atualizar status do briefing para in_progress
  await supabase.from('briefings').update({ status: 'in_progress' }).eq('id', briefingId)

  // Garantir que copywriter_profile existe
  await supabase.from('copywriter_profiles').upsert({ id: user.id }, { onConflict: 'id' })

  revalidatePath(`/copywriter/missions/${briefingId}`)
  revalidatePath('/copywriter/missions')
}

export async function submitForReview(submissionId: string, content: string) {
  const user = await getUser()
  if (!user) throw new Error('Não autenticado')

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('submissions')
    .update({
      content,
      word_count: wordCount,
      status: 'submitted',
      submitted_at: new Date().toISOString(),
    })
    .eq('id', submissionId)
    .eq('writer_id', user.id)
  if (error) throw new Error(error.message)

  revalidatePath('/copywriter/missions')
  revalidatePath('/copywriter/admin/reviews')
}

export async function reviewSubmission(
  submissionId: string,
  verdict: 'approved' | 'revision' | 'rejected',
  score: number
) {
  const user = await getUser()
  if (!user || !['director', 'unit_manager'].includes(user.role)) {
    throw new Error('Sem permissão')
  }

  const supabase = createAdminClient()

  // Buscar submission
  const { data: submission } = await supabase
    .from('submissions')
    .select('*, briefing:briefings(*)')
    .eq('id', submissionId)
    .single()
  if (!submission) throw new Error('Submission não encontrada')

  // Atualizar submission
  const { error } = await supabase.from('submissions').update({
    status: verdict,
    score,
    reviewer_id: user.id,
    reviewed_at: new Date().toISOString(),
  }).eq('id', submissionId)
  if (error) throw new Error(error.message)

  // Se aprovada, conceder XP e atualizar perfil
  if (verdict === 'approved' && submission.briefing) {
    const baseXp = submission.briefing.xp_reward
    const qualityBonus = calculateQualityBonus(score)
    const totalXp = baseXp + qualityBonus

    // Log de XP
    await supabase.from('writer_xp_log').insert({
      writer_id: submission.writer_id,
      amount: totalXp,
      reason: `Missão aprovada: ${submission.briefing.title}${qualityBonus > 0 ? ` (+${qualityBonus} bônus qualidade)` : ''}`,
      source_id: submissionId,
    })

    // Atualizar perfil do escritor
    const { data: profile } = await supabase
      .from('copywriter_profiles')
      .select('*')
      .eq('id', submission.writer_id)
      .single()

    if (profile) {
      const newMissionsDone = profile.missions_done + 1
      const newTotalXp = profile.total_xp + totalXp
      const newAvg = ((profile.avg_score * profile.missions_done) + score) / newMissionsDone

      // Calcular streak
      const lastSub = profile.last_submission ? new Date(profile.last_submission) : null
      const now = new Date()
      const diffDays = lastSub ? Math.floor((now.getTime() - lastSub.getTime()) / 86400000) : 999
      const newStreak = diffDays <= 1 ? profile.current_streak + 1 : 1

      await supabase.from('copywriter_profiles').update({
        total_xp: newTotalXp,
        missions_done: newMissionsDone,
        avg_score: Math.round(newAvg * 10) / 10,
        current_streak: newStreak,
        best_streak: Math.max(profile.best_streak, newStreak),
        last_submission: now.toISOString(),
      }).eq('id', submission.writer_id)

      // Checar badges
      await checkAndAwardBadges(submission.writer_id, {
        totalXp: newTotalXp,
        missionsDone: newMissionsDone,
        streak: newStreak,
        score,
        submittedAt: submission.submitted_at,
        claimedAt: submission.created_at,
      })
    }

    // Se todos os slots estão aprovados, completar briefing
    const { count: approvedCount } = await supabase
      .from('submissions')
      .select('id', { count: 'exact', head: true })
      .eq('briefing_id', submission.briefing_id)
      .eq('status', 'approved')
    if ((approvedCount ?? 0) >= submission.briefing.max_writers) {
      await supabase.from('briefings').update({ status: 'completed' }).eq('id', submission.briefing_id)
    }
  }

  revalidatePath('/copywriter/admin/reviews')
  revalidatePath('/copywriter/missions')
  revalidatePath('/copywriter/leaderboard')
}

async function checkAndAwardBadges(
  writerId: string,
  stats: { totalXp: number; missionsDone: number; streak: number; score: number; submittedAt: string | null; claimedAt: string }
) {
  const supabase = createAdminClient()

  const { data: allBadges } = await supabase.from('badge_definitions').select('*')
  const { data: earned } = await supabase.from('writer_badges').select('badge_id').eq('writer_id', writerId)
  const earnedIds = new Set((earned ?? []).map(b => b.badge_id))

  for (const badge of allBadges ?? []) {
    if (earnedIds.has(badge.id)) continue

    const cond = badge.condition as Record<string, unknown>
    let qualifies = false

    if (cond.missions_done && stats.missionsDone >= (cond.missions_done as number)) qualifies = true
    if (cond.total_xp && stats.totalXp >= (cond.total_xp as number)) qualifies = true
    if (cond.streak && stats.streak >= (cond.streak as number)) qualifies = true
    if (cond.perfect_score && stats.score === 100) qualifies = true
    if (cond.hours_under && stats.submittedAt) {
      const claimed = new Date(stats.claimedAt).getTime()
      const submitted = new Date(stats.submittedAt).getTime()
      const hours = (submitted - claimed) / 3600000
      if (hours < (cond.hours_under as number)) qualifies = true
    }
    if (cond.perfect_count) {
      const { count } = await supabase
        .from('submissions')
        .select('id', { count: 'exact', head: true })
        .eq('writer_id', writerId)
        .eq('score', 100)
        .eq('status', 'approved')
      if ((count ?? 0) >= (cond.perfect_count as number)) qualifies = true
    }

    if (qualifies) {
      await supabase.from('writer_badges').insert({ writer_id: writerId, badge_id: badge.id })
    }
  }
}

export async function addComment(submissionId: string, content: string) {
  const user = await getUser()
  if (!user) throw new Error('Não autenticado')

  const supabase = createAdminClient()
  const { error } = await supabase.from('submission_comments').insert({
    submission_id: submissionId,
    author_id: user.id,
    content,
  })
  if (error) throw new Error(error.message)

  revalidatePath('/copywriter/missions')
  revalidatePath('/copywriter/admin/reviews')
}

export async function getSubmissionComments(submissionId: string): Promise<SubmissionComment[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('submission_comments')
    .select('*, author:profiles!submission_comments_author_id_fkey(full_name)')
    .eq('submission_id', submissionId)
    .order('created_at', { ascending: true })
  return (data ?? []) as SubmissionComment[]
}

export async function listMySubmissions(): Promise<Submission[]> {
  const user = await getUser()
  if (!user) throw new Error('Não autenticado')

  const supabase = createAdminClient()
  const { data } = await supabase
    .from('submissions')
    .select('*, briefing:briefings(*)')
    .eq('writer_id', user.id)
    .order('created_at', { ascending: false })
  return (data ?? []) as Submission[]
}

export async function getSubmission(briefingId: string): Promise<Submission | null> {
  const user = await getUser()
  if (!user) throw new Error('Não autenticado')

  const supabase = createAdminClient()
  const { data } = await supabase
    .from('submissions')
    .select('*, writer:profiles!submissions_writer_id_fkey(full_name)')
    .eq('briefing_id', briefingId)
    .eq('writer_id', user.id)
    .maybeSingle()
  return data as Submission | null
}
