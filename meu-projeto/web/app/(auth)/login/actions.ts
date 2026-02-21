'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
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
      return '/profile/setup' // <- em vez de '/'
  }
}

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = String(formData.get('email') || '')
  const password = String(formData.get('password') || '')

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data?.user) {
    const loginUrl = new URL('/login', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')
    loginUrl.searchParams.set('error', 'Email ou senha incorretos. Verifique seus dados e tente novamente.')
    redirect(loginUrl.pathname + '?' + loginUrl.searchParams.toString())
  }

  const admin = createAdminClient()
  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('role, unit_id, sector')
    .eq('id', data.user.id)
    .single()

  // Se não existe profile ainda, manda para setup em vez de cair em /
  if (profileError || !profile) {
    revalidatePath('/', 'layout')
    redirect('/profile/setup')
  }

  revalidatePath('/', 'layout')
  redirect(getRedirectPath(profile.role as UserRole, profile.unit_id, profile.sector))
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}