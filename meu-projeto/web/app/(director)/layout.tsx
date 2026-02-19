import { getUser } from '@/lib/auth/get-user'
import { AppHeader } from '@/components/layout/app-header'
import { DirectorSidebar } from '@/components/layout/director-sidebar'

export default async function DirectorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUser()

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader
        user={user}
        title="Synkra Laundry OS"
        subtitle="Diretor"
        logoHref="/director/dashboard"
      />
      <div className="flex flex-1">
        <DirectorSidebar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
