import { getUser } from '@/lib/auth/get-user'
import { logout } from '@/app/(auth)/login/actions'

const SECTOR_NAMES: Record<string, string> = {
  sorting: 'Triagem',
  washing: 'Lavagem',
  drying: 'Secagem',
  ironing: 'Passadoria',
  shipping: 'Expedição',
}

export default async function SectorPage({
  params,
}: {
  params: Promise<{ sector: string }>
}) {
  const { sector } = await params
  const user = await getUser()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-900 text-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">
          {SECTOR_NAMES[sector] ?? sector}
        </h1>
        <p className="text-gray-400">Operador: {user?.full_name}</p>
        <p className="text-sm text-gray-500 mt-4">
          Interface do setor será implementada na E2.3
        </p>
        <form action={logout} className="mt-8">
          <button type="submit" className="text-sm text-gray-400 hover:text-white">
            Sair
          </button>
        </form>
      </div>
    </div>
  )
}
