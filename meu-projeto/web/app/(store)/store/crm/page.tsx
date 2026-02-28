import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getUser } from '@/lib/auth/get-user'
import { listClients } from '@/actions/clients/crud'

export default async function StoreCrmPage() {
  const user = await getUser()
  if (!user || user.role !== 'store' || !user.unit_id) redirect('/login')

  const clients = await listClients(user.unit_id)
  const activeClients = clients.filter(c => c.active)

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div>
        <p
          className="text-[10px] uppercase tracking-widest font-semibold mb-1"
          style={{ color: 'rgba(52,211,153,0.40)' }}
        >
          CRM
        </p>
        <h1 className="text-xl font-bold text-white tracking-tight">Relacionamento com Clientes</h1>
      </div>

      <p className="text-xs text-white/30">{activeClients.length} cliente{activeClients.length !== 1 ? 's' : ''} ativo{activeClients.length !== 1 ? 's' : ''}</p>

      {/* Clients grid */}
      {activeClients.length === 0 ? (
        <div
          className="rounded-2xl p-12 text-center"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-3xl mb-3">👥</p>
          <p className="font-medium text-white/50">Nenhum cliente cadastrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {activeClients.map(client => {
            const initials = client.name
              .split(' ')
              .slice(0, 2)
              .map(w => w[0])
              .join('')
              .toUpperCase()

            return (
              <Link
                key={client.id}
                href={`/store/crm/${client.id}`}
                className="rounded-xl p-4 flex items-center gap-3 transition-all group"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(52,211,153,0.22)'
                  e.currentTarget.style.background = 'rgba(255,255,255,0.045)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{
                    background: 'rgba(52,211,153,0.12)',
                    border: '1px solid rgba(52,211,153,0.25)',
                    color: '#34d399',
                  }}
                >
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white/85 truncate group-hover:text-[#34d399] transition-colors">
                    {client.name}
                  </p>
                  <p className="text-[11px] text-white/35 truncate">
                    {[client.phone, client.email].filter(Boolean).join(' · ') || 'Sem contato'}
                  </p>
                </div>
                <span className="text-xs text-white/20 group-hover:text-white/40 transition-colors">→</span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
