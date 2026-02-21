interface StreakIndicatorProps {
  streak: number
}

export function StreakIndicator({ streak }: StreakIndicatorProps) {
  if (streak <= 0) return null

  const intensity = streak >= 30 ? 'text-red-400' : streak >= 7 ? 'text-orange-400' : 'text-amber-400'
  const glow = streak >= 7 ? 'drop-shadow-[0_0_6px_rgba(251,146,60,0.5)]' : ''

  return (
    <span className={`inline-flex items-center gap-1 text-sm font-bold ${intensity} ${glow}`}>
      <span className="text-base">🔥</span>
      <span className="num-stat">{streak}</span>
    </span>
  )
}
