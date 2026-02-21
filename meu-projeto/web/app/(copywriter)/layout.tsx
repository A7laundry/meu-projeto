import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/get-user'
import { AppHeader } from '@/components/layout/app-header'
import { CopywriterSidebar } from '@/components/layout/copywriter-sidebar'
import { createAdminClient } from '@/lib/supabase/admin'
import { getWriterLevel, getXpProgress } from '@/lib/gamification'

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

  // Buscar XP para sidebar
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
    <div className="min-h-screen flex flex-col bg-[#07070a]">
      <AppHeader user={user} dark subtitle="Copywriter" />
      <div className="flex flex-1 overflow-hidden">
        <CopywriterSidebar
          userName={user.full_name}
          roleLabel={roleLabel}
          isAdmin={isAdmin}
          xp={totalXp}
          level={title}
          xpProgress={progress}
        />
        <main className="flex-1 overflow-auto bg-obsidian scrollbar-dark">
          {children}
        </main>
      </div>
    </div>
  )
}
