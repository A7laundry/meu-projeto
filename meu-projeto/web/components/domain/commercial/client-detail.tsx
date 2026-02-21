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
      <div className="rounded-lg border bg-[rgba(255,255,255,0.04)] p-5 space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">{client.name}</h2>
          <Badge variant="outline">{CLIENT_TYPE_LABELS[client.type]}</Badge>
          {!client.active && <Badge variant="secondary">Inativo</Badge>}
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm text-white/55">
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
          <div key={s.label} className="rounded-lg border bg-[rgba(255,255,255,0.04)] p-4 text-center">
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-white/40 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* LTV */}
      {stats.annualLtv > 0 && (
        <div className="rounded-lg border border-[#d6b25e]/30 bg-gradient-to-r from-[#07070a] to-[#111118] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[#d6b25e]/60 uppercase tracking-wide font-semibold">
                LTV Anual Estimado
              </p>
              <p className="text-3xl font-bold text-[#d6b25e] mt-1">
                {formatCurrency(stats.annualLtv)}
              </p>
              <p className="text-xs text-white/40 mt-1">
                Baseado em {stats.totalOrders} pedido{stats.totalOrders !== 1 ? 's' : ''} ·{' '}
                {stats.firstOrderAt
                  ? `Cliente desde ${format(new Date(stats.firstOrderAt), 'MMM/yyyy', { locale: ptBR })}`
                  : ''}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/40 uppercase tracking-wide">Por mês</p>
              <p className="text-lg font-semibold text-white/80 mt-1">
                {formatCurrency(stats.annualLtv / 12)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Notas de atendimento */}
      <div className="rounded-lg border bg-[rgba(255,255,255,0.04)] p-5 space-y-4">
        <h3 className="font-semibold text-white">Notas de Atendimento</h3>
        <CrmNoteForm clientId={client.id} unitId={unitId} />

        <div className="space-y-3 mt-2">
          {notes.length === 0 && (
            <p className="text-sm text-white/35">Nenhuma nota registrada.</p>
          )}
          {notes.map((note) => (
            <div key={note.id} className="rounded-md border bg-[rgba(255,255,255,0.03)] p-3 space-y-1">
              <div className="flex items-center justify-between text-xs text-white/40">
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
              <p className="text-sm text-white/75">{note.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
