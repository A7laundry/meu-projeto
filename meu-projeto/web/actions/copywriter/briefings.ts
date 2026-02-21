'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { getUser } from '@/lib/auth/get-user'
import type { Briefing, BriefingStatus, ContentType, BriefingDifficulty } from '@/types/copywriter'

export async function listBriefings(status?: BriefingStatus): Promise<Briefing[]> {
  const user = await getUser()
  if (!user) throw new Error('Não autenticado')

  const supabase = createAdminClient()
  let query = supabase
    .from('briefings')
    .select('*, creator:profiles!briefings_created_by_fkey(full_name)')
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  } else if (user.role === 'copywriter') {
    query = query.neq('status', 'draft')
  }

  const { data } = await query
  return (data ?? []) as Briefing[]
}

export async function getBriefing(id: string): Promise<Briefing | null> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('briefings')
    .select('*, creator:profiles!briefings_created_by_fkey(full_name)')
    .eq('id', id)
    .single()
  return data as Briefing | null
}

export async function createBriefing(formData: FormData) {
  const user = await getUser()
  if (!user || !['director', 'unit_manager'].includes(user.role)) {
    throw new Error('Sem permissão')
  }

  const supabase = createAdminClient()
  const { error } = await supabase.from('briefings').insert({
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    content_type: formData.get('content_type') as ContentType,
    difficulty: formData.get('difficulty') as BriefingDifficulty,
    xp_reward: Number(formData.get('xp_reward') ?? 50),
    max_writers: Number(formData.get('max_writers') ?? 1),
    word_limit: formData.get('word_limit') ? Number(formData.get('word_limit')) : null,
    deadline: formData.get('deadline') as string || null,
    reference_links: (formData.get('reference_links') as string || '').split('\n').filter(Boolean),
    status: 'draft',
    created_by: user.id,
  })
  if (error) throw new Error(error.message)

  revalidatePath('/copywriter/admin/briefings')
}

export async function updateBriefing(id: string, formData: FormData) {
  const user = await getUser()
  if (!user || !['director', 'unit_manager'].includes(user.role)) {
    throw new Error('Sem permissão')
  }

  const supabase = createAdminClient()
  const { error } = await supabase.from('briefings').update({
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    content_type: formData.get('content_type') as ContentType,
    difficulty: formData.get('difficulty') as BriefingDifficulty,
    xp_reward: Number(formData.get('xp_reward') ?? 50),
    max_writers: Number(formData.get('max_writers') ?? 1),
    word_limit: formData.get('word_limit') ? Number(formData.get('word_limit')) : null,
    deadline: formData.get('deadline') as string || null,
    reference_links: (formData.get('reference_links') as string || '').split('\n').filter(Boolean),
  }).eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/copywriter/admin/briefings')
}

export async function publishBriefing(id: string) {
  const user = await getUser()
  if (!user || !['director', 'unit_manager'].includes(user.role)) {
    throw new Error('Sem permissão')
  }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('briefings')
    .update({ status: 'published' })
    .eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/copywriter/admin/briefings')
  revalidatePath('/copywriter/missions')
}
