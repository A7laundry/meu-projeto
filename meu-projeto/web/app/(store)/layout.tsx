import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/get-user'
import { getUnit } from '@/actions/units/crud'
import { getNotificationCount } from '@/actions/notifications'
import { logout } from '@/app/(auth)/login/actions'
import { StoreShell } from './store-shell'

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()
  if (!user) redirect('/login')
  if (user.role !== 'store') redirect('/auth/error')
  if (!user.unit_id) redirect('/auth/error')

  const [unit, notificationCount] = await Promise.all([
    getUnit(user.unit_id),
    getNotificationCount(),
  ])

  const unitName = unit?.name ?? 'Loja'

  return (
    <StoreShell
      userName={user.full_name}
      userRole={unitName}
      notificationCount={notificationCount}
      logoutAction={logout}
    >
      {children}
    </StoreShell>
  )
}
