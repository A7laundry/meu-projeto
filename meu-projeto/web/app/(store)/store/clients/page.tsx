import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/get-user'
import { listClients } from '@/actions/clients/crud'
import { ClientList } from '@/components/domain/client/client-list'

export default async function StoreClientsPage() {
  const user = await getUser()
  if (!user || user.role !== 'store' || !user.unit_id) redirect('/login')

  const clients = await listClients(user.unit_id)

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div>
        <p
          className="text-[10px] uppercase tracking-widest font-semibold mb-1"
          style={{ color: 'rgba(52,211,153,0.40)' }}
        >
          Clientes
        </p>
        <h1 className="text-xl font-bold text-white tracking-tight">Cadastro de Clientes</h1>
      </div>

      <ClientList unitId={user.unit_id} initialClients={clients} />
    </div>
  )
}
