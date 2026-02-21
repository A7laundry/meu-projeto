'use client'

import { useState, useEffect } from 'react'

interface LiveIndicatorProps {
  intervalSeconds?: number
}

export function LiveIndicator({ intervalSeconds = 60 }: LiveIndicatorProps) {
  const [seconds, setSeconds] = useState(intervalSeconds)

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((s) => (s <= 1 ? intervalSeconds : s - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [intervalSeconds])

  return (
    <div className="flex items-center gap-1.5 text-xs text-white/35">
      <span className="relative flex h-1.5 w-1.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
      </span>
      <span className="num-stat">Ao vivo · {seconds}s</span>
    </div>
  )
}
