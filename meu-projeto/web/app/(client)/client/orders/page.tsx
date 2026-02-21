import { getUser } from '@/lib/auth/get-user'
import { logout } from '@/app/(auth)/login/actions'

export default async function ClientOrdersPage() {
  const user = await getUser()

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Minhas Comandas</h1>
        <form action={logout}>
          <button type="submit" className="text-sm text-gray-500 hover:text-gray-800">
            Sair
          </button>
        </form>
      </div>
      <p className="text-gray-600">Olá, {user?.full_name}.</p>
      <p className="text-sm text-gray-400 mt-1">Portal do cliente será implementado na E5.</p>
    </div>
  )
}
