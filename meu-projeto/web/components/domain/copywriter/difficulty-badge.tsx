import type { BriefingDifficulty } from '@/types/copywriter'

const CONFIGS: Record<BriefingDifficulty, { label: string; className: string }> = {
  easy:   { label: 'Fácil',   className: 'diff-easy' },
  medium: { label: 'Médio',   className: 'diff-medium' },
  hard:   { label: 'Difícil', className: 'diff-hard' },
  expert: { label: 'Expert',  className: 'diff-expert' },
}

interface DifficultyBadgeProps {
  difficulty: BriefingDifficulty
}

export function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  const config = CONFIGS[difficulty]
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${config.className}`}>
      {config.label}
    </span>
  )
}
