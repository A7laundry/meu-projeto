import { listClients } from '@/actions/clients/crud'
import { ClientList } from '@/components/domain/client/client-list'

export const revalidate = 0

export default async function ClientsPage({
  params,
}: {
  params: Promise<{ unitId: string }>
}) {
  const { unitId } = await params
  const clients = await listClients(unitId)

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
        <p className="text-sm text-gray-500 mt-1">
          Cadastro de clientes B2B e pessoas físicas da unidade
        </p>
      </div>

      <ClientList unitId={unitId} initialClients={clients} />
    </div>
  )
}
