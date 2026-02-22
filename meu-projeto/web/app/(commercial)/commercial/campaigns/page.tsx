import Link from 'next/link'
import { listCampaigns, createCampaign, updateCampaignStatus } from '@/actions/commercial/campaigns'
import type { Campaign, CampaignStatus } from '@/actions/commercial/campaigns'

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

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const costPerLead       = campaign.leads_generated > 0 ? campaign.spent / campaign.leads_generated : null
  const costPerConversion = campaign.conversions > 0 ? campaign.spent / campaign.conversions : null
  const roi = campaign.spent > 0 && campaign.conversions > 0
    ? (campaign.conversions * (campaign.budget / Math.max(campaign.leads_generated, 1))) / campaign.spent
    : null
  const budgetUsed = campaign.budget > 0 ? Math.min((campaign.spent / campaign.budget) * 100, 100) : 0
  const status = STATUS_DARK[campaign.status]

  const barColor = budgetUsed >= 90
    ? 'rgba(248,113,113,0.70)'
    : budgetUsed >= 70
      ? 'rgba(251,191,36,0.70)'
      : 'rgba(52,211,153,0.65)'

  return (
    <div
      className="rounded-2xl space-y-4"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        padding: '18px 20px',
      }}
    >
      {/* Título + status */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{CHANNEL_ICONS[campaign.channel] ?? '📣'}</span>
          <div>
            <p className="font-semibold text-white/85">{campaign.name}</p>
            <p className="text-[11px] capitalize mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {campaign.channel} · {campaign.objective}
            </p>
          </div>
        </div>
        <span
          className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex-shrink-0"
          style={{ background: status.bg, color: status.color }}
        >
          {status.label}
        </span>
      </div>

      {/* Barra de orçamento */}
      <div>
        <div className="flex justify-between mb-1.5">
          <span className="text-xs tabular-nums" style={{ color: 'rgba(255,255,255,0.40)' }}>
            R$ {Number(campaign.spent).toFixed(2).replace('.', ',')} gasto
          </span>
          <span className="text-xs tabular-nums" style={{ color: 'rgba(255,255,255,0.30)' }}>
            R$ {Number(campaign.budget).toFixed(2).replace('.', ',')} orçamento
          </span>
        </div>
        <div className="rounded-full overflow-hidden" style={{ height: 5, background: 'rgba(255,255,255,0.06)' }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${budgetUsed}%`, background: barColor }}
          />
        </div>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { val: String(campaign.leads_generated), label: 'Leads' },
          { val: String(campaign.conversions), label: 'Conversões' },
          { val: costPerLead ? `R$${costPerLead.toFixed(0)}` : '—', label: 'Custo/Lead' },
        ].map((m) => (
          <div
            key={m.label}
            className="rounded-xl py-2.5"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <p className="text-base font-bold tabular-nums text-white/80">{m.val}</p>
            <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.28)' }}>{m.label}</p>
          </div>
        ))}
      </div>

      {/* Métricas secundárias */}
      {(costPerConversion || roi) && (
        <div className="grid grid-cols-2 gap-2 text-center">
          {costPerConversion && (
            <div
              className="rounded-xl py-2"
              style={{ background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.12)' }}
            >
              <p className="text-sm font-bold tabular-nums" style={{ color: 'rgba(96,165,250,0.85)' }}>
                R$ {costPerConversion.toFixed(2).replace('.', ',')}
              </p>
              <p className="text-[10px]" style={{ color: 'rgba(96,165,250,0.55)' }}>Custo/Conversão</p>
            </div>
          )}
          {roi && (
            <div
              className="rounded-xl py-2"
              style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.14)' }}
            >
              <p className="text-sm font-bold tabular-nums" style={{ color: 'rgba(52,211,153,0.90)' }}>
                {roi.toFixed(1)}x
              </p>
              <p className="text-[10px]" style={{ color: 'rgba(52,211,153,0.50)' }}>ROI estimado</p>
            </div>
          )}
        </div>
      )}

      {/* Período */}
      <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.28)' }}>
        📅 {new Date(campaign.starts_at).toLocaleDateString('pt-BR')}
        {campaign.ends_at
          ? ` → ${new Date(campaign.ends_at).toLocaleDateString('pt-BR')}`
          : ' → em andamento'}
      </p>

      {/* Ações */}
      <div className="flex gap-2">
        <Link
          href={`/commercial/campaigns/${campaign.id}`}
          className="flex-1 text-center text-xs py-2 rounded-xl transition-all"
          style={{
            border: '1px solid rgba(214,178,94,0.20)',
            color: 'rgba(214,178,94,0.75)',
            background: 'rgba(214,178,94,0.06)',
            textDecoration: 'none',
          }}
        >
          Ver detalhes →
        </Link>
        {campaign.status !== 'completed' && (
          <form action={async () => {
            'use server'
            const nextStatus: CampaignStatus = campaign.status === 'active' ? 'paused' : 'active'
            await updateCampaignStatus(campaign.id, nextStatus)
          }} className="flex-1">
            <button
              type="submit"
              className="w-full text-xs py-2 rounded-xl transition-all"
              style={{
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.38)',
                background: 'transparent',
              }}
            >
              {campaign.status === 'active' ? 'Pausar' : 'Reativar'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default async function CampaignsPage() {
  const campaigns = await listCampaigns()

  const active    = campaigns.filter(c => c.status === 'active')
  const paused    = campaigns.filter(c => c.status === 'paused')
  const completed = campaigns.filter(c => c.status === 'completed')

  const totalLeads       = campaigns.reduce((s, c) => s + c.leads_generated, 0)
  const totalConversions = campaigns.reduce((s, c) => s + c.conversions, 0)
  const totalSpent       = campaigns.reduce((s, c) => s + Number(c.spent ?? 0), 0)

  return (
    <div className="p-6 space-y-6">

      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Campanhas</h1>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {active.length} ativa{active.length !== 1 ? 's' : ''}
            {' · '}{totalLeads} leads
            {' · '}{totalConversions} conversões
            {' · '}
            <span style={{ color: '#d6b25e', fontWeight: 600 }}>
              R$ {totalSpent.toFixed(2).replace('.', ',')} investido
            </span>
          </p>
        </div>

        {/* Form nova campanha */}
        <details className="relative">
          <summary
            className="cursor-pointer inline-flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all list-none"
            style={{
              background: 'linear-gradient(135deg, #d6b25e 0%, #f0d080 100%)',
              color: '#05050a',
              boxShadow: '0 4px 16px rgba(214,178,94,0.22)',
            }}
          >
            + Nova Campanha
          </summary>
          <div
            className="absolute right-0 top-12 z-20 w-80 rounded-xl shadow-2xl p-5"
            style={{ background: '#0e0e14', border: '1px solid rgba(255,255,255,0.10)' }}
          >
            <h3 className="font-semibold text-white mb-4 text-sm">Criar Campanha</h3>
            <form action={createCampaign} className="space-y-3">
              <input
                name="name"
                required
                placeholder="Nome da campanha *"
                className="input-premium w-full"
                style={{ padding: '10px 14px', borderRadius: 10, fontSize: 14 }}
              />
              <div className="grid grid-cols-2 gap-2">
                <select name="channel" className="input-premium w-full" style={{ padding: '10px 14px', borderRadius: 10, fontSize: 14 }}>
                  <option value="instagram">Instagram</option>
                  <option value="google">Google</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">E-mail</option>
                  <option value="referral">Indicação</option>
                  <option value="offline">Offline</option>
                </select>
                <select name="objective" className="input-premium w-full" style={{ padding: '10px 14px', borderRadius: 10, fontSize: 14 }}>
                  <option value="leads">Geração de Leads</option>
                  <option value="brand">Branding</option>
                  <option value="retention">Retenção</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>Orçamento (R$)</label>
                  <input name="budget" type="number" min="0" step="0.01" defaultValue="0"
                    className="input-premium w-full" style={{ padding: '10px 14px', borderRadius: 10, fontSize: 14 }} />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>Início</label>
                  <input name="starts_at" type="date" required
                    className="input-premium w-full" style={{ padding: '10px 14px', borderRadius: 10, fontSize: 14, colorScheme: 'dark' }} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>Término (opcional)</label>
                <input name="ends_at" type="date"
                  className="input-premium w-full" style={{ padding: '10px 14px', borderRadius: 10, fontSize: 14, colorScheme: 'dark' }} />
              </div>
              <button
                type="submit"
                className="w-full text-sm font-semibold py-2.5 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, #d6b25e 0%, #f0d080 100%)',
                  color: '#05050a',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Criar
              </button>
            </form>
          </div>
        </details>
      </div>

      {/* ── Ativas ───────────────────────────────────────── */}
      {active.length > 0 && (
        <section>
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: 'rgba(255,255,255,0.28)' }}>
            Ativas
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {active.map(c => <CampaignCard key={c.id} campaign={c} />)}
          </div>
        </section>
      )}

      {/* ── Pausadas ─────────────────────────────────────── */}
      {paused.length > 0 && (
        <section>
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: 'rgba(255,255,255,0.28)' }}>
            Pausadas
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {paused.map(c => <CampaignCard key={c.id} campaign={c} />)}
          </div>
        </section>
      )}

      {/* ── Encerradas ───────────────────────────────────── */}
      {completed.length > 0 && (
        <section>
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: 'rgba(255,255,255,0.28)' }}>
            Encerradas
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {completed.map(c => <CampaignCard key={c.id} campaign={c} />)}
          </div>
        </section>
      )}

      {/* ── Empty state ──────────────────────────────────── */}
      {campaigns.length === 0 && (
        <div
          className="rounded-2xl py-20 text-center"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-4xl mb-3">📣</p>
          <p className="text-lg font-medium text-white/60">Nenhuma campanha ainda</p>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.30)' }}>
            Crie sua primeira campanha para começar a rastrear leads.
          </p>
        </div>
      )}
    </div>
  )
}
