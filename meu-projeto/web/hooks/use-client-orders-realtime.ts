'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Order } from '@/types/order'

export function useClientOrdersRealtime(
  clientId: string | null,
  initialOrders: Order[]
) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [updatedOrderId, setUpdatedOrderId] = useState<string | null>(null)

  // Clear the flash highlight after animation
  useEffect(() => {
    if (!updatedOrderId) return
    const timer = setTimeout(() => setUpdatedOrderId(null), 2000)
    return () => clearTimeout(timer)
  }, [updatedOrderId])

  const fetchOrders = useCallback(async () => {
    if (!clientId) return
    const supabase = createClient()
    const { data } = await supabase
      .from('orders')
      .select('*, items:order_items(*), events:order_events(*)')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (data) {
      setOrders(data as Order[])
    }
  }, [clientId])

  // Track previous orders to detect changes
  const prevOrdersRef = useRef<Order[]>(initialOrders)

  useEffect(() => {
    if (!clientId) return

    const supabase = createClient()

    const channel = supabase
      .channel(`client-orders-${clientId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `client_id=eq.${clientId}`,
        },
        (payload) => {
          // Highlight the updated order
          if (payload.eventType === 'UPDATE' && payload.new?.id) {
            setUpdatedOrderId(payload.new.id as string)
          }
          // Refetch all orders to get fresh data with items and events
          fetchOrders()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'order_events',
        },
        () => {
          fetchOrders()
        }
      )
      .subscribe()

    // Polling fallback every 30s
    const pollingInterval = setInterval(fetchOrders, 30_000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(pollingInterval)
    }
  }, [clientId, fetchOrders])

  // Update ref for change detection
  useEffect(() => {
    prevOrdersRef.current = orders
  }, [orders])

  return { orders, updatedOrderId }
}
