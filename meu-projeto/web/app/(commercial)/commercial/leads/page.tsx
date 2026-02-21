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

const STAGE_COLORS: Record<LeadStage, string> = {
  prospect: 'bg-gray-100 text-gray-600',
  contacted: 'bg-blue-100 text-blue-700',
  qualified: 'bg-purple-100 text-purple-700',
  proposal: 'bg-yellow-100 text-yellow-800',
  won: 'bg-emerald-100 text-emerald-700',
  lost: 'bg-red-100 text-red-600',
}

const STAGE_ORDER: LeadStage[] = ['prospect', 'contacted', 'qualified', 'proposal', 'won', 'lost']

function StageColumn({ stage, leads }: { stage: LeadStage; leads: Lead[] }) {
  const filtered = leads.filter(l => l.stage === stage)
  const totalValue = filtered.reduce((s, l) => s + Number(l.estimated_monthly_value ?? 0), 0)

  return (
    <div className="flex-shrink-0 w-72">
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${STAGE_COLORS[stage]}`}>
          {STAGE_LABELS[stage]}
        </span>
        <span className="text-xs text-gray-400">
          {filtered.length} {filtered.length !== 1 ? 'leads' : 'lead'}
          {totalValue > 0 && ` · R$ ${(totalValue / 1000).toFixed(1)}k`}
        </span>
      </div>

      <div className="space-y-2 min-h-[60px]">
        {filtered.map((lead) => (
          <Link
            key={lead.id}
            href={`/commercial/leads/${lead.id}`}
            className="block bg-white border border-gray-200 rounded-xl p-4 hover:border-[#d6b25e]/60 hover:shadow-sm transition-all group"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium text-gray-800 text-sm group-hover:text-[#b8921e] transition-colors truncate">
                {lead.name}
              </p>
              {lead.estimated_monthly_value > 0 && (
                <span className="text-xs text-gray-500 flex-shrink-0">
                  R$ {Number(lead.estimated_monthly_value).toFixed(0)}/mês
                </span>
              )}
            </div>
            {lead.company && (
              <p className="text-xs text-gray-400 mt-0.5 truncate">{lead.company}</p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                {lead.source}
              </span>
              {lead.phone && (
                <span className="text-[10px] text-gray-400 truncate">{lead.phone}</span>
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

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pipeline de Leads</h1>
          <p className="text-sm text-gray-500 mt-0.5">{leads.length} leads no total</p>
        </div>

        {/* Form de criação rápida */}
        <details className="relative">
          <summary className="cursor-pointer inline-flex items-center gap-2 bg-[#07070a] hover:bg-gray-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors list-none">
            + Novo Lead
          </summary>
          <div className="absolute right-0 top-12 z-20 w-80 bg-white rounded-xl border border-gray-200 shadow-lg p-5">
            <h3 className="font-semibold text-gray-800 mb-4 text-sm">Adicionar Lead</h3>
            <form action={createLead} className="space-y-3">
              <input
                name="name"
                required
                placeholder="Nome do contato *"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#d6b25e]"
              />
              <input
                name="company"
                placeholder="Empresa"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#d6b25e]"
              />
              <input
                name="phone"
                placeholder="Telefone / WhatsApp"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#d6b25e]"
              />
              <input
                name="email"
                type="email"
                placeholder="E-mail"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#d6b25e]"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  name="source"
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#d6b25e] bg-white"
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
                  placeholder="R$/mês est."
                  min="0"
                  step="0.01"
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#d6b25e]"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#07070a] text-white text-sm font-medium py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Criar Lead
              </button>
            </form>
          </div>
        </details>
      </div>

      {/* Kanban */}
      <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
        {STAGE_ORDER.map((stage) => (
          <StageColumn key={stage} stage={stage} leads={leads} />
        ))}
      </div>
    </div>
  )
}
