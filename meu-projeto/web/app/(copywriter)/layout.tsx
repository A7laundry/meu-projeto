import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/get-user'
import { createAdminClient } from '@/lib/supabase/admin'
import { getWriterLevel, getXpProgress } from '@/lib/gamification'
import { logout } from '@/app/(auth)/login/actions'
import { CopywriterShell } from './copywriter-shell'

const ROLE_LABELS: Record<string, string> = {
  director: 'Diretor',
  unit_manager: 'Gerente',
  copywriter: 'Redator',
}

export default async function CopywriterLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()
  if (!user) redirect('/login')

  const allowed = ['director', 'unit_manager', 'copywriter']
  if (!allowed.includes(user.role)) redirect('/auth/error')

  const roleLabel = ROLE_LABELS[user.role] ?? user.role
  const isAdmin = ['director', 'unit_manager'].includes(user.role)

  const supabase = createAdminClient()
  await supabase.from('copywriter_profiles').upsert({ id: user.id }, { onConflict: 'id' })
  const { data: cp } = await supabase
    .from('copywriter_profiles')
    .select('total_xp')
    .eq('id', user.id)
    .single()

  const totalXp = cp?.total_xp ?? 0
  const { title } = getWriterLevel(totalXp)
  const { progress } = getXpProgress(totalXp)

  return (
    <CopywriterShell
      userName={user.full_name}
      userRole={roleLabel}
      isAdmin={isAdmin}
      xp={totalXp}
      level={title}
      xpProgress={progress}
      logoutAction={logout}
    >
      {children}
    </CopywriterShell>
  )
}
