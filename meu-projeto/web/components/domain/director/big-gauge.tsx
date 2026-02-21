'use client'

import { PieChart, Pie, Cell } from 'recharts'

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

  const ir = size * 0.34
  const or = size * 0.46

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Gauge donut */}
      <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
        {/* PieChart renderiza sua própria <svg> — não aninhar dentro de <svg> */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: size, height: size }}>
          <PieChart width={size} height={size}>
            <Pie
              data={data}
              cx={size / 2}
              cy={size / 2}
              innerRadius={ir}
              outerRadius={or}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              strokeWidth={0}
              isAnimationActive
              animationDuration={900}
              animationEasing="ease-out"
            >
              <Cell fill={color} />
              <Cell fill="rgba(255,255,255,0.05)" />
            </Pie>
          </PieChart>
        </div>

        {/* Glow ring — SVG separado, atrás do PieChart */}
        <svg
          width={size}
          height={size}
          style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 0 }}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={(ir + or) / 2}
            fill="none"
            stroke={color}
            strokeOpacity={0.10}
            strokeWidth={(or - ir) + 10}
          />
        </svg>

        {/* Texto central — div sobre os SVGs */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ pointerEvents: 'none', zIndex: 2 }}
        >
          <span className="text-3xl font-bold num-stat leading-none" style={{ color }}>
            {centerValue}
          </span>
          {centerSub && (
            <span className="text-xs text-white/35 mt-1 num-stat">{centerSub}</span>
          )}
        </div>
      </div>

      {/* Label abaixo */}
      <div className="text-center">
        <p className="section-header">{label}</p>
        {sublabel && <p className="text-xs text-white/30 mt-0.5">{sublabel}</p>}
      </div>
    </div>
  )
}
