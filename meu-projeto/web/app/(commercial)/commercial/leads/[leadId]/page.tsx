import { notFound } from 'next/navigation'
import { getLead, moveLeadStage, convertLeadToClient } from '@/actions/commercial/leads'
import { listActivities, createActivity } from '@/actions/commercial/activities'
import type { LeadStage } from '@/actions/commercial/leads'
import type { ActivityType } from '@/actions/commercial/activities'

const STAGE_LABELS: Record<LeadStage, string> = {
  prospect: 'Prospecto',
  contacted: 'Contatado',
  qualified: 'Qualificado',
  proposal: 'Proposta',
  won: 'Ganho ✓',
  lost: 'Perdido ✗',
}

const STAGE_ORDER: LeadStage[] = ['prospect', 'contacted', 'qualified', 'proposal', 'won', 'lost']

const ACTIVITY_LABELS: Record<ActivityType, string> = {
  note: '📝 Nota',
  call: '📞 Ligação',
  whatsapp: '💬 WhatsApp',
  email: '✉️ E-mail',
  meeting: '🤝 Reunião',
  proposal: '📄 Proposta',
}

const ACTIVITY_ICONS: Record<string, string> = {
  note: '📝',
  call: '📞',
  whatsapp: '💬',
  email: '✉️',
  meeting: '🤝',
  proposal: '📄',
  stage_change: '↗️',
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ leadId: string }>
}) {
  const { leadId } = await params
  const [lead, activities] = await Promise.all([
    getLead(leadId),
    listActivities(leadId),
  ])

  if (!lead) notFound()

  const isWon = lead.stage === 'won'
  const isLost = lead.stage === 'lost'

  // Server actions bound to leadId
  async function moveStage(formData: FormData) {
    'use server'
    const stage = formData.get('stage') as LeadStage
    const lostReason = formData.get('lost_reason') as string | undefined
    await moveLeadStage(leadId, stage, lostReason || undefined)
  }

  async function addActivity(formData: FormData) {
    'use server'
    formData.set('lead_id', leadId)
    await createActivity(formData)
  }

  async function convert() {
    'use server'
    await convertLeadToClient(leadId)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{lead.name}</h1>
          {lead.company && <p className="text-gray-500 mt-0.5">{lead.company}</p>}
        </div>
        {isWon && !lead.converted_client_id && (
          <form action={convert}>
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Converter em Cliente →
            </button>
          </form>
        )}
        {lead.converted_client_id && (
          <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full font-medium">
            ✓ Convertido em Cliente
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info do lead */}
        <div className="lg:col-span-1 space-y-4">
          {/* Dados de contato */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contato</h2>
            {lead.phone && (
              <div>
                <p className="text-xs text-gray-400">Telefone</p>
                <p className="text-sm font-medium text-gray-700">{lead.phone}</p>
              </div>
            )}
            {lead.email && (
              <div>
                <p className="text-xs text-gray-400">E-mail</p>
                <p className="text-sm font-medium text-gray-700">{lead.email}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-400">Origem</p>
              <p className="text-sm font-medium text-gray-700 capitalize">{lead.source}</p>
            </div>
            {lead.estimated_monthly_value > 0 && (
              <div>
                <p className="text-xs text-gray-400">Ticket estimado</p>
                <p className="text-sm font-bold text-[#b8921e]">
                  R$ {Number(lead.estimated_monthly_value).toFixed(2).replace('.', ',')}/mês
                </p>
              </div>
            )}
            {lead.notes && (
              <div>
                <p className="text-xs text-gray-400">Observações</p>
                <p className="text-sm text-gray-600">{lead.notes}</p>
              </div>
            )}
            {isLost && lead.lost_reason && (
              <div>
                <p className="text-xs text-gray-400">Motivo da perda</p>
                <p className="text-sm text-red-600">{lead.lost_reason}</p>
              </div>
            )}
          </div>

          {/* Mover estágio */}
          {!isWon && !isLost && (
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Mover Estágio</h2>
              <form action={moveStage} className="space-y-2">
                <select
                  name="stage"
                  defaultValue={lead.stage}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#d6b25e]"
                >
                  {STAGE_ORDER.filter(s => s !== lead.stage).map(s => (
                    <option key={s} value={s}>{STAGE_LABELS[s]}</option>
                  ))}
                </select>
                <input
                  name="lost_reason"
                  placeholder="Motivo (se perder)"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#d6b25e]"
                />
                <button
                  type="submit"
                  className="w-full text-sm font-medium py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-700 transition-colors"
                >
                  Mover
                </button>
              </form>
            </div>
          )}

          {/* Pipeline visual */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Estágio atual</h2>
            <div className="space-y-1">
              {STAGE_ORDER.map((s, i) => {
                const currentIdx = STAGE_ORDER.indexOf(lead.stage as LeadStage)
                const done = i < currentIdx
                const current = s === lead.stage
                return (
                  <div key={s} className="flex items-center gap-2">
                    <div className={[
                      'w-4 h-4 rounded-full flex items-center justify-center text-[9px] flex-shrink-0',
                      done ? 'bg-emerald-500 text-white' : current ? 'bg-[#d6b25e] text-white ring-2 ring-[#d6b25e]/30' : 'bg-gray-100 text-gray-300',
                    ].join(' ')}>
                      {done ? '✓' : current ? '●' : '○'}
                    </div>
                    <span className={`text-xs ${current ? 'font-semibold text-gray-800' : done ? 'text-gray-400' : 'text-gray-300'}`}>
                      {STAGE_LABELS[s]}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Timeline de atividades */}
        <div className="lg:col-span-2 space-y-4">
          {/* Adicionar atividade */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Registrar Atividade</h2>
            <form action={addActivity} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <select
                  name="type"
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#d6b25e]"
                >
                  {(Object.entries(ACTIVITY_LABELS) as [ActivityType, string][]).map(([type, label]) => (
                    <option key={type} value={type}>{label}</option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="bg-[#07070a] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Salvar
                </button>
              </div>
              <textarea
                name="description"
                required
                rows={2}
                placeholder="Descreva a interação..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-[#d6b25e]"
              />
            </form>
          </div>

          {/* Lista de atividades */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Histórico</h2>
            {activities.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">Nenhuma atividade registrada ainda</p>
            ) : (
              <div className="space-y-4">
                {activities.map((act) => (
                  <div key={act.id} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-base flex-shrink-0">
                      {ACTIVITY_ICONS[act.type] ?? '📋'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-medium text-gray-600 capitalize">{act.type}</p>
                        <time className="text-[10px] text-gray-400 flex-shrink-0">
                          {new Date(act.occurred_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </time>
                      </div>
                      <p className="text-sm text-gray-700 mt-0.5">{act.description}</p>
                      {act.user && (
                        <p className="text-[10px] text-gray-400 mt-0.5">por {(act.user as { full_name: string }).full_name}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
