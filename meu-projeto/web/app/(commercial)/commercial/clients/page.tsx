import { createAdminClient } from '@/lib/supabase/admin'
import { differenceInMonths } from 'date-fns'

export const revalidate = 60

interface ClientWithLtv {
  id: string
  name: string
  email: string | null
  phone: string | null
  unit_id: string | null
  unit_name: string | null
  totalOrders: number
  totalSpent: number
  avgTicket: number
  firstOrderAt: string | null
  lastOrderAt: string | null
  annualLtv: number
}

async function getAllClientsWithLtv(): Promise<ClientWithLtv[]> {
  const supabase = createAdminClient()

  const { data: clients } = await supabase
    .from('clients')
    .select('id, name, email, phone, unit_id, unit:units(name)')
    .order('name')

  if (!clients || clients.length === 0) return []

  const { data: quotes } = await supabase
    .from('quotes')
    .select('client_id, total, created_at')
    .eq('status', 'approved')
    .order('created_at')

  const quotesByClient: Record<string, { total: number; created_at: string }[]> = {}
  for (const q of quotes ?? []) {
    if (!quotesByClient[q.client_id]) quotesByClient[q.client_id] = []
    quotesByClient[q.client_id].push({ total: Number(q.total), created_at: q.created_at })
  }

  return clients.map((c) => {
    const clientQuotes = quotesByClient[c.id] ?? []
    const totalOrders  = clientQuotes.length
    const totalSpent   = clientQuotes.reduce((s, q) => s + q.total, 0)
    const avgTicket    = totalOrders > 0 ? totalSpent / totalOrders : 0
    const firstOrderAt = clientQuotes[0]?.created_at ?? null
    const lastOrderAt  = clientQuotes[clientQuotes.length - 1]?.created_at ?? null

    let annualLtv = 0
    if (totalOrders > 0 && firstOrderAt && lastOrderAt) {
      const monthsActive = Math.max(differenceInMonths(new Date(lastOrderAt), new Date(firstOrderAt)), 1)
      annualLtv = (totalSpent / monthsActive) * 12
    }

    const unit = Array.isArray(c.unit) ? c.unit[0] : c.unit as { name: string } | null

    return {
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      unit_id: c.unit_id,
      unit_name: unit?.name ?? null,
      totalOrders,
      totalSpent,
      avgTicket,
      firstOrderAt,
      lastOrderAt,
      annualLtv,
    }
  }).sort((a, b) => b.annualLtv - a.annualLtv)
}

function LtvBadge({ ltv }: { ltv: number }) {
  if (ltv === 0) return <span style={{ color: 'rgba(255,255,255,0.20)' }}>—</span>
  if (ltv >= 5000) return (
    <span
      className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
      style={{ background: 'rgba(214,178,94,0.12)', color: 'rgba(214,178,94,0.90)', border: '1px solid rgba(214,178,94,0.20)' }}
    >
      🏆 R$ {ltv.toFixed(0)}/ano
    </span>
  )
  if (ltv >= 1000) return (
    <span
      className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
      style={{ background: 'rgba(52,211,153,0.10)', color: 'rgba(52,211,153,0.85)', border: '1px solid rgba(52,211,153,0.18)' }}
    >
      ⭐ R$ {ltv.toFixed(0)}/ano
    </span>
  )
  return (
    <span
      className="text-xs px-2.5 py-0.5 rounded-full"
      style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.40)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      R$ {ltv.toFixed(0)}/ano
    </span>
  )
}

export default async function CommercialClientsPage() {
  const clients = await getAllClientsWithLtv()

  const totalLtv     = clients.reduce((s, c) => s + c.annualLtv, 0)
  const activeClients = clients.filter(c => c.totalOrders > 0)
  const avgLtv       = activeClients.length > 0 ? totalLtv / activeClients.length : 0

  const kpis = [
    { label: 'Total de Clientes', value: String(clients.length), accent: '#60a5fa' },
    { label: 'Com Pedidos',       value: String(activeClients.length), accent: '#a78bfa' },
    { label: 'LTV Médio/Ano',     value: `R$ ${avgLtv.toFixed(0)}`, accent: '#34d399' },
    { label: 'LTV Total Rede',    value: `R$ ${(totalLtv / 1000).toFixed(1)}k`, accent: '#d6b25e' },
  ]

  return (
    <div className="p-6 space-y-6">

      {/* ── Header ──────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Clientes + LTV</h1>
        <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
          {clients.length} clientes · {activeClients.length} com histórico · LTV médio: R$ {avgLtv.toFixed(0)}/ano
        </p>
      </div>

      {/* ── KPIs ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="rounded-2xl"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              padding: '18px 20px',
            }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.28)' }}>
              {k.label}
            </p>
            <p className="text-2xl font-bold tabular-nums" style={{ color: k.accent }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* ── Tabela de clientes ───────────────────────────── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Cliente', 'Unidade', 'Pedidos', 'Total Gasto', 'Ticket Médio', 'LTV Anual'].map((h, i) => (
                  <th
                    key={h}
                    className={`px-4 py-3 text-[10px] font-semibold uppercase tracking-wider ${i >= 2 ? 'text-right' : 'text-left'} ${i === 1 ? 'hidden md:table-cell' : ''}`}
                    style={{ color: 'rgba(255,255,255,0.28)', background: 'rgba(255,255,255,0.02)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12" style={{ color: 'rgba(255,255,255,0.25)' }}>
                    Nenhum cliente cadastrado ainda
                  </td>
                </tr>
              )}
              {clients.map((client, idx) => (
                <tr
                  key={client.id}
                  className="transition-colors hover:bg-white/[0.025]"
                  style={{ borderBottom: idx < clients.length - 1 ? '1px solid rgba(255,255,255,0.04)' : undefined }}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-white/80">{client.name}</p>
                    {client.email && <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.30)' }}>{client.email}</p>}
                    {client.phone && <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.25)' }}>{client.phone}</p>}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-sm" style={{ color: 'rgba(255,255,255,0.40)' }}>
                    {client.unit_name ?? <span style={{ color: 'rgba(255,255,255,0.15)' }}>—</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-medium text-white/70 tabular-nums">{client.totalOrders}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {client.totalSpent > 0 ? (
                      <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.60)' }}>
                        R$ {client.totalSpent.toFixed(2).replace('.', ',')}
                      </span>
                    ) : <span style={{ color: 'rgba(255,255,255,0.15)' }}>—</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {client.avgTicket > 0 ? (
                      <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.55)' }}>
                        R$ {client.avgTicket.toFixed(2).replace('.', ',')}
                      </span>
                    ) : <span style={{ color: 'rgba(255,255,255,0.15)' }}>—</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <LtvBadge ltv={client.annualLtv} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
