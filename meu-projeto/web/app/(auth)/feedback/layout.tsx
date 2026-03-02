import { getUser } from '@/lib/auth/get-user'
import { AppHeader } from '@/components/layout/app-header'
import { redirect } from 'next/navigation'

export default async function FeedbackLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen flex flex-col bg-obsidian">
      <AppHeader
        user={user}
        subtitle="Feedback UAT"
        logoHref="/feedback"
        dark
      />
      <main className="flex-1 overflow-auto scrollbar-dark">{children}</main>
    </div>
  )
}
