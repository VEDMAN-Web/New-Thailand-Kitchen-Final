"use client";

type SkeletonVariant = "cards" | "rows" | "panel";

function Bar({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-[#E5E7EB] ${className}`} />;
}

export default function AdminSkeleton({
  variant = "cards",
  count = 6,
}: {
  variant?: SkeletonVariant;
  count?: number;
}) {
  if (variant === "panel") {
    return (
      <div className="rounded-xl border border-[#E8EAED] bg-white p-4 sm:p-6 space-y-4" aria-busy="true" aria-label="Loading">
        <Bar className="h-5 w-2/5" />
        <Bar className="h-10 w-full" />
        <div className="grid gap-3 sm:grid-cols-2">
          <Bar className="h-24 w-full" />
          <Bar className="h-24 w-full" />
        </div>
        <Bar className="h-28 w-full" />
      </div>
    );
  }

  if (variant === "rows") {
    return (
      <div className="space-y-3" aria-busy="true" aria-label="Loading">
        {Array.from({ length: count }, (_, index) => (
          <div key={index} className="rounded-xl border border-[#E8EAED] bg-white p-4 space-y-3">
            <div className="flex items-center justify-between gap-4">
              <Bar className="h-5 w-2/5" />
              <Bar className="h-8 w-16" />
            </div>
            <Bar className="h-4 w-4/5" />
            <Bar className="h-4 w-3/5" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="overflow-hidden rounded-2xl border border-[#E8EAED] bg-white">
          <Bar className="h-36 w-full rounded-none" />
          <div className="space-y-3 p-4">
            <Bar className="h-5 w-3/5" />
            <Bar className="h-3 w-4/5" />
            <Bar className="h-4 w-full" />
            <Bar className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
