'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { requireUnitAccess } from '@/lib/auth/guards'
import { revalidatePath } from 'next/cache'
import type { ActionResult } from '@/lib/auth/action-result'

export interface DisplayToken {
  id: string
  unit_id: string
  token: string
  label: string
  active: boolean
  created_at: string
  expires_at: string | null
}

export async function listDisplayTokens(unitId: string): Promise<DisplayToken[]> {
  await requireUnitAccess(unitId, ['unit_manager', 'director'])
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('display_tokens')
    .select('*')
    .eq('unit_id', unitId)
    .order('created_at', { ascending: false })

  return (data ?? []) as DisplayToken[]
}

export async function createDisplayToken(
  unitId: string,
  label?: string
): Promise<ActionResult<DisplayToken>> {
  await requireUnitAccess(unitId, ['unit_manager', 'director'])
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('display_tokens')
    .insert({
      unit_id: unitId,
      label: label || 'TV Principal',
      active: true,
    })
    .select()
    .single()

  if (error) return { success: false, error: `Erro ao criar token: ${error.message}` }

  revalidatePath(`/unit/${unitId}/settings`)
  return { success: true, data: data as DisplayToken }
}

export async function revokeDisplayToken(
  id: string,
  unitId: string
): Promise<ActionResult> {
  await requireUnitAccess(unitId, ['unit_manager', 'director'])
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('display_tokens')
    .update({ active: false })
    .eq('id', id)
    .eq('unit_id', unitId)

  if (error) return { success: false, error: `Erro ao revogar token: ${error.message}` }

  revalidatePath(`/unit/${unitId}/settings`)
  return { success: true, data: undefined }
}

/**
 * Valida um token de display e retorna o unit_id associado.
 * Usada pela rota pública /display/[token].
 */
export async function validateDisplayToken(token: string): Promise<{ unitId: string; label: string } | null> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('display_tokens')
    .select('unit_id, label')
    .eq('token', token)
    .eq('active', true)
    .single()

  if (!data) return null

  // Verificar expiração (se tiver)
  return { unitId: data.unit_id, label: data.label }
}
