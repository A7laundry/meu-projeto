export const revalidate = 0

import Link from 'next/link'
import { listAuditLogs } from '@/actions/director/audit-logs'

const ACTION_LABELS: Record<string, string> = {
  'order.create': 'Comanda criada',
  'order.status_change': 'Status alterado',
  'equipment.maintenance': 'Manutenção registrada',
  'client.create': 'Cliente cadastrado',
  'recipe.create': 'Receita criada',
  'quote.create': 'Orçamento criado',
}

const PERIOD_OPTIONS = [
  { label: '24h', days: 1 },
  { label: '7 dias', days: 7 },
  { label: '30 dias', days: 30 },
]

interface Props {
  searchParams: Promise<{ days?: string }>
}

export default async function AuditLogPage({ searchParams }: Props) {
  const params = await searchParams
  const days = Number(params.days ?? 7)
  const logs = await listAuditLogs({ days })

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Auditoria</h1>
        <p className="text-sm text-white/40 mt-1">
          Registro de todas as ações realizadas no sistema
        </p>
      </div>

      {/* Filtro de período */}
      <div className="flex gap-2 flex-wrap">
        {PERIOD_OPTIONS.map((opt) => (
          <Link
            key={opt.days}
            href={`?days=${opt.days}`}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
              days === opt.days
                ? 'btn-gold rounded-full'
                : 'border-white/15 bg-white/04 text-white/60 hover:border-[#60a5fa]/40 hover:text-white'
            }`}
          >
            {opt.label}
          </Link>
        ))}
      </div>

      {/* Tabela */}
      <div className="card-dark rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/08">
          <h2 className="font-semibold text-white">
            {logs.length} registro{logs.length !== 1 ? 's' : ''} nos últimos {days} dia{days !== 1 ? 's' : ''}
          </h2>
        </div>

        {logs.length === 0 ? (
          <p className="px-5 py-8 text-sm text-white/30 italic text-center">
            Nenhum registro encontrado.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/08">
                <tr>
                  <th className="text-left px-4 py-3 section-header">Quando</th>
                  <th className="text-left px-4 py-3 section-header">Usuário</th>
                  <th className="text-left px-4 py-3 section-header">Ação</th>
                  <th className="text-left px-4 py-3 section-header">Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/05">
                {logs.map((log) => {
                  const meta = log.metadata ?? {}
                  const details = Object.entries(meta)
                    .filter(([, v]) => v !== null && v !== undefined)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(' · ')

                  return (
                    <tr key={log.id} className="hover:bg-white/03 transition-colors">
                      <td className="px-4 py-2.5 text-white/50 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-2.5 text-white/70">
                        {log.user_name || 'Sistema'}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            background: 'rgba(96,165,250,0.10)',
                            color: '#93bbfc',
                            border: '1px solid rgba(96,165,250,0.20)',
                          }}
                        >
                          {ACTION_LABELS[log.action] ?? log.action}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-white/40 text-xs max-w-xs truncate">
                        {details || '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
