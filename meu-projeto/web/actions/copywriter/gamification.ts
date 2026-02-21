'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getUser } from '@/lib/auth/get-user'
import { getWriterLevel, getXpProgress } from '@/lib/gamification'
import type { WriterStats, LeaderboardEntry, WriterXpLog, WriterBadge, CopywriterProfile } from '@/types/copywriter'

export async function getWriterStats(): Promise<WriterStats | null> {
  const user = await getUser()
  if (!user) return null

  const supabase = createAdminClient()

  // Upsert profile se não existe
  await supabase.from('copywriter_profiles').upsert({ id: user.id }, { onConflict: 'id' })

  const { data: profile } = await supabase
    .from('copywriter_profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  if (!profile) return null

  const { data: badges } = await supabase
    .from('writer_badges')
    .select('*, badge:badge_definitions(*)')
    .eq('writer_id', user.id)
    .order('awarded_at', { ascending: false })

  const { data: recentXp } = await supabase
    .from('writer_xp_log')
    .select('*')
    .eq('writer_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const { level, title } = getWriterLevel(profile.total_xp)
  const xp = getXpProgress(profile.total_xp)

  return {
    profile: profile as CopywriterProfile,
    level,
    levelTitle: title,
    xpToNext: xp.next - xp.current,
    xpProgress: xp.progress,
    badges: (badges ?? []) as WriterBadge[],
    recentXp: (recentXp ?? []) as WriterXpLog[],
  }
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const supabase = createAdminClient()
  const { data: profiles } = await supabase
    .from('copywriter_profiles')
    .select('*, profile:profiles!copywriter_profiles_id_fkey(full_name)')
    .order('total_xp', { ascending: false })
    .limit(50)

  if (!profiles) return []

  const entries: LeaderboardEntry[] = []
  for (let i = 0; i < profiles.length; i++) {
    const p = profiles[i] as CopywriterProfile & { profile: { full_name: string } }
    const { level, title } = getWriterLevel(p.total_xp)

    // Contar badges
    const { count } = await supabase
      .from('writer_badges')
      .select('id', { count: 'exact', head: true })
      .eq('writer_id', p.id)

    entries.push({
      rank: i + 1,
      writerId: p.id,
      name: p.profile?.full_name ?? 'Redator',
      totalXp: p.total_xp,
      level,
      levelTitle: title,
      missionsDone: p.missions_done,
      currentStreak: p.current_streak,
      badgeCount: count ?? 0,
    })
  }

  return entries
}

export async function getMyProfile(): Promise<CopywriterProfile | null> {
  const user = await getUser()
  if (!user) return null

  const supabase = createAdminClient()
  await supabase.from('copywriter_profiles').upsert({ id: user.id }, { onConflict: 'id' })

  const { data } = await supabase
    .from('copywriter_profiles')
    .select('*, profile:profiles!copywriter_profiles_id_fkey(full_name, role)')
    .eq('id', user.id)
    .single()
  return data as CopywriterProfile | null
}

export async function updateMyProfile(bio: string, specialties: string[]) {
  const user = await getUser()
  if (!user) throw new Error('Não autenticado')

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('copywriter_profiles')
    .update({ bio, specialties })
    .eq('id', user.id)
  if (error) throw new Error(error.message)
}
