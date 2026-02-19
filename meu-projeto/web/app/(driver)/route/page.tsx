import { getUser } from '@/lib/auth/get-user'
import { logout } from '@/app/(auth)/login/actions'

export default async function DriverRoutePage() {
  const user = await getUser()

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Minha Rota</h1>
        <form action={logout}>
          <button type="submit" className="text-sm text-gray-500 hover:text-gray-800">
            Sair
          </button>
        </form>
      </div>
      <p className="text-gray-600">Motorista: {user?.full_name}</p>
      <p className="text-sm text-gray-400 mt-1">Módulo de logística será implementado na E4.</p>
    </div>
  )
}
