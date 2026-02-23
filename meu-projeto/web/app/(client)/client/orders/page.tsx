import { getUser } from '@/lib/auth/get-user'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Order, OrderEvent, OrderItem, OrderStatus } from '@/types/order'

/* ─── Etapas do processo ─────────────────────────────────────────── */

const PROCESS_STEPS: {
  status: OrderStatus
  label: string
  description: string
  icon: string
  color: string
}[] = [
  { status: 'received',  label: 'Recebida',   description: 'Suas peças chegaram à unidade',                icon: '📥', color: '#60a5fa' },
  { status: 'sorting',   label: 'Triagem',    description: 'Separando por tipo de tecido e cor',           icon: '🔍', color: '#93c5fd' },
  { status: 'washing',   label: 'Lavagem',    description: 'Na máquina com fórmula especial',              icon: '🫧', color: '#60a5fa' },
  { status: 'drying',    label: 'Secagem',    description: 'Secagem controlada para preservar o tecido',   icon: '💨', color: '#93c5fd' },
  { status: 'ironing',   label: 'Passadoria', description: 'Passando e dobrando suas peças',               icon: '🌡️', color: '#60a5fa' },
  { status: 'ready',     label: 'Pronta',     description: 'Suas peças estão prontas para retirada!',      icon: '✅', color: '#34d399' },
  { status: 'shipped',   label: 'Em entrega', description: 'O entregador está a caminho',                  icon: '🚚', color: '#60a5fa' },
  { status: 'delivered', label: 'Entregue',   description: 'Entregue com sucesso!',                        icon: '🏠', color: '#34d399' },
]

const STATUS_INDEX: Record<OrderStatus, number> = Object.fromEntries(
  PROCESS_STEPS.map((s, i) => [s.status, i])
) as Record<OrderStatus, number>

const PIECE_TYPE_LABELS: Record<string, string> = {
  clothing:   'Roupa',
  costume:    'Fantasia',
  sneaker:    'Tênis',
  rug:        'Tapete',
  curtain:    'Cortina',
  industrial: 'Industrial',
  other:      'Outros',
}

/* ─── Busca de dados ─────────────────────────────────────────────── */

async function getClientRecord(profileId: string): Promise<string | null> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('clients')
    .select('id')
    .eq('profile_id', profileId)
    .maybeSingle()
  return data?.id ?? null
}

async function getClientOrders(clientId: string): Promise<Order[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('orders')
    .select(`*, items:order_items(*), events:order_events(*)`)
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .limit(30)
  return (data ?? []) as Order[]
}

/* ─── Página principal ──────────────────────────────────────────── */

