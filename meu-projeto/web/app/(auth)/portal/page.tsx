import { requireUser } from '@/lib/auth/get-user'
import { PortalContent } from './portal-content'
import { redirect } from 'next/navigation'

export default async function PortalPage() {
  try {
    const user = await requireUser()
    return <PortalContent user={user} />
  } catch (error) {
    console.error('[Portal] Auth error:', error)
    redirect('/login')
  }
}
