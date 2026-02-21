import { getUser } from '@/lib/auth/get-user'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Order, OrderEvent, OrderStatus } from '@/types/order'

/* ─── Dados do processo de lavanderia ───────────────────────────── */

const PROCESS_STEPS: {
  status: OrderStatus
  label: string
  description: string
  icon: string
}[] = [
  { status: 'received',  label: 'Recebida',             description: 'Suas peças chegaram à unidade', icon: '📥' },
  { status: 'sorting',   label: 'Triagem',               description: 'Separando por tipo de tecido e cor', icon: '🔍' },
  { status: 'washing',   label: 'Lavagem',               description: 'Na máquina com fórmula especial', icon: '🫧' },
  { status: 'drying',    label: 'Secagem',               description: 'Secagem controlada para preservar o tecido', icon: '💨' },
  { status: 'ironing',   label: 'Passadoria',            description: 'Passando e dobrando suas peças', icon: '🌡️' },
  { status: 'ready',     label: 'Pronta',                description: 'Suas peças estão prontas!', icon: '✅' },
  { status: 'shipped',   label: 'Em entrega',            description: 'O entregador está a caminho', icon: '🚚' },
  { status: 'delivered', label: 'Entregue',              description: 'Entregue com sucesso!', icon: '🏠' },
]

const STATUS_INDEX: Record<OrderStatus, number> = Object.fromEntries(
  PROCESS_STEPS.map((s, i) => [s.status, i])
) as Record<OrderStatus, number>

/* ─── Busca de dados ─────────────────────────────────────────────── */

async function getClientOrders(unitId: string): Promise<Order[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('orders')
    .select(`*, items:order_items(*), events:order_events(*)`)
    .eq('unit_id', unitId)
    .order('created_at', { ascending: false })
    .limit(20)
  return (data ?? []) as Order[]
}

/* ─── Página principal ──────────────────────────────────────────── */