export default async function ClientOrdersPage() {
  const user = await getUser()
  if (!user) {
    return (
      <div className="p-8 text-center">
        <p className="text-white/40 text-sm">Sessão expirada. Faça login novamente.</p>
      </div>
    )
  }

  // Busca o registro de cliente vinculado ao perfil do usuário
  const clientId = await getClientRecord(user.id)
  const orders = clientId ? await getClientOrders(clientId) : []
  const active  = orders.filter((o) => o.status !== 'delivered')
  const history = orders.filter((o) => o.status === 'delivered')
  const firstName = user.full_name.split(' ')[0]

  return (
    <div
      className="min-h-[calc(100vh-56px)]"
      style={{ background: 'linear-gradient(180deg, #071020 0%, #0d1b2e 100%)' }}
    >
      {/* Top accent line */}
      <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.50), transparent)' }} />

      <div className="max-w-xl mx-auto px-4 py-6 space-y-6 pb-10">

        {/* ─── Saudação ─────────────────────────────────────────── */}
        <div className="pt-2">
          <p
            className="text-[10px] uppercase tracking-widest font-semibold mb-1.5"
            style={{ color: 'rgba(96,165,250,0.50)' }}
          >
            Portal do Cliente
          </p>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Olá, {firstName} 👋
          </h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.40)' }}>
            {active.length > 0
              ? `${active.length} comanda${active.length > 1 ? 's' : ''} em andamento`
              : history.length > 0
                ? 'Nenhuma comanda em andamento'
                : 'Bem-vindo! Suas comandas aparecerão aqui.'}
          </p>
        </div>

        {/* ─── Resumo estatístico ───────────────────────────────── */}
        {orders.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: 'Em andamento',
                value: active.length,
                color: '#3b82f6',
                bg: 'rgba(59,130,246,0.10)',
                border: 'rgba(59,130,246,0.18)',
              },
              {
                label: 'Entregues',
                value: history.length,
                color: '#34d399',
                bg: 'rgba(52,211,153,0.08)',
                border: 'rgba(52,211,153,0.16)',
              },
              {
                label: 'Total de peças',
                value: orders.reduce((acc, o) => acc + (o.items?.reduce((s, i) => s + i.quantity, 0) ?? 0), 0),
                color: '#93c5fd',
                bg: 'rgba(147,197,253,0.07)',
                border: 'rgba(147,197,253,0.14)',
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl p-3 text-center"
                style={{ background: stat.bg, border: `1px solid ${stat.border}` }}
              >
                <p className="text-lg font-bold leading-none" style={{ color: stat.color }}>{stat.value}</p>
                <p className="text-[10px] mt-1 leading-tight" style={{ color: 'rgba(255,255,255,0.35)' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* ─── Comandas ativas ──────────────────────────────────── */}
        {active.length > 0 && (
          <section>
            <p
              className="text-[10px] uppercase tracking-widest font-semibold mb-3"
              style={{ color: 'rgba(59,130,246,0.45)' }}
            >
              Em andamento
            </p>
            <div className="space-y-4">
              {active.map((order) => (
                <OrderTracker key={order.id} order={order} />
              ))}
            </div>
          </section>
        )}

        {/* ─── Empty state ──────────────────────────────────────── */}
        {active.length === 0 && (
          <div
            className="rounded-2xl p-8 text-center"
            style={{
              background: 'rgba(59,130,246,0.04)',
              border: '1px solid rgba(59,130,246,0.10)',
            }}
          >
            <div
              className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl"
              style={{ background: 'rgba(59,130,246,0.10)', border: '1px solid rgba(59,130,246,0.18)' }}
            >
              🧺
            </div>
            <p className="font-semibold text-white/75">Nenhuma peça em processo</p>
            <p className="text-sm mt-1.5" style={{ color: 'rgba(255,255,255,0.30)' }}>
              Traga suas peças à unidade e acompanhe cada etapa do processo aqui em tempo real.
            </p>
          </div>
        )}

        {/* ─── Histórico ────────────────────────────────────────── */}
        {history.length > 0 && (
          <section>
            <p
              className="text-[10px] uppercase tracking-widest font-semibold mb-3"
              style={{ color: 'rgba(255,255,255,0.22)' }}
            >
              Histórico de entregas
            </p>
            <div className="space-y-2">
              {history.slice(0, 10).map((order) => (
                <HistoryCard key={order.id} order={order} />
              ))}
            </div>
          </section>
        )}

        {/* ─── Footer informativo ───────────────────────────────── */}
        <div
          className="rounded-xl px-4 py-3 flex items-center gap-3"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <span className="text-base flex-shrink-0">💬</span>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.28)' }}>
            Precisa de ajuda? Entre em contato com a unidade.
          </p>
        </div>
      </div>
    </div>
  )
}

/* ─── Tracker completo da comanda ────────────────────────────────── */

