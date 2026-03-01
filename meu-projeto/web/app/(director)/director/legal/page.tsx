import { Scale, FileText, AlertTriangle, CheckCircle, Clock, Shield } from 'lucide-react'

export default function LegalPage() {
  const stats = [
    { label: 'Contratos ativos', value: '23', icon: FileText, color: '#3b82f6', trend: '3 vencem este mês' },
    { label: 'Conformidade', value: '96%', icon: Shield, color: '#10b981', trend: 'Score geral' },
    { label: 'Pendências', value: '4', icon: Clock, color: '#f59e0b', trend: 'Aguardando revisão' },
    { label: 'Processos', value: '1', icon: Scale, color: '#8b5cf6', trend: 'Em andamento' },
  ]

  const contracts = [
    { client: 'Hotel Grand Palace', type: 'Serviço recorrente', expires: '15/06/2026', status: 'ativo', value: 'R$ 4.800/mês' },
    { client: 'Restaurante Bella Cucina', type: 'Serviço recorrente', expires: '22/03/2026', status: 'vencendo', value: 'R$ 1.200/mês' },
    { client: 'Clínica São Lucas', type: 'Serviço recorrente', expires: '10/09/2026', status: 'ativo', value: 'R$ 3.200/mês' },
    { client: 'Academia FitLife', type: 'Serviço avulso', expires: '01/04/2026', status: 'vencendo', value: 'R$ 800/mês' },
  ]

  const compliance = [
    { item: 'Alvará de funcionamento', status: 'ok', expires: '12/2026' },
    { item: 'Licença ambiental (CETESB)', status: 'ok', expires: '08/2026' },
    { item: 'PPRA / PCMSO', status: 'atencao', expires: '04/2026' },
    { item: 'Certificado INMETRO — balanças', status: 'ok', expires: '11/2026' },
    { item: 'Contrato social atualizado', status: 'ok', expires: '—' },
  ]

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <p className="text-overline mb-2">Departamento</p>
        <h1 className="text-display-lg text-white">Jurídico</h1>
        <p className="text-sm text-white/40 mt-2">Contratos, conformidade e processos</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="card-stat rounded-xl p-5 animate-fade-up">
            <div className="flex items-center justify-between mb-3">
              <s.icon size={18} style={{ color: s.color }} />
              <span className="text-[10px] text-white/30">{s.trend}</span>
            </div>
            <p className="stat-number text-2xl text-white">{s.value}</p>
            <p className="text-xs text-white/40 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Contratos */}
      <section className="space-y-4">
        <h2 className="section-title">Contratos</h2>
        <div className="space-y-2">
          {contracts.map((c) => (
            <div key={c.client} className={`rounded-xl px-5 py-4 flex items-center gap-4 animate-fade-up ${c.status === 'vencendo' ? 'card-warn' : 'card-dark'}`}>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{c.client}</p>
                <p className="text-xs text-white/35">{c.type}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-medium text-white/70 num-stat">{c.value}</p>
                <p className="text-[10px] text-white/30">Vence: {c.expires}</p>
              </div>
              <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{
                background: c.status === 'ativo' ? 'rgba(52,211,153,0.10)' : 'rgba(251,191,36,0.10)',
                color: c.status === 'ativo' ? '#34d399' : '#fbbf24',
                border: `1px solid ${c.status === 'ativo' ? 'rgba(52,211,153,0.25)' : 'rgba(251,191,36,0.25)'}`,
              }}>
                {c.status === 'ativo' ? <CheckCircle size={10} /> : <AlertTriangle size={10} />}
                {c.status === 'ativo' ? 'Ativo' : 'Vencendo'}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Conformidade */}
      <section className="space-y-4">
        <h2 className="section-title">Conformidade & Licenças</h2>
        <div className="card-dark rounded-xl overflow-hidden">
          {compliance.map((c, i) => (
            <div key={c.item} className={`px-5 py-3 flex items-center justify-between ${i > 0 ? 'border-t border-white/05' : ''}`}>
              <div className="flex items-center gap-3">
                {c.status === 'ok' ? (
                  <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                ) : (
                  <AlertTriangle size={14} className="text-yellow-400 flex-shrink-0" />
                )}
                <p className="text-sm text-white/70">{c.item}</p>
              </div>
              <span className="text-xs text-white/30 num-stat">{c.expires}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
