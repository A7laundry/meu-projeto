interface RingGaugeProps {
  percent: number
  size?: number
  strokeWidth?: number
  color?: string
  label?: string
  sublabel?: string
}

export function RingGauge({
  percent,
  size = 96,
  strokeWidth = 7,
  color = '#10b981',
  label,
  sublabel,
}: RingGaugeProps) {
  const r = (size - strokeWidth) / 2
  const c = 2 * Math.PI * r
  const fill = c * (1 - Math.min(percent, 100) / 100)

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          style={{ transform: 'rotate(-90deg)' }}
        >
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
          />
          {/* Fill */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={c}
            strokeDashoffset={fill}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 1s cubic-bezier(0.16,1,0.3,1)',
              filter: `drop-shadow(0 0 6px ${color}60)`,
            }}
          />
        </svg>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold num-stat leading-none" style={{ color }}>
            {percent}%
          </span>
        </div>
      </div>
      {label && <p className="section-header text-center">{label}</p>}
      {sublabel && <p className="text-xs text-white/30 text-center">{sublabel}</p>}
    </div>
  )
}
