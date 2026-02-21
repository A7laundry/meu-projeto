import Link from 'next/link'
import { getDifficultyConfig } from '@/lib/gamification'
import { DifficultyBadge } from '@/components/domain/copywriter/difficulty-badge'
import type { Briefing } from '@/types/copywriter'

interface MissionCardProps {
  briefing: Briefing
  submissionsCount?: number
}

export function MissionCard({ briefing, submissionsCount = 0 }: MissionCardProps) {
  const diff = getDifficultyConfig(briefing.difficulty)
  const spotsLeft = briefing.max_writers - submissionsCount
  const hasDeadline = briefing.deadline && new Date(briefing.deadline) > new Date()

  return (
    <Link
      href={`/copywriter/missions/${briefing.id}`}
      className="card-stat rounded-xl p-5 space-y-3 block hover:border-[#d6b25e]/25 transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-white/90 line-clamp-2 flex-1">
          {briefing.title}
        </h3>
        <DifficultyBadge difficulty={briefing.difficulty} />
      </div>

      <p className="text-xs text-white/40 line-clamp-2">{briefing.description}</p>

      <div className="flex items-center gap-3 text-[10px]">
        <span className="flex items-center gap-1 text-[#d6b25e]/80 font-medium">
          +{briefing.xp_reward} XP
        </span>
        <span className="text-white/25">·</span>
        <span className="text-white/40 capitalize">{briefing.content_type.replace('_', ' ')}</span>
        {briefing.word_limit && (
          <>
            <span className="text-white/25">·</span>
            <span className="text-white/40">{briefing.word_limit} palavras</span>
          </>
        )}
      </div>

      <div className="flex items-center justify-between pt-1">
        <span className={`text-[10px] ${spotsLeft > 0 ? 'text-emerald-400/70' : 'text-red-400/70'}`}>
          {spotsLeft > 0 ? `${spotsLeft} vaga${spotsLeft > 1 ? 's' : ''}` : 'Lotada'}
        </span>
        {hasDeadline && (
          <span className="text-[10px] text-white/25">
            até {new Date(briefing.deadline!).toLocaleDateString('pt-BR')}
          </span>
        )}
      </div>
    </Link>
  )
}
