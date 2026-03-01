'use client'

import { useState } from 'react'
import { useClientOrdersRealtime } from '@/hooks/use-client-orders-realtime'
import { NpsWidget } from '@/components/domain/client/nps-widget'
import { ServiceRequestForm } from '@/components/domain/client/service-request-form'
import type { Order, OrderEvent, OrderItem, OrderStatus } from '@/types/order'

/* ---- Etapas do processo ------------------------------------------------ */

const PROCESS_STEPS: { status: OrderStatus; label: string; description: string; icon: string }[] = [
  { status: 'received',  label: 'Recebida',   description: 'Suas pe\u00e7as chegaram \u00e0 unidade',              icon: '\ud83d\udce5' },
  { status: 'sorting',   label: 'Triagem',    description: 'Separando por tipo de tecido e cor',         icon: '\ud83d\udd0d' },
  { status: 'washing',   label: 'Lavagem',    description: 'Na m\u00e1quina com f\u00f3rmula especial',            icon: '\ud83e\udee7' },
  { status: 'drying',    label: 'Secagem',    description: 'Secagem controlada para preservar o tecido', icon: '\ud83d\udca8' },
  { status: 'ironing',   label: 'Passadoria', description: 'Passando e dobrando suas pe\u00e7as',             icon: '\ud83c\udf21\ufe0f' },
  { status: 'ready',     label: 'Pronta',     description: 'Suas pe\u00e7as est\u00e3o prontas para retirada!',    icon: '\u2705' },
  { status: 'shipped',   label: 'Em entrega', description: 'O entregador est\u00e1 a caminho',                icon: '\ud83d\ude9a' },
  { status: 'delivered', label: 'Entregue',   description: 'Entregue com sucesso!',                      icon: '\ud83c\udfe0' },
]

const STATUS_INDEX: Record<OrderStatus, number> = Object.fromEntries(
  PROCESS_STEPS.map((s, i) => [s.status, i])
) as Record<OrderStatus, number>

const PIECE_TYPE_LABELS: Record<string, string> = {
  clothing: 'Roupa', costume: 'Fantasia', sneaker: 'T\u00eanis',
  rug: 'Tapete', curtain: 'Cortina', industrial: 'Industrial', other: 'Outros',
}

/* ---- Servicos de upsell ------------------------------------------------ */

const UPSELL_SERVICES = [
  {
    icon: '🛡️', title: 'Impermeabiliza\u00e7\u00e3o',
    tagline: 'Proteja t\u00eanis e bolsas por at\u00e9 6 meses',
    badge: 'Popular', badgeColor: '#f59e0b',
    accent: '#f59e0b',
    bg: 'linear-gradient(145deg, rgba(245,158,11,0.08) 0%, rgba(7,8,15,0.95) 100%)',
    border: 'rgba(245,158,11,0.18)',
    message: 'Ol\u00e1! Gostaria de contratar o servi\u00e7o de *Impermeabiliza\u00e7\u00e3o* para meus t\u00eanis/bolsas. Podem me informar valores e disponibilidade? 🛡️',
  },
  {
    icon: '🚚', title: 'Entrega em Casa',
    tagline: 'Receba suas pe\u00e7as sem sair de casa',
    badge: 'Novo', badgeColor: '#34d399',
    accent: '#34d399',
    bg: 'linear-gradient(145deg, rgba(52,211,153,0.08) 0%, rgba(7,8,15,0.95) 100%)',
    border: 'rgba(52,211,153,0.18)',
    message: 'Ol\u00e1! Gostaria de solicitar a *Entrega em Casa* das minhas pe\u00e7as. Podem me passar a taxa e agendar? 🚚',
  },
  {
    icon: '🔄', title: 'Plano Mensal',
    tagline: '20% de desconto em todas as lavagens',
    badge: '-20%', badgeColor: '#60a5fa',
    accent: '#60a5fa',
    bg: 'linear-gradient(145deg, rgba(96,165,250,0.08) 0%, rgba(7,8,15,0.95) 100%)',
    border: 'rgba(96,165,250,0.18)',
    message: 'Ol\u00e1! Tenho interesse no *Plano Mensal* com 20% de desconto. Como funciona? 🔄',
  },
  {
    icon: '✨', title: 'Premium',
    tagline: 'Higieniza\u00e7\u00e3o com oz\u00f4nio \u2014 ideal para casacos',
    badge: 'Premium', badgeColor: '#c084fc',
    accent: '#c084fc',
    bg: 'linear-gradient(145deg, rgba(192,132,252,0.08) 0%, rgba(7,8,15,0.95) 100%)',
    border: 'rgba(192,132,252,0.18)',
    message: 'Ol\u00e1! Gostaria de contratar a *Higieniza\u00e7\u00e3o Premium* com oz\u00f4nio. Qual o valor e prazo? ✨',
  },
]

