import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/get-user'
import { AppHeader } from '@/components/layout/app-header'
import { CommercialSidebar } from '@/components/layout/commercial-sidebar'

const ROLE_LABELS: Record<string, string> = {
  director: 'Diretor',
  unit_manager: 'Gerente',
  sdr: 'SDR',
  closer: 'Closer',
}

export default async function CommercialLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()
  if (!user) redirect('/login')

  const allowed = ['director', 'unit_manager', 'sdr', 'closer']
  if (!allowed.includes(user.role)) redirect('/auth/error')

  const roleLabel = ROLE_LABELS[user.role] ?? user.role

  return (
    <div className="min-h-screen flex flex-col bg-[#07070a]">
      <AppHeader user={user} dark subtitle="Comercial" />
      <div className="flex flex-1 overflow-hidden">
        <CommercialSidebar userName={user.full_name} roleLabel={roleLabel} />
        <main className="flex-1 overflow-auto bg-obsidian scrollbar-dark">
          {children}
        </main>
      </div>
    </div>
  )
}
