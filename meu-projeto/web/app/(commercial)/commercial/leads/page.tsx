import Link from 'next/link'
import { listLeads, createLead } from '@/actions/commercial/leads'
import type { Lead, LeadStage } from '@/actions/commercial/leads'

export const revalidate = 0

const STAGE_LABELS: Record<LeadStage, string> = {
  prospect: 'Prospecto',
  contacted: 'Contatado',
  qualified: 'Qualificado',
  proposal: 'Proposta',
  won: 'Ganho',
  lost: 'Perdido',
}

const STAGE_DARK: Record<LeadStage, { bg: string; text: string; border: string; headerBg: string }> = {
  prospect:  {
    bg: 'rgba(255,255,255,0.02)', text: 'rgba(255,255,255,0.40)',
    border: 'rgba(255,255,255,0.07)', headerBg: 'rgba(255,255,255,0.04)',
  },
  contacted: {
    bg: 'rgba(96,165,250,0.04)',  text: 'rgba(96,165,250,0.80)',
    border: 'rgba(96,165,250,0.12)', headerBg: 'rgba(96,165,250,0.08)',
  },
  qualified: {
    bg: 'rgba(167,139,250,0.04)', text: 'rgba(167,139,250,0.80)',
    border: 'rgba(167,139,250,0.12)', headerBg: 'rgba(167,139,250,0.08)',
  },
  proposal:  {
    bg: 'rgba(214,178,94,0.04)',  text: 'rgba(214,178,94,0.90)',
    border: 'rgba(214,178,94,0.14)', headerBg: 'rgba(214,178,94,0.09)',
  },
  won:       {
    bg: 'rgba(52,211,153,0.04)',  text: 'rgba(52,211,153,0.85)',
    border: 'rgba(52,211,153,0.12)', headerBg: 'rgba(52,211,153,0.08)',
  },
  lost:      {
    bg: 'rgba(248,113,113,0.04)', text: 'rgba(248,113,113,0.70)',
    border: 'rgba(248,113,113,0.10)', headerBg: 'rgba(248,113,113,0.07)',
  },
}

const SOURCE_ICONS: Record<string, string> = {
  instagram: '📸',
  google:    '🔍',
  referral:  '🤝',
  cold_call: '📞',
  whatsapp:  '💬',
  form:      '📋',
  manual:    '✏️',
}

