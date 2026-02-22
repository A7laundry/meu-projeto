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

const ORDER_STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  received:  { label: 'Recebida',  color: 'rgba(96,165,250,0.85)',  bg: 'rgba(96,165,250,0.08)'  },
  sorting:   { label: 'Triagem',   color: 'rgba(167,139,250,0.85)', bg: 'rgba(167,139,250,0.08)' },
  washing:   { label: 'Lavando',   color: 'rgba(96,165,250,0.85)',  bg: 'rgba(96,165,250,0.08)'  },
  drying:    { label: 'Secando',   color: 'rgba(251,191,36,0.85)',  bg: 'rgba(251,191,36,0.08)'  },
  ironing:   { label: 'Passando',  color: 'rgba(251,146,60,0.85)',  bg: 'rgba(251,146,60,0.08)'  },
  ready:     { label: 'Pronto',    color: 'rgba(52,211,153,0.90)',  bg: 'rgba(52,211,153,0.10)'  },
  delivered: { label: 'Entregue',  color: 'rgba(255,255,255,0.40)', bg: 'rgba(255,255,255,0.04)' },
  cancelled: { label: 'Cancelada', color: 'rgba(248,113,113,0.80)', bg: 'rgba(248,113,113,0.08)' },
}

interface ClientDetailProps {
  unitId: string
  client: Client
  stats: ClientStats
  notes: CrmNote[]
  orders: ClientOrder[]
}

