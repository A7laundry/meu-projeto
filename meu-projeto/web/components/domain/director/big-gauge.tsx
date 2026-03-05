'use client'

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

interface BigGaugeProps {
  percent: number          // 0–100, controla o arco
  centerValue: string      // texto no centro
  centerSub?: string       // texto secundário no centro
  label: string            // rótulo abaixo
  sublabel?: string
  color: string
  size?: number
}

export function BigGauge({
  percent,
  centerValue,
  centerSub,
  label,
  sublabel,
  color,
  size = 200,
}: BigGaugeProps) {
  const clamped = Math.min(Math.max(percent, 0), 100)
  const data = [
    { value: clamped },
    { value: Math.max(0, 100 - clamped) },
  ]

  const ir = size * 0.36
  const or = size * 0.44

  // Unique ID for gradients to avoid collisions
  const gradientId = `gauge-gradient-${label.replace(/\s+/g, '-').toLowerCase()}`

  // Warning state for pulse
  const isWarning = clamped < 30

  return (
    <div className="flex flex-col items-center gap-4">
      <style>{`
        @keyframes gauge-pulse {
          0%, 100% { filter: drop-shadow(0 0 8px ${color}40); transform: scale(1); }
          50% { filter: drop-shadow(0 0 20px ${color}80); transform: scale(1.02); }
        }
        .gauge-container-premium {
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .gauge-container-premium.is-warning {
          animation: gauge-pulse 2s infinite ease-in-out;
        }
      `}</style>

      {/* Gauge donut */}
      <div className={`gauge-container-premium relative flex-shrink-0 ${isWarning ? 'is-warning' : ''}`} style={{ width: size, height: size }}>

        {/* SVG Defs for Gradients */}
        <svg width="0" height="0" className="absolute">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={1} />
              <stop offset="100%" stopColor={color} stopOpacity={0.6} />
            </linearGradient>
          </defs>
        </svg>

        {/* Glow ring — Stronger and more diffuse */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-full blur-3xl opacity-20" style={{
            width: size * 0.8,
            height: size * 0.8,
            background: color
          }} />
        </div>

        <div style={{ position: 'absolute', top: 0, left: 0, width: size, height: size, zIndex: 1 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={ir}
                outerRadius={or}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
                strokeWidth={0}
                isAnimationActive
                animationDuration={1200}
                animationEasing="ease-out"
              >
                <Cell fill={`url(#${gradientId})`} />
                <Cell fill="rgba(255,255,255,0.03)" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Central Content */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center p-4"
          style={{ pointerEvents: 'none', zIndex: 2 }}
        >
          <span
            className="text-4xl font-black tracking-tighter leading-none transition-all"
            style={{
              color,
              textShadow: `0 0 30px ${color}40`
            }}
          >
            {centerValue}
          </span>
          {centerSub && (
            <span className="text-10 font-bold text-white/30 mt-1 uppercase tracking-widest">{centerSub}</span>
          )}
        </div>
      </div>

      {/* Label Area */}
      <div className="text-center">
        <p className="text-12 font-black uppercase tracking-[0.2em] text-white/50">{label}</p>
        {sublabel && <p className="text-11 text-white/20 mt-1 font-medium">{sublabel}</p>}
      </div>
    </div>
  )
}
