import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getUser } from '@/lib/auth/get-user'
import { getClientStats, listClientNotes, listClientOrders, createCrmNote } from '@/actions/crm/notes'
import { CrmNoteForm } from './crm-note-form'
import { CRM_NOTE_CATEGORY_LABELS } from '@/types/crm'

interface Props {
  params: Promise<{ clientId: string }>
}

export default async function StoreCrmDetailPage({ params }: Props) {
  const { clientId } = await params
  const user = await getUser()
  if (!user || user.role !== 'store' || !user.unit_id) redirect('/login')

  const [stats, notes, orders] = await Promise.all([
    getClientStats(clientId, user.unit_id),
    listClientNotes(clientId, 20),
    listClientOrders(clientId, user.unit_id, 20),
  ])

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Breadcrumb */}
      <div>
        <Link
          href="/store/crm"
          className="text-xs transition-colors"
          style={{ color: 'rgba(52,211,153,0.50)' }}
        >
          ← CRM
        </Link>
        <h1 className="text-xl font-bold text-white tracking-tight mt-2">Detalhe do Cliente</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatMini label="Pedidos" value={stats.totalOrders} />
        <StatMini label="Total Gasto" value={`R$ ${stats.totalSpent.toFixed(0)}`} emerald />
        <StatMini label="Ticket Médio" value={`R$ ${stats.avgTicket.toFixed(0)}`} />
        <StatMini label="LTV Anual" value={`R$ ${stats.annualLtv.toFixed(0)}`} emerald />
        <StatMini
          label="Primeiro Pedido"
          value={stats.firstOrderAt ? new Date(stats.firstOrderAt).toLocaleDateString('pt-BR') : '—'}
        />
        <StatMini
          label="Último Pedido"
          value={stats.lastOrderAt ? new Date(stats.lastOrderAt).toLocaleDateString('pt-BR') : '—'}
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left — Notes */}
        <div className="flex-1 space-y-4">
          <p className="section-title" style={{ color: 'rgba(52,211,153,0.50)' }}>Notas CRM</p>

          <CrmNoteForm clientId={clientId} unitId={user.unit_id} />

          {notes.length === 0 ? (
            <p className="text-sm text-white/25 py-4">Nenhuma nota registrada.</p>
          ) : (
            <div className="space-y-2">
              {notes.map(note => (
                <div
                  key={note.id}
                  className="rounded-xl p-4"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(52,211,153,0.10)', color: '#34d399', border: '1px solid rgba(52,211,153,0.20)' }}
                    >
                      {CRM_NOTE_CATEGORY_LABELS[note.category] ?? note.category}
                    </span>
                    <span className="text-[10px] text-white/25">
                      {new Date(note.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-sm text-white/60 leading-relaxed">{note.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right — Orders */}
        <div className="lg:w-96 space-y-4">
          <p className="section-title" style={{ color: 'rgba(52,211,153,0.50)' }}>Histórico de Comandas</p>

          {orders.length === 0 ? (
            <p className="text-sm text-white/25 py-4">Nenhuma comanda encontrada.</p>
          ) : (
            <div className="space-y-2">
              {orders.map(order => (
                <div
                  key={order.id}
                  className="rounded-xl p-3 flex items-center gap-3"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white/70 num-stat">{order.order_number}</p>
                    <p className="text-[10px] text-white/30">
                      {new Date(order.created_at).toLocaleDateString('pt-BR')} · {order.items_count} peça{order.items_count !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold num-stat" style={{ color: '#34d399' }}>
                      R$ {order.estimated_total.toFixed(0)}
                    </p>
                    <p className="text-[10px] text-white/25 capitalize">{order.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatMini({ label, value, emerald }: { label: string; value: string | number; emerald?: boolean }) {
  return (
    <div
      className="rounded-xl p-3"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30">{label}</p>
      <p
        className="text-lg font-bold num-stat mt-0.5"
        style={{ color: emerald ? '#34d399' : '#fff' }}
      >
        {value}
      </p>
    </div>
  )
}
