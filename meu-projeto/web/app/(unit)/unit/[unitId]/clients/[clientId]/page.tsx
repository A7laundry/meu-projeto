import { notFound } from 'next/navigation'
import Link from 'next/link'
import { listClients } from '@/actions/clients/crud'
import { getClientStats, listClientNotes, listClientOrders } from '@/actions/crm/notes'
import { ClientDetail } from '@/components/domain/commercial/client-detail'

export const revalidate = 0

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ unitId: string; clientId: string }>
}) {
  const { unitId, clientId } = await params
  const [clients, notes, stats, orders] = await Promise.all([
    listClients(unitId),
    listClientNotes(clientId),
    getClientStats(clientId, unitId),
    listClientOrders(clientId, unitId),
  ])

  const client = clients.find((c) => c.id === clientId)
  if (!client) notFound()

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Breadcrumb / Voltar */}
      <div className="flex items-center gap-2 mb-6">
        <Link
          href={`/unit/${unitId}/clients`}
          className="text-sm transition-colors"
          style={{ color: 'rgba(255,255,255,0.35)' }}
        >
          Clientes
        </Link>
        <span style={{ color: 'rgba(255,255,255,0.20)' }}>/</span>
        <span className="text-sm font-medium text-white/65 truncate max-w-xs">
          {client.name}
        </span>
      </div>

      <ClientDetail unitId={unitId} client={client} stats={stats} notes={notes} orders={orders} />
    </div>
  )
}
