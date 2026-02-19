'use server'

import { createClient } from '@/lib/supabase/server'
import type { Order } from '@/types/order'

export type OrderFilters = {
  status?: string
  search?: string
  from?: string
  to?: string
}

export async function listOrders(
  unitId: string,
  filters?: OrderFilters
): Promise<Order[]> {
  const supabase = await createClient()

  let query = supabase
    .from('orders')
    .select(`
      *,
      items:order_items(*),
      events:order_events(*)
    `)
    .eq('unit_id', unitId)
    .order('created_at', { ascending: false })

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }
  if (filters?.search) {
    query = query.ilike('client_name', `%${filters.search}%`)
  }
  if (filters?.from) {
    query = query.gte('created_at', filters.from)
  }
  if (filters?.to) {
    query = query.lte('created_at', filters.to)
  }

  const { data, error } = await query

  if (error) throw new Error(`Erro ao listar comandas: ${error.message}`)
  return (data ?? []) as Order[]
}

export async function getOrder(orderId: string): Promise<Order | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(*),
      events:order_events(* , operator:profiles(full_name))
    `)
    .eq('id', orderId)
    .single()

  if (error) return null
  return data as Order
}
