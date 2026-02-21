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

const STAGE_COLORS: Record<LeadStage, string> = {
  prospect: 'bg-gray-200 text-gray-700',
  contacted: 'bg-blue-100 text-blue-700',
  qualified: 'bg-purple-100 text-purple-700',
  proposal: 'bg-yellow-100 text-yellow-800',
  won: 'bg-emerald-100 text-emerald-700',
  lost: 'bg-red-100 text-red-700',
}

async function getCommercialStats() {
  const supabase = createAdminClient()

  const { data: leads } = await supabase
    .from('leads')
    .select('stage, estimated_monthly_value, created_at')

  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('budget, spent, leads_generated, conversions, status')
    .eq('status', 'active')

  const allLeads = leads ?? []
  const activeCampaigns = campaigns ?? []

  // Agrupamento por estágio
  const byStage: Record<string, { count: number; value: number }> = {}
  for (const lead of allLeads) {
    if (!byStage[lead.stage]) byStage[lead.stage] = { count: 0, value: 0 }
    byStage[lead.stage].count++
    byStage[lead.stage].value += Number(lead.estimated_monthly_value ?? 0)
  }

  // Leads criados nos últimos 30 dias
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const recentLeads = allLeads.filter(l => new Date(l.created_at) >= thirtyDaysAgo).length

  // Pipeline total (ganhos em andamento)
  const pipelineValue = allLeads
    .filter(l => !['won', 'lost'].includes(l.stage))
    .reduce((s, l) => s + Number(l.estimated_monthly_value ?? 0), 0)

  const wonLeads = allLeads.filter(l => l.stage === 'won').length
  const totalLeads = allLeads.filter(l => !['prospect'].includes(l.stage)).length
  const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0

  // Total gasto em campanhas ativas
  const totalBudget = activeCampaigns.reduce((s, c) => s + Number(c.budget ?? 0), 0)
  const totalSpent = activeCampaigns.reduce((s, c) => s + Number(c.spent ?? 0), 0)
  const totalCampaignLeads = activeCampaigns.reduce((s, c) => s + (c.leads_generated ?? 0), 0)
  const costPerLead = totalCampaignLeads > 0 ? totalSpent / totalCampaignLeads : 0

  return {
    byStage,
    recentLeads,
    pipelineValue,
    conversionRate,
    totalBudget,
    totalSpent,
    costPerLead,
    wonLeads,
  }
}

export default async function CommercialDashboardPage() {
  const stats = await getCommercialStats()

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Comercial</h1>
        <p className="text-sm text-gray-500 mt-0.5">Visão geral do pipeline e performance</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Pipeline (R$/mês)</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            R$ {stats.pipelineValue.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Leads em aberto</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Taxa de Conversão</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.conversionRate}%</p>
          <p className="text-xs text-gray-400 mt-0.5">{stats.wonLeads} ganhos</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Leads (30 dias)</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.recentLeads}</p>
          <p className="text-xs text-gray-400 mt-0.5">Novos leads captados</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Custo/Lead</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {stats.costPerLead > 0 ? `R$ ${stats.costPerLead.toFixed(2).replace('.', ',')}` : '—'}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Campanhas ativas</p>
        </div>
      </div>

      {/* Funil de vendas */}
      <section>
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
          Funil de Vendas
        </h2>
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="space-y-3">
            {STAGE_ORDER.map((stage) => {
              const stageData = stats.byStage[stage] ?? { count: 0, value: 0 }
              const maxCount = Math.max(...STAGE_ORDER.map(s => stats.byStage[s]?.count ?? 0), 1)
              const widthPct = Math.max((stageData.count / maxCount) * 100, 4)
              return (
                <div key={stage} className="flex items-center gap-4">
                  <div className="w-28 flex-shrink-0">
                    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${STAGE_COLORS[stage]}`}>
                      {STAGE_LABELS[stage]}
                    </span>
                  </div>
                  <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#d6b25e]/80 to-[#d6b25e] transition-all"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                  <div className="w-24 text-right flex-shrink-0">
                    <span className="text-sm font-semibold text-gray-700">{stageData.count}</span>
                    {stageData.value > 0 && (
                      <span className="text-xs text-gray-400 ml-1">
                        · R${(stageData.value / 1000).toFixed(1)}k
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Campanhas ativas */}
      <section>
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
          Campanhas Ativas
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-1">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Orçamento total</p>
            <p className="text-2xl font-bold text-gray-900">
              R$ {stats.totalBudget.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
            </p>
            <p className="text-xs text-gray-400">
              R$ {stats.totalSpent.toFixed(0)} investido ({stats.totalBudget > 0 ? Math.round((stats.totalSpent / stats.totalBudget) * 100) : 0}%)
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 col-span-2">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Progresso dos orçamentos</p>
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${stats.totalBudget > 0 ? Math.min((stats.totalSpent / stats.totalBudget) * 100, 100) : 0}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              R$ {stats.totalSpent.toFixed(2).replace('.', ',')} de R$ {stats.totalBudget.toFixed(2).replace('.', ',')} gasto
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
