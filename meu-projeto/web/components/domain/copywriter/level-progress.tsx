'use client'

import { LEVEL_THRESHOLDS } from '@/types/copywriter'
import type { WriterLevel } from '@/types/copywriter'

interface LevelProgressProps {
  totalXp: number
  level: WriterLevel
  levelTitle: string
  xpProgress: number
}

export function LevelProgress({ totalXp, level, levelTitle, xpProgress }: LevelProgressProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold gold-text">{levelTitle}</span>
          <span className="text-xs text-white/30">Nível {level}</span>
        </div>
        <span className="text-sm font-medium text-white/60 num-stat">{totalXp} XP</span>
      </div>

      {/* Barra principal */}
      <div className="xp-bar h-3 rounded-md">
        <div
          className="xp-bar-fill animate-xp-fill rounded-md"
          style={{ width: `${xpProgress}%` }}
        />
      </div>

      {/* Milestones */}
      <div className="flex justify-between">
        {LEVEL_THRESHOLDS.map((t) => (
          <div key={t.level} className="flex flex-col items-center gap-0.5">
            <div
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                totalXp >= t.xp
                  ? 'bg-[#60a5fa] shadow-[0_0_8px_rgba(59,130,246,0.6)]'
                  : 'bg-white/10'
              }`}
            />
            <span className={`text-[9px] ${totalXp >= t.xp ? 'text-[#60a5fa]/70' : 'text-white/20'}`}>
              {t.title}
            </span>
            <span className="text-[8px] text-white/15 num-stat">{t.xp}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
