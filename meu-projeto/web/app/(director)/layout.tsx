import { getUser } from '@/lib/auth/get-user'
import { AppHeader } from '@/components/layout/app-header'
import { DirectorNav } from '@/components/layout/director-nav'
import { createAdminClient } from '@/lib/supabase/admin'

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
    <div className="min-h-screen flex flex-col bg-obsidian">
      <AppHeader
        user={user}
        subtitle="Painel Executivo"
        logoHref="/director/dashboard"
        dark
      />
      <div className="flex flex-1 overflow-hidden">
        <DirectorNav units={units} />
        <main className="flex-1 overflow-auto scrollbar-dark">{children}</main>
      </div>
    </div>
  )
}
