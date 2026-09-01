function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-2xl bg-[#E8E3DD] ${className}`} />;
}

export default function ProductDetailLoading() {
  return (
    <main className="w-full bg-[#F5F3EF]" aria-label="Loading product">
      <div className="max-w-6xl mx-auto px-5 sm:px-6">
        <section className="pt-20 sm:pt-21">
          <SkeletonBlock className="h-5 w-56 rounded-md mb-4 sm:mb-8" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
            <SkeletonBlock className="lg:col-span-2 h-44 sm:h-95 md:h-115 lg:h-135 rounded-3xl sm:rounded-4xl" />
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4 lg:gap-5 lg:h-135">
              <SkeletonBlock className="h-28 sm:h-50 lg:h-full rounded-3xl sm:rounded-4xl" />
              <SkeletonBlock className="h-28 sm:h-50 lg:h-full rounded-3xl sm:rounded-4xl" />
            </div>
          </div>
        </section>

        <section className="pt-8 sm:pt-16 lg:pt-20 max-w-4xl">
          <SkeletonBlock className="h-4 w-32 rounded-md mb-4" />
          <SkeletonBlock className="h-10 sm:h-12 lg:h-16 w-full max-w-3xl rounded-md" />
          <SkeletonBlock className="mt-5 sm:mt-6 h-24 w-full max-w-3xl rounded-md" />
        </section>

        <section className="pt-8 sm:pt-14 lg:pt-16">
          <SkeletonBlock className="w-full h-44 sm:h-95 md:h-110 lg:h-120 rounded-3xl sm:rounded-4xl" />
          <SkeletonBlock className="mt-5 sm:mt-8 mx-auto h-12 w-40 rounded-full" />
        </section>

        <section className="pt-8 sm:pt-20 lg:pt-24 pb-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10 lg:gap-14 items-center">
            <div className="space-y-5 sm:space-y-10">
              <SkeletonBlock className="h-20 w-full max-w-md rounded-md" />
              <SkeletonBlock className="h-20 w-full max-w-md rounded-md" />
              <SkeletonBlock className="h-20 w-full max-w-md rounded-md" />
            </div>
            <div className="flex items-end gap-2.5 sm:gap-3 w-full max-w-md mx-auto lg:max-w-none">
              <SkeletonBlock className="w-[58%] aspect-3/4 rounded-3xl sm:rounded-4xl" />
              <SkeletonBlock className="w-[38%] aspect-2/3 mb-4 sm:mb-6 rounded-3xl sm:rounded-4xl" />
            </div>
          </div>
        </section>

        <section className="py-8 sm:py-20 lg:py-24">
          <SkeletonBlock className="h-4 w-36 rounded-md mb-3" />
          <SkeletonBlock className="h-10 sm:h-12 lg:h-16 w-full max-w-3xl rounded-md mb-6 sm:mb-10 lg:mb-14" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10 items-stretch">
            <SkeletonBlock className="min-h-90 sm:min-h-120 lg:min-h-130 rounded-3xl sm:rounded-4xl" />
            <SkeletonBlock className="min-h-90 sm:min-h-105 rounded-3xl sm:rounded-4xl" />
          </div>
        </section>
      </div>
    </main>
  );
}