'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireRole } from '@/lib/auth/guards'

export type ActivityType = 'note' | 'call' | 'whatsapp' | 'email' | 'meeting' | 'proposal'

export interface LeadActivity {
  id: string
  lead_id: string
  user_id: string
  type: ActivityType
  description: string
  occurred_at: string
  user?: { full_name: string } | null
}

export async function listActivities(leadId: string): Promise<LeadActivity[]> {
  await requireRole(['sdr', 'closer', 'unit_manager', 'director'])

  const supabase = createAdminClient()
  const { data } = await supabase
    .from('lead_activities')
    .select('*, user:profiles!lead_activities_user_id_fkey(full_name)')
    .eq('lead_id', leadId)
    .order('occurred_at', { ascending: false })
  return (data ?? []) as LeadActivity[]
}

export async function createActivity(formData: FormData) {
  const { profile } = await requireRole(['sdr', 'closer', 'unit_manager', 'director'])

  const leadId = formData.get('lead_id') as string
  const supabase = createAdminClient()
  const { error } = await supabase.from('lead_activities').insert({
    lead_id: leadId,
    user_id: profile.id,
    type: formData.get('type') as ActivityType,
    description: formData.get('description') as string,
  })
  if (error) throw new Error(error.message)

  revalidatePath(`/commercial/leads/${leadId}`)
}
