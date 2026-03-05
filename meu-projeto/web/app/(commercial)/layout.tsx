import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/get-user'
import { logout } from '@/app/(auth)/login/actions'
import { CommercialShell } from './commercial-shell'

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
    <CommercialShell
      userName={user.full_name}
      userRole={roleLabel}
      logoutAction={logout}
    >
      {children}
    </CommercialShell>
  )
}
