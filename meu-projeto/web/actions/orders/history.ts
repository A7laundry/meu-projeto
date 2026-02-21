'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import type { Order } from '@/types/order'

export interface HistoryFilters {
  search?: string
  status?: string
  dateFrom?: string
  dateTo?: string
  page?: number
}

export interface HistoryResult {
  orders: Order[]
  total: number
  page: number
  pageSize: number
}

const PAGE_SIZE = 20

export async function getOrderHistory(
  unitId: string,
  filters: HistoryFilters = {}
): Promise<HistoryResult> {
  const supabase = createAdminClient()
  const page = Math.max(1, filters.page ?? 1)
  const offset = (page - 1) * PAGE_SIZE

  let query = supabase
    .from('orders')
    .select(
      '*, items:order_items(id, piece_type, quantity, recipe_id, notes)',
      { count: 'exact' }
    )
    .eq('unit_id', unitId)
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)

  if (filters.search) {
    query = query.or(
      `order_number.ilike.%${filters.search}%,client_name.ilike.%${filters.search}%`
    )
  }

  if (filters.status) {
    query = query.eq('status', filters.status)
  }

  if (filters.dateFrom) {
    query = query.gte('created_at', filters.dateFrom)
  }

  if (filters.dateTo) {
    // Inclui o dia todo
    const dateTo = new Date(filters.dateTo)
    dateTo.setDate(dateTo.getDate() + 1)
    query = query.lt('created_at', dateTo.toISOString())
  }

  const { data, count, error } = await query
  if (error) throw new Error(`Erro ao buscar histórico: ${error.message}`)

  return {
    orders: (data ?? []) as Order[],
    total: count ?? 0,
    page,
    pageSize: PAGE_SIZE,
  }
}

export async function getOrderWithEvents(orderId: string): Promise<Order | null> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('orders')
    .select('*, items:order_items(*), events:order_events(*)')
    .eq('id', orderId)
    .order('occurred_at', { referencedTable: 'order_events', ascending: true })
    .single()

  return data as Order | null
}
