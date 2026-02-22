import { createAdminClient } from '@/lib/supabase/admin'
import type { LeadStage } from '@/actions/commercial/leads'

export const revalidate = 60

const STAGE_LABELS: Record<LeadStage, string> = {
  prospect: 'Prospecto',
  contacted: 'Contatado',
  qualified: 'Qualificado',
  proposal: 'Proposta',
  won: 'Ganho',
  lost: 'Perdido',
}

const STAGE_ORDER: LeadStage[] = ['prospect', 'contacted', 'qualified', 'proposal', 'won', 'lost']

const STAGE_DARK: Record<LeadStage, { bg: string; text: string; bar: string }> = {
  prospect:  { bg: 'rgba(255,255,255,0.05)',  text: 'rgba(255,255,255,0.45)', bar: 'rgba(255,255,255,0.20)' },
  contacted: { bg: 'rgba(96,165,250,0.10)',   text: 'rgba(96,165,250,0.80)',  bar: 'rgba(96,165,250,0.50)'  },
  qualified: { bg: 'rgba(167,139,250,0.10)',  text: 'rgba(167,139,250,0.80)', bar: 'rgba(167,139,250,0.50)' },
  proposal:  { bg: 'rgba(214,178,94,0.12)',   text: 'rgba(214,178,94,0.90)',  bar: 'rgba(214,178,94,0.60)'  },
  won:       { bg: 'rgba(52,211,153,0.10)',   text: 'rgba(52,211,153,0.85)',  bar: 'rgba(52,211,153,0.55)'  },
  lost:      { bg: 'rgba(248,113,113,0.08)',  text: 'rgba(248,113,113,0.70)', bar: 'rgba(248,113,113,0.45)' },
}

function fmtBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function fmtInt(v: number) {
  return v.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

async function getCommercialStats() {
  const supabase = createAdminClient()

  const { data: leads } = await supabase
    .from('leads')
    .select('stage, estimated_monthly_value, created_at')

  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('name, channel, budget, spent, leads_generated, conversions, status')
    .eq('status', 'active')

  const allLeads = leads ?? []
  const activeCampaigns = campaigns ?? []

  const byStage: Record<string, { count: number; value: number }> = {}
  for (const lead of allLeads) {
    if (!byStage[lead.stage]) byStage[lead.stage] = { count: 0, value: 0 }
    byStage[lead.stage].count++
    byStage[lead.stage].value += Number(lead.estimated_monthly_value ?? 0)
  }

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const recentLeads = allLeads.filter(l => new Date(l.created_at) >= thirtyDaysAgo).length

  const pipelineValue = allLeads
    .filter(l => !['won', 'lost'].includes(l.stage))
    .reduce((s, l) => s + Number(l.estimated_monthly_value ?? 0), 0)

  const wonLeads = allLeads.filter(l => l.stage === 'won').length
  const totalLeads = allLeads.filter(l => !['prospect'].includes(l.stage)).length
  const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0

  const totalBudget = activeCampaigns.reduce((s, c) => s + Number(c.budget ?? 0), 0)
  const totalSpent  = activeCampaigns.reduce((s, c) => s + Number(c.spent ?? 0), 0)
  const totalCampaignLeads = activeCampaigns.reduce((s, c) => s + (c.leads_generated ?? 0), 0)
  const costPerLead = totalCampaignLeads > 0 ? totalSpent / totalCampaignLeads : 0
  const budgetPct   = totalBudget > 0 ? Math.min(Math.round((totalSpent / totalBudget) * 100), 100) : 0

  return {
    byStage,
    recentLeads,
    pipelineValue,
    conversionRate,
    totalBudget,
    totalSpent,
    budgetPct,
    costPerLead,
    wonLeads,
    activeCampaigns,
    totalLeads: allLeads.length,
  }
}

const CARD = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 16,
  padding: '20px 22px',
} as const

