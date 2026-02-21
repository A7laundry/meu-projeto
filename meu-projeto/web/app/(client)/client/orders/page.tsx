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
  { status: 'received',  label: 'Recebida',           description: 'Suas peças chegaram à unidade', icon: '📥' },
  { status: 'sorting',   label: 'Triagem',             description: 'Separando por tipo de tecido e cor', icon: '🔍' },
  { status: 'washing',   label: 'Lavagem',             description: 'Na máquina com fórmula especial para seu tipo de peça', icon: '🫧' },
  { status: 'drying',    label: 'Secagem',             description: 'Secagem controlada para não danificar o tecido', icon: '💨' },
  { status: 'ironing',   label: 'Passadoria',          description: 'Passando e dobrando suas peças', icon: '🌡️' },
  { status: 'ready',     label: 'Pronta para retirada',description: 'Suas peças estão prontas! Aguardando coleta ou entrega', icon: '✅' },
  { status: 'shipped',   label: 'Saiu para entrega',   description: 'O entregador está a caminho com suas peças', icon: '🚚' },
  { status: 'delivered', label: 'Entregue',            description: 'Peças entregues com sucesso. Obrigado pela preferência!', icon: '🏠' },
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
      <div className="p-8 text-center text-gray-500">
        Unidade não encontrada. Entre em contato com o suporte.
      </div>
    )
  }

  const orders = await getClientOrders(user.unit_id)
  const active = orders.filter((o) => o.status !== 'delivered')
  const history = orders.filter((o) => o.status === 'delivered')

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-8">
      {/* Saudação */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Olá, {user.full_name.split(' ')[0]} 👋</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {active.length > 0
            ? `Você tem ${active.length} comanda${active.length > 1 ? 's' : ''} em andamento`
            : 'Nenhuma comanda em andamento no momento'}
        </p>
      </div>

      {/* Comandas ativas com timeline */}
      {active.map((order) => (
        <OrderTracker key={order.id} order={order} />
      ))}

      {active.length === 0 && (
        <div className="rounded-2xl bg-gray-50 border border-gray-200 p-8 text-center">
          <p className="text-4xl mb-3">🧺</p>
          <p className="text-gray-700 font-medium">Nenhuma peça em processo</p>
          <p className="text-sm text-gray-400 mt-1">
            Traga suas peças à unidade e acompanhe o processo aqui em tempo real.
          </p>
        </div>
      )}

      {/* Histórico */}
      {history.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Histórico
          </h2>
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
  const promised = order.promised_at
    ? new Date(order.promised_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : null

  // Mapeia eventos para timestamps por status
  const eventTimestamps: Partial<Record<string, string>> = {}
  ;(order.events ?? []).forEach((ev: OrderEvent) => {
    if (!eventTimestamps[ev.sector]) {
      eventTimestamps[ev.sector] = ev.occurred_at
    }
  })
  // Recebida = data de criação
  eventTimestamps['received'] = order.created_at

  const currentStep = PROCESS_STEPS[currentIdx]
  const isDelivered = order.status === 'delivered'
  const isReady = order.status === 'ready'

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Header da comanda */}
      <div className={[
        'px-5 py-4 flex items-start justify-between',
        isDelivered ? 'bg-emerald-50' : isReady ? 'bg-green-50' : 'bg-white',
      ].join(' ')}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{currentStep.icon}</span>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                Comanda # {order.order_number}
              </p>
              <p className="font-bold text-gray-900">{currentStep.label}</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-1">{currentStep.description}</p>
        </div>
        {totalPieces > 0 && (
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full ml-2 flex-shrink-0">
            {totalPieces} peça{totalPieces > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Barra visual de progresso */}
      <div className="px-5 py-3 bg-gray-50 border-y border-gray-100">
        <div className="flex items-center gap-1">
          {PROCESS_STEPS.map((step, i) => (
            <div key={step.status} className="flex items-center flex-1 last:flex-none">
              <div
                title={step.label}
                className={[
                  'h-2 flex-1 rounded-full transition-all',
                  i < currentIdx
                    ? 'bg-emerald-500'
                    : i === currentIdx
                      ? 'bg-blue-500'
                      : 'bg-gray-200',
                ].join(' ')}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-gray-400">Entrada</span>
          <span className="text-[10px] text-gray-400">Entrega</span>
        </div>
      </div>

      {/* Timeline de etapas */}
      <div className="px-5 py-4 space-y-3">
        {PROCESS_STEPS.slice(0, currentIdx + 2 > PROCESS_STEPS.length ? PROCESS_STEPS.length : currentIdx + 2).map((step, i) => {
          const done = i < currentIdx
          const current = i === currentIdx
          const ts = eventTimestamps[i === 0 ? 'received' : step.status]
          const formattedTs = ts
            ? new Date(ts).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
            : null

          return (
            <div key={step.status} className="flex items-start gap-3">
              <div className={[
                'w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5',
                done ? 'bg-emerald-500 text-white' : current ? 'bg-blue-500 text-white ring-4 ring-blue-100' : 'bg-gray-100 text-gray-300',
              ].join(' ')}>
                {done ? '✓' : current ? '●' : '○'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={['text-sm font-medium', done || current ? 'text-gray-900' : 'text-gray-300'].join(' ')}>
                    {step.label}
                  </p>
                  {formattedTs && (
                    <span className="text-[10px] text-gray-400 ml-2">{formattedTs}</span>
                  )}
                </div>
                {current && (
                  <p className="text-xs text-blue-600 mt-0.5">{step.description}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Rodapé com entrega prometida */}
      {promised && !isDelivered && (
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
          <p className="text-xs text-gray-500">
            📅 Entrega prometida: <span className="font-semibold text-gray-700">{promised}</span>
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
    <div className="flex items-center justify-between rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="text-lg">🏠</span>
        <div>
          <p className="text-sm font-medium text-gray-700">Comanda # {order.order_number}</p>
          <p className="text-xs text-gray-400">
            {totalPieces} peça{totalPieces > 1 ? 's' : ''}
            {formatted ? ` · Entregue em ${formatted}` : ''}
          </p>
        </div>
      </div>
      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
        Entregue
      </span>
    </div>
  )
}
