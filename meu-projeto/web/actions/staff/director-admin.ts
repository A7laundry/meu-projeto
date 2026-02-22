'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import type { UserRole } from '@/types/auth'

export type UserWithUnit = {
  id: string
  full_name: string
  role: UserRole
  unit_id: string | null
  sector: string | null
  active: boolean
  created_at: string
  units: { name: string } | null
}

export async function listAllUsers(filters?: {
  role?: UserRole
  unit_id?: string
  active?: boolean
}): Promise<UserWithUnit[]> {
  const supabase = createAdminClient()
  let q = supabase
    .from('profiles')
    .select('*, units(name)')
    .order('created_at', { ascending: false })

  if (filters?.role)              q = q.eq('role', filters.role)
  if (filters?.unit_id)           q = q.eq('unit_id', filters.unit_id)
  if (filters?.active !== undefined) q = q.eq('active', filters.active)

  const { data, error } = await q
  if (error) throw new Error(error.message)
  return (data ?? []) as UserWithUnit[]
}

export async function createUserDirector(formData: FormData): Promise<void> {
  const supabase = createAdminClient()

  const email     = formData.get('email') as string
  const password  = formData.get('password') as string
  const full_name = formData.get('full_name') as string
  const role      = formData.get('role') as UserRole
  const unit_id   = (formData.get('unit_id') as string) || null

  const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (authErr) throw new Error(authErr.message)

  const { error: profileErr } = await supabase.from('profiles').insert({
    id: authData.user.id,
    full_name,
    role,
    unit_id,
    active: true,
  })
  if (profileErr) throw new Error(profileErr.message)

  revalidatePath('/director/users')
}

export async function updateUserDirector(
  userId: string,
  formData: FormData
): Promise<void> {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: formData.get('full_name') as string,
      role:      formData.get('role') as UserRole,
      unit_id:   (formData.get('unit_id') as string) || null,
    })
    .eq('id', userId)

  if (error) throw new Error(error.message)
  revalidatePath('/director/users')
}

export async function toggleUserDirector(
  userId: string,
  active: boolean
): Promise<void> {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('profiles')
    .update({ active })
    .eq('id', userId)

  if (error) throw new Error(error.message)
  revalidatePath('/director/users')
}