function OrderTracker({ order }: { order: Order }) {
  const currentIdx = STATUS_INDEX[order.status as OrderStatus] ?? 0
  const currentStep = PROCESS_STEPS[currentIdx]
  const totalPieces = order.items?.reduce((s, i) => s + i.quantity, 0) ?? 0
  const progress = Math.round(((currentIdx + 1) / PROCESS_STEPS.length) * 100)
  const isDelivered = order.status === 'delivered'
  const isReady = order.status === 'ready'
  const isShipped = order.status === 'shipped'

  const promised = order.promised_at
    ? new Date(order.promised_at).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })
    : null

  const eventTimestamps: Partial<Record<string, string>> = {}
  ;(order.events ?? []).forEach((ev: OrderEvent) => {
    if (!eventTimestamps[ev.sector]) eventTimestamps[ev.sector] = ev.occurred_at
  })
  eventTimestamps['received'] = order.created_at

  const accentColor = isDelivered || isReady ? '#34d399' : isShipped ? '#60a5fa' : '#3b82f6'
  const accentBg   = isDelivered || isReady ? 'rgba(52,211,153,0.10)' : isShipped ? 'rgba(96,165,250,0.10)' : 'rgba(59,130,246,0.10)'
  const accentBorder = isDelivered || isReady ? 'rgba(52,211,153,0.22)' : isShipped ? 'rgba(96,165,250,0.22)' : 'rgba(59,130,246,0.22)'

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, rgba(59,130,246,0.06) 0%, rgba(7,16,32,0.97) 100%)',
        border: `1px solid ${accentBorder}`,
        boxShadow: `0 4px 24px rgba(0,0,0,0.3), 0 0 0 0.5px ${accentBorder}`,
      }}
    >
      {/* ── Header ── */}
      <div
        className="px-5 py-4 flex items-start justify-between gap-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
            style={{ background: accentBg, border: `1px solid ${accentBorder}` }}
          >
            {currentStep.icon}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: 'rgba(255,255,255,0.28)' }}>
              Comanda #{order.order_number}
            </p>
            <p className="font-bold text-white leading-tight text-base">{currentStep.label}</p>
            <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.40)' }}>
              {currentStep.description}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          {totalPieces > 0 && (
            <span
              className="text-xs px-2.5 py-1 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.50)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {totalPieces} peça{totalPieces > 1 ? 's' : ''}
            </span>
          )}
          {(isReady || isShipped) && (
            <span
              className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
              style={{ background: accentBg, color: accentColor, border: `1px solid ${accentBorder}` }}
            >
              {isReady ? '✓ Pronta' : '🚚 A caminho'}
            </span>
          )}
        </div>
      </div>

      {/* ── Barra de progresso ── */}
      <div className="px-5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.28)' }}>
            Progresso
          </span>
          <span className="text-xs font-bold" style={{ color: accentColor }}>{progress}%</span>
        </div>
        <div className="flex gap-0.5">
          {PROCESS_STEPS.map((step, i) => (
            <div
              key={step.status}
              title={step.label}
              className="flex-1 h-1.5 rounded-full transition-all"
              style={{
                background: i < currentIdx
                  ? 'rgba(52,211,153,0.65)'
                  : i === currentIdx
                    ? accentColor
                    : 'rgba(255,255,255,0.07)',
              }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.18)' }}>Entrada</span>
          <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.18)' }}>Entrega</span>
        </div>
      </div>

      {/* ── Lista de peças ── */}
      {order.items && order.items.length > 0 && (
        <div className="px-5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <p className="text-[10px] uppercase tracking-widest font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.22)' }}>
            Peças
          </p>
          <div className="flex flex-wrap gap-1.5">
            {order.items.map((item: OrderItem) => (
              <span
                key={item.id}
                className="text-xs px-2 py-0.5 rounded-md"
                style={{
                  background: 'rgba(59,130,246,0.08)',
                  border: '1px solid rgba(59,130,246,0.15)',
                  color: 'rgba(147,197,253,0.80)',
                }}
              >
                {item.quantity}× {item.piece_type_label ?? PIECE_TYPE_LABELS[item.piece_type] ?? item.piece_type}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Timeline ── */}
      <div className="px-5 py-4 space-y-3">
        {PROCESS_STEPS.slice(0, Math.min(currentIdx + 2, PROCESS_STEPS.length)).map((step, i) => {
          const done    = i < currentIdx
          const current = i === currentIdx
          const ts = eventTimestamps[i === 0 ? 'received' : step.status]
          const formattedTs = ts
            ? new Date(ts).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
            : null

          return (
            <div key={step.status} className="flex items-start gap-3">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5 font-bold"
                style={{
                  background: done
                    ? 'rgba(52,211,153,0.18)'
                    : current
                      ? `${accentBg}`
                      : 'rgba(255,255,255,0.04)',
                  border: done
                    ? '1px solid rgba(52,211,153,0.32)'
                    : current
                      ? `1.5px solid ${accentColor}55`
                      : '1px solid rgba(255,255,255,0.08)',
                  color: done ? '#34d399' : current ? accentColor : 'rgba(255,255,255,0.18)',
                }}
              >
                {done ? '✓' : current ? '●' : '○'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p
                    className="text-sm font-medium truncate"
                    style={{ color: done || current ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.18)' }}
                  >
                    {step.label}
                  </p>
                  {formattedTs && (
                    <span className="text-[10px] flex-shrink-0" style={{ color: 'rgba(255,255,255,0.22)' }}>
                      {formattedTs}
                    </span>
                  )}
                </div>
                {current && (
                  <p className="text-xs mt-0.5" style={{ color: `${accentColor}99` }}>
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Rodapé: entrega prometida ── */}
      {promised && !isDelivered && (
        <div
          className="px-5 py-3 flex items-center justify-between"
          style={{
            borderTop: '1px solid rgba(255,255,255,0.04)',
            background: 'rgba(59,130,246,0.04)',
          }}
        >
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.32)' }}>
            Previsão de entrega
          </p>
          <p className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.65)' }}>
            {promised}
          </p>
        </div>
      )}
    </div>
  )
}

/* ─── Card de histórico ──────────────────────────────────────────── */

function HistoryCard({ order }: { order: Order }) {
  const totalPieces = order.items?.reduce((s, i) => s + i.quantity, 0) ?? 0
  const deliveredEvent = (order.events ?? []).find(
    (ev: OrderEvent) => ev.sector === 'shipping' || ev.sector === 'delivered'
  )
  const deliveredAt = deliveredEvent?.occurred_at
  const formatted = deliveredAt
    ? new Date(deliveredAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : new Date(order.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

  return (
    <div
      className="flex items-center justify-between rounded-xl px-4 py-3 gap-3"
      style={{
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm"
          style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.16)' }}
        >
          🏠
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate" style={{ color: 'rgba(255,255,255,0.70)' }}>
            Comanda #{order.order_number}
          </p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.28)' }}>
            {totalPieces > 0 ? `${totalPieces} peça${totalPieces > 1 ? 's' : ''} · ` : ''}
            Entregue em {formatted}
          </p>
        </div>
      </div>
      <span
        className="text-[11px] px-2 py-0.5 rounded-full font-medium flex-shrink-0"
        style={{ background: 'rgba(52,211,153,0.10)', color: '#34d399', border: '1px solid rgba(52,211,153,0.22)' }}
      >
        ✓ Entregue
      </span>
    </div>
  )
}
