import { Truck, Package, MapPin, Clock, AlertTriangle, CheckCircle } from 'lucide-react'

export default function LogisticsPage() {
  const stats = [
    { label: 'Rotas ativas', value: '8', icon: MapPin, color: '#3b82f6', trend: 'Hoje' },
    { label: 'Entregas', value: '34', icon: Package, color: '#10b981', trend: '28 concluídas' },
    { label: 'Coletas', value: '19', icon: Truck, color: '#f97316', trend: '12 pendentes' },
    { label: 'Tempo médio', value: '42min', icon: Clock, color: '#8b5cf6', trend: 'Por parada' },
  ]

  const routes = [
    { name: 'Rota Centro-Paulista', driver: 'João Motorista', stops: 5, completed: 3, status: 'em_rota', shift: 'Manhã' },
    { name: 'Rota Sul-Clínicas', driver: 'João Motorista', stops: 4, completed: 0, status: 'pendente', shift: 'Tarde' },
    { name: 'Rota Norte-Hotéis', driver: 'Pedro Costa', stops: 6, completed: 6, status: 'concluida', shift: 'Manhã' },
    { name: 'Rota Leste-Restaurantes', driver: 'Maria Santos', stops: 3, completed: 1, status: 'em_rota', shift: 'Manhã' },
  ]

  const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
    em_rota:   { label: 'Em rota', color: '#3b82f6', icon: Truck },
    pendente:  { label: 'Pendente', color: '#f59e0b', icon: Clock },
    concluida: { label: 'Concluída', color: '#10b981', icon: CheckCircle },
    atrasada:  { label: 'Atrasada', color: '#f87171', icon: AlertTriangle },
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <p className="text-overline mb-2">Departamento</p>
        <h1 className="text-display-lg text-white">Logística</h1>
        <p className="text-sm text-white/40 mt-2">Rotas, coletas, entregas e romaneios</p>
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

      {/* Rotas do dia */}
      <section className="space-y-4">
        <h2 className="section-title">Rotas do Dia</h2>
        <div className="space-y-3">
          {routes.map((r) => {
            const sc = statusConfig[r.status]
            const StatusIcon = sc.icon
            const progressPct = r.stops > 0 ? Math.round((r.completed / r.stops) * 100) : 0
            return (
              <div key={r.name} className="card-dark rounded-xl p-5 animate-fade-up">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${sc.color}15`, border: `1px solid ${sc.color}25` }}>
                      <StatusIcon size={16} style={{ color: sc.color }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{r.name}</p>
                      <p className="text-xs text-white/35">{r.driver} · {r.shift}</p>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: `${sc.color}12`, color: sc.color, border: `1px solid ${sc.color}25` }}>
                    {sc.label}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 rounded-full bg-white/06 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progressPct}%`, background: sc.color }} />
                  </div>
                  <span className="text-xs text-white/40 num-stat flex-shrink-0">{r.completed}/{r.stops} paradas</span>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