export default async function CommercialDashboardPage() {
  const stats = await getCommercialStats()

  const kpis = [
    {
      label: 'Pipeline ativo',
      value: fmtBRL(stats.pipelineValue),
      sub: `${stats.totalLeads} leads no total`,
      accent: '#d6b25e',
      icon: '💰',
    },
    {
      label: 'Taxa de conversão',
      value: `${stats.conversionRate}%`,
      sub: `${stats.wonLeads} leads ganhos`,
      accent: '#34d399',
      icon: '✅',
    },
    {
      label: 'Leads (30 dias)',
      value: String(stats.recentLeads),
      sub: 'Novos captados',
      accent: '#60a5fa',
      icon: '📊',
    },
    {
      label: 'Custo / Lead',
      value: stats.costPerLead > 0 ? fmtBRL(stats.costPerLead) : '—',
      sub: 'Campanhas ativas',
      accent: '#a78bfa',
      icon: '🎯',
    },
  ]

  const maxStageCount = Math.max(...STAGE_ORDER.map(s => stats.byStage[s]?.count ?? 0), 1)

  return (
    <div className="p-6 space-y-8">

      {/* ── Header ─────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard Comercial</h1>
        <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Visão geral do pipeline e performance
        </p>
      </div>

      {/* ── KPIs ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} style={CARD}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{k.icon}</span>
              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.30)' }}>
                {k.label}
              </p>
            </div>
            <p className="text-2xl font-bold tabular-nums" style={{ color: k.accent }}>
              {k.value}
            </p>
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.28)' }}>
              {k.sub}
            </p>
          </div>
        ))}
      </div>

      {/* ── Funil de vendas ──────────────────────────── */}
      <section>
        <p className="text-[11px] font-semibold uppercase tracking-wider mb-4" style={{ color: 'rgba(255,255,255,0.30)' }}>
          Funil de Vendas
        </p>
        <div style={CARD}>
          <div className="space-y-4">
            {STAGE_ORDER.map((stage) => {
              const stageData = stats.byStage[stage] ?? { count: 0, value: 0 }
              const widthPct  = Math.max((stageData.count / maxStageCount) * 100, stageData.count > 0 ? 4 : 0)
              const theme     = STAGE_DARK[stage]
              return (
                <div key={stage} className="flex items-center gap-4">
                  <div className="w-28 flex-shrink-0">
                    <span
                      className="inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: theme.bg, color: theme.text }}
                    >
                      {STAGE_LABELS[stage]}
                    </span>
                  </div>
                  <div
                    className="flex-1 rounded-full overflow-hidden"
                    style={{ height: 6, background: 'rgba(255,255,255,0.05)' }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${widthPct}%`, background: theme.bar }}
                    />
                  </div>
                  <div className="w-24 text-right flex-shrink-0">
                    <span className="text-sm font-semibold tabular-nums text-white">{stageData.count}</span>
                    {stageData.value > 0 && (
                      <span className="text-xs ml-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        R${(stageData.value / 1000).toFixed(1)}k
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Campanhas ────────────────────────────────── */}
      <section>
        <p className="text-[11px] font-semibold uppercase tracking-wider mb-4" style={{ color: 'rgba(255,255,255,0.30)' }}>
          Campanhas Ativas
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Card orçamento total */}
          <div style={CARD}>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-3" style={{ color: 'rgba(255,255,255,0.30)' }}>
              Orçamento total
            </p>
            <p className="text-2xl font-bold tabular-nums" style={{ color: '#d6b25e' }}>
              R$ {fmtInt(stats.totalBudget)}
            </p>
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
              R$ {fmtInt(stats.totalSpent)} investido ({stats.budgetPct}%)
            </p>
          </div>

          {/* Barra de progresso */}
          <div style={{ ...CARD, padding: '20px 22px', gridColumn: 'span 2 / span 2' }}>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-4" style={{ color: 'rgba(255,255,255,0.30)' }}>
              Progresso dos orçamentos
            </p>
            <div className="rounded-full overflow-hidden" style={{ height: 8, background: 'rgba(255,255,255,0.05)' }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${stats.budgetPct}%`, background: 'linear-gradient(90deg, #34d399 0%, #10b981 100%)' }}
              />
            </div>
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {fmtBRL(stats.totalSpent)} gasto
              </p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {fmtBRL(stats.totalBudget)} total
              </p>
            </div>
          </div>
        </div>

        {/* Lista de campanhas */}
        {stats.activeCampaigns.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mt-3">
            {stats.activeCampaigns.map((c, i) => {
              const pct = Number(c.budget) > 0 ? Math.min(Math.round((Number(c.spent) / Number(c.budget)) * 100), 100) : 0
              const convRate = (c.leads_generated ?? 0) > 0 ? Math.round(((c.conversions ?? 0) / (c.leads_generated ?? 1)) * 100) : 0
              return (
                <div
                  key={i}
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 12,
                    padding: '16px 18px',
                  }}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <p className="text-sm font-semibold text-white truncate">{c.name}</p>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 font-medium"
                      style={{ background: 'rgba(52,211,153,0.10)', color: 'rgba(52,211,153,0.80)' }}
                    >
                      ativa
                    </span>
                  </div>
                  <div className="space-y-1 text-xs" style={{ color: 'rgba(255,255,255,0.40)' }}>
                    <div className="flex justify-between">
                      <span>Leads gerados</span>
                      <span className="text-white font-medium">{c.leads_generated ?? 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Conversões</span>
                      <span style={{ color: '#34d399', fontWeight: 600 }}>{c.conversions ?? 0} ({convRate}%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Gasto / orçamento</span>
                      <span className="text-white">{pct}%</span>
                    </div>
                  </div>
                  <div className="mt-3 rounded-full overflow-hidden" style={{ height: 3, background: 'rgba(255,255,255,0.05)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, background: 'rgba(214,178,94,0.60)' }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
