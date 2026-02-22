import { notFound } from 'next/navigation'
import Link from 'next/link'
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

const STAGE_DOT: Record<LeadStage, string> = {
  prospect:  'rgba(255,255,255,0.35)',
  contacted: 'rgba(96,165,250,0.80)',
  qualified: 'rgba(167,139,250,0.80)',
  proposal:  'rgba(214,178,94,0.90)',
  won:       'rgba(52,211,153,0.90)',
  lost:      'rgba(248,113,113,0.75)',
}

const ACTIVITY_LABELS: Record<ActivityType, string> = {
  note:     '📝 Nota',
  call:     '📞 Ligação',
  whatsapp: '💬 WhatsApp',
  email:    '✉️ E-mail',
  meeting:  '🤝 Reunião',
  proposal: '📄 Proposta',
}

const ACTIVITY_ICONS: Record<string, string> = {
  note:         '📝',
  call:         '📞',
  whatsapp:     '💬',
  email:        '✉️',
  meeting:      '🤝',
  proposal:     '📄',
  stage_change: '↗️',
}

const CARD = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 16,
  padding: '18px 20px',
} as const

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

  const isWon  = lead.stage === 'won'
  const isLost = lead.stage === 'lost'

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

  const currentStageIdx = STAGE_ORDER.indexOf(lead.stage as LeadStage)
  const stageColor = STAGE_DOT[lead.stage as LeadStage] ?? 'rgba(255,255,255,0.40)'

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">

      {/* ── Breadcrumb ──────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <Link
          href="/commercial/leads"
          className="text-sm transition-colors"
          style={{ color: 'rgba(255,255,255,0.35)' }}
        >
          Pipeline
        </Link>
        <span style={{ color: 'rgba(255,255,255,0.20)' }}>/</span>
        <span className="text-sm font-medium truncate max-w-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>
          {lead.name}
        </span>
      </div>

      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-white tracking-tight">{lead.name}</h1>
            <span
              className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
              style={{
                background: `${stageColor.replace(/[\d.]+\)$/, '0.12)')}`,
                color: stageColor,
              }}
            >
              {STAGE_LABELS[lead.stage as LeadStage] ?? lead.stage}
            </span>
          </div>
          {lead.company && (
            <p className="mt-0.5 text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {lead.company}
            </p>
          )}
        </div>

        {isWon && !lead.converted_client_id && (
          <form action={convert}>
            <button
              type="submit"
              className="text-sm font-semibold px-4 py-2 rounded-xl transition-all"
              style={{
                background: 'linear-gradient(135deg, rgba(52,211,153,0.20) 0%, rgba(16,185,129,0.12) 100%)',
                border: '1px solid rgba(52,211,153,0.30)',
                color: 'rgba(52,211,153,0.90)',
              }}
            >
              Converter em Cliente →
            </button>
          </form>
        )}
        {lead.converted_client_id && (
          <span
            className="text-xs px-3 py-1.5 rounded-full font-semibold"
            style={{ background: 'rgba(52,211,153,0.10)', color: 'rgba(52,211,153,0.85)', border: '1px solid rgba(52,211,153,0.20)' }}
          >
            ✓ Convertido em Cliente
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── Coluna esquerda ─────────────────────────────── */}
        <div className="space-y-4">

          {/* Dados de contato */}
          <div style={CARD}>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-3.5" style={{ color: 'rgba(255,255,255,0.30)' }}>
              Contato
            </p>
            <div className="space-y-2.5">
              {lead.phone && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>Telefone</p>
                  <p className="text-sm text-white/80">{lead.phone}</p>
                </div>
              )}
              {lead.email && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>E-mail</p>
                  <p className="text-sm text-white/80">{lead.email}</p>
                </div>
              )}
              <div>
                <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>Origem</p>
                <p className="text-sm text-white/80 capitalize">{lead.source}</p>
              </div>
              {lead.estimated_monthly_value > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>Ticket estimado</p>
                  <p className="text-sm font-bold tabular-nums" style={{ color: '#d6b25e' }}>
                    R$ {Number(lead.estimated_monthly_value).toFixed(2).replace('.', ',')}/mês
                  </p>
                </div>
              )}
              {lead.notes && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>Observações</p>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.60)' }}>{lead.notes}</p>
                </div>
              )}
              {isLost && lead.lost_reason && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: 'rgba(248,113,113,0.60)' }}>Motivo da perda</p>
                  <p className="text-sm" style={{ color: 'rgba(248,113,113,0.80)' }}>{lead.lost_reason}</p>
                </div>
              )}
            </div>
          </div>

          {/* Mover estágio */}
          {!isWon && !isLost && (
            <div style={CARD}>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-3.5" style={{ color: 'rgba(255,255,255,0.30)' }}>
                Mover Estágio
              </p>
              <form action={moveStage} className="space-y-2.5">
                <select
                  name="stage"
                  defaultValue={lead.stage}
                  className="input-premium w-full"
                  style={{ padding: '9px 14px', borderRadius: 10, fontSize: 14 }}
                >
                  {STAGE_ORDER.filter(s => s !== lead.stage).map(s => (
                    <option key={s} value={s}>{STAGE_LABELS[s]}</option>
                  ))}
                </select>
                <input
                  name="lost_reason"
                  placeholder="Motivo (se perder)"
                  className="input-premium w-full"
                  style={{ padding: '9px 14px', borderRadius: 10, fontSize: 14 }}
                />
                <button
                  type="submit"
                  className="w-full text-sm font-semibold py-2.5 rounded-xl transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #d6b25e 0%, #f0d080 100%)',
                    color: '#05050a',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Mover
                </button>
              </form>
            </div>
          )}

          {/* Pipeline visual */}
          <div style={CARD}>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-3.5" style={{ color: 'rgba(255,255,255,0.30)' }}>
              Estágio Atual
            </p>
            <div className="space-y-2">
              {STAGE_ORDER.map((s, i) => {
                const done    = i < currentStageIdx
                const current = s === lead.stage
                const color   = STAGE_DOT[s]
                return (
                  <div key={s} className="flex items-center gap-2.5">
                    <div
                      className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] flex-shrink-0 font-bold"
                      style={{
                        background: done ? 'rgba(52,211,153,0.15)' : current ? `${color.replace(/[\d.]+\)$/, '0.18)')}` : 'rgba(255,255,255,0.04)',
                        border: done ? '1px solid rgba(52,211,153,0.40)' : current ? `1px solid ${color}` : '1px solid rgba(255,255,255,0.10)',
                        color: done ? 'rgba(52,211,153,0.90)' : current ? color : 'rgba(255,255,255,0.20)',
                      }}
                    >
                      {done ? '✓' : current ? '●' : '○'}
                    </div>
                    <span
                      className="text-xs"
                      style={{
                        color: done ? 'rgba(52,211,153,0.60)' : current ? 'rgba(255,255,255,0.90)' : 'rgba(255,255,255,0.25)',
                        fontWeight: current ? 600 : 400,
                      }}
                    >
                      {STAGE_LABELS[s]}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── Coluna direita (timeline) ────────────────────── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Registrar atividade */}
          <div style={CARD}>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-3.5" style={{ color: 'rgba(255,255,255,0.30)' }}>
              Registrar Atividade
            </p>
            <form action={addActivity} className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2.5">
                <select
                  name="type"
                  className="input-premium w-full"
                  style={{ padding: '9px 14px', borderRadius: 10, fontSize: 14 }}
                >
                  {(Object.entries(ACTIVITY_LABELS) as [ActivityType, string][]).map(([type, label]) => (
                    <option key={type} value={type}>{label}</option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="text-sm font-semibold rounded-xl transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #d6b25e 0%, #f0d080 100%)',
                    color: '#05050a',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Salvar
                </button>
              </div>
              <textarea
                name="description"
                required
                rows={2}
                placeholder="Descreva a interação..."
                className="input-premium w-full resize-none"
                style={{ padding: '10px 14px', borderRadius: 10, fontSize: 14 }}
              />
            </form>
          </div>

          {/* Histórico */}
          <div style={CARD}>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-4" style={{ color: 'rgba(255,255,255,0.30)' }}>
              Histórico
            </p>
            {activities.length === 0 ? (
              <p className="text-sm text-center py-6" style={{ color: 'rgba(255,255,255,0.25)' }}>
                Nenhuma atividade registrada ainda
              </p>
            ) : (
              <div className="space-y-4">
                {activities.map((act) => (
                  <div key={act.id} className="flex items-start gap-3">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      {ACTIVITY_ICONS[act.type] ?? '📋'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[11px] font-semibold capitalize" style={{ color: 'rgba(255,255,255,0.50)' }}>
                          {act.type}
                        </p>
                        <time className="text-[10px] flex-shrink-0" style={{ color: 'rgba(255,255,255,0.28)' }}>
                          {new Date(act.occurred_at).toLocaleString('pt-BR', {
                            day: '2-digit', month: '2-digit',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </time>
                      </div>
                      <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.72)' }}>
                        {act.description}
                      </p>
                      {act.user && (
                        <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.28)' }}>
                          por {(act.user as { full_name: string }).full_name}
                        </p>
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
