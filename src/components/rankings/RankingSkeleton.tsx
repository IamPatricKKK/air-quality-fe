import { Skeleton } from '@/components/ui/skeleton';

/** Loading skeleton mirroring the ranking dashboard layout (stats · podium · table). */
export function RankingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="ow-card p-4 md:p-5">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <Skeleton className="mt-3 h-2.5 w-24" />
            <Skeleton className="mt-2 h-8 w-16" />
            <Skeleton className="mt-2 h-2.5 w-28" />
          </div>
        ))}
      </div>

      {/* Podium */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="ow-card p-6 min-h-[260px]">
          <div className="flex items-center gap-2.5">
            <Skeleton className="w-11 h-11 rounded-xl" />
            <div className="space-y-1.5">
              <Skeleton className="h-2.5 w-28" />
              <Skeleton className="h-2.5 w-36" />
            </div>
          </div>
          <Skeleton className="mt-6 h-6 w-3/4" />
          <Skeleton className="mt-2 h-3 w-1/3" />
          <Skeleton className="mt-8 h-16 w-32" />
        </div>
        <div className="flex flex-col gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="ow-card flex items-center gap-3.5 p-4 pl-5 flex-1">
              <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-2/3" />
                <Skeleton className="h-2.5 w-1/3" />
                <Skeleton className="h-4 w-24 rounded-full" />
              </div>
              <Skeleton className="w-14 h-9 rounded-xl" />
            </div>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="glass-card px-3 py-2.5">
        <div className="flex flex-col gap-2 lg:flex-row">
          <Skeleton className="h-9 flex-1 rounded-lg" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 lg:flex">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full lg:w-32 rounded-lg" />
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="ow-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border/50 space-y-1.5">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-2.5 w-56" />
        </div>
        <div className="divide-y divide-border/30">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-7 w-12 rounded-lg" />
              <Skeleton className="h-3.5 flex-1 max-w-[200px]" />
              <Skeleton className="h-3 w-24 hidden sm:block" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-3 w-10 hidden md:block" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
