'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { differenceInDays, getMonth, getDate, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

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

// ─── Campanhas de comportamento ──────────────────────────────

export interface CampaignClient {
  id: string
  name: string
  phone: string | null
  email: string | null
  birthday: string | null
  last_order_at: string | null
  days_inactive: number
  total_orders: number
  total_spent: number
  birthday_today: boolean
  birthday_day: number | null
  birthday_formatted: string | null
}

export interface BehaviorCampaignData {
  birthday: CampaignClient[]   // aniversariantes deste mês
  dormant30: CampaignClient[]  // 30–59 dias sem pedido
  dormant60: CampaignClient[]  // 60–89 dias sem pedido
  dormant90: CampaignClient[]  // 90+ dias (perdidos)
}

export async function getBehaviorCampaigns(unitId: string): Promise<BehaviorCampaignData> {
  const supabase = createAdminClient()
  const now = new Date()

  const { data: clients, error: clientsError } = await supabase
    .from('clients')
    .select('id, name, phone, email, birthday, created_at')
    .eq('unit_id', unitId)
    .eq('active', true)

  if (clientsError) {
    console.error('[getBehaviorCampaigns] clients query failed:', clientsError.message)
    return { birthday: [], dormant30: [], dormant60: [], dormant90: [] }
  }

  if (!clients?.length) {
    return { birthday: [], dormant30: [], dormant60: [], dormant90: [] }
  }

  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('client_id, created_at, estimated_total')
    .eq('unit_id', unitId)
    .neq('status', 'cancelled')

  if (ordersError) {
    console.error('[getBehaviorCampaigns] orders query failed:', ordersError.message)
  }

  // mapa client_id → último pedido + totais
  const orderMap = new Map<string, { lastOrderAt: string; totalOrders: number; totalSpent: number }>()
  for (const o of orders ?? []) {
    const ex = orderMap.get(o.client_id)
    orderMap.set(o.client_id, {
      lastOrderAt: !ex || o.created_at > ex.lastOrderAt ? o.created_at : ex.lastOrderAt,
      totalOrders: (ex?.totalOrders ?? 0) + 1,
      totalSpent:  (ex?.totalSpent  ?? 0) + (o.estimated_total ?? 0),
    })
  }

  const enriched: CampaignClient[] = clients.map((c) => {
    const info = orderMap.get(c.id)
    const lastOrderAt = info?.lastOrderAt ?? null
    const daysInactive = differenceInDays(now, new Date(lastOrderAt ?? c.created_at))

    let birthdayToday = false
    let birthdayDay: number | null = null
    let birthdayFormatted: string | null = null

    if (c.birthday) {
      const bday = new Date(c.birthday)
      birthdayDay     = getDate(bday)
      birthdayToday   = getMonth(bday) === getMonth(now) && getDate(bday) === getDate(now)
      birthdayFormatted = format(bday, "dd 'de' MMMM", { locale: ptBR })
    }

    return {
      id: c.id, name: c.name, phone: c.phone, email: c.email, birthday: c.birthday,
      last_order_at: lastOrderAt,
      days_inactive: daysInactive,
      total_orders: info?.totalOrders ?? 0,
      total_spent:  info?.totalSpent  ?? 0,
      birthday_today: birthdayToday,
      birthday_day: birthdayDay,
      birthday_formatted: birthdayFormatted,
    }
  })

  const currentMonth = getMonth(now)

  return {
    birthday: enriched
      .filter(c => c.birthday && getMonth(new Date(c.birthday)) === currentMonth)
      .sort((a, b) => (a.birthday_today ? -1 : 0) - (b.birthday_today ? -1 : 0) || (a.birthday_day ?? 99) - (b.birthday_day ?? 99)),
    dormant30: enriched.filter(c => c.days_inactive >= 30 && c.days_inactive < 60).sort((a, b) => b.days_inactive - a.days_inactive),
    dormant60: enriched.filter(c => c.days_inactive >= 60 && c.days_inactive < 90).sort((a, b) => b.days_inactive - a.days_inactive),
    dormant90: enriched.filter(c => c.days_inactive >= 90).sort((a, b) => b.days_inactive - a.days_inactive),
  }
}

// ─── Templates de mensagem WPP ───────────────────────────────
// Funções puras movidas para @/lib/campaigns/messages (sem 'use server')
// para permitir uso em componentes client sem criar server actions.
