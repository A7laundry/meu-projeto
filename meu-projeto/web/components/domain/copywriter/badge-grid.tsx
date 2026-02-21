import { BadgeCard } from '@/components/domain/copywriter/badge-card'
import type { BadgeDefinition, WriterBadge } from '@/types/copywriter'

interface BadgeGridProps {
  allBadges: BadgeDefinition[]
  earnedBadges: WriterBadge[]
}

export function BadgeGrid({ allBadges, earnedBadges }: BadgeGridProps) {
  const earnedMap = new Map(earnedBadges.map(b => [b.badge_id, b.awarded_at]))

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {allBadges.map((badge, i) => (
        <div key={badge.id} className={`animate-fade-up stagger-${Math.min(i + 1, 6)}`}>
          <BadgeCard
            badge={badge}
            earned={earnedMap.has(badge.id)}
            awardedAt={earnedMap.get(badge.id)}
          />
        </div>
      ))}
    </div>
  )
}
