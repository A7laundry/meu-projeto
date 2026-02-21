import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/get-user'
import { getDashboardStats, listWriters } from '@/actions/copywriter/admin'
import { KpiCard } from '@/components/domain/kpi/kpi-card'
import { getWriterLevel } from '@/lib/gamification'

export default async function AdminDashboardPage() {
  const user = await getUser()
  if (!user || !['director', 'unit_manager'].includes(user.role)) redirect('/copywriter/dashboard')

  const [stats, writers] = await Promise.all([
    getDashboardStats(),
    listWriters(),
  ])

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      <div className="animate-fade-up">
        <h1 className="text-xl font-bold text-white/90 mb-1">Admin Dashboard</h1>
        <p className="text-sm text-white/40">Visão geral do squad de copywriters</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Escritores" value={stats.writersCount} highlight stagger={1} />
        <KpiCard title="Missões Ativas" value={stats.activeMissions} stagger={2} />
        <KpiCard title="Reviews Pendentes" value={stats.pendingReviews} alert={stats.pendingReviews > 0} stagger={3} />
        <KpiCard title="Missões Concluídas" value={stats.completedMissions} stagger={4} />
      </div>

      {/* Lista de escritores */}
      <div className="space-y-4 animate-fade-up stagger-3">
        <h2 className="section-header">Equipe</h2>
        <div className="card-dark rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-white/30 font-medium">Redator</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-white/30 font-medium">Nível</th>
                <th className="text-right px-4 py-3 text-[10px] uppercase tracking-wider text-white/30 font-medium">XP</th>
                <th className="text-right px-4 py-3 text-[10px] uppercase tracking-wider text-white/30 font-medium">Missões</th>
                <th className="text-right px-4 py-3 text-[10px] uppercase tracking-wider text-white/30 font-medium">Score Médio</th>
                <th className="text-right px-4 py-3 text-[10px] uppercase tracking-wider text-white/30 font-medium">Streak</th>
              </tr>
            </thead>
            <tbody>
              {writers.map((w) => {
                const { title } = getWriterLevel(w.total_xp)
                return (
                  <tr key={w.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-sm text-white/80">{w.profile?.full_name ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-[#d6b25e]/70">{title}</td>
                    <td className="px-4 py-3 text-right text-sm text-white/70 num-stat">{w.total_xp}</td>
                    <td className="px-4 py-3 text-right text-xs text-white/40 num-stat">{w.missions_done}</td>
                    <td className="px-4 py-3 text-right text-xs text-white/40 num-stat">{w.avg_score}</td>
                    <td className="px-4 py-3 text-right text-xs text-white/40 num-stat">
                      {w.current_streak > 0 && '🔥 '}{w.current_streak}
                    </td>
                  </tr>
                )
              })}
              {writers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-white/25">
                    Nenhum redator cadastrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
