import { Badge } from '@/components/ui/badge'
import { CrmNoteForm } from '@/components/domain/commercial/crm-note-form'
import { CLIENT_TYPE_LABELS, type Client } from '@/types/logistics'
import { CRM_NOTE_CATEGORY_LABELS, type ClientStats, type CrmNote } from '@/types/crm'
import { ClientFormDialog } from '@/components/domain/client/client-form-dialog'
import type { ClientOrder } from '@/actions/crm/notes'
import { format, isToday, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

function formatCurrency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const ACQUISITION_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  google:    'Google',
  referral:  'Indicação',
  whatsapp:  'WhatsApp',
  facebook:  'Facebook',
  other:     'Outro',
}

const ACQUISITION_ICONS: Record<string, string> = {
  instagram: '📸',
  google:    '🔍',
  referral:  '🤝',
  whatsapp:  '💬',
  facebook:  '👤',
  other:     '📌',
}

const ORDER_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  received:   { label: 'Recebida',    color: 'rgba(96,165,250,0.7)' },
  sorting:    { label: 'Triagem',     color: 'rgba(167,139,250,0.7)' },
  washing:    { label: 'Lavando',     color: 'rgba(96,165,250,0.8)' },
  drying:     { label: 'Secando',     color: 'rgba(251,191,36,0.7)' },
  ironing:    { label: 'Passando',    color: 'rgba(251,146,60,0.7)' },
  ready:      { label: 'Pronto',      color: 'rgba(52,211,153,0.8)' },
  delivered:  { label: 'Entregue',    color: 'rgba(255,255,255,0.3)' },
  cancelled:  { label: 'Cancelada',   color: 'rgba(248,113,113,0.6)' },
}

interface ClientDetailProps {
  unitId: string
  client: Client
  stats: ClientStats
  notes: CrmNote[]
  orders: ClientOrder[]
}

