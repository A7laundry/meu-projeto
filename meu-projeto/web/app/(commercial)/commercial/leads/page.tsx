import { listLeads, createLead } from '@/actions/commercial/leads'
import { KanbanBoard } from '@/components/domain/commercial/kanban-board'

export const revalidate = 0

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

      {/* ── Kanban (drag & drop) ────────────────────── */}
      <KanbanBoard initialLeads={leads} />
    </div>
  )
}
