import { Badge } from '@/components/ui/badge'
import { CrmNoteForm } from '@/components/domain/commercial/crm-note-form'
import { CLIENT_TYPE_LABELS, type Client } from '@/types/logistics'
import { CRM_NOTE_CATEGORY_LABELS, type ClientStats, type CrmNote } from '@/types/crm'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

function formatCurrency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

interface ClientDetailProps {
  unitId: string
  client: Client
  stats: ClientStats
  notes: CrmNote[]
}

export function ClientDetail({ unitId, client, stats, notes }: ClientDetailProps) {
  const address = [
    client.address_street,
    client.address_number,
    client.address_complement,
    client.address_neighborhood,
    client.address_city,
    client.address_state,
    client.address_zip,
  ]
    .filter(Boolean)
    .join(', ')

  return (
    <div className="space-y-6">
      {/* Info do cliente */}
      <div className="rounded-lg border bg-white p-5 space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">{client.name}</h2>
          <Badge variant="outline">{CLIENT_TYPE_LABELS[client.type]}</Badge>
          {!client.active && <Badge variant="secondary">Inativo</Badge>}
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
          {client.document && <p>Doc: {client.document}</p>}
          {client.phone && <p>Tel: {client.phone}</p>}
          {client.email && <p>Email: {client.email}</p>}
          {address && <p className="col-span-2">Endereço: {address}</p>}
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pedidos aprovados', value: stats.totalOrders },
          { label: 'Total gasto', value: formatCurrency(stats.totalSpent) },
          { label: 'Ticket médio', value: formatCurrency(stats.avgTicket) },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border bg-white p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Notas de atendimento */}
      <div className="rounded-lg border bg-white p-5 space-y-4">
        <h3 className="font-semibold text-gray-900">Notas de Atendimento</h3>
        <CrmNoteForm clientId={client.id} unitId={unitId} />

        <div className="space-y-3 mt-2">
          {notes.length === 0 && (
            <p className="text-sm text-gray-400">Nenhuma nota registrada.</p>
          )}
          {notes.map((note) => (
            <div key={note.id} className="rounded-md border bg-gray-50 p-3 space-y-1">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="font-medium">
                  {CRM_NOTE_CATEGORY_LABELS[note.category]}
                  {note.author_name && ` · ${note.author_name}`}
                </span>
                <span>
                  {format(new Date(note.created_at), "dd/MM/yy 'às' HH:mm", {
                    locale: ptBR,
                  })}
                </span>
              </div>
              <p className="text-sm text-gray-700">{note.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
