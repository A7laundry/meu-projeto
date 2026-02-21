import { getWriterStats } from '@/actions/copywriter/gamification'
import { listBriefings } from '@/actions/copywriter/briefings'
import { KpiCard } from '@/components/domain/kpi/kpi-card'
import { LevelProgress } from '@/components/domain/copywriter/level-progress'
import { MissionCard } from '@/components/domain/copywriter/mission-card'
import { XpTimeline } from '@/components/domain/copywriter/xp-timeline'
import { StreakIndicator } from '@/components/domain/copywriter/streak-indicator'
import { BadgeCard } from '@/components/domain/copywriter/badge-card'
import { createAdminClient } from '@/lib/supabase/admin'

export default async function CopywriterDashboardPage() {
  const [stats, activeBriefings] = await Promise.all([
    getWriterStats(),
    listBriefings('published'),
  ])

  // Buscar badges para mostrar os últimos conquistados
  const supabase = createAdminClient()
  const { data: allBadges } = await supabase
    .from('badge_definitions')
    .select('*')
    .order('created_at', { ascending: true })

  const profile = stats?.profile

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      {/* Hero */}
      <div className="animate-fade-up">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-xl font-bold text-white/90">Quartel General</h1>
          {profile && <StreakIndicator streak={profile.current_streak} />}
        </div>
        <p className="text-sm text-white/40">Sua base de operações como redator</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="XP Total"
          value={profile?.total_xp ?? 0}
          unit="XP"
          highlight
          stagger={1}
        />
        <KpiCard
          title="Streak"
          value={profile?.current_streak ?? 0}
          unit="dias"
          stagger={2}
        />
        <KpiCard
          title="Missões"
          value={profile?.missions_done ?? 0}
          stagger={3}
        />
        <KpiCard
          title="Nível"
          value={stats?.levelTitle ?? 'Novato'}
          stagger={4}
        />
      </div>

      {/* Progressão de nível */}
      {stats && (
        <div className="card-stat rounded-xl p-5 animate-fade-up stagger-3">
          <LevelProgress
            totalXp={profile?.total_xp ?? 0}
            level={stats.level}
            levelTitle={stats.levelTitle}
            xpProgress={stats.xpProgress}
          />
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Missões ativas */}
        <div className="space-y-4">
          <h2 className="section-header">Missões Disponíveis</h2>
          {activeBriefings.length === 0 ? (
            <div className="card-dark rounded-xl p-6 text-center">
              <p className="text-sm text-white/30">Nenhuma missão disponível no momento</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeBriefings.slice(0, 3).map((b) => (
                <MissionCard key={b.id} briefing={b} />
              ))}
            </div>
          )}
        </div>

        {/* XP Recente + Badges */}
        <div className="space-y-6">
          <div className="space-y-3">
            <h2 className="section-header">XP Recente</h2>
            <div className="card-dark rounded-xl p-4">
              <XpTimeline logs={stats?.recentXp ?? []} />
            </div>
          </div>

          {stats && stats.badges.length > 0 && (
            <div className="space-y-3">
              <h2 className="section-header">Últimas Conquistas</h2>
              <div className="grid grid-cols-3 gap-2">
                {stats.badges.slice(0, 3).map((wb) => {
                  const badgeDef = allBadges?.find(b => b.id === wb.badge_id) ?? wb.badge
                  if (!badgeDef) return null
                  return (
                    <BadgeCard
                      key={wb.id}
                      badge={badgeDef}
                      earned
                      awardedAt={wb.awarded_at}
                    />
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
