function Bone({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-slate-100 ${className}`}
    />
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-sm"
        >
          <div className="mb-3 flex items-center justify-between">
            <Bone className="h-3 w-20" />
            <Bone className="h-8 w-8 rounded-xl" />
          </div>
          <Bone className="mb-1.5 h-8 w-16" />
          <Bone className="h-3 w-24" />
        </div>
      ))}
    </div>
  );
}

export function LeadCardSkeleton() {
  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Bone className="h-10 w-10 rounded-xl" />
          <div>
            <Bone className="mb-1.5 h-4 w-24" />
            <Bone className="h-3 w-32" />
          </div>
        </div>
        <Bone className="h-6 w-16 rounded-full" />
      </div>
      <div className="mt-3 flex gap-2">
        <Bone className="h-6 w-20 rounded-full" />
        <Bone className="h-6 w-16 rounded-full" />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <Bone className="h-3 w-28" />
        <Bone className="h-3 w-20" />
      </div>
    </div>
  );
}

export function LeadsListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 9 }).map((_, i) => (
        <LeadCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function MatchesSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-sm"
        >
          <div className="mb-2 flex items-start justify-between">
            <div>
              <Bone className="mb-1.5 h-4 w-32" />
              <Bone className="h-3 w-20" />
            </div>
            <Bone className="h-5 w-12 rounded-full" />
          </div>
          <Bone className="mb-3 h-3 w-full" />
          <Bone className="mb-3 h-3 w-4/5" />
          <div className="flex gap-2">
            <Bone className="h-9 flex-1 rounded-xl" />
            <Bone className="h-9 flex-1 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}
