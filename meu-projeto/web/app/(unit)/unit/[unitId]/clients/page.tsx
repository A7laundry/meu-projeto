import { Users } from 'lucide-react'
import { listClients } from '@/actions/clients/crud'
import { ClientList } from '@/components/domain/client/client-list'
import { PageHeader } from '@/components/layout/page-header'

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
      <PageHeader
        overline="Unidade"
        title="Clientes"
        subtitle="Cadastro de clientes B2B e pessoas físicas da unidade"
        accent="#3b82f6"
        icon={Users}
      />

      <ClientList unitId={unitId} initialClients={clients} />
    </div>
  )
}
