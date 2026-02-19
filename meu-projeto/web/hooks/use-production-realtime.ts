'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Order, OrderStatus } from '@/types/order'

const SECTORS: OrderStatus[] = ['received', 'sorting', 'washing', 'drying', 'ironing', 'ready', 'shipped']

export interface SectorData {
  status: OrderStatus
  orders: Order[]
}

export function useProductionRealtime(unitId: string) {
  const [sectorData, setSectorData] = useState<SectorData[]>([])
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [isConnected, setIsConnected] = useState(false)

  const fetchData = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('orders')
      .select('*, items:order_items(quantity, piece_type)')
      .eq('unit_id', unitId)
      .in('status', SECTORS)
      .order('created_at', { ascending: true })

    const grouped = SECTORS.map((status) => ({
      status,
      orders: ((data ?? []) as Order[]).filter((o) => o.status === status),
    }))

    setSectorData(grouped)
    setLastUpdated(new Date())
  }, [unitId])

  useEffect(() => {
    // Fetch inicial via callback para evitar setState síncrono no corpo do effect
    const initialFetch = setTimeout(fetchData, 0)

    const supabase = createClient()

    const channel = supabase
      .channel(`tv:${unitId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `unit_id=eq.${unitId}` },
        () => fetchData()
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'order_events', filter: `unit_id=eq.${unitId}` },
        () => fetchData()
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED')
      })

    // Polling fallback a cada 30s
    const pollingInterval = setInterval(fetchData, 30_000)

    // Auto-refresh completo a cada 6h
    const refreshTimeout = setTimeout(() => window.location.reload(), 6 * 3600_000)

    return () => {
      clearTimeout(initialFetch)
      supabase.removeChannel(channel)
      clearInterval(pollingInterval)
      clearTimeout(refreshTimeout)
    }
  }, [unitId, fetchData])

  return { sectorData, lastUpdated, isConnected }
}