const CARD = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 16,
} as const

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

  let birthdayToday = false
  try {
    if (client.birthday) birthdayToday = isToday(parseISO(client.birthday))
  } catch { /* data inválida — ignora */ }

  const initials = client.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  return (
    <div className="space-y-5">

      {/* ── Banner aniversário ─────────────────────────── */}
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
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Envie uma mensagem personalizada ou gere um cupom de presente
            </p>
          </div>
          <a
            href={client.phone ? `https://wa.me/55${client.phone.replace(/\D/g, '')}?text=Feliz%20anivers%C3%A1rio!%20🎉` : '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-xs font-semibold px-3 py-1.5 rounded-lg flex-shrink-0 transition-all"
            style={{
              background: 'linear-gradient(135deg, #d6b25e 0%, #f0d080 100%)',
              color: '#05050a',
            }}
          >
            Enviar WPP 💬
          </a>
        </div>
      )}

      {/* ── Header do cliente ──────────────────────────── */}
      <div style={{ ...CARD, padding: '22px 24px' }}>
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-base font-bold"
            style={{
              background: 'linear-gradient(135deg, rgba(214,178,94,0.18) 0%, rgba(185,138,44,0.08) 100%)',
              border: '1px solid rgba(214,178,94,0.30)',
              color: '#d6b25e',
            }}
          >
            {initials}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-white">{client.name}</h2>
                  <span
                    className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                    style={{
                      background: client.type === 'pj' ? 'rgba(167,139,250,0.12)' : 'rgba(255,255,255,0.06)',
                      border: client.type === 'pj' ? '1px solid rgba(167,139,250,0.22)' : '1px solid rgba(255,255,255,0.10)',
                      color: client.type === 'pj' ? 'rgba(167,139,250,0.85)' : 'rgba(255,255,255,0.45)',
                    }}
                  >
                    {CLIENT_TYPE_LABELS[client.type as keyof typeof CLIENT_TYPE_LABELS] ?? 'Outro'}
                  </span>
                  {!client.active && (
                    <span
                      className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                      style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.30)' }}
                    >
                      Inativo
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm mt-1.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  {client.document && <span className="font-mono text-xs">{client.document}</span>}
                  {client.phone && <span>📞 {client.phone}</span>}
                  {client.email && <span>✉️ {client.email}</span>}
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
                  {client.birthday && (() => {
                    try {
                      return (
                        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                          🎂 {format(parseISO(client.birthday!), "dd 'de' MMMM", { locale: ptBR })}
                        </p>
                      )
                    } catch { return null }
                  })()}
                  {client.acquisition_channel && (
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      {ACQUISITION_ICONS[client.acquisition_channel] ?? '📌'}{' '}
                      Veio via {ACQUISITION_LABELS[client.acquisition_channel] ?? client.acquisition_channel}
                    </p>
                  )}
                </div>

                {address && (
                  <p className="text-xs mt-1 truncate max-w-sm" style={{ color: 'rgba(255,255,255,0.28)' }}>
                    📍 {address}
                  </p>
                )}
              </div>

              <ClientFormDialog unitId={unitId} client={client} trigger={
                <button
                  className="flex-shrink-0 text-xs px-3 py-1.5 rounded-lg transition-colors"
                  style={{
                    border: '1px solid rgba(255,255,255,0.10)',
                    color: 'rgba(255,255,255,0.40)',
                    background: 'transparent',
                  }}
                >
                  Editar
                </button>
              } />
            </div>
          </div>
        </div>
      </div>

      {/* ── KPIs ──────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Comandas',     value: String(stats.totalOrders), accent: '#60a5fa' },
          { label: 'Total gasto',  value: formatCurrency(stats.totalSpent), accent: '#d6b25e' },
          { label: 'Ticket médio', value: formatCurrency(stats.avgTicket), accent: '#a78bfa' },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl p-4 text-center"
            style={CARD}
          >
            <p className="text-2xl font-bold tabular-nums" style={{ color: s.accent }}>{s.value}</p>
            <p className="text-[11px] mt-1.5 font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.30)' }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* ── LTV Anual ─────────────────────────────────────── */}
      {stats.annualLtv > 0 && (
        <div
          className="rounded-2xl p-5"
          style={{
            background: 'linear-gradient(135deg, rgba(214,178,94,0.09) 0%, rgba(5,5,8,0.85) 100%)',
            border: '1px solid rgba(214,178,94,0.22)',
          }}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                LTV Anual Estimado
              </p>
              <p className="text-3xl font-bold tabular-nums" style={{ color: '#d6b25e' }}>
                {formatCurrency(stats.annualLtv)}
              </p>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.30)' }}>
                {stats.totalOrders} comanda{stats.totalOrders !== 1 ? 's' : ''}{' '}
                {stats.firstOrderAt
                  ? `· Cliente desde ${format(new Date(stats.firstOrderAt), 'MMM/yyyy', { locale: ptBR })}`
                  : ''}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.30)' }}>Por mês</p>
              <p className="text-xl font-semibold tabular-nums mt-1" style={{ color: 'rgba(255,255,255,0.65)' }}>
                {formatCurrency(stats.annualLtv / 12)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Histórico de Comandas ─────────────────────────── */}
      {orders.length > 0 && (
        <div style={{ ...CARD, padding: '20px 22px' }}>
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-4" style={{ color: 'rgba(255,255,255,0.30)' }}>
            Histórico de Comandas
          </p>
          <div className="space-y-2">
            {orders.map((order) => {
              const statusInfo = ORDER_STATUS_LABELS[order.status] ?? {
                label: order.status,
                color: 'rgba(255,255,255,0.35)',
                bg: 'rgba(255,255,255,0.04)',
              }
              return (
                <div
                  key={order.id}
                  className="flex items-center gap-3 py-2.5 px-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <div className="flex-shrink-0 w-20">
                    <p className="text-xs font-mono font-semibold" style={{ color: 'rgba(255,255,255,0.60)' }}>
                      #{order.order_number}
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
                      {format(new Date(order.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                    <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
                      {order.items_count} peça{order.items_count !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <span
                    className="text-[11px] px-2.5 py-0.5 rounded-full font-medium flex-shrink-0"
                    style={{ color: statusInfo.color, background: statusInfo.bg }}
                  >
                    {statusInfo.label}
                  </span>
                  {order.estimated_total > 0 && (
                    <div className="flex-shrink-0 text-right w-20">
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
      <div style={{ ...CARD, padding: '20px 22px' }}>
        <p className="text-[11px] font-semibold uppercase tracking-wider mb-4" style={{ color: 'rgba(255,255,255,0.30)' }}>
          Notas de Atendimento
        </p>
        <CrmNoteForm clientId={client.id} unitId={unitId} />

        <div className="space-y-3 mt-4">
          {notes.length === 0 && (
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.25)' }}>Nenhuma nota registrada.</p>
          )}
          {notes.map((note) => (
            <div
              key={note.id}
              className="rounded-xl p-3.5 space-y-1.5"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  {CRM_NOTE_CATEGORY_LABELS[note.category]}
                  {note.author_name && (
                    <span style={{ color: 'rgba(255,255,255,0.30)', fontWeight: 400 }}> · {note.author_name}</span>
                  )}
                </span>
                <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  {format(new Date(note.created_at), "dd/MM/yy 'às' HH:mm", { locale: ptBR })}
                </span>
              </div>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.72)' }}>{note.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
