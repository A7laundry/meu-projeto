'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Unit } from '@/types/unit'

interface UseCurrentUnitResult {
  unit: Unit | null
  loading: boolean
  error: string | null
}

export function useCurrentUnit(): UseCurrentUnitResult {
  const [unit, setUnit] = useState<Unit | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUnit() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          setUnit(null)
          return
        }

        // Buscar unit_id do perfil
        const { data: profile } = await supabase
          .from('profiles')
          .select('unit_id')
          .eq('id', user.id)
          .single()

        if (!profile?.unit_id) {
          setUnit(null)
          return
        }

        // Buscar dados da unidade
        const { data: unitData, error: unitError } = await supabase
          .from('units')
          .select('*')
          .eq('id', profile.unit_id)
          .single()

        if (unitError) throw unitError
        setUnit(unitData as Unit)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar unidade')
      } finally {
        setLoading(false)
      }
    }

    fetchUnit()
  }, [])

  return { unit, loading, error }
}
