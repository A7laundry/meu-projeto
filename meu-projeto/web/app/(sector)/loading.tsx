import { Skeleton } from '@/components/ui/skeleton'

export default function SectorLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-900 p-6 space-y-6">
      <Skeleton className="h-10 w-48 bg-gray-700" />
      <div className="grid grid-cols-2 gap-6 flex-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-xl bg-gray-700" />
        ))}
      </div>
    </div>
  )
}
