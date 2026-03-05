import { getUser } from '@/lib/auth/get-user'
import { createAdminClient } from '@/lib/supabase/admin'
import { logout } from '@/app/(auth)/login/actions'
import { DirectorShell } from './director-shell'

async function getAllActiveUnits(): Promise<{ id: string; name: string }[]> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('units')
    .select('id, name')
    .eq('active', true)
    .order('name')
  return (data ?? []) as { id: string; name: string }[]
}

export default async function DirectorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, units] = await Promise.all([getUser(), getAllActiveUnits()])

  return (
    <DirectorShell
      userName={user?.full_name}
      userRole="Diretor"
      units={units}
      logoutAction={logout}
    >
      {children}
    </DirectorShell>
  )
}
