// Loading skeletons that mirror the real card layouts, so content
// arriving never causes a layout jump.

export function Shimmer({ className = '' }) {
  return <div className={`animate-pulse rounded-md bg-cream-200/80 ${className}`} aria-hidden="true" />;
}

export function HospitalCardSkeleton() {
  return (
    <div className="rounded-lg bg-white border border-ink-900/10 p-5 shadow-warm-sm" aria-hidden="true">
      <div className="flex items-start gap-4">
        <Shimmer className="w-14 h-14 rounded-md shrink-0" />
        <div className="flex-1 space-y-2.5 pt-1">
          <Shimmer className="h-4 w-3/4" />
          <Shimmer className="h-3 w-1/2" />
        </div>
      </div>
      <Shimmer className="mt-4 h-3 w-2/3" />
      <Shimmer className="mt-2 h-3 w-5/6" />
      <div className="mt-5 flex gap-2">
        <Shimmer className="h-9 flex-1 rounded-md" />
        <Shimmer className="h-9 flex-1 rounded-md" />
      </div>
    </div>
  );
}

export function ReviewCardSkeleton() {
  return (
    <div className="rounded-lg bg-white border border-ink-900/10 p-5 shadow-warm-sm" aria-hidden="true">
      <div className="flex items-start gap-3">
        <Shimmer className="w-10 h-10 rounded-md shrink-0" />
        <div className="flex-1 space-y-2 pt-0.5">
          <Shimmer className="h-3.5 w-28" />
          <Shimmer className="h-3 w-40" />
        </div>
        <Shimmer className="h-6 w-24 rounded-sm" />
      </div>
      <Shimmer className="mt-4 h-3.5 w-24" />
      <Shimmer className="mt-3 h-3 w-full" />
      <Shimmer className="mt-2 h-3 w-11/12" />
      <Shimmer className="mt-2 h-3 w-3/5" />
      <div className="mt-5 flex gap-2">
        <Shimmer className="h-8 w-24 rounded-md" />
        <Shimmer className="h-8 w-24 rounded-md" />
      </div>
    </div>
  );
}

export function HospitalGridSkeleton({ count = 6, className = '' }) {
  return (
    <div className={className || 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'}>
      {[...Array(count)].map((_, i) => (
        <HospitalCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ReviewListSkeleton({ count = 3, className = '' }) {
  return (
    <div className={className || 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'}>
      {[...Array(count)].map((_, i) => (
        <ReviewCardSkeleton key={i} />
      ))}
    </div>
  );
}
