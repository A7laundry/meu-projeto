'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Submission } from '@/types/copywriter'

export function useSubmissionsRealtime(briefingId: string) {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [isConnected, setIsConnected] = useState(false)

  const fetchData = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('submissions')
      .select('*, writer:profiles!submissions_writer_id_fkey(full_name)')
      .eq('briefing_id', briefingId)
      .order('created_at', { ascending: true })
    setSubmissions((data ?? []) as Submission[])
  }, [briefingId])

  useEffect(() => {
    const initialFetch = setTimeout(fetchData, 0)

    const supabase = createClient()
    const channel = supabase
      .channel(`submissions:${briefingId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'submissions', filter: `briefing_id=eq.${briefingId}` },
        () => fetchData()
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED')
      })

    const pollingInterval = setInterval(fetchData, 30_000)

    return () => {
      clearTimeout(initialFetch)
      supabase.removeChannel(channel)
      clearInterval(pollingInterval)
    }
  }, [briefingId, fetchData])

  return { submissions, isConnected }
}