const WA_ICON = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="#25d366" style={{ flexShrink: 0 }}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

/* ---- Props ------------------------------------------------------------- */

interface OrdersClientProps {
  clientId: string | null
  unitId: string | null
  firstName: string
  unitWa: string | null
  initialOrders: Order[]
}

/* ---- Componente principal ---------------------------------------------- */

export function OrdersClient({ clientId, unitId, firstName, unitWa, initialOrders }: OrdersClientProps) {
  const { orders, updatedOrderId } = useClientOrdersRealtime(clientId, initialOrders)
  const [showServiceRequest, setShowServiceRequest] = useState(false)

  const active  = orders.filter((o) => o.status !== 'delivered')
  const history = orders.filter((o) => o.status === 'delivered')

  const totalPieces   = orders.reduce((acc, o) => acc + (o.items?.reduce((s, i) => s + i.quantity, 0) ?? 0), 0)
  const loyaltyPoints = history.reduce((acc, o) => acc + (o.items?.reduce((s, i) => s + i.quantity, 0) ?? 0) * 10, 0)
  const nextReward    = 100
  const loyaltyPct    = Math.min((loyaltyPoints % nextReward) / nextReward * 100, 100)
  const rewardsEarned = Math.floor(loyaltyPoints / nextReward)
  const lastDelivered = history[0]

  return (
    <div style={{ background: 'linear-gradient(180deg, #07080f 0%, #090c16 100%)', minHeight: '100%' }}>

      {/* ---- Hero -------------------------------------------------------- */}
      <div className="relative px-5 pt-7 pb-6 overflow-hidden">
        <div
          className="absolute -top-10 left-1/2 pointer-events-none"
          style={{
            transform: 'translateX(-50%)',
            width: 280, height: 180,
            background: 'radial-gradient(ellipse, rgba(59,130,246,0.14) 0%, transparent 70%)',
          }}
        />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-[10px] uppercase tracking-[0.15em] font-semibold" style={{ color: 'rgba(96,165,250,0.45)' }}>
              Meu portal
            </p>
            <span
              className="flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full font-medium"
              style={{ background: 'rgba(52,211,153,0.10)', color: '#34d399', border: '1px solid rgba(52,211,153,0.20)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#34d399' }} />
              Ao vivo
            </span>
          </div>
          <h1 className="text-[28px] font-bold text-white tracking-tight leading-tight">
            Ol\u00e1, {firstName} 👋
          </h1>
          <p className="text-sm mt-1.5" style={{ color: 'rgba(255,255,255,0.36)', lineHeight: 1.5 }}>
            {active.length > 0
              ? `${active.length} comanda${active.length > 1 ? 's' : ''} em andamento`
              : history.length > 0
                ? 'Todas as pe\u00e7as entregues \u2014 obrigado!'
                : 'Bem-vindo! Suas comandas aparecem aqui.'}
          </p>
        </div>
      </div>

      {/* ---- Botão nova solicitação ---------------------------------------- */}
      {clientId && unitId && (
        <div className="px-5 mb-4">
          <button
            onClick={() => setShowServiceRequest(!showServiceRequest)}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: showServiceRequest ? 'rgba(255,255,255,0.06)' : 'rgba(59,130,246,0.10)',
              color: showServiceRequest ? 'rgba(255,255,255,0.5)' : '#60a5fa',
              border: `1px solid ${showServiceRequest ? 'rgba(255,255,255,0.10)' : 'rgba(59,130,246,0.22)'}`,
            }}
          >
            {showServiceRequest ? 'Cancelar' : '+ Solicitar novo serviço'}
          </button>
        </div>
      )}

      {/* ---- Formulário de solicitação ------------------------------------- */}
      {showServiceRequest && clientId && unitId && (
        <div
          className="mx-5 mb-5 rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <ServiceRequestForm
            clientId={clientId}
            unitId={unitId}
            onClose={() => setShowServiceRequest(false)}
          />
        </div>
      )}

      {/* ---- Stats ------------------------------------------------------- */}
      {orders.length > 0 && (
        <div className="px-5 mb-5">
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { label: 'Em andamento', value: active.length,  accent: '#3b82f6', glow: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.18)' },
              { label: 'Entregues',    value: history.length,  accent: '#34d399', glow: 'rgba(52,211,153,0.10)',  border: 'rgba(52,211,153,0.18)' },
              { label: 'Pe\u00e7as',   value: totalPieces,     accent: '#c084fc', glow: 'rgba(192,132,252,0.10)', border: 'rgba(192,132,252,0.18)' },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl px-3 py-3.5 flex flex-col items-center gap-0.5"
                style={{
                  background: s.glow,
                  border: `1px solid ${s.border}`,
                }}
              >
                <span
                  className="text-2xl font-bold num-stat leading-none"
                  style={{ color: s.accent }}
                >
                  {s.value}
                </span>
                <span className="text-[10px] font-medium text-center leading-tight" style={{ color: 'rgba(255,255,255,0.38)' }}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---- Fidelidade -------------------------------------------------- */}
      {loyaltyPoints > 0 && (
        <div className="px-5 mb-4">
          <div
            className="rounded-2xl px-5 py-4"
            style={{
              background: 'linear-gradient(135deg, rgba(96,165,250,0.08) 0%, rgba(192,132,252,0.05) 100%)',
              border: '1px solid rgba(96,165,250,0.16)',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">⭐</span>
                <div>
                  <p className="text-sm font-semibold text-white leading-tight">Programa Fidelidade</p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.32)' }}>
                    {rewardsEarned > 0
                      ? `${rewardsEarned} recompensa${rewardsEarned > 1 ? 's' : ''} dispon\u00edvel`
                      : 'Acumule pontos a cada lavagem'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[22px] font-bold num-stat leading-none" style={{ color: '#93c5fd' }}>{loyaltyPoints}</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>pontos</p>
              </div>
            </div>

            <div className="flex justify-between text-[10px] mb-1.5" style={{ color: 'rgba(255,255,255,0.28)' }}>
              <span>{loyaltyPoints % nextReward} / {nextReward} pts</span>
              <span>pr\u00f3xima lavagem gr\u00e1tis</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${loyaltyPct}%`,
                  background: 'linear-gradient(90deg, #3b82f6, #c084fc)',
                  boxShadow: '0 0 10px rgba(96,165,250,0.4)',
                  transition: 'width 1s cubic-bezier(0.16,1,0.3,1)',
                }}
              />
            </div>

            {rewardsEarned > 0 && (
              <div className="mt-3 flex">
                <span
                  className="text-xs px-3 py-1.5 rounded-xl font-semibold"
                  style={{
                    background: 'rgba(96,165,250,0.14)',
                    color: '#93c5fd',
                    border: '1px solid rgba(96,165,250,0.24)',
                  }}
                >
                  🎁 {rewardsEarned}\u00d7 lavagem gr\u00e1tis dispon\u00edvel
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---- NPS --------------------------------------------------------- */}
      {lastDelivered && (
        <div className="px-5 mb-4">
          <div
            className="rounded-2xl px-5 py-4"
            style={{
              background: 'linear-gradient(135deg, rgba(52,211,153,0.06) 0%, rgba(16,185,129,0.03) 100%)',
              border: '1px solid rgba(52,211,153,0.16)',
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(52,211,153,0.10)', border: '1px solid rgba(52,211,153,0.20)', fontSize: 20 }}
              >
                🎉
              </div>
              <div>
                <p className="text-sm font-semibold text-white leading-tight">
                  Comanda #{lastDelivered.order_number} entregue!
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.36)' }}>
                  Como foi sua experi\u00eancia desta vez?
                </p>
              </div>
            </div>

            <NpsWidget orderNumber={String(lastDelivered.order_number)} />
          </div>
        </div>
      )}

      {/* ---- Comandas ativas --------------------------------------------- */}
      {active.length > 0 && (
        <section className="mb-6">
          <div className="px-5 mb-3">
            <div className="flex items-center gap-2">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: '#3b82f6', boxShadow: '0 0 6px rgba(59,130,246,0.8)' }}
              />
              <p className="text-[10px] uppercase tracking-[0.14em] font-semibold" style={{ color: 'rgba(59,130,246,0.55)' }}>
                Em andamento
              </p>
            </div>
          </div>
          <div className="px-5 space-y-4">
            {active.map((order) => (
              <OrderTracker
                key={order.id}
                order={order}
                isHighlighted={updatedOrderId === order.id}
              />
            ))}
          </div>
        </section>
      )}

      {/* ---- Empty state ------------------------------------------------- */}
      {active.length === 0 && orders.length === 0 && (
        <div className="px-5 mb-6">
          <div
            className="rounded-2xl p-10 text-center"
            style={{ background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.09)' }}
          >
            <div
              className="w-20 h-20 rounded-2xl mx-auto mb-5 flex items-center justify-center"
              style={{
                fontSize: 36,
                background: 'rgba(59,130,246,0.09)',
                border: '1px solid rgba(59,130,246,0.16)',
              }}
            >
              🧺
            </div>
            <p className="font-semibold text-white/80 text-base leading-tight">Nenhuma pe\u00e7a em processo</p>
            <p className="text-sm mt-2.5" style={{ color: 'rgba(255,255,255,0.28)', lineHeight: 1.6 }}>
              Traga suas pe\u00e7as \u00e0 unidade e<br />acompanhe cada etapa aqui em tempo real.
            </p>
          </div>
        </div>
      )}

      {/* ---- Servicos exclusivos ----------------------------------------- */}
      <section id="services" className="mb-6">
        <div className="px-5 flex items-center justify-between mb-3">
          <p className="text-[10px] uppercase tracking-[0.14em] font-semibold" style={{ color: 'rgba(255,255,255,0.22)' }}>
            Servi\u00e7os exclusivos
          </p>
          {unitWa && (
            <span
              className="flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full font-medium"
              style={{ background: 'rgba(37,211,102,0.10)', color: '#25d366', border: '1px solid rgba(37,211,102,0.20)' }}
            >
              {WA_ICON}
              WhatsApp
            </span>
          )}
        </div>

        <div
          className="flex gap-3 overflow-x-auto px-5 pb-2"
          style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          {UPSELL_SERVICES.map((s) => {
            const waUrl = unitWa ? `https://wa.me/${unitWa}?text=${encodeURIComponent(s.message)}` : null
            const Tag = waUrl ? 'a' : 'div'
            const extra = waUrl ? { href: waUrl, target: '_blank', rel: 'noopener noreferrer' } : {}
            return (
              <Tag
                key={s.title}
                {...(extra as object)}
                className="flex-shrink-0 rounded-2xl p-4 active:scale-95"
                style={{
                  width: 162,
                  background: s.bg,
                  border: `1px solid ${s.border}`,
                  textDecoration: 'none',
                  display: 'block',
                  transition: 'transform 0.18s ease',
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <span style={{ fontSize: 30, lineHeight: 1 }}>{s.icon}</span>
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide"
                    style={{
                      background: `${s.badgeColor}20`,
                      color: s.badgeColor,
                      border: `1px solid ${s.badgeColor}30`,
                    }}
                  >
                    {s.badge}
                  </span>
                </div>

                <p className="font-semibold text-white leading-tight mb-1" style={{ fontSize: 13 }}>
                  {s.title}
                </p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.36)', lineHeight: 1.45 }}>
                  {s.tagline}
                </p>

                {waUrl && (
                  <div
                    className="flex items-center gap-1.5 mt-3 pt-3"
                    style={{ borderTop: `1px solid ${s.border}` }}
                  >
                    {WA_ICON}
                    <span style={{ fontSize: 11, color: '#25d366', fontWeight: 600 }}>Falar agora</span>
                  </div>
                )}
              </Tag>
            )
          })}
        </div>
      </section>

      {/* ---- Historico --------------------------------------------------- */}
      {history.length > 0 && (
        <section id="history" className="mb-6">
          <div className="px-5 mb-3">
            <p className="text-[10px] uppercase tracking-[0.14em] font-semibold" style={{ color: 'rgba(255,255,255,0.20)' }}>
              Hist\u00f3rico de entregas
            </p>
          </div>
          <div className="px-5 space-y-2">
            {history.slice(0, 10).map((order) => (
              <HistoryCard key={order.id} order={order} />
            ))}
          </div>
          {history.length > 10 && (
            <p className="text-center text-xs mt-4 px-5" style={{ color: 'rgba(255,255,255,0.18)' }}>
              +{history.length - 10} comandas anteriores
            </p>
          )}
        </section>
      )}

      {/* ---- Banner indicacao -------------------------------------------- */}
      <div className="px-5 mb-8">
        <div
          className="rounded-2xl p-5 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(59,130,246,0.11) 0%, rgba(96,165,250,0.05) 100%)',
            border: '1px solid rgba(59,130,246,0.20)',
          }}
        >
          <div
            className="absolute -right-6 -top-6 w-32 h-32 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.16) 0%, transparent 70%)' }}
          />
          <div className="absolute top-4 right-4 pointer-events-none" style={{ fontSize: 32, opacity: 0.18 }}>🎁</div>

          <div className="relative">
            <p className="text-base font-bold text-white mb-1 leading-tight">Indique e Ganhe</p>
            <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.36)', lineHeight: 1.55 }}>
              Cada amigo indicado te d\u00e1{' '}
              <strong style={{ color: 'rgba(255,255,255,0.68)' }}>50 pontos</strong>
              {' '}+{' '}
              <strong style={{ color: 'rgba(255,255,255,0.68)' }}>10% de desconto</strong>
              {' '}na pr\u00f3xima lavagem.
            </p>
            <button
              className="w-full rounded-xl font-semibold"
              style={{
                height: 44,
                background: 'rgba(59,130,246,0.16)',
                color: '#93c5fd',
                border: '1px solid rgba(59,130,246,0.28)',
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              Compartilhar meu c\u00f3digo
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}

/* ---- OrderTracker ------------------------------------------------------ */

function OrderTracker({ order, isHighlighted }: { order: Order; isHighlighted?: boolean }) {
  const currentIdx   = STATUS_INDEX[order.status as OrderStatus] ?? 0
  const currentStep  = PROCESS_STEPS[currentIdx]
  const totalPieces  = order.items?.reduce((s, i) => s + i.quantity, 0) ?? 0
  const progress     = Math.round(((currentIdx + 1) / PROCESS_STEPS.length) * 100)
  const isDelivered  = order.status === 'delivered'
  const isReady      = order.status === 'ready'
  const isShipped    = order.status === 'shipped'
  const isDone       = isDelivered || isReady

  const promised = order.promised_at
    ? new Date(order.promised_at).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })
    : null

  const evTs: Partial<Record<string, string>> = {}
  ;(order.events ?? []).forEach((ev: OrderEvent) => { if (!evTs[ev.sector]) evTs[ev.sector] = ev.occurred_at })
  evTs['received'] = order.created_at

  const accent       = isDone ? '#34d399' : '#3b82f6'
  const accentBg     = isDone ? 'rgba(52,211,153,0.10)' : 'rgba(59,130,246,0.10)'
  const accentBorder = isDone ? 'rgba(52,211,153,0.20)' : 'rgba(59,130,246,0.20)'
  const pulseClass   = isDone ? 'animate-pulse-status-green' : 'animate-pulse-status'

  return (
    <div
      className={`rounded-2xl overflow-hidden transition-all duration-700 ${isHighlighted ? 'realtime-flash' : ''}`}
      style={{
        background: 'linear-gradient(160deg, rgba(59,130,246,0.06) 0%, rgba(7,8,15,0.98) 100%)',
        border: `1px solid ${accentBorder}`,
        boxShadow: isHighlighted
          ? `0 0 0 2px rgba(52,211,153,0.40), 0 4px 24px rgba(0,0,0,0.30)`
          : `0 4px 24px rgba(0,0,0,0.30)`,
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-4 flex items-start justify-between gap-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className={`rounded-xl flex items-center justify-center flex-shrink-0 ${pulseClass}`}
            style={{
              width: 50, height: 50, fontSize: 22,
              background: accentBg,
              border: `1px solid ${accentBorder}`,
            }}
          >
            {currentStep.icon}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.12em] font-semibold" style={{ color: 'rgba(255,255,255,0.26)' }}>
              Comanda #{order.order_number}
            </p>
            <p className="font-bold text-white text-[18px] leading-tight mt-0.5">{currentStep.label}</p>
            <p className="text-xs mt-0.5 truncate" style={{ color: `${accent}99` }}>
              {currentStep.description}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          {totalPieces > 0 && (
            <span
              className="text-xs px-2.5 py-1 rounded-lg font-medium"
              style={{
                background: 'rgba(255,255,255,0.06)',
                color: 'rgba(255,255,255,0.46)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {totalPieces} pe\u00e7a{totalPieces > 1 ? 's' : ''}
            </span>
          )}
          {(isReady || isShipped) && (
            <span
              className="text-xs px-2.5 py-1 rounded-full font-semibold"
              style={{ background: accentBg, color: accent, border: `1px solid ${accentBorder}` }}
            >
              {isReady ? '✓ Pronta' : '🚚 A caminho'}
            </span>
          )}
        </div>
      </div>

      {/* Barra de progresso segmentada */}
      <div className="px-5 py-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.26)' }}>Progresso</span>
          <span className="text-xs font-bold num-stat" style={{ color: accent }}>{progress}%</span>
        </div>
        <div className="flex gap-0.5">
          {PROCESS_STEPS.map((step, i) => (
            <div
              key={step.status}
              title={step.label}
              className="flex-1 rounded-full"
              style={{
                height: 5,
                background:
                  i < currentIdx  ? 'rgba(52,211,153,0.55)' :
                  i === currentIdx ? accent :
                  'rgba(255,255,255,0.06)',
                boxShadow: i === currentIdx ? `0 0 6px ${accent}80` : 'none',
              }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.16)' }}>Entrada</span>
          <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.16)' }}>Entrega</span>
        </div>
      </div>

      {/* Pecas */}
      {order.items && order.items.length > 0 && (
        <div className="px-5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <p className="text-[10px] uppercase tracking-widest font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.20)' }}>Pe\u00e7as</p>
          <div className="flex flex-wrap gap-1.5">
            {order.items.map((item: OrderItem) => (
              <span
                key={item.id}
                className="text-xs px-2.5 py-1 rounded-lg"
                style={{
                  background: 'rgba(59,130,246,0.08)',
                  border: '1px solid rgba(59,130,246,0.16)',
                  color: 'rgba(147,197,253,0.80)',
                }}
              >
                {item.quantity}x {item.piece_type_label ?? PIECE_TYPE_LABELS[item.piece_type] ?? item.piece_type}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="px-5 py-4 space-y-4">
        {PROCESS_STEPS.slice(0, Math.min(currentIdx + 2, PROCESS_STEPS.length)).map((step, i) => {
          const done    = i < currentIdx
          const current = i === currentIdx
          const ts = evTs[i === 0 ? 'received' : step.status]
          const fmtTs = ts
            ? new Date(ts).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
            : null

          return (
            <div key={step.status} className="flex items-start gap-3">
              <div
                className="flex items-center justify-center flex-shrink-0 font-bold text-xs"
                style={{
                  width: 24, height: 24, borderRadius: '50%', marginTop: 1,
                  background: done ? 'rgba(52,211,153,0.14)' : current ? accentBg : 'rgba(255,255,255,0.03)',
                  border: done
                    ? '1px solid rgba(52,211,153,0.28)'
                    : current
                      ? `1.5px solid ${accent}60`
                      : '1px solid rgba(255,255,255,0.07)',
                  color: done ? '#34d399' : current ? accent : 'rgba(255,255,255,0.16)',
                }}
              >
                {done ? '✓' : current ? '●' : '○'}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <p
                    className="text-sm font-medium"
                    style={{ color: done || current ? 'rgba(255,255,255,0.82)' : 'rgba(255,255,255,0.16)' }}
                  >
                    {step.label}
                  </p>
                  {fmtTs && (
                    <span className="text-[10px] flex-shrink-0" style={{ color: 'rgba(255,255,255,0.20)' }}>
                      {fmtTs}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Previsao */}
      {promised && !isDelivered && (
        <div
          className="px-5 py-3 flex items-center justify-between"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(59,130,246,0.03)' }}
        >
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.28)' }}>Previs\u00e3o de entrega</p>
          <p className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.58)' }}>{promised}</p>
        </div>
      )}
    </div>
  )
}

/* ---- HistoryCard ------------------------------------------------------- */

function HistoryCard({ order }: { order: Order }) {
  const totalPieces = order.items?.reduce((s, i) => s + i.quantity, 0) ?? 0
  const ev = (order.events ?? []).find((ev: OrderEvent) => ev.sector === 'shipping' || ev.sector === 'delivered')
  const formatted = new Date(ev?.occurred_at ?? order.created_at)
    .toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

  return (
    <div
      className="flex items-center justify-between rounded-xl px-4 py-3.5 gap-3"
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.055)',
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="flex-shrink-0 rounded-xl flex items-center justify-center"
          style={{
            width: 38, height: 38, fontSize: 16,
            background: 'rgba(52,211,153,0.07)',
            border: '1px solid rgba(52,211,153,0.14)',
          }}
        >
          🏠
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate" style={{ color: 'rgba(255,255,255,0.70)' }}>
            Comanda #{order.order_number}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.26)' }}>
            {totalPieces > 0 ? `${totalPieces} peca${totalPieces > 1 ? 's' : ''} · ` : ''}
            {formatted}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <span
          className="text-xs px-2.5 py-1 rounded-full font-medium"
          style={{ background: 'rgba(52,211,153,0.09)', color: '#34d399', border: '1px solid rgba(52,211,153,0.20)' }}
        >
          ✓ Entregue
        </span>
        {totalPieces > 0 && (
          <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.20)' }}>+{totalPieces * 10} pts</span>
        )}
      </div>
    </div>
  )
}
