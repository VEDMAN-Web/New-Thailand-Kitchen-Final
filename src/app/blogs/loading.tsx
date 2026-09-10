export default function GuidesLoading() {
  return (
    <div className="flex flex-col gap-5" aria-label="Loading guides" role="status">
      <div className="flex items-center justify-between gap-3">
        <div className="h-4 w-32 animate-pulse rounded bg-[#E2E5EA]" />
        <div className="h-10 w-24 animate-pulse rounded-lg bg-[#E2E5EA]" />
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[340px_1fr]">
        <div className="h-48 animate-pulse rounded-xl border border-[#E8EAED] bg-white" />
        <div className="space-y-3 rounded-xl border border-[#E8EAED] bg-white p-5">
          <div className="h-6 w-48 animate-pulse rounded bg-[#E2E5EA]" />
          <div className="h-4 w-full animate-pulse rounded bg-[#F0F1F3]" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-[#F0F1F3]" />
          <div className="h-32 animate-pulse rounded-lg bg-[#F8F9FB]" />
        </div>
      </div>
    </div>
  );
}
