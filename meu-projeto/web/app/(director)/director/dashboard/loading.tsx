import { SectionSkeleton, ChartSkeleton } from '@/components/domain/kpi/kpi-card-skeleton'

export default function DirectorDashboardLoading() {
  return (
    <div className="p-6 space-y-8">
      {/* Header skeleton */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-6 w-52 rounded-md bg-white/08 animate-pulse" />
          <div className="h-2 w-40 rounded-full bg-white/04 animate-pulse" />
        </div>
        <div className="flex gap-4">
          <div className="h-4 w-10 rounded bg-[#d6b25e]/10 animate-pulse" />
          <div className="h-4 w-20 rounded bg-[#d6b25e]/10 animate-pulse" />
        </div>
      </div>

      {/* Produção skeleton */}
      <SectionSkeleton />

      {/* Trend chart skeleton */}
      <ChartSkeleton height={160} />

      {/* KPIs avançados skeleton */}
      <SectionSkeleton />

      {/* Unidades skeleton */}
      <section className="space-y-3">
        <div className="h-2 w-20 rounded-full bg-[#d6b25e]/15 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="card-dark rounded-xl p-5 space-y-4 animate-fade-up" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="flex justify-between items-center">
                <div className="h-4 w-32 rounded bg-white/06 animate-pulse" />
                <div className="h-3 w-16 rounded bg-white/04 animate-pulse" />
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="card-stat rounded-lg p-3 space-y-2">
                    <div className="h-2 w-12 rounded-full bg-white/05 animate-pulse" />
                    <div className="h-6 w-8 rounded bg-white/08 animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
