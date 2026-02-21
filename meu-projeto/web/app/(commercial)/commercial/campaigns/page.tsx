import { listCampaigns, createCampaign, updateCampaignStatus } from '@/actions/commercial/campaigns'
import type { Campaign, CampaignStatus } from '@/actions/commercial/campaigns'

export const revalidate = 0

const CHANNEL_ICONS: Record<string, string> = {
  instagram: '📷',
  google: '🔍',
  whatsapp: '💬',
  email: '✉️',
  referral: '🤝',
  offline: '📌',
}

const STATUS_COLORS: Record<CampaignStatus, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  paused: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-gray-100 text-gray-500',
}

const STATUS_LABELS: Record<CampaignStatus, string> = {
  active: 'Ativa',
  paused: 'Pausada',
  completed: 'Encerrada',
}

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const roi = campaign.spent > 0 && campaign.conversions > 0
    ? (campaign.conversions * (campaign.budget / Math.max(campaign.leads_generated, 1))) / campaign.spent
    : null
  const costPerLead = campaign.leads_generated > 0 ? campaign.spent / campaign.leads_generated : null
  const costPerConversion = campaign.conversions > 0 ? campaign.spent / campaign.conversions : null
  const budgetUsed = campaign.budget > 0 ? Math.min((campaign.spent / campaign.budget) * 100, 100) : 0

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{CHANNEL_ICONS[campaign.channel] ?? '📣'}</span>
          <div>
            <p className="font-semibold text-gray-800">{campaign.name}</p>
            <p className="text-xs text-gray-400 capitalize">{campaign.channel} · {campaign.objective}</p>
          </div>
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[campaign.status]}`}>
          {STATUS_LABELS[campaign.status]}
        </span>
      </div>

      {/* Barra de orçamento */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>R$ {Number(campaign.spent).toFixed(2).replace('.', ',')} gasto</span>
          <span>R$ {Number(campaign.budget).toFixed(2).replace('.', ',')} orçamento</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${budgetUsed >= 90 ? 'bg-red-400' : budgetUsed >= 70 ? 'bg-yellow-400' : 'bg-emerald-500'}`}
            style={{ width: `${budgetUsed}%` }}
          />
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-gray-50 rounded-lg p-2">
          <p className="text-lg font-bold text-gray-800">{campaign.leads_generated}</p>
          <p className="text-[10px] text-gray-400">Leads</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <p className="text-lg font-bold text-gray-800">{campaign.conversions}</p>
          <p className="text-[10px] text-gray-400">Conversões</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <p className="text-lg font-bold text-gray-800">
            {costPerLead ? `R$${costPerLead.toFixed(0)}` : '—'}
          </p>
          <p className="text-[10px] text-gray-400">Custo/Lead</p>
        </div>
      </div>

      {(costPerConversion || roi) && (
        <div className="grid grid-cols-2 gap-2 text-center">
          {costPerConversion && (
            <div className="bg-blue-50 rounded-lg p-2">
              <p className="text-sm font-bold text-blue-700">R$ {costPerConversion.toFixed(2).replace('.', ',')}</p>
              <p className="text-[10px] text-blue-400">Custo/Conversão</p>
            </div>
          )}
          {roi && (
            <div className="bg-emerald-50 rounded-lg p-2">
              <p className="text-sm font-bold text-emerald-700">{roi.toFixed(1)}x</p>
              <p className="text-[10px] text-emerald-400">ROI estimado</p>
            </div>
          )}
        </div>
      )}

      {/* Período */}
      <p className="text-xs text-gray-400">
        {new Date(campaign.starts_at).toLocaleDateString('pt-BR')}
        {campaign.ends_at ? ` → ${new Date(campaign.ends_at).toLocaleDateString('pt-BR')}` : ' → em andamento'}
      </p>

      {/* Toggle status */}
      {campaign.status !== 'completed' && (
        <form action={async () => {
          'use server'
          const nextStatus: CampaignStatus = campaign.status === 'active' ? 'paused' : 'active'
          await updateCampaignStatus(campaign.id, nextStatus)
        }}>
          <button
            type="submit"
            className="w-full text-xs text-gray-500 hover:text-gray-700 border border-gray-200 hover:border-gray-300 rounded-lg py-1.5 transition-colors"
          >
            {campaign.status === 'active' ? 'Pausar campanha' : 'Reativar campanha'}
          </button>
        </form>
      )}
    </div>
  )
}

export default async function CampaignsPage() {
  const campaigns = await listCampaigns()

  const active = campaigns.filter(c => c.status === 'active')
  const paused = campaigns.filter(c => c.status === 'paused')
  const completed = campaigns.filter(c => c.status === 'completed')

  const totalLeads = campaigns.reduce((s, c) => s + c.leads_generated, 0)
  const totalConversions = campaigns.reduce((s, c) => s + c.conversions, 0)
  const totalSpent = campaigns.reduce((s, c) => s + Number(c.spent ?? 0), 0)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campanhas</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {active.length} ativas · {totalLeads} leads · {totalConversions} conversões · R$ {totalSpent.toFixed(2).replace('.', ',')} investido
          </p>
        </div>

        <details className="relative">
          <summary className="cursor-pointer inline-flex items-center gap-2 bg-[#07070a] hover:bg-gray-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors list-none">
            + Nova Campanha
          </summary>
          <div className="absolute right-0 top-12 z-20 w-80 bg-white rounded-xl border border-gray-200 shadow-lg p-5">
            <h3 className="font-semibold text-gray-800 mb-4 text-sm">Criar Campanha</h3>
            <form action={createCampaign} className="space-y-3">
              <input
                name="name"
                required
                placeholder="Nome da campanha *"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#d6b25e]"
              />
              <div className="grid grid-cols-2 gap-2">
                <select name="channel" className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#d6b25e]">
                  <option value="instagram">Instagram</option>
                  <option value="google">Google</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">E-mail</option>
                  <option value="referral">Indicação</option>
                  <option value="offline">Offline</option>
                </select>
                <select name="objective" className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#d6b25e]">
                  <option value="leads">Geração de Leads</option>
                  <option value="brand">Branding</option>
                  <option value="retention">Retenção</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500">Orçamento (R$)</label>
                  <input name="budget" type="number" min="0" step="0.01" defaultValue="0"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#d6b25e]" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Início</label>
                  <input name="starts_at" type="date" required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#d6b25e]" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500">Término (opcional)</label>
                <input name="ends_at" type="date"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#d6b25e]" />
              </div>
              <button type="submit"
                className="w-full bg-[#07070a] text-white text-sm font-medium py-2 rounded-lg hover:bg-gray-800 transition-colors">
                Criar
              </button>
            </form>
          </div>
        </details>
      </div>

      {active.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Ativas</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {active.map(c => <CampaignCard key={c.id} campaign={c} />)}
          </div>
        </section>
      )}

      {paused.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Pausadas</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {paused.map(c => <CampaignCard key={c.id} campaign={c} />)}
          </div>
        </section>
      )}

      {completed.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Encerradas</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {completed.map(c => <CampaignCard key={c.id} campaign={c} />)}
          </div>
        </section>
      )}

      {campaigns.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">📣</p>
          <p className="text-lg font-medium">Nenhuma campanha ainda</p>
          <p className="text-sm mt-1">Crie sua primeira campanha para começar a rastrear leads.</p>
        </div>
      )}
    </div>
  )
}
