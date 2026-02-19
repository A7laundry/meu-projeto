'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { UserRole } from '@/types/auth'

function getRedirectPath(role: UserRole, unitId?: string | null, sector?: string | null): string {
  switch (role) {
    case 'director':
      return '/director/dashboard'
    case 'unit_manager':
      return unitId ? `/unit/${unitId}/dashboard` : '/unit/select'
    case 'operator':
      return sector ? `/sector/${sector}` : '/sector/select'
    case 'driver':
      return '/driver/route'
    case 'store':
    case 'customer':
      return '/client/orders'
    default:
      return '/'
  }
}

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    const loginUrl = new URL('/login', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')
    loginUrl.searchParams.set('error', 'Email ou senha incorretos. Verifique seus dados e tente novamente.')
    redirect(loginUrl.pathname + '?' + loginUrl.searchParams.toString())
  }

  // Buscar perfil para determinar redirecionamento
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, unit_id, sector')
    .eq('id', data.user.id)
    .single()

  revalidatePath('/', 'layout')

  const redirectPath = profile
    ? getRedirectPath(
        profile.role as UserRole,
        profile.unit_id,
        profile.sector
      )
    : '/'

  redirect(redirectPath)
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
