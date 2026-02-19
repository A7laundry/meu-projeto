'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Order, OrderStatus } from '@/types/order'

export function useSectorQueue(unitId: string, statuses: OrderStatus[]) {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function fetchOrders() {
      const { data } = await supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .eq('unit_id', unitId)
        .in('status', statuses)
        .order('created_at', { ascending: true })

      setOrders((data as Order[]) ?? [])
      setIsLoading(false)
    }

    fetchOrders()

    // Realtime subscription
    const channel = supabase
      .channel(`sector-queue-${unitId}-${statuses.join(',')}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `unit_id=eq.${unitId}`,
        },
        () => {
          fetchOrders()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [unitId, statuses])

  return { orders, isLoading }
}
