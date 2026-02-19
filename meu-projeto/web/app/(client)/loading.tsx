import { Skeleton } from '@/components/ui/skeleton'

export default function ClientLoading() {
  return (
    <div className="p-6 space-y-4 max-w-2xl mx-auto">
      <Skeleton className="h-8 w-48" />
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-24 rounded-lg" />
      ))}
    </div>
  )
}
