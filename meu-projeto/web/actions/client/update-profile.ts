'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { getUser } from '@/lib/auth/get-user'

const profileSchema = z.object({
  phone: z.string().max(20).optional(),
  email: z.string().email('Email inválido').optional(),
})

type ActionResult = { success: true } | { success: false; error: string }

export async function getClientProfile(): Promise<{
  name: string
  email: string | null
  phone: string | null
  unitName: string | null
} | null> {
  const user = await getUser()
  if (!user) return null

  const supabase = createAdminClient()
  const { data } = await supabase
    .from('clients')
    .select('name, email, phone, units(name)')
    .eq('profile_id', user.id)
    .maybeSingle()

  if (!data) return null

  const raw = data as { name: string; email?: string | null; phone?: string | null; units?: { name?: string | null } | null }
  return {
    name: raw.name,
    email: raw.email ?? null,
    phone: raw.phone ?? null,
    unitName: raw.units?.name ?? null,
  }
}

export async function updateClientProfile(formData: FormData): Promise<ActionResult> {
  const user = await getUser()
  if (!user) return { success: false, error: 'Não autenticado' }

  const raw = {
    phone: (formData.get('phone') as string) || undefined,
    email: (formData.get('email') as string) || undefined,
  }

  const parsed = profileSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const supabase = createAdminClient()

  const updateData: Record<string, string> = {}
  if (parsed.data.phone !== undefined) updateData.phone = parsed.data.phone
  if (parsed.data.email !== undefined) updateData.email = parsed.data.email

  const { error } = await supabase
    .from('clients')
    .update(updateData)
    .eq('profile_id', user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/client/profile')
  return { success: true }
}
