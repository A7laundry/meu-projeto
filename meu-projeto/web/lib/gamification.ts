import { LEVEL_THRESHOLDS, type WriterLevel, type BriefingDifficulty, type BadgeRarity } from '@/types/copywriter'

export function getWriterLevel(totalXp: number): { level: WriterLevel; title: string } {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXp >= LEVEL_THRESHOLDS[i].xp) {
      return { level: LEVEL_THRESHOLDS[i].level, title: LEVEL_THRESHOLDS[i].title }
    }
  }
  return { level: 0, title: 'Novato' }
}

export function getXpProgress(totalXp: number): { current: number; next: number; progress: number } {
  const { level } = getWriterLevel(totalXp)
  const currentThreshold = LEVEL_THRESHOLDS[level].xp
  const nextThreshold = level < 5 ? LEVEL_THRESHOLDS[level + 1].xp : LEVEL_THRESHOLDS[5].xp

  if (level >= 5) return { current: totalXp, next: nextThreshold, progress: 100 }

  const progress = ((totalXp - currentThreshold) / (nextThreshold - currentThreshold)) * 100
  return { current: totalXp - currentThreshold, next: nextThreshold - currentThreshold, progress: Math.min(progress, 100) }
}

export function getDifficultyConfig(difficulty: BriefingDifficulty) {
  const configs = {
    easy:   { label: 'Fácil',    color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/30', xpMultiplier: 1 },
    medium: { label: 'Médio',    color: 'text-amber-400',   bg: 'bg-amber-400/10',   border: 'border-amber-400/30',   xpMultiplier: 1.5 },
    hard:   { label: 'Difícil',  color: 'text-orange-400',  bg: 'bg-orange-400/10',  border: 'border-orange-400/30',  xpMultiplier: 2 },
    expert: { label: 'Expert',   color: 'text-red-400',     bg: 'bg-red-400/10',     border: 'border-red-400/30',     xpMultiplier: 3 },
  }
  return configs[difficulty]
}

export function getRarityConfig(rarity: BadgeRarity) {
  const configs = {
    common:    { label: 'Comum',      border: 'border-white/20',      glow: '',                                          bg: 'bg-white/5' },
    rare:      { label: 'Raro',       border: 'border-blue-400/50',   glow: 'shadow-[0_0_12px_rgba(96,165,250,0.3)]',     bg: 'bg-blue-400/10' },
    epic:      { label: 'Épico',      border: 'border-purple-400/50', glow: 'shadow-[0_0_16px_rgba(192,132,252,0.35)]',   bg: 'bg-purple-400/10' },
    legendary: { label: 'Lendário',   border: 'border-[#d6b25e]/60',  glow: 'shadow-[0_0_20px_rgba(214,178,94,0.45)]',    bg: 'bg-[#d6b25e]/10' },
  }
  return configs[rarity]
}

export function calculateQualityBonus(score: number): number {
  if (score >= 95) return 50
  if (score >= 85) return 25
  if (score >= 75) return 10
  return 0
}
