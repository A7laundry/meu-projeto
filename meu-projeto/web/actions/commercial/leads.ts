'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { getUser } from '@/lib/auth/get-user'

export type LeadStage = 'prospect' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost'
export type LeadSource = 'instagram' | 'google' | 'referral' | 'cold_call' | 'whatsapp' | 'form' | 'manual'

export interface Lead {
  id: string
  unit_id: string | null
  name: string
  company: string | null
  email: string | null
  phone: string | null
  type: string
  source: LeadSource
  stage: LeadStage
  assigned_to: string | null
  estimated_monthly_value: number
  notes: string | null
  lost_reason: string | null
  converted_client_id: string | null
  created_at: string
  updated_at: string
  assignee?: { full_name: string } | null
}

export async function listLeads(): Promise<Lead[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('leads')
    .select('*, assignee:profiles!leads_assigned_to_fkey(full_name)')
    .order('updated_at', { ascending: false })
  return (data ?? []) as Lead[]
}

export async function getLead(id: string): Promise<Lead | null> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('leads')
    .select('*, assignee:profiles!leads_assigned_to_fkey(full_name)')
    .eq('id', id)
    .single()
  return data as Lead | null
}

export async function createLead(formData: FormData) {
  const user = await getUser()
  if (!user) throw new Error('Não autenticado')

  const supabase = createAdminClient()
  const { error } = await supabase.from('leads').insert({
    name: formData.get('name') as string,
    company: formData.get('company') as string || null,
    email: formData.get('email') as string || null,
    phone: formData.get('phone') as string || null,
    type: formData.get('type') as string || 'business',
    source: formData.get('source') as LeadSource || 'manual',
    estimated_monthly_value: Number(formData.get('estimated_monthly_value') ?? 0),
    notes: formData.get('notes') as string || null,
    assigned_to: user.id,
    unit_id: user.unit_id,
  })
  if (error) throw new Error(error.message)

  revalidatePath('/commercial/leads')
}

export async function updateLead(id: string, formData: FormData) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('leads').update({
    name: formData.get('name') as string,
    company: formData.get('company') as string || null,
    email: formData.get('email') as string || null,
    phone: formData.get('phone') as string || null,
    type: formData.get('type') as string,
    source: formData.get('source') as LeadSource,
    estimated_monthly_value: Number(formData.get('estimated_monthly_value') ?? 0),
    notes: formData.get('notes') as string || null,
  }).eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/commercial/leads')
  revalidatePath(`/commercial/leads/${id}`)
}

export async function moveLeadStage(id: string, stage: LeadStage, lostReason?: string) {
  const user = await getUser()
  if (!user) throw new Error('Não autenticado')

  const supabase = createAdminClient()
  const { error } = await supabase.from('leads').update({
    stage,
    lost_reason: lostReason ?? null,
  }).eq('id', id)
  if (error) throw new Error(error.message)

  // Registrar mudança de estágio como atividade
  await supabase.from('lead_activities').insert({
    lead_id: id,
    user_id: user.id,
    type: 'stage_change',
    description: `Estágio alterado para: ${stage}${lostReason ? ` — Motivo: ${lostReason}` : ''}`,
  })

  revalidatePath('/commercial/leads')
  revalidatePath(`/commercial/leads/${id}`)
  revalidatePath('/commercial/dashboard')
}

export async function convertLeadToClient(leadId: string) {
  const user = await getUser()
  if (!user) throw new Error('Não autenticado')

  const supabase = createAdminClient()

  // Busca o lead
  const { data: lead } = await supabase.from('leads').select('*').eq('id', leadId).single()
  if (!lead) throw new Error('Lead não encontrado')

  // Cria o cliente
  const { data: client, error: clientError } = await supabase.from('clients').insert({
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    unit_id: lead.unit_id,
  }).select('id').single()
  if (clientError) throw new Error(clientError.message)

  // Atualiza lead: won + converted_client_id
  await supabase.from('leads').update({
    stage: 'won',
    converted_client_id: client.id,
  }).eq('id', leadId)

  // Registra atividade
  await supabase.from('lead_activities').insert({
    lead_id: leadId,
    user_id: user.id,
    type: 'stage_change',
    description: `Lead convertido em cliente`,
  })

  revalidatePath('/commercial/leads')
  revalidatePath(`/commercial/leads/${leadId}`)
  revalidatePath('/commercial/clients')
}

export async function deleteLead(id: string) {
  const supabase = createAdminClient()
  await supabase.from('leads').delete().eq('id', id)
  revalidatePath('/commercial/leads')
}
