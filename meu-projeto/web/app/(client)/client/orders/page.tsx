export const dynamic = 'force-dynamic'

import { getUser } from '@/lib/auth/get-user'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Order, OrderEvent, OrderItem, OrderStatus } from '@/types/order'

/* ─── Etapas do processo ─────────────────────────────────────────── */

const PROCESS_STEPS: {
  status: OrderStatus
  label: string
  description: string
  icon: string
}[] = [
  { status: 'received',  label: 'Recebida',   description: 'Suas peças chegaram à unidade',              icon: '📥' },
  { status: 'sorting',   label: 'Triagem',    description: 'Separando por tipo de tecido e cor',         icon: '🔍' },
  { status: 'washing',   label: 'Lavagem',    description: 'Na máquina com fórmula especial',            icon: '🫧' },
  { status: 'drying',    label: 'Secagem',    description: 'Secagem controlada para preservar o tecido', icon: '💨' },
  { status: 'ironing',   label: 'Passadoria', description: 'Passando e dobrando suas peças',             icon: '🌡️' },
  { status: 'ready',     label: 'Pronta',     description: 'Suas peças estão prontas para retirada!',    icon: '✅' },
  { status: 'shipped',   label: 'Em entrega', description: 'O entregador está a caminho',                icon: '🚚' },
  { status: 'delivered', label: 'Entregue',   description: 'Entregue com sucesso!',                      icon: '🏠' },
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

/* ─── Serviços de upsell ─────────────────────────────────────────── */

const UPSELL_SERVICES = [
  {
    icon: '🛡️',
    title: 'Impermeabilização',
    tagline: 'Proteja seus tênis e bolsas por até 6 meses',
    badge: 'Popular',
    badgeColor: '#f59e0b',
    accentColor: '#f59e0b',
    bg: 'rgba(245,158,11,0.06)',
    border: 'rgba(245,158,11,0.18)',
    message: 'Olá! Gostaria de contratar o serviço de *Impermeabilização* para meus tênis/bolsas. Podem me informar valores e disponibilidade? 🛡️',
  },
  {
    icon: '🚚',
    title: 'Entrega em Casa',
    tagline: 'Receba suas peças sem sair de casa — taxa única',
    badge: 'Novo',
    badgeColor: '#34d399',
    accentColor: '#34d399',
    bg: 'rgba(52,211,153,0.06)',
    border: 'rgba(52,211,153,0.18)',
    message: 'Olá! Gostaria de solicitar a *Entrega em Casa* das minhas peças. Podem me passar a taxa e agendar a entrega? 🚚',
  },
  {
    icon: '🔄',
    title: 'Plano Mensal',
    tagline: '20% de desconto em todas as lavagens do mês',
    badge: '-20%',
    badgeColor: '#60a5fa',
    accentColor: '#60a5fa',
    bg: 'rgba(96,165,250,0.06)',
    border: 'rgba(96,165,250,0.18)',
    message: 'Olá! Tenho interesse no *Plano Mensal* com 20% de desconto. Podem me explicar como funciona a assinatura? 🔄',
  },
  {
    icon: '✨',
    title: 'Higienização Premium',
    tagline: 'Limpeza profunda com ozônio — ideal para casacos',
    badge: 'Premium',
    badgeColor: '#c084fc',
    accentColor: '#c084fc',
    bg: 'rgba(192,132,252,0.06)',
    border: 'rgba(192,132,252,0.18)',
    message: 'Olá! Gostaria de contratar a *Higienização Premium* com ozônio para meus casacos. Qual o valor e prazo? ✨',
  },
]

/* ─── Busca de dados ─────────────────────────────────────────────── */

async function getClientRecord(profileId: string): Promise<{ id: string; name: string; unitPhone: string | null } | null> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('clients')
    .select('id, name, units(phone)')
    .eq('profile_id', profileId)
    .maybeSingle()
  if (!data) return null
  const raw = data as { id: string; name: string; units?: { phone?: string | null } | null }
  return {
    id: raw.id,
    name: raw.name,
    unitPhone: raw.units?.phone ?? null,
  }
}

