import { getUser } from '@/lib/auth/get-user'
import { AppHeader } from '@/components/layout/app-header'

export default async function DriverLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <AppHeader user={user} title="A7x TecNologia - OS." subtitle="Motorista" />
      <main className="flex-1 overflow-auto px-4 py-6 max-w-lg mx-auto w-full">
        {children}
      </main>
    </div>
  )
}
