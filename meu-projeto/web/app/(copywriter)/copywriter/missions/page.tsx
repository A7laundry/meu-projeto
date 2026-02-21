import { listBriefings } from '@/actions/copywriter/briefings'
import { MissionCard } from '@/components/domain/copywriter/mission-card'
import { createAdminClient } from '@/lib/supabase/admin'

export default async function MissionsPage() {
  const briefings = await listBriefings()
  const supabase = createAdminClient()

  // Buscar contagem de submissions por briefing
  const counts = new Map<string, number>()
  if (briefings.length > 0) {
    const { data } = await supabase
      .from('submissions')
      .select('briefing_id')
      .in('briefing_id', briefings.map(b => b.id))
    for (const row of data ?? []) {
      counts.set(row.briefing_id, (counts.get(row.briefing_id) ?? 0) + 1)
    }
  }

  const published = briefings.filter(b => b.status === 'published' || b.status === 'in_progress')
  const completed = briefings.filter(b => b.status === 'completed')

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      <div className="animate-fade-up">
        <h1 className="text-xl font-bold text-white/90 mb-1">Board de Missões</h1>
        <p className="text-sm text-white/40">Aceite missões, escreva conteúdo e ganhe XP</p>
      </div>

      {/* Missões ativas */}
      <div className="space-y-4">
        <h2 className="section-header">Disponíveis</h2>
        {published.length === 0 ? (
          <div className="card-dark rounded-xl p-8 text-center">
            <p className="text-sm text-white/30">Nenhuma missão disponível no momento</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {published.map((b) => (
              <MissionCard
                key={b.id}
                briefing={b}
                submissionsCount={counts.get(b.id) ?? 0}
              />
            ))}
          </div>
        )}
      </div>

      {/* Concluídas */}
      {completed.length > 0 && (
        <div className="space-y-4">
          <h2 className="section-header">Concluídas</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 opacity-60">
            {completed.map((b) => (
              <MissionCard
                key={b.id}
                briefing={b}
                submissionsCount={counts.get(b.id) ?? 0}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
