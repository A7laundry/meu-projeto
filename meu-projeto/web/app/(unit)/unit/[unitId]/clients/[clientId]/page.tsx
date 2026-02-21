import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
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
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-4">
        <Button asChild variant="ghost" size="sm" className="text-white/40">
          <Link href={`/unit/${unitId}/clients`}>← Voltar</Link>
        </Button>
      </div>

      <ClientDetail unitId={unitId} client={client} stats={stats} notes={notes} orders={orders} />
    </div>
  )
}
