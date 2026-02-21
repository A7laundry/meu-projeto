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

  // Busca todos os pedidos aprovados de uma vez
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
    const totalOrders = clientQuotes.length
    const totalSpent = clientQuotes.reduce((s, q) => s + q.total, 0)
    const avgTicket = totalOrders > 0 ? totalSpent / totalOrders : 0
    const firstOrderAt = clientQuotes[0]?.created_at ?? null
    const lastOrderAt = clientQuotes[clientQuotes.length - 1]?.created_at ?? null

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
  if (ltv === 0) return <span className="text-xs text-gray-400">—</span>
  if (ltv >= 5000) return <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">🏆 R$ {ltv.toFixed(0)}/ano</span>
  if (ltv >= 1000) return <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">⭐ R$ {ltv.toFixed(0)}/ano</span>
  return <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">R$ {ltv.toFixed(0)}/ano</span>
}

export default async function CommercialClientsPage() {
  const clients = await getAllClientsWithLtv()

  const totalLtv = clients.reduce((s, c) => s + c.annualLtv, 0)
  const activeClients = clients.filter(c => c.totalOrders > 0)
  const avgLtv = activeClients.length > 0 ? totalLtv / activeClients.length : 0

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Clientes + LTV</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {clients.length} clientes cadastrados · {activeClients.length} com histórico · LTV médio: R$ {avgLtv.toFixed(0)}/ano
        </p>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total de Clientes</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{clients.length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Com Pedidos</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{activeClients.length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">LTV Médio/Ano</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">R$ {avgLtv.toFixed(0)}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">LTV Total Rede</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">R$ {(totalLtv / 1000).toFixed(1)}k</p>
        </div>
      </div>

      {/* Tabela de clientes */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Cliente</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Unidade</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Pedidos</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Gasto</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ticket Médio</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">LTV Anual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{client.name}</p>
                    {client.email && <p className="text-xs text-gray-400">{client.email}</p>}
                    {client.phone && <p className="text-xs text-gray-400">{client.phone}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                    {client.unit_name ?? <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-gray-700 font-medium">{client.totalOrders}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {client.totalSpent > 0 ? (
                      <span className="text-gray-700">R$ {client.totalSpent.toFixed(2).replace('.', ',')}</span>
                    ) : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {client.avgTicket > 0 ? (
                      <span className="text-gray-700">R$ {client.avgTicket.toFixed(2).replace('.', ',')}</span>
                    ) : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <LtvBadge ltv={client.annualLtv} />
                  </td>
                </tr>
              ))}
              {clients.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    Nenhum cliente cadastrado ainda
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
