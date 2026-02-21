import { getLeaderboard } from '@/actions/copywriter/gamification'

export default async function LeaderboardPage() {
  const entries = await getLeaderboard()

  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto">
      <div className="animate-fade-up">
        <h1 className="text-xl font-bold text-white/90 mb-1">Ranking</h1>
        <p className="text-sm text-white/40">Os melhores redatores da equipe</p>
      </div>

      {/* Podio top 3 */}
      {entries.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 animate-fade-up stagger-1">
          {[entries[1], entries[0], entries[2]].map((entry, i) => {
            const position = [2, 1, 3][i]
            const isFirst = position === 1
            return (
              <div
                key={entry.writerId}
                className={`rounded-xl p-5 text-center ${
                  isFirst ? 'card-gold glow-gold -mt-4' : 'card-stat'
                }`}
              >
                <div className={`text-2xl mb-2 ${isFirst ? '' : 'opacity-70'}`}>
                  {position === 1 ? '👑' : position === 2 ? '🥈' : '🥉'}
                </div>
                <p className={`text-sm font-semibold mb-1 ${isFirst ? 'gold-text' : 'text-white/80'}`}>
                  {entry.name}
                </p>
                <p className="text-xs text-white/40">{entry.levelTitle}</p>
                <p className={`text-lg font-bold num-stat mt-2 ${isFirst ? 'gold-text' : 'text-white/70'}`}>
                  {entry.totalXp} XP
                </p>
                <div className="flex justify-center gap-2 mt-2 text-[10px] text-white/30">
                  <span>🔥 {entry.currentStreak}</span>
                  <span>🏅 {entry.badgeCount}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Tabela completa */}
      <div className="card-dark rounded-xl overflow-hidden animate-fade-up stagger-2">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-white/30 font-medium">#</th>
              <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-white/30 font-medium">Redator</th>
              <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-white/30 font-medium">Nível</th>
              <th className="text-right px-4 py-3 text-[10px] uppercase tracking-wider text-white/30 font-medium">XP</th>
              <th className="text-right px-4 py-3 text-[10px] uppercase tracking-wider text-white/30 font-medium">Missões</th>
              <th className="text-right px-4 py-3 text-[10px] uppercase tracking-wider text-white/30 font-medium">Streak</th>
              <th className="text-right px-4 py-3 text-[10px] uppercase tracking-wider text-white/30 font-medium">Badges</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, i) => (
              <tr
                key={entry.writerId}
                className={`border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors animate-fade-up stagger-${Math.min(i + 1, 6)}`}
              >
                <td className="px-4 py-3 text-sm text-white/40 num-stat">{entry.rank}</td>
                <td className="px-4 py-3">
                  <span className="text-sm text-white/80 font-medium">{entry.name}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs text-[#d6b25e]/70">{entry.levelTitle}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-sm text-white/70 num-stat font-medium">{entry.totalXp}</span>
                </td>
                <td className="px-4 py-3 text-right text-xs text-white/40 num-stat">{entry.missionsDone}</td>
                <td className="px-4 py-3 text-right text-xs text-white/40 num-stat">
                  {entry.currentStreak > 0 && <span>🔥 </span>}{entry.currentStreak}
                </td>
                <td className="px-4 py-3 text-right text-xs text-white/40 num-stat">{entry.badgeCount}</td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-white/25">
                  Nenhum redator no ranking ainda
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
