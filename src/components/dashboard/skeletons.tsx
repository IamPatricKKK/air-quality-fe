import { Skeleton } from "@/components/ui/skeleton";

export function AQISummarySkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="w-4 h-4 rounded" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-2.5 w-24" />
        </div>
      ))}
    </div>
  );
}

export function StationCardSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 pr-2 space-y-2">
              <Skeleton className="h-3.5 w-3/4" />
              <Skeleton className="h-2.5 w-1/2" />
            </div>
            <Skeleton className="w-14 h-14 rounded-xl" />
          </div>
          <Skeleton className="h-3 w-1/3 mb-3" />
          <div className="grid grid-cols-3 gap-2">
            <Skeleton className="h-3" />
            <Skeleton className="h-3" />
            <Skeleton className="h-3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function MapSkeleton() {
  return (
    <div className="glass-card h-full overflow-hidden">
      <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-44" />
          <Skeleton className="h-2.5 w-32" />
        </div>
        <Skeleton className="h-7 w-32 rounded-lg" />
      </div>
      <div className="h-[calc(100%-52px)] p-3">
        <Skeleton className="h-full w-full rounded-lg" />
      </div>
    </div>
  );
}

export function SelectedStationSkeleton() {
  return (
    <div className="space-y-4">
      <div className="glass-card p-4 space-y-3">
        <Skeleton className="h-3.5 w-2/3" />
        <Skeleton className="h-52 w-full" />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass-card p-4 space-y-3">
          <Skeleton className="h-3.5 w-1/2" />
          <Skeleton className="h-20 w-full" />
        </div>
        <div className="glass-card p-4 space-y-3">
          <Skeleton className="h-3.5 w-1/2" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    </div>
  );
}
