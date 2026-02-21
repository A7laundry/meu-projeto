import { getWriterStats, getMyProfile } from '@/actions/copywriter/gamification'
import { getUser } from '@/lib/auth/get-user'
import { createAdminClient } from '@/lib/supabase/admin'
import { LevelProgress } from '@/components/domain/copywriter/level-progress'
import { BadgeGrid } from '@/components/domain/copywriter/badge-grid'
import { XpTimeline } from '@/components/domain/copywriter/xp-timeline'
import { StreakIndicator } from '@/components/domain/copywriter/streak-indicator'
import { ProfileEditDialog } from '@/components/domain/copywriter/profile-edit-dialog'
import { Button } from '@/components/ui/button'
import type { BadgeDefinition } from '@/types/copywriter'

export default async function ProfilePage() {
  const [user, stats, profile] = await Promise.all([
    getUser(),
    getWriterStats(),
    getMyProfile(),
  ])

  const supabase = createAdminClient()
  const { data: allBadges } = await supabase
    .from('badge_definitions')
    .select('*')
    .order('created_at', { ascending: true })

  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto">
      {/* Header com info */}
      <div className="flex items-start justify-between animate-fade-up">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-bold text-white/90">{user?.full_name}</h1>
            {profile && <StreakIndicator streak={profile.current_streak} />}
          </div>
          <p className="text-sm text-[#d6b25e]/60">{stats?.levelTitle ?? 'Novato'} · Nível {stats?.level ?? 0}</p>
          {profile?.bio && (
            <p className="text-xs text-white/40 mt-2 max-w-md">{profile.bio}</p>
          )}
          {profile?.specialties && profile.specialties.length > 0 && (
            <div className="flex gap-1.5 mt-2">
              {profile.specialties.map((s) => (
                <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-[#d6b25e]/10 text-[#d6b25e]/60 border border-[#d6b25e]/15">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
        <ProfileEditDialog
          bio={profile?.bio ?? ''}
          specialties={profile?.specialties ?? []}
          trigger={<Button className="btn-ghost text-xs px-3 py-1.5 rounded-lg">Editar Perfil</Button>}
        />
      </div>

      {/* Stats rápidos */}
      <div className="grid grid-cols-4 gap-3">
        <div className="card-stat rounded-xl p-4 text-center animate-fade-up stagger-1">
          <p className="text-[10px] text-white/30 uppercase tracking-wider">XP Total</p>
          <p className="text-xl font-bold gold-text num-stat mt-1">{profile?.total_xp ?? 0}</p>
        </div>
        <div className="card-stat rounded-xl p-4 text-center animate-fade-up stagger-2">
          <p className="text-[10px] text-white/30 uppercase tracking-wider">Missões</p>
          <p className="text-xl font-bold text-white/80 num-stat mt-1">{profile?.missions_done ?? 0}</p>
        </div>
        <div className="card-stat rounded-xl p-4 text-center animate-fade-up stagger-3">
          <p className="text-[10px] text-white/30 uppercase tracking-wider">Score Médio</p>
          <p className="text-xl font-bold text-white/80 num-stat mt-1">{profile?.avg_score ?? 0}</p>
        </div>
        <div className="card-stat rounded-xl p-4 text-center animate-fade-up stagger-4">
          <p className="text-[10px] text-white/30 uppercase tracking-wider">Melhor Streak</p>
          <p className="text-xl font-bold text-white/80 num-stat mt-1">{profile?.best_streak ?? 0}</p>
        </div>
      </div>

      {/* Progressão */}
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

      {/* Badges */}
      <div className="space-y-4 animate-fade-up stagger-4">
        <h2 className="section-header">Coleção de Badges</h2>
        <BadgeGrid
          allBadges={(allBadges ?? []) as BadgeDefinition[]}
          earnedBadges={stats?.badges ?? []}
        />
      </div>

      {/* Histórico XP */}
      <div className="space-y-4 animate-fade-up stagger-5">
        <h2 className="section-header">Histórico de XP</h2>
        <div className="card-dark rounded-xl p-5">
          <XpTimeline logs={stats?.recentXp ?? []} />
        </div>
      </div>
    </div>
  )
}
