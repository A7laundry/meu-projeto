import { getUser } from '@/lib/auth/get-user'
import { AppHeader } from '@/components/layout/app-header'

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AppHeader user={user} title="Synkra" subtitle="Portal do Cliente" />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
