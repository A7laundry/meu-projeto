import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getCampaign, updateCampaign, updateCampaignStatus } from '@/actions/commercial/campaigns'
import type { CampaignChannel, CampaignStatus } from '@/actions/commercial/campaigns'

export const revalidate = 0

const CHANNEL_ICONS: Record<string, string> = {
  instagram: '📷',
  google:    '🔍',
  whatsapp:  '💬',
  email:     '✉️',
  referral:  '🤝',
  offline:   '📌',
}

const STATUS_DARK: Record<CampaignStatus, { bg: string; color: string; label: string }> = {
  active:    { bg: 'rgba(52,211,153,0.10)',  color: 'rgba(52,211,153,0.85)',  label: 'Ativa'     },
  paused:    { bg: 'rgba(251,191,36,0.10)',  color: 'rgba(251,191,36,0.85)',  label: 'Pausada'   },
  completed: { bg: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.40)', label: 'Encerrada' },
}

const FIELD: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: 10,
  color: 'rgba(255,255,255,0.85)',
  fontSize: 14,
  padding: '10px 14px',
  width: '100%',
  outline: 'none',
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function CampaignDetailPage({ params }: Props) {
  const { id } = await params
  const campaign = await getCampaign(id)
  if (!campaign) notFound()

  const status           = STATUS_DARK[campaign.status]
  const costPerLead      = campaign.leads_generated > 0 ? campaign.spent / campaign.leads_generated : null
  const costPerConv      = campaign.conversions > 0 ? campaign.spent / campaign.conversions : null
  const convRate         = campaign.leads_generated > 0 ? (campaign.conversions / campaign.leads_generated) * 100 : null
  const budgetUsed       = campaign.budget > 0 ? Math.min((campaign.spent / campaign.budget) * 100, 100) : 0
  const barColor         = budgetUsed >= 90 ? 'rgba(248,113,113,0.70)' : budgetUsed >= 70 ? 'rgba(251,191,36,0.70)' : 'rgba(52,211,153,0.65)'

  const updateAction = updateCampaign.bind(null, id)

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">

      {/* ── Breadcrumb ────────────────────────────── */}
      <div className="flex items-center gap-2 text-sm">
        <Link
          href="/commercial/campaigns"
          className="transition-colors"
          style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}
        >
          Campanhas
        </Link>
        <span style={{ color: 'rgba(255,255,255,0.20)' }}>/</span>
        <span style={{ color: 'rgba(255,255,255,0.70)' }}>{campaign.name}</span>
      </div>

      {/* ── Header ────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <span className="text-4xl">{CHANNEL_ICONS[campaign.channel] ?? '📣'}</span>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{campaign.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span
                className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                style={{ background: status.bg, color: status.color }}
              >
                {status.label}
              </span>
              <span className="text-xs capitalize" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {campaign.channel} · {campaign.objective}
              </span>
            </div>
          </div>
        </div>

        {/* Ação de status */}
        {campaign.status !== 'completed' && (
          <form action={async () => {
            'use server'
            const next: CampaignStatus = campaign.status === 'active' ? 'paused' : 'active'
            await updateCampaignStatus(id, next)
          }}>
            <button
              type="submit"
              className="text-sm px-4 py-2 rounded-xl transition-all"
              style={{
                border: '1px solid rgba(255,255,255,0.10)',
                color: 'rgba(255,255,255,0.45)',
                background: 'transparent',
                cursor: 'pointer',
              }}
            >
              {campaign.status === 'active' ? '⏸ Pausar campanha' : '▶ Reativar campanha'}
            </button>
          </form>
        )}
      </div>

      {/* ── KPIs ──────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Leads gerados',  val: String(campaign.leads_generated), color: 'rgba(96,165,250,0.85)' },
          { label: 'Conversões',     val: String(campaign.conversions),      color: 'rgba(52,211,153,0.85)' },
          { label: 'Custo / Lead',   val: costPerLead ? `R$${costPerLead.toFixed(2).replace('.', ',')}` : '—', color: 'rgba(214,178,94,0.90)' },
          { label: 'Custo / Conv.',  val: costPerConv ? `R$${costPerConv.toFixed(2).replace('.', ',')}` : '—', color: 'rgba(167,139,250,0.85)' },
        ].map((k) => (
          <div
            key={k.label}
            className="rounded-2xl p-4 text-center"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <p className="text-xl font-bold tabular-nums" style={{ color: k.color }}>{k.val}</p>
            <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{k.label}</p>
          </div>
        ))}
      </div>

      {/* ── Orçamento ─────────────────────────────── */}
      <div
        className="rounded-2xl p-5 space-y-3"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="flex justify-between items-center">
          <p className="text-sm font-semibold text-white/70">Orçamento</p>
          {convRate !== null && (
            <span className="text-xs tabular-nums" style={{ color: 'rgba(52,211,153,0.75)' }}>
              {convRate.toFixed(1)}% taxa de conversão
            </span>
          )}
        </div>
        <div className="flex justify-between text-xs tabular-nums mb-1.5">
          <span style={{ color: 'rgba(255,255,255,0.50)' }}>
            R$ {Number(campaign.spent).toFixed(2).replace('.', ',')} gasto
          </span>
          <span style={{ color: 'rgba(255,255,255,0.30)' }}>
            R$ {Number(campaign.budget).toFixed(2).replace('.', ',')} total
          </span>
        </div>
        <div className="rounded-full overflow-hidden" style={{ height: 8, background: 'rgba(255,255,255,0.06)' }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${budgetUsed}%`, background: barColor }}
          />
        </div>
        <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
          {budgetUsed.toFixed(1)}% do orçamento utilizado
        </p>
      </div>

      {/* ── Período ───────────────────────────────── */}
      <div
        className="rounded-2xl p-4 flex items-center gap-6 flex-wrap"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div>
          <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>Início</p>
          <p className="text-sm font-medium text-white/70">
            {new Date(campaign.starts_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <span style={{ color: 'rgba(255,255,255,0.20)' }}>→</span>
        <div>
          <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>Término</p>
          <p className="text-sm font-medium text-white/70">
            {campaign.ends_at
              ? new Date(campaign.ends_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
              : 'Em andamento'}
          </p>
        </div>
      </div>

      {/* ── Editar campanha ───────────────────────── */}
      <div
        className="rounded-2xl p-5 space-y-4"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <p className="text-sm font-semibold text-white/70">Editar campanha</p>
        <form action={updateAction} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>Nome</label>
              <input name="name" required defaultValue={campaign.name} style={FIELD} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>Canal</label>
                <select name="channel" defaultValue={campaign.channel} style={FIELD}>
                  {(['instagram', 'google', 'whatsapp', 'email', 'referral', 'offline'] as CampaignChannel[]).map(ch => (
                    <option key={ch} value={ch} style={{ background: '#0e0e14' }}>{ch}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>Objetivo</label>
                <select name="objective" defaultValue={campaign.objective} style={FIELD}>
                  <option value="leads" style={{ background: '#0e0e14' }}>Leads</option>
                  <option value="brand" style={{ background: '#0e0e14' }}>Branding</option>
                  <option value="retention" style={{ background: '#0e0e14' }}>Retenção</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>Orçamento (R$)</label>
              <input name="budget" type="number" min="0" step="0.01" defaultValue={campaign.budget} style={FIELD} />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>Gasto (R$)</label>
              <input name="spent" type="number" min="0" step="0.01" defaultValue={campaign.spent} style={FIELD} />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>Leads gerados</label>
              <input name="leads_generated" type="number" min="0" defaultValue={campaign.leads_generated} style={FIELD} />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>Conversões</label>
              <input name="conversions" type="number" min="0" defaultValue={campaign.conversions} style={FIELD} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>Término (opcional)</label>
            <input
              name="ends_at"
              type="date"
              defaultValue={campaign.ends_at ?? ''}
              style={{ ...FIELD, colorScheme: 'dark' }}
            />
          </div>

          <button
            type="submit"
            className="text-sm font-semibold px-5 py-2.5 rounded-xl transition-all"
            style={{
              background: 'linear-gradient(135deg, #d6b25e 0%, #f0d080 100%)',
              color: '#05050a',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Salvar alterações
          </button>
        </form>
      </div>
    </div>
  )
}
