import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/get-user'

export default async function Home() {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  switch (user.role) {
    case 'director':
      redirect('/director/dashboard')
    case 'unit_manager':
      redirect(user.unit_id ? `/unit/${user.unit_id}/dashboard` : '/login')
    case 'operator':
      redirect(user.sector ? `/sector/${user.sector}` : '/login')
    case 'driver':
      redirect('/driver/route')
    case 'store':
    case 'customer':
      redirect('/client/orders')
    case 'sdr':
    case 'closer':
      redirect('/commercial/dashboard')
    default:
      redirect('/login')
  }
}
