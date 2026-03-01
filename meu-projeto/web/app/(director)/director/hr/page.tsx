import { UserCog, Users, Clock, Award, TrendingUp, CalendarDays } from 'lucide-react'

export default function HRPage() {
  const stats = [
    { label: 'Colaboradores', value: '47', icon: Users, color: '#3b82f6', trend: '+3 este mês' },
    { label: 'Turnover', value: '4.2%', icon: TrendingUp, color: '#10b981', trend: 'Meta: < 5%' },
    { label: 'Horas Extras', value: '128h', icon: Clock, color: '#f59e0b', trend: 'Últimos 30 dias' },
    { label: 'Treinamentos', value: '12', icon: Award, color: '#8b5cf6', trend: 'Realizados no mês' },
  ]

  const teams = [
    { unit: 'Unidade Centro', headcount: 28, sectors: ['Triagem (4)', 'Lavagem (6)', 'Secagem (4)', 'Passadoria (5)', 'Expedição (3)', 'Admin (6)'] },
    { unit: 'Unidade Norte', headcount: 19, sectors: ['Triagem (3)', 'Lavagem (4)', 'Secagem (3)', 'Passadoria (3)', 'Expedição (2)', 'Admin (4)'] },
  ]

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <p className="text-overline mb-2">Departamento</p>
        <h1 className="text-display-lg text-white">Recursos Humanos</h1>
        <p className="text-sm text-white/40 mt-2">Gestão de pessoas, turnos e performance</p>
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

      {/* Equipes por unidade */}
      <section className="space-y-4">
        <h2 className="section-title">Equipes por Unidade</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {teams.map((t) => (
            <div key={t.unit} className="card-dark rounded-xl p-5 space-y-4 animate-fade-up">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">{t.unit}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {t.headcount} pessoas
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {t.sectors.map((sec) => (
                  <span key={sec} className="text-xs px-2.5 py-1 rounded-lg bg-white/04 text-white/50 border border-white/06">
                    {sec}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Agenda */}
      <section className="space-y-4">
        <h2 className="section-title">
          <CalendarDays size={14} className="text-blue-400/60" />
          Próximos Eventos
        </h2>
        <div className="space-y-2">
          {[
            { date: '05/03', title: 'Avaliação de desempenho — Q1', type: 'Avaliação', color: '#8b5cf6' },
            { date: '12/03', title: 'Treinamento de segurança — Unidade Centro', type: 'Treinamento', color: '#10b981' },
            { date: '20/03', title: 'Integração — novos colaboradores', type: 'Onboarding', color: '#3b82f6' },
            { date: '28/03', title: 'Reunião de clima organizacional', type: 'Reunião', color: '#f59e0b' },
          ].map((e) => (
            <div key={e.title} className="card-dark rounded-xl px-5 py-3 flex items-center gap-4 animate-fade-up">
              <div className="text-center flex-shrink-0" style={{ minWidth: 44 }}>
                <p className="text-lg font-bold text-white num-stat">{e.date.split('/')[0]}</p>
                <p className="text-[10px] text-white/30">MAR</p>
              </div>
              <div className="w-px h-8 bg-white/06" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white/80 truncate">{e.title}</p>
                <span className="text-[10px] px-2 py-0.5 rounded-full mt-1 inline-block" style={{ background: `${e.color}15`, color: e.color, border: `1px solid ${e.color}30` }}>
                  {e.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