export function ClientDetail({ unitId, client, stats, notes, orders }: ClientDetailProps) {
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

  // Verifica se hoje é aniversário do cliente
  let birthdayToday = false
  try {
    if (client.birthday) birthdayToday = isToday(parseISO(client.birthday))
  } catch { /* data inválida — ignora */ }

  return (
    <div className="space-y-6">
      {/* Banner aniversário */}
      {birthdayToday && (
        <div
          className="rounded-2xl px-5 py-4 flex items-center gap-4"
          style={{
            background: 'linear-gradient(135deg, rgba(214,178,94,0.18) 0%, rgba(5,5,8,0.6) 100%)',
            border: '1px solid rgba(214,178,94,0.35)',
          }}
        >
          <span className="text-3xl">🎂</span>
          <div>
            <p className="text-sm font-semibold" style={{ color: '#d6b25e' }}>
              Hoje é aniversário de {client.name.split(' ')[0]}!
            </p>
            <p className="text-xs text-white/50 mt-0.5">
              Envie uma mensagem personalizada ou gere um cupom de presente
            </p>
          </div>
          <a
            href={client.phone ? `https://wa.me/55${client.phone.replace(/\D/g, '')}?text=Feliz%20anivers%C3%A1rio!%20🎉` : '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto btn-gold px-3 py-1.5 rounded-lg text-xs font-semibold flex-shrink-0"
          >
            Enviar WPP 💬
          </a>
        </div>
      )}

      {/* Info + Editar */}
      <div
        className="rounded-xl p-5 space-y-4"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-white">{client.name}</h2>
              <Badge variant="outline">{CLIENT_TYPE_LABELS[client.type as keyof typeof CLIENT_TYPE_LABELS] ?? 'Outro'}</Badge>
              {!client.active && <Badge variant="secondary">Inativo</Badge>}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/50">
              {client.document && <span>{client.document}</span>}
              {client.phone && <span>📞 {client.phone}</span>}
              {client.email && <span>✉️ {client.email}</span>}
            </div>
            {client.birthday && (() => {
              try {
                return (
                  <p className="text-xs text-white/40">
                    🎂 Aniversário: {format(parseISO(client.birthday!), "dd 'de' MMMM", { locale: ptBR })}
                  </p>
                )
              } catch { return null }
            })()}
            {client.acquisition_channel && (
              <p className="text-xs text-white/40">
                {ACQUISITION_ICONS[client.acquisition_channel] ?? '📌'}{' '}
                Veio via {ACQUISITION_LABELS[client.acquisition_channel] ?? client.acquisition_channel}
              </p>
            )}
            {address && (
              <p className="text-xs text-white/35">📍 {address}</p>
            )}
          </div>
          <ClientFormDialog unitId={unitId} client={client} trigger={
            <button
              className="flex-shrink-0 text-xs px-3 py-1.5 rounded-lg text-white/40 hover:text-white/60 transition-colors"
              style={{ border: '1px solid rgba(255,255,255,0.10)' }}
            >
              Editar
            </button>
          } />
        </div>
      </div>

      {/* ── KPIs ─────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Comandas',      value: stats.totalOrders },
          { label: 'Total gasto',   value: formatCurrency(stats.totalSpent) },
          { label: 'Ticket médio',  value: formatCurrency(stats.avgTicket) },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl p-4 text-center"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-white/40 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── LTV Anual ─────────────────────────────────────── */}
      {stats.annualLtv > 0 && (
        <div
          className="rounded-xl p-5"
          style={{
            background: 'linear-gradient(135deg, rgba(214,178,94,0.08) 0%, rgba(5,5,8,0.8) 100%)',
            border: '1px solid rgba(214,178,94,0.20)',
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-1">
                LTV Anual Estimado
              </p>
              <p className="text-3xl font-bold" style={{ color: '#d6b25e' }}>
                {formatCurrency(stats.annualLtv)}
              </p>
              <p className="text-xs text-white/35 mt-1">
                {stats.totalOrders} comanda{stats.totalOrders !== 1 ? 's' : ''} ·{' '}
                {stats.firstOrderAt
                  ? `Cliente desde ${format(new Date(stats.firstOrderAt), 'MMM/yyyy', { locale: ptBR })}`
                  : ''}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/35 uppercase tracking-wider">Por mês</p>
              <p className="text-xl font-semibold text-white/70 mt-1">
                {formatCurrency(stats.annualLtv / 12)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Histórico de Comandas ─────────────────────────── */}
      {orders.length > 0 && (
        <div
          className="rounded-xl p-5 space-y-4"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <h3 className="font-semibold text-white text-sm">Histórico de Comandas</h3>
          <div className="space-y-2">
            {orders.map((order) => {
              const statusInfo = ORDER_STATUS_LABELS[order.status] ?? { label: order.status, color: 'rgba(255,255,255,0.35)' }
              return (
                <div
                  key={order.id}
                  className="flex items-center gap-3 py-2.5 px-3 rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  {/* Número da comanda */}
                  <div className="flex-shrink-0 w-20">
                    <p className="text-xs font-mono font-semibold text-white/70">
                      #{order.order_number}
                    </p>
                  </div>

                  {/* Data */}
                  <div className="flex-1">
                    <p className="text-xs text-white/45">
                      {format(new Date(order.created_at), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                    <p className="text-[11px] text-white/25">
                      {order.items_count} peça{order.items_count !== 1 ? 's' : ''}
                    </p>
                  </div>

                  {/* Status */}
                  <span
                    className="text-[11px] px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                    style={{
                      color: statusInfo.color,
                      background: `${statusInfo.color.replace('0.', '0.0')}`,
                      border: `1px solid ${statusInfo.color.replace('0.', '0.2')}`,
                    }}
                  >
                    {statusInfo.label}
                  </span>

                  {/* Valor */}
                  {order.estimated_total > 0 && (
                    <div className="flex-shrink-0 text-right">
                      <p className="text-sm font-semibold tabular-nums" style={{ color: '#d6b25e' }}>
                        {formatCurrency(order.estimated_total)}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Notas de atendimento ──────────────────────────── */}
      <div
        className="rounded-xl p-5 space-y-4"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <h3 className="font-semibold text-white text-sm">Notas de Atendimento</h3>
        <CrmNoteForm clientId={client.id} unitId={unitId} />

        <div className="space-y-3 mt-2">
          {notes.length === 0 && (
            <p className="text-sm text-white/35">Nenhuma nota registrada.</p>
          )}
          {notes.map((note) => (
            <div
              key={note.id}
              className="rounded-lg p-3 space-y-1"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-center justify-between text-xs text-white/40">
                <span className="font-medium">
                  {CRM_NOTE_CATEGORY_LABELS[note.category]}
                  {note.author_name && ` · ${note.author_name}`}
                </span>
                <span>
                  {format(new Date(note.created_at), "dd/MM/yy 'às' HH:mm", { locale: ptBR })}
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
