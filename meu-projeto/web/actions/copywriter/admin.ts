'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getUser } from '@/lib/auth/get-user'
import { getWriterLevel } from '@/lib/gamification'
import type { CopywriterProfile, Submission } from '@/types/copywriter'

export async function listWriters(): Promise<(CopywriterProfile & { profile: { full_name: string } })[]> {
  const user = await getUser()
  if (!user || !['director', 'unit_manager'].includes(user.role)) {
    throw new Error('Sem permissão')
  }

  const supabase = createAdminClient()
  const { data } = await supabase
    .from('copywriter_profiles')
    .select('*, profile:profiles!copywriter_profiles_id_fkey(full_name)')
    .order('total_xp', { ascending: false })
  return (data ?? []) as (CopywriterProfile & { profile: { full_name: string } })[]
}

export async function getDashboardStats() {
  const user = await getUser()
  if (!user || !['director', 'unit_manager'].includes(user.role)) {
    throw new Error('Sem permissão')
  }

  const supabase = createAdminClient()

  const { count: writersCount } = await supabase
    .from('copywriter_profiles')
    .select('id', { count: 'exact', head: true })

  const { count: activeMissions } = await supabase
    .from('briefings')
    .select('id', { count: 'exact', head: true })
    .in('status', ['published', 'in_progress'])

  const { count: pendingReviews } = await supabase
    .from('submissions')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'submitted')

  const { count: completedMissions } = await supabase
    .from('briefings')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'completed')

  return {
    writersCount: writersCount ?? 0,
    activeMissions: activeMissions ?? 0,
    pendingReviews: pendingReviews ?? 0,
    completedMissions: completedMissions ?? 0,
  }
}

export async function getReviewQueue(): Promise<Submission[]> {
  const user = await getUser()
  if (!user || !['director', 'unit_manager'].includes(user.role)) {
    throw new Error('Sem permissão')
  }

  const supabase = createAdminClient()
  const { data } = await supabase
    .from('submissions')
    .select('*, briefing:briefings(*), writer:profiles!submissions_writer_id_fkey(full_name)')
    .eq('status', 'submitted')
    .order('submitted_at', { ascending: true })
  return (data ?? []) as Submission[]
}

export async function getAllSubmissionsForBriefing(briefingId: string): Promise<Submission[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('submissions')
    .select('*, writer:profiles!submissions_writer_id_fkey(full_name), reviewer:profiles!submissions_reviewer_id_fkey(full_name)')
    .eq('briefing_id', briefingId)
    .order('created_at', { ascending: true })
  return (data ?? []) as Submission[]
}

export async function getWriterDetail(writerId: string) {
  const supabase = createAdminClient()

  const { data: profile } = await supabase
    .from('copywriter_profiles')
    .select('*, profile:profiles!copywriter_profiles_id_fkey(full_name)')
    .eq('id', writerId)
    .single()
  if (!profile) return null

  const { level, title } = getWriterLevel(profile.total_xp)

  return { ...profile, level, levelTitle: title }
}
