'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'

export type CampaignChannel = 'instagram' | 'google' | 'whatsapp' | 'email' | 'referral' | 'offline'
export type CampaignStatus = 'active' | 'paused' | 'completed'

export interface Campaign {
  id: string
  unit_id: string | null
  name: string
  channel: CampaignChannel
  objective: string
  budget: number
  spent: number
  leads_generated: number
  conversions: number
  status: CampaignStatus
  starts_at: string
  ends_at: string | null
  created_at: string
}

export async function listCampaigns(): Promise<Campaign[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false })
  return (data ?? []) as Campaign[]
}

export async function createCampaign(formData: FormData) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('campaigns').insert({
    name: formData.get('name') as string,
    channel: formData.get('channel') as CampaignChannel,
    objective: formData.get('objective') as string || 'leads',
    budget: Number(formData.get('budget') ?? 0),
    starts_at: formData.get('starts_at') as string,
    ends_at: formData.get('ends_at') as string || null,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/commercial/campaigns')
}

export async function updateCampaignStatus(id: string, status: CampaignStatus) {
  const supabase = createAdminClient()
  await supabase.from('campaigns').update({ status }).eq('id', id)
  revalidatePath('/commercial/campaigns')
}

export async function updateCampaignSpent(id: string, spent: number) {
  const supabase = createAdminClient()
  await supabase.from('campaigns').update({ spent }).eq('id', id)
  revalidatePath('/commercial/campaigns')
}

export async function incrementLeadsGenerated(id: string) {
  const supabase = createAdminClient()
  const { data } = await supabase.from('campaigns').select('leads_generated').eq('id', id).single()
  if (data) {
    await supabase.from('campaigns').update({ leads_generated: data.leads_generated + 1 }).eq('id', id)
  }
  revalidatePath('/commercial/campaigns')
}
