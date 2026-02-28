import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/get-user'
import { getUnit } from '@/actions/units/crud'
import { getNotificationCount } from '@/actions/notifications'
import { AppHeader } from '@/components/layout/app-header'
import { StoreSidebar } from '@/components/layout/store-sidebar'

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
    <div className="min-h-screen flex flex-col bg-[#07070a]">
      <AppHeader user={user} dark subtitle={unitName} notificationCount={notificationCount} />
      <div className="flex flex-1 overflow-hidden">
        <StoreSidebar userName={user.full_name} unitName={unitName} />
        <main className="flex-1 overflow-auto bg-obsidian scrollbar-dark">
          {children}
        </main>
      </div>
    </div>
  )
}
