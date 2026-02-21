import { getRarityConfig } from '@/lib/gamification'
import type { BadgeDefinition, BadgeRarity } from '@/types/copywriter'

interface BadgeCardProps {
  badge: BadgeDefinition
  earned: boolean
  awardedAt?: string
}

export function BadgeCard({ badge, earned, awardedAt }: BadgeCardProps) {
  const rarity = getRarityConfig(badge.rarity as BadgeRarity)

  return (
    <div
      className={`rounded-xl p-4 text-center transition-all ${
        earned
          ? `${rarity.bg} ${rarity.glow} badge-${badge.rarity}`
          : 'bg-white/[0.02] border border-white/[0.06] opacity-40 grayscale'
      }`}
    >
      <div className={`text-3xl mb-2 ${earned ? '' : 'grayscale'}`}>
        {badge.icon}
      </div>
      <p className={`text-xs font-semibold mb-0.5 ${earned ? 'text-white/90' : 'text-white/30'}`}>
        {badge.name}
      </p>
      <p className={`text-[10px] ${earned ? 'text-white/40' : 'text-white/15'}`}>
        {badge.description}
      </p>
      {earned && awardedAt && (
        <p className="text-[9px] text-[#d6b25e]/40 mt-1.5">
          {new Date(awardedAt).toLocaleDateString('pt-BR')}
        </p>
      )}
      <span
        className={`inline-block mt-2 text-[9px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider ${
          earned ? `${rarity.border} ${rarity.bg}` : 'border border-white/10 text-white/20'
        }`}
        style={{ fontSize: '8px' }}
      >
        {rarity.label}
      </span>
    </div>
  )
}
