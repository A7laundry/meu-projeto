import { createClient } from '@/lib/supabase/server'
import type { UserProfile } from '@/types/auth'

export async function getUser(): Promise<UserProfile | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile as UserProfile | null
}

export async function requireUser(): Promise<UserProfile> {
  const user = await getUser()
  if (!user) {
    throw new Error('Não autenticado')
  }
  return user
}

export function getRoleFromJWT(jwt: Record<string, unknown>) {
  return (jwt['user_role'] as string) ?? null
}

export function getUnitIdFromJWT(jwt: Record<string, unknown>) {
  return (jwt['unit_id'] as string) ?? null
}