async function getClientOrders(clientId: string): Promise<Order[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('orders')
    .select(`*, items:order_items(*), events:order_events(*)`)
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .limit(50)
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

  const clientRecord = await getClientRecord(user.id)
  const orders = clientRecord ? await getClientOrders(clientRecord.id) : []
  const active  = orders.filter((o) => o.status !== 'delivered')
  const history = orders.filter((o) => o.status === 'delivered')
  const firstName = (clientRecord?.name ?? user.full_name).split(' ')[0]

  // Número do WhatsApp da unidade: limpa máscara, adiciona DDI 55
  const rawPhone = clientRecord?.unitPhone ?? null
  const unitWhatsapp = rawPhone
    ? '55' + rawPhone.replace(/\D/g, '')
    : null

  const totalPieces = orders.reduce(
    (acc, o) => acc + (o.items?.reduce((s, i) => s + i.quantity, 0) ?? 0), 0
  )

  // Simular pontos de fidelidade: 1 ponto por peça lavada em comandas entregues
  const loyaltyPoints = history.reduce(
    (acc, o) => acc + (o.items?.reduce((s, i) => s + i.quantity, 0) ?? 0) * 10, 0
  )
  const nextReward = 100
  const loyaltyProgress = Math.min((loyaltyPoints % nextReward) / nextReward * 100, 100)
  const rewardsEarned = Math.floor(loyaltyPoints / nextReward)

  // Última comanda entregue para NPS
  const lastDelivered = history[0]

  return (
    <div
      className="min-h-[calc(100vh-56px)]"
      style={{ background: 'linear-gradient(180deg, #071020 0%, #0b1628 50%, #070e1a 100%)' }}
    >
      {/* Top accent */}
      <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.50), transparent)' }} />

      <div className="max-w-xl mx-auto px-4 py-6 space-y-6 pb-16">

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
                ? 'Todas as peças entregues — obrigado pela confiança!'
                : 'Bem-vindo! Suas comandas aparecerão aqui.'}
          </p>
        </div>

        {/* ─── Cards de stats ───────────────────────────────────── */}
        {orders.length > 0 && (
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { label: 'Em andamento', value: active.length, color: '#3b82f6', bg: 'rgba(59,130,246,0.10)', border: 'rgba(59,130,246,0.18)' },
              { label: 'Entregues', value: history.length, color: '#34d399', bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.16)' },
              { label: 'Total peças', value: totalPieces, color: '#93c5fd', bg: 'rgba(147,197,253,0.07)', border: 'rgba(147,197,253,0.14)' },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl p-3 text-center"
                style={{ background: s.bg, border: `1px solid ${s.border}` }}
              >
                <p className="text-lg font-bold leading-none" style={{ color: s.color }}>{s.value}</p>
                <p className="text-[10px] mt-1 leading-tight" style={{ color: 'rgba(255,255,255,0.32)' }}>{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* ─── Programa de Fidelidade ───────────────────────────── */}
        {loyaltyPoints > 0 && (
          <div
            className="rounded-2xl p-4"
            style={{
              background: 'linear-gradient(135deg, rgba(96,165,250,0.08) 0%, rgba(192,132,252,0.06) 100%)',
              border: '1px solid rgba(96,165,250,0.18)',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">⭐</span>
                <div>
                  <p className="text-sm font-semibold text-white">Programa Fidelidade</p>
                  <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    {rewardsEarned > 0 ? `${rewardsEarned} recompensa${rewardsEarned > 1 ? 's' : ''} resgatável${rewardsEarned > 1 ? 'is' : ''}` : 'Acumule pontos a cada lavagem'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold" style={{ color: '#93c5fd' }}>{loyaltyPoints}</p>
                <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.30)' }}>pontos</p>
              </div>
            </div>
            {/* Barra de progresso */}
            <div>
              <div className="flex justify-between text-[10px] mb-1.5" style={{ color: 'rgba(255,255,255,0.30)' }}>
                <span>{loyaltyPoints % nextReward} pts</span>
                <span>{nextReward} pts = 1 lavagem grátis</span>
              </div>
              <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
                <div
                  className="h-1.5 rounded-full transition-all"
                  style={{
                    width: `${loyaltyProgress}%`,
                    background: 'linear-gradient(90deg, #60a5fa, #c084fc)',
                  }}
                />
              </div>
              {rewardsEarned > 0 && (
                <div className="mt-2.5 flex items-center gap-2">
                  <span
                    className="text-xs px-3 py-1 rounded-lg font-semibold"
                    style={{ background: 'rgba(96,165,250,0.15)', color: '#93c5fd', border: '1px solid rgba(96,165,250,0.25)' }}
                  >
                    🎁 {rewardsEarned}× lavagem grátis disponível
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── NPS pós-entrega ──────────────────────────────────── */}
        {lastDelivered && (
          <NpsWidget orderId={lastDelivered.id} orderNumber={lastDelivered.order_number} />
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
        {active.length === 0 && orders.length === 0 && (
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
              Traga suas peças à unidade e acompanhe cada etapa aqui em tempo real.
            </p>
          </div>
        )}

        {/* ─── Serviços & Upsell ────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <p
              className="text-[10px] uppercase tracking-widest font-semibold"
              style={{ color: 'rgba(255,255,255,0.25)' }}
            >
              Serviços exclusivos
            </p>
            {unitWhatsapp ? (
              <span
                className="text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1"
                style={{ background: 'rgba(37,211,102,0.12)', color: '#25d366', border: '1px solid rgba(37,211,102,0.22)' }}
              >
                <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp
              </span>
            ) : (
              <span
                className="text-[10px] px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.20)' }}
              >
                Peça na unidade
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {UPSELL_SERVICES.map((s) => {
              const waUrl = unitWhatsapp
                ? `https://wa.me/${unitWhatsapp}?text=${encodeURIComponent(s.message)}`
                : null
              const Tag = waUrl ? 'a' : 'div'
              const extraProps = waUrl
                ? { href: waUrl, target: '_blank', rel: 'noopener noreferrer' }
                : {}
              return (
                <Tag
                  key={s.title}
                  {...(extraProps as object)}
                  className="rounded-xl p-3.5 cursor-pointer active:scale-95 transition-transform block"
                  style={{ background: s.bg, border: `1px solid ${s.border}`, textDecoration: 'none' }}
                >
                  <div className="flex items-start justify-between gap-1 mb-2">
                    <span className="text-xl">{s.icon}</span>
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide"
                      style={{ background: `${s.badgeColor}22`, color: s.badgeColor, border: `1px solid ${s.badgeColor}33` }}
                    >
                      {s.badge}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-white leading-tight">{s.title}</p>
                  <p className="text-[11px] mt-1 leading-tight" style={{ color: 'rgba(255,255,255,0.38)' }}>
                    {s.tagline}
                  </p>
                  {waUrl && (
                    <div className="flex items-center gap-1 mt-2.5">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="#25d366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      <span className="text-[10px]" style={{ color: '#25d366' }}>Falar no WhatsApp</span>
                    </div>
                  )}
                </Tag>
              )
            })}
          </div>
        </section>

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
            {history.length > 10 && (
              <p className="text-center text-xs mt-3" style={{ color: 'rgba(255,255,255,0.22)' }}>
                +{history.length - 10} comandas anteriores
              </p>
            )}
          </section>
        )}

        {/* ─── Banner de indicação ──────────────────────────────── */}
        <div
          className="rounded-2xl p-5 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(96,165,250,0.06) 100%)',
            border: '1px solid rgba(59,130,246,0.20)',
          }}
        >
          {/* Círculo decorativo */}
          <div
            className="absolute -right-8 -top-8 w-32 h-32 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)' }}
          />
          <div className="relative">
            <p className="text-base font-bold text-white mb-1">Indique e Ganhe 🎁</p>
            <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.40)' }}>
              Cada amigo indicado te dá 50 pontos + 10% de desconto na próxima lavagem.
            </p>
            <button
              className="text-xs font-semibold px-4 py-2 rounded-lg"
              style={{ background: 'rgba(59,130,246,0.20)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.30)' }}
            >
              Compartilhar meu código
            </button>
          </div>
        </div>

        {/* ─── Footer ───────────────────────────────────────────── */}
        <div
          className="rounded-xl px-4 py-3 flex items-center gap-3"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <span className="text-base flex-shrink-0">💬</span>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.28)' }}>
            Dúvidas? Entre em contato diretamente com a unidade.
          </p>
        </div>
      </div>
    </div>
  )
}

/* ─── Widget de NPS ──────────────────────────────────────────────── */

function NpsWidget({ orderId, orderNumber }: { orderId: string; orderNumber: string }) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: 'linear-gradient(135deg, rgba(52,211,153,0.06) 0%, rgba(16,185,129,0.04) 100%)',
        border: '1px solid rgba(52,211,153,0.16)',
      }}
    >
      <div className="flex items-start gap-3 mb-3">
        <span className="text-xl">🎉</span>
        <div>
          <p className="text-sm font-semibold text-white">Comanda #{orderNumber} entregue!</p>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.38)' }}>
            Como foi a sua experiência? Sua opinião melhora nosso serviço.
          </p>
        </div>
      </div>
      <div className="flex gap-1.5">
        {['😞','😐','🙂','😊','🤩'].map((emoji, i) => (
          <button
            key={i}
            className="flex-1 py-2 rounded-xl text-base active:scale-95 transition-transform"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {emoji}
          </button>
        ))}
      </div>
      <p className="text-[10px] text-center mt-2" style={{ color: 'rgba(255,255,255,0.22)' }}>
        Péssimo → Excelente
      </p>
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

  const accentColor  = isDelivered || isReady ? '#34d399' : isShipped ? '#60a5fa' : '#3b82f6'
  const accentBg     = isDelivered || isReady ? 'rgba(52,211,153,0.10)'  : 'rgba(59,130,246,0.10)'
  const accentBorder = isDelivered || isReady ? 'rgba(52,211,153,0.22)'  : 'rgba(59,130,246,0.22)'

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, rgba(59,130,246,0.06) 0%, rgba(7,16,32,0.97) 100%)',
        border: `1px solid ${accentBorder}`,
        boxShadow: `0 4px 24px rgba(0,0,0,0.30), 0 0 0 0.5px ${accentBorder}`,
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
                  background: done ? 'rgba(52,211,153,0.18)' : current ? accentBg : 'rgba(255,255,255,0.04)',
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

      {/* ── Rodapé: previsão ── */}
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
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span
          className="text-[11px] px-2 py-0.5 rounded-full font-medium"
          style={{ background: 'rgba(52,211,153,0.10)', color: '#34d399', border: '1px solid rgba(52,211,153,0.22)' }}
        >
          ✓ Entregue
        </span>
        {totalPieces > 0 && (
          <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.22)' }}>
            +{totalPieces * 10} pts
          </span>
        )}
      </div>
    </div>
  )
}
