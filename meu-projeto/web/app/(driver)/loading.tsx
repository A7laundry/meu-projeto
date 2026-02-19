import { Skeleton } from '@/components/ui/skeleton'

export default function DriverLoading() {
  return (
    <div className="px-4 py-6 max-w-lg mx-auto w-full space-y-4">
      <Skeleton className="h-8 w-40" />
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-20 rounded-lg" />
      ))}
    </div>
  )
}
