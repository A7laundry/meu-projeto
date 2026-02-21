export function KpiCardSkeleton({ stagger = 0 }: { stagger?: number }) {
  return (
    <div className={`rounded-xl p-5 space-y-3 card-stat animate-fade-up ${stagger ? `stagger-${stagger}` : ''}`}>
      {/* Label */}
      <div className="h-2 w-20 rounded-full bg-white/06 animate-pulse" />
      {/* Value */}
      <div className="h-8 w-16 rounded-md bg-white/08 animate-pulse" />
      {/* Subtitle */}
      <div className="h-2 w-24 rounded-full bg-white/04 animate-pulse" />
    </div>
  )
}

export function KpiRowSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <KpiCardSkeleton key={i} stagger={i as 1 | 2 | 3 | 4 | 5} />
      ))}
    </div>
  )
}

export function ChartSkeleton({ height = 200 }: { height?: number }) {
  return (
    <div className="card-dark rounded-xl p-5 animate-fade-up stagger-3">
      <div className="h-2 w-32 rounded-full bg-white/06 animate-pulse mb-6" />
      <div className="rounded-lg bg-white/03 animate-pulse" style={{ height }} />
    </div>
  )
}

export function SectionSkeleton() {
  return (
    <section className="space-y-3">
      <div className="h-2 w-24 rounded-full bg-[#d6b25e]/15 animate-pulse" />
      <KpiRowSkeleton />
    </section>
  )
}