function StageColumn({ stage, leads }: { stage: LeadStage; leads: Lead[] }) {
  const filtered  = leads.filter(l => l.stage === stage)
  const totalValue = filtered.reduce((s, l) => s + Number(l.estimated_monthly_value ?? 0), 0)
  const theme     = STAGE_DARK[stage]

  return (
    <div className="flex-shrink-0 w-64 flex flex-col gap-2">
      {/* Header da coluna */}
      <div
        className="flex items-center justify-between px-3 py-2.5 rounded-xl"
        style={{ background: theme.headerBg, border: `1px solid ${theme.border}` }}
      >
        <span className="text-xs font-semibold" style={{ color: theme.text }}>
          {STAGE_LABELS[stage]}
        </span>
        <div className="flex items-center gap-2">
          <span
            className="text-[11px] font-bold tabular-nums w-5 h-5 rounded-full flex items-center justify-center"
            style={{ background: theme.bg, color: theme.text, border: `1px solid ${theme.border}` }}
          >
            {filtered.length}
          </span>
          {totalValue > 0 && (
            <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.30)' }}>
              R${(totalValue / 1000).toFixed(1)}k
            </span>
          )}
        </div>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2 min-h-[80px]">
        {filtered.length === 0 && (
          <div
            className="rounded-xl px-3 py-6 text-center"
            style={{ background: 'rgba(255,255,255,0.01)', border: `1px dashed rgba(255,255,255,0.06)` }}
          >
            <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.20)' }}>vazio</p>
          </div>
        )}
        {filtered.map((lead) => (
          <Link
            key={lead.id}
            href={`/commercial/leads/${lead.id}`}
            className="block rounded-xl p-3.5 transition-all duration-150 group hover:bg-white/[0.05] hover:border-white/[0.14]"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid rgba(255,255,255,0.07)`,
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold truncate text-white/85 group-hover:text-white transition-colors">
                {lead.name}
              </p>
              {lead.estimated_monthly_value > 0 && (
                <span className="text-[11px] flex-shrink-0 tabular-nums" style={{ color: '#d6b25e', fontWeight: 600 }}>
                  R${Number(lead.estimated_monthly_value).toFixed(0)}
                </span>
              )}
            </div>
            {lead.company && (
              <p className="text-[11px] mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {lead.company}
              </p>
            )}
            <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
              {lead.source && (
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.40)',
                  }}
                >
                  {SOURCE_ICONS[lead.source] ?? '📌'} {lead.source}
                </span>
              )}
              {lead.phone && (
                <span className="text-[10px] truncate" style={{ color: 'rgba(255,255,255,0.28)' }}>
                  {lead.phone}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default async function LeadsPage() {
  const leads = await listLeads()
  const totalValue = leads
    .filter(l => !['won', 'lost'].includes(l.stage))
    .reduce((s, l) => s + Number(l.estimated_monthly_value ?? 0), 0)

  return (
    <div className="p-6 h-full flex flex-col gap-5">

      {/* ── Header ─────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Pipeline de Leads</h1>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {leads.length} lead{leads.length !== 1 ? 's' : ''} no total
            {totalValue > 0 && (
              <span style={{ color: '#d6b25e', marginLeft: 8, fontWeight: 600 }}>
                · R${(totalValue / 1000).toFixed(1)}k em aberto
              </span>
            )}
          </p>
        </div>

        {/* Form de novo lead */}
        <details className="relative">
          <summary
            className="cursor-pointer inline-flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all list-none"
            style={{
              background: 'linear-gradient(135deg, #d6b25e 0%, #f0d080 100%)',
              color: '#05050a',
              boxShadow: '0 4px 16px rgba(214,178,94,0.25)',
            }}
          >
            + Novo Lead
          </summary>
          <div
            className="absolute right-0 top-12 z-20 w-80 rounded-xl shadow-2xl p-5"
            style={{ background: '#0e0e14', border: '1px solid rgba(255,255,255,0.10)' }}
          >
            <h3 className="font-semibold text-white mb-4 text-sm">Adicionar Lead</h3>
            <form action={createLead} className="space-y-3">
              <input
                name="name"
                required
                placeholder="Nome do contato *"
                className="input-premium w-full"
                style={{ padding: '10px 14px', borderRadius: 10, fontSize: 14 }}
              />
              <input
                name="company"
                placeholder="Empresa"
                className="input-premium w-full"
                style={{ padding: '10px 14px', borderRadius: 10, fontSize: 14 }}
              />
              <input
                name="phone"
                placeholder="Telefone / WhatsApp"
                className="input-premium w-full"
                style={{ padding: '10px 14px', borderRadius: 10, fontSize: 14 }}
              />
              <input
                name="email"
                type="email"
                placeholder="E-mail"
                className="input-premium w-full"
                style={{ padding: '10px 14px', borderRadius: 10, fontSize: 14 }}
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  name="source"
                  className="input-premium w-full"
                  style={{ padding: '10px 14px', borderRadius: 10, fontSize: 14 }}
                >
                  <option value="manual">Manual</option>
                  <option value="instagram">Instagram</option>
                  <option value="google">Google</option>
                  <option value="referral">Indicação</option>
                  <option value="cold_call">Cold Call</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
                <input
                  name="estimated_monthly_value"
                  type="number"
                  placeholder="R$/mês"
                  min="0"
                  step="0.01"
                  className="input-premium w-full"
                  style={{ padding: '10px 14px', borderRadius: 10, fontSize: 14 }}
                />
              </div>
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
                Criar Lead
              </button>
            </form>
          </div>
        </details>
      </div>

      {/* ── Kanban ─────────────────────────────────── */}
      <div className="flex gap-4 overflow-x-auto pb-4 flex-1 items-start">
        {(['prospect', 'contacted', 'qualified', 'proposal', 'won', 'lost'] as LeadStage[]).map((stage) => (
          <StageColumn key={stage} stage={stage} leads={leads} />
        ))}
      </div>
    </div>
  )
}
