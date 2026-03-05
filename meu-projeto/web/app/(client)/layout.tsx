import { getUser } from '@/lib/auth/get-user'
import { logout } from '@/app/(auth)/login/actions'
import { ClientShell } from './client-shell'

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()

  return (
    <ClientShell
      userName={user?.full_name}
      logoutAction={logout}
    >
      {children}
    </ClientShell>
  )
}
