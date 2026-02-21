'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'
import type { UserProfile } from '@/types/auth'

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

const inviteSchema = z.object({
  email: z.string().email('Email inválido'),
  full_name: z.string().min(2, 'Nome obrigatório'),
  role: z.enum(['operator', 'driver']),
  sector: z.enum(['sorting', 'washing', 'drying', 'ironing', 'shipping']).optional().nullable(),
})

export async function listStaff(unitId: string): Promise<UserProfile[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('unit_id', unitId)
    .order('full_name')

  if (error) throw new Error(`Erro ao listar funcionários: ${error.message}`)
  return data as UserProfile[]
}

export async function inviteStaff(
  unitId: string,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    email: formData.get('email'),
    full_name: formData.get('full_name'),
    role: formData.get('role'),
    sector: formData.get('sector') || null,
  }

  const parsed = inviteSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  // Validação: operador precisa de setor
  if (parsed.data.role === 'operator' && !parsed.data.sector) {
    return { success: false, error: 'Operador precisa ter um setor definido.' }
  }

  const admin = createAdminClient()

  const { error } = await admin.auth.admin.inviteUserByEmail(parsed.data.email, {
    data: {
      full_name: parsed.data.full_name,
      role: parsed.data.role,
      unit_id: unitId,
      sector: parsed.data.sector ?? null,
    },
  })

  if (error) {
    if (error.message.includes('already been registered')) {
      return { success: false, error: 'Este email já está cadastrado no sistema.' }
    }
    return { success: false, error: `Erro ao convidar: ${error.message}` }
  }

  revalidatePath(`/unit/${unitId}/staff`)
  return { success: true, data: undefined }
}

export async function toggleStaffStatus(
  profileId: string,
  unitId: string,
  active: boolean
): Promise<ActionResult> {
  const admin = createAdminClient()
  const { error } = await admin
    .from('profiles')
    .update({ active })
    .eq('id', profileId)
    .eq('unit_id', unitId) // garantia de isolamento de unidade

  if (error) return { success: false, error: `Erro ao alterar status: ${error.message}` }

  revalidatePath(`/unit/${unitId}/staff`)
  return { success: true, data: undefined }
}
