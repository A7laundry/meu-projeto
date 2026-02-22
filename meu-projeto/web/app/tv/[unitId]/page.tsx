import { createAdminClient } from '@/lib/supabase/admin'
import { TvRefresher } from './refresher'
import type { Order, OrderStatus } from '@/types/order'

export const revalidate = 0

// Estágios ativos na produção (excluindo received, shipped, delivered)
const ACTIVE_STAGES: OrderStatus[] = ['sorting', 'washing', 'drying', 'ironing', 'ready']

const STAGE_CONFIG: Record<OrderStatus, { label: string; icon: string; color: string; bg: string; border: string }> = {
  received: { label: 'Recebida',  icon: '📥', color: '#a1a1aa', bg: 'rgba(161,161,170,0.05)', border: 'rgba(161,161,170,0.15)' },
  sorting:  { label: 'Triagem',   icon: '⊟',  color: '#60a5fa', bg: 'rgba(96,165,250,0.07)',  border: 'rgba(96,165,250,0.20)'  },
  washing:  { label: 'Lavagem',   icon: '◎',  color: '#34d399', bg: 'rgba(52,211,153,0.07)',  border: 'rgba(52,211,153,0.20)'  },
  drying:   { label: 'Secagem',   icon: '◉',  color: '#fbbf24', bg: 'rgba(251,191,36,0.07)',  border: 'rgba(251,191,36,0.20)'  },
  ironing:  { label: 'Passadoria',icon: '◈',  color: '#a78bfa', bg: 'rgba(167,139,250,0.07)', border: 'rgba(167,139,250,0.20)' },
  ready:    { label: 'Pronto',    icon: '✓',  color: '#d6b25e', bg: 'rgba(214,178,94,0.10)',  border: 'rgba(214,178,94,0.30)'  },
  shipped:  { label: 'Expedido',  icon: '📦', color: '#a1a1aa', bg: 'rgba(161,161,170,0.05)', border: 'rgba(161,161,170,0.15)' },
  delivered:{ label: 'Entregue',  icon: '✅', color: '#a1a1aa', bg: 'rgba(161,161,170,0.05)', border: 'rgba(161,161,170,0.15)' },
}

function minutesSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 60_000)
}

function urgencyColor(minutes: number): string {
  if (minutes > 240) return '#f87171'  // 4h+ → vermelho
  if (minutes > 120) return '#fbbf24'  // 2h+ → amarelo
  return 'rgba(255,255,255,0.45)'      // normal
}

interface Props {
  params: Promise<{ unitId: string }>
}

