import { getUser } from '@/lib/auth/get-user'
import { AppHeader } from '@/components/layout/app-header'

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()

  return (
    <div className="min-h-screen flex flex-col bg-obsidian text-white">
      <AppHeader user={user} title="A7x TecNologia - OS." subtitle="Portal do Cliente" dark />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