export default async function ClientOrdersPage() {
  const user = await getUser()
  if (!user?.unit_id) {
    return (
      <div className="p-8 text-center">
        <p className="text-white/40 text-sm">Unidade não encontrada. Entre em contato com o suporte.</p>
      </div>
    )
  }

  const orders = await getClientOrders(user.unit_id)
  const active = orders.filter((o) => o.status !== 'delivered')
  const history = orders.filter((o) => o.status === 'delivered')
  const firstName = user.full_name.split(' ')[0]

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
      {/* Saudação */}
      <div className="pt-2">
        <p className="text-[11px] uppercase tracking-widest text-[#d6b25e]/45 font-semibold mb-1">Portal do Cliente</p>
        <h1 className="text-2xl font-bold text-white tracking-tight">Olá, {firstName}</h1>
        <p className="text-sm text-white/40 mt-1">
          {active.length > 0
            ? `${active.length} comanda${active.length > 1 ? 's' : ''} em andamento`
            : 'Nenhuma comanda em andamento no momento'}
        </p>
      </div>

      {/* Comandas ativas */}
      {active.map((order) => (
        <OrderTracker key={order.id} order={order} />
      ))}

      {active.length === 0 && (
        <div
          className="rounded-2xl p-8 text-center"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <p className="text-4xl mb-3">🧺</p>
          <p className="text-white/75 font-medium">Nenhuma peça em processo</p>
          <p className="text-sm text-white/30 mt-1">
            Traga suas peças à unidade e acompanhe o processo aqui em tempo real.
          </p>
        </div>
      )}

      {/* Histórico */}
      {history.length > 0 && (
        <section>
          <p className="text-[10px] uppercase tracking-widest text-[#d6b25e]/35 font-semibold mb-3">
            Histórico
          </p>
          <div className="space-y-2">
            {history.slice(0, 5).map((order) => (
              <HistoryCard key={order.id} order={order} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

/* ─── Tracker completo da comanda ───────────────────────────────── */

function OrderTracker({ order }: { order: Order }) {
  const currentIdx = STATUS_INDEX[order.status as OrderStatus] ?? 0
  const totalPieces = order.items?.reduce((s, i) => s + i.quantity, 0) ?? 0
  const progress = Math.round(((currentIdx + 1) / PROCESS_STEPS.length) * 100)
  const promised = order.promised_at
    ? new Date(order.promised_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    : null

  const eventTimestamps: Partial<Record<string, string>> = {}
  ;(order.events ?? []).forEach((ev: OrderEvent) => {
    if (!eventTimestamps[ev.sector]) eventTimestamps[ev.sector] = ev.occurred_at
  })
  eventTimestamps['received'] = order.created_at

  const currentStep = PROCESS_STEPS[currentIdx]
  const isDelivered = order.status === 'delivered'
  const isReady = order.status === 'ready'

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, rgba(214,178,94,0.05) 0%, rgba(5,5,8,0.95) 100%)',
        border: '1px solid rgba(214,178,94,0.12)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
      }}
    >
      {/* Header da comanda */}
      <div
        className="px-5 py-4 flex items-start justify-between"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
            style={{ background: isDelivered ? 'rgba(52,211,153,0.12)' : isReady ? 'rgba(52,211,153,0.10)' : 'rgba(214,178,94,0.10)', border: `1px solid ${isDelivered || isReady ? 'rgba(52,211,153,0.25)' : 'rgba(214,178,94,0.20)'}` }}
          >
            {currentStep.icon}
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-white/30 font-semibold">
              Comanda #{order.order_number}
            </p>
            <p className="font-bold text-white leading-tight">{currentStep.label}</p>
            <p className="text-xs text-white/45 mt-0.5">{currentStep.description}</p>
          </div>
        </div>
        {totalPieces > 0 && (
          <span
            className="text-xs px-2 py-1 rounded-lg flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.50)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {totalPieces} peça{totalPieces > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Barra de progresso */}
      <div className="px-5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-white/30 uppercase tracking-wider">Progresso</span>
          <span className="text-xs font-bold" style={{ color: '#d6b25e' }}>{progress}%</span>
        </div>
        <div className="flex gap-0.5">
          {PROCESS_STEPS.map((step, i) => (
            <div
              key={step.status}
              title={step.label}
              className="flex-1 h-1.5 rounded-full transition-all"
              style={{
                background: i < currentIdx
                  ? 'rgba(52,211,153,0.7)'
                  : i === currentIdx
                    ? '#d6b25e'
                    : 'rgba(255,255,255,0.07)',
              }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[9px] text-white/20">Entrada</span>
          <span className="text-[9px] text-white/20">Entrega</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="px-5 py-4 space-y-3">
        {PROCESS_STEPS.slice(0, Math.min(currentIdx + 2, PROCESS_STEPS.length)).map((step, i) => {
          const done = i < currentIdx
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
                    ? 'rgba(52,211,153,0.20)'
                    : current
                      ? 'rgba(214,178,94,0.18)'
                      : 'rgba(255,255,255,0.04)',
                  border: done
                    ? '1px solid rgba(52,211,153,0.35)'
                    : current
                      ? '1.5px solid rgba(214,178,94,0.50)'
                      : '1px solid rgba(255,255,255,0.08)',
                  color: done ? '#34d399' : current ? '#d6b25e' : 'rgba(255,255,255,0.20)',
                }}
              >
                {done ? '✓' : current ? '●' : '○'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium" style={{ color: done || current ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.20)' }}>
                    {step.label}
                  </p>
                  {formattedTs && (
                    <span className="text-[10px] text-white/25 ml-2">{formattedTs}</span>
                  )}
                </div>
                {current && (
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(214,178,94,0.65)' }}>{step.description}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Rodapé entrega prometida */}
      {promised && !isDelivered && (
        <div
          className="px-5 py-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(214,178,94,0.04)' }}
        >
          <p className="text-xs text-white/35">
            Entrega prevista: <span className="font-semibold text-white/65">{promised}</span>
          </p>
        </div>
      )}
    </div>
  )
}

/* ─── Card de histórico ─────────────────────────────────────────── */

function HistoryCard({ order }: { order: Order }) {
  const totalPieces = order.items?.reduce((s, i) => s + i.quantity, 0) ?? 0
  const deliveredAt = (order.events ?? []).find((ev: OrderEvent) => ev.sector === 'shipping')?.occurred_at
  const formatted = deliveredAt
    ? new Date(deliveredAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : null

  return (
    <div
      className="flex items-center justify-between rounded-xl px-4 py-3"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="flex items-center gap-3">
        <span className="text-base">🏠</span>
        <div>
          <p className="text-sm font-medium text-white/70">Comanda #{order.order_number}</p>
          <p className="text-xs text-white/30">
            {totalPieces} peça{totalPieces > 1 ? 's' : ''}
            {formatted ? ` · Entregue ${formatted}` : ''}
          </p>
        </div>
      </div>
      <span
        className="text-[11px] px-2 py-0.5 rounded-full font-medium"
        style={{ background: 'rgba(52,211,153,0.12)', color: '#34d399', border: '1px solid rgba(52,211,153,0.25)' }}
      >
        Entregue
      </span>
    </div>
  )
}