export default async function TvPage({ params }: Props) {
  const { unitId } = await params
  const supabase = createAdminClient()

  const [unitRes, ordersRes] = await Promise.all([
    supabase.from('units').select('name').eq('id', unitId).single(),
    supabase
      .from('orders')
      .select('id, order_number, client_name, status, created_at, promised_at, items:order_items(piece_type, quantity)')
      .eq('unit_id', unitId)
      .in('status', ACTIVE_STAGES)
      .order('created_at', { ascending: true }),
  ])

  const unitName = (unitRes.data as { name: string } | null)?.name ?? 'Unidade'
  const orders = (ordersRes.data ?? []) as Order[]

  const grouped = ACTIVE_STAGES.reduce<Record<OrderStatus, Order[]>>((acc, stage) => {
    acc[stage] = orders.filter(o => o.status === stage)
    return acc
  }, {} as Record<OrderStatus, Order[]>)

  const now = new Date()
  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  const dateStr = now.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })

  return (
    <div className="flex flex-col" style={{ minHeight: '100vh', padding: '20px 24px', gap: 20 }}>
      <TvRefresher intervalSeconds={30} />

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div
            style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'linear-gradient(135deg, rgba(214,178,94,0.22) 0%, rgba(185,138,44,0.10) 100%)',
              border: '1.5px solid rgba(214,178,94,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: 18, fontWeight: 900, color: '#d6b25e' }}>A</span>
          </div>
          <div>
            <p style={{ fontSize: 22, fontWeight: 700, color: '#fff', lineHeight: 1 }}>
              {unitName}
            </p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginTop: 3, textTransform: 'capitalize' }}>
              {dateStr}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Total em produção */}
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 32, fontWeight: 800, color: '#fff', lineHeight: 1, tabularNums: true } as React.CSSProperties}>
              {orders.length}
            </p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>em produção</p>
          </div>

          {/* Relógio */}
          <div
            style={{
              background: 'rgba(214,178,94,0.08)',
              border: '1px solid rgba(214,178,94,0.22)',
              borderRadius: 14, padding: '8px 18px',
            }}
          >
            <p style={{ fontSize: 36, fontWeight: 800, color: '#d6b25e', lineHeight: 1, letterSpacing: '-0.5px' }}>
              {timeStr}
            </p>
          </div>
        </div>
      </div>

      {/* ── Divisor gold ───────────────────────────────────── */}
      <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(214,178,94,0.30), transparent)', flexShrink: 0 }} />

      {/* ── Colunas de estágio ─────────────────────────────── */}
      <div
        className="flex gap-4 flex-1"
        style={{ overflow: 'hidden' }}
      >
        {ACTIVE_STAGES.map((stage) => {
          const cfg   = STAGE_CONFIG[stage]
          const items = grouped[stage]
          const isReady = stage === 'ready'

          return (
            <div
              key={stage}
              className="flex flex-col flex-1"
              style={{ gap: 10, minWidth: 0 }}
            >
              {/* Cabeçalho da coluna */}
              <div
                style={{
                  background: cfg.bg,
                  border: `1px solid ${cfg.border}`,
                  borderRadius: 14,
                  padding: '10px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexShrink: 0,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 20, color: cfg.color }}>{cfg.icon}</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: cfg.color }}>{cfg.label}</span>
                </div>
                <span
                  style={{
                    fontSize: 18, fontWeight: 800, color: cfg.color,
                    background: `${cfg.bg}`, border: `1px solid ${cfg.border}`,
                    borderRadius: 8, padding: '2px 10px',
                  }}
                >
                  {items.length}
                </span>
              </div>

              {/* Cards de ordem */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, overflowY: 'auto' }}>
                {items.length === 0 ? (
                  <div
                    style={{
                      borderRadius: 12, padding: '24px 16px', textAlign: 'center',
                      background: 'rgba(255,255,255,0.01)',
                      border: '1px dashed rgba(255,255,255,0.06)',
                    }}
                  >
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.18)' }}>vazio</p>
                  </div>
                ) : items.map((order) => {
                  const mins = minutesSince(order.created_at)
                  const urg  = urgencyColor(mins)
                  const totalPieces = (order.items ?? []).reduce((s, i) => s + i.quantity, 0)
                  const isLate = order.promised_at && new Date(order.promised_at) < now

                  return (
                    <div
                      key={order.id}
                      style={{
                        background: isReady
                          ? 'rgba(214,178,94,0.07)'
                          : 'rgba(255,255,255,0.03)',
                        border: isReady
                          ? '1px solid rgba(214,178,94,0.20)'
                          : '1px solid rgba(255,255,255,0.07)',
                        borderRadius: 12,
                        padding: '12px 14px',
                      }}
                    >
                      {/* Número + nome */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <p
                          style={{
                            fontSize: isReady ? 18 : 16,
                            fontWeight: 700,
                            color: isReady ? '#d6b25e' : 'rgba(255,255,255,0.90)',
                            lineHeight: 1.2,
                          }}
                        >
                          #{order.order_number}
                        </p>
                        {isLate && (
                          <span style={{ fontSize: 11, color: '#f87171', fontWeight: 700 }}>ATRASADO</span>
                        )}
                      </div>

                      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.60)', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {order.client_name}
                      </p>

                      {/* Peças + tempo */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                        {totalPieces > 0 && (
                          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                            {totalPieces} peça{totalPieces !== 1 ? 's' : ''}
                          </span>
                        )}
                        <span style={{ fontSize: 11, color: urg, marginLeft: 'auto' }}>
                          {mins < 60 ? `${mins}min` : `${Math.floor(mins / 60)}h${mins % 60 > 0 ? `${mins % 60}m` : ''}`}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Footer ─────────────────────────────────────────── */}
      <div
        style={{
          flexShrink: 0, paddingTop: 12,
          borderTop: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}
      >
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.18)' }}>
          A7x TecNologia — Sistema Operacional
        </p>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.18)' }}>
          Atualiza automaticamente a cada 30 segundos
        </p>
      </div>
    </div>
  )
}
