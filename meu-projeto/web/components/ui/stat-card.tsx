'use client'

import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

// ─── Skeleton loading state ───────────────────────────────────────────────────
export function StatCardSkeleton({
  accent = '#3b82f6',
  hasIcon = true,
  hasTrend = false,
}: {
  accent?: string
  hasIcon?: boolean
  hasTrend?: boolean
}) {
  return (
    <div
      className="relative overflow-hidden rounded-xl p-4"
      style={{
        background: `linear-gradient(145deg, ${accent}06 0%, rgba(0,0,0,0.22) 100%)`,
        border: `1px solid ${accent}12`,
      }}
    >
      {/* top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, ${accent}44 0%, transparent 60%)` }}
      />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          {/* label */}
          <div className="skeleton-pulse h-2.5 w-24 rounded-full" style={{ background: `${accent}18` }} />
          {/* value */}
          <div className="skeleton-pulse h-8 w-16 rounded-lg" style={{ background: `${accent}18` }} />
          {hasTrend && (
            <div className="skeleton-pulse h-2 w-14 rounded-full" style={{ background: `${accent}14` }} />
          )}
        </div>
        {hasIcon && (
          <div
            className="skeleton-pulse w-9 h-9 rounded-lg flex-shrink-0"
            style={{ background: `${accent}14` }}
          />
        )}
      </div>
    </div>
  )
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  accent?: string
  icon?: LucideIcon
  trend?: { value: string; direction: 'up' | 'down' | 'neutral' }
  size?: 'sm' | 'md' | 'lg'
  /** Makes the entire card a clickable link */
  href?: string
  /** Show skeleton loading state */
  loading?: boolean
  /** Optional click handler */
  onClick?: () => void
}

export function StatCard({
  label,
  value,
  sub,
  accent = '#3b82f6',
  icon: Icon,
  trend,
  size = 'md',
  loading = false,
  onClick,
}: StatCardProps) {
  const [hovered, setHovered] = useState(false)

  if (loading) {
    return <StatCardSkeleton accent={accent} hasIcon={!!Icon} hasTrend={!!trend} />
  }

  const valueSize = { sm: 'text-xl', md: 'text-3xl', lg: 'text-4xl' }[size]
  const TrendIcon =
    trend?.direction === 'up'
      ? TrendingUp
      : trend?.direction === 'down'
        ? TrendingDown
        : Minus

  const trendColor =
    trend?.direction === 'up'
      ? '#34d399'
      : trend?.direction === 'down'
        ? '#f87171'
        : 'rgba(255,255,255,0.30)'

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className="relative overflow-hidden rounded-xl p-4 transition-all duration-300 group cursor-default"
      style={{
        background: `linear-gradient(145deg, ${accent}${hovered ? '14' : '0a'} 0%, rgba(0,0,0,0.30) 100%)`,
        border: `1px solid ${accent}${hovered ? '28' : '15'}`,
        transform: hovered ? 'translateY(-3px)' : 'none',
        boxShadow: hovered
          ? `0 16px 40px rgba(0,0,0,0.35), 0 0 0 1px ${accent}22, 0 0 24px ${accent}18`
          : '0 2px 8px rgba(0,0,0,0.15)',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {/* Top accent gradient line */}
      <div
        className="absolute top-0 left-0 right-0 h-px transition-opacity duration-300"
        style={{
          background: `linear-gradient(90deg, ${accent}88 0%, ${accent}22 55%, transparent 100%)`,
          opacity: hovered ? 1 : 0.6,
        }}
      />

      {/* Bottom glow when hovered */}
      {hovered && (
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${accent}44, transparent)` }}
        />
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {/* Label */}
          <p className="text-[11px] uppercase tracking-wider text-white/40 mb-2 truncate font-medium">
            {label}
          </p>

          {/* Value */}
          <p
            className={`${valueSize} font-black tracking-tight leading-none`}
            style={{
              color: 'rgba(255,255,255,0.96)',
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '-0.04em',
              textShadow: hovered ? `0 0 24px ${accent}55` : 'none',
              transition: 'text-shadow 0.3s',
            }}
          >
            {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
          </p>

          {/* Sub */}
          {sub && (
            <p className="text-[11px] text-white/28 mt-1.5 leading-snug">{sub}</p>
          )}

          {/* Trend */}
          {trend && (
            <div className="flex items-center gap-1.5 mt-2">
              <TrendIcon size={11} style={{ color: trendColor }} />
              <span
                className="text-[11px] font-semibold"
                style={{ color: trendColor }}
              >
                {trend.value}
              </span>
            </div>
          )}
        </div>

        {/* Icon */}
        {Icon && (
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300"
            style={{
              background: `${accent}${hovered ? '1e' : '12'}`,
              border: `1px solid ${accent}${hovered ? '30' : '1a'}`,
              boxShadow: hovered ? `0 0 20px ${accent}22` : 'none',
            }}
          >
            <Icon size={18} style={{ color: `${accent}${hovered ? 'dd' : '99'}`, transition: 'color 0.3s' }} />
          </div>
        )}
      </div>
    </div>
  )
}
