'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import type { ClientStats, CrmNote } from '@/types/crm'

export interface ClientOrder {
  id: string
  order_number: string
  status: string
  created_at: string
  estimated_total: number
  items_count: number
}

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

const noteSchema = z.object({
  category: z.enum(['visit', 'call', 'email', 'other']),
  content: z.string().min(3, 'Nota deve ter ao menos 3 caracteres'),
})

export async function listClientNotes(clientId: string, limit = 10): Promise<CrmNote[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('crm_notes')
    .select(`*, author:staff(id, name)`)
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .limit(limit)

  return (data ?? []).map((n) => ({
    ...n,
    author_name: n.author?.name ?? null,
  })) as CrmNote[]
}

export async function createCrmNote(
  clientId: string,
  unitId: string,
  formData: FormData,
): Promise<ActionResult<CrmNote>> {
  const raw = {
    category: formData.get('category') as string,
    content: formData.get('content') as string,
  }

  const parsed = noteSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('crm_notes')
    .insert({ ...parsed.data, client_id: clientId, unit_id: unitId })
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath(`/unit/${unitId}/clients/${clientId}`)
  return { success: true, data: data as CrmNote }
}

export async function getClientStats(
  clientId: string,
  unitId: string,
): Promise<ClientStats> {
  const supabase = createAdminClient()

  const { data: quotes } = await supabase
    .from('quotes')
    .select('total, created_at, status')
    .eq('client_id', clientId)
    .eq('unit_id', unitId)
    .eq('status', 'approved')
    .order('created_at', { ascending: true })

  const totalOrders = quotes?.length ?? 0
  const totalSpent = (quotes ?? []).reduce((sum, q) => sum + Number(q.total), 0)
  const avgTicket = totalOrders > 0 ? totalSpent / totalOrders : 0
  const firstOrderAt = quotes?.[0]?.created_at ?? null
  const lastOrderAt = quotes?.[quotes.length - 1]?.created_at ?? null

  // LTV anual = (total gasto / meses ativos) × 12
  let annualLtv = 0
  if (totalOrders > 0 && firstOrderAt && lastOrderAt) {
    const msPerMonth = 1000 * 60 * 60 * 24 * 30.44
    const monthsActive = Math.max(
      (new Date(lastOrderAt).getTime() - new Date(firstOrderAt).getTime()) / msPerMonth,
      1,
    )
    annualLtv = (totalSpent / monthsActive) * 12
  }

  return { totalOrders, totalSpent, avgTicket, firstOrderAt, lastOrderAt, annualLtv }
}

export async function listClientOrders(
  clientId: string,
  unitId: string,
  limit = 20,
): Promise<ClientOrder[]> {
  const supabase = createAdminClient()

  const [ordersRes, pricesRes] = await Promise.all([
    supabase
      .from('orders')
      .select('id, order_number, status, created_at, items:order_items(piece_type, quantity)')
      .eq('client_id', clientId)
      .eq('unit_id', unitId)
      .order('created_at', { ascending: false })
      .limit(limit),
    supabase
      .from('price_table')
      .select('piece_type, price')
      .eq('unit_id', unitId)
      .eq('active', true),
  ])

  const priceMap = new Map<string, number>()
  for (const p of pricesRes.data ?? []) {
    // preço genérico da família (item_name = '' tem priority)
    if (!priceMap.has(p.piece_type)) priceMap.set(p.piece_type, Number(p.price))
  }

  return (ordersRes.data ?? []).map((order) => {
    const items = (order.items as { piece_type: string; quantity: number }[] | null) ?? []
    const estimated_total = items.reduce(
      (sum, item) => sum + (priceMap.get(item.piece_type) ?? 0) * item.quantity,
      0,
    )
    return {
      id: order.id,
      order_number: order.order_number,
      status: order.status,
      created_at: order.created_at,
      estimated_total,
      items_count: items.reduce((s, i) => s + i.quantity, 0),
    }
  })
}
