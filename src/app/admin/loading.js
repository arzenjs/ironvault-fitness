import { Skeleton, TextBlock } from "@/components/ui/Skeleton";

export default function AdminLoading() {
  return (
    <div role="status" aria-live="polite" aria-label="Loading the admin dashboard">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-3 h-9 w-72 max-w-full" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <Skeleton key={item} className="h-28 rounded-2xl" />
        ))}
      </div>
      <div className="mt-8 rounded-xl border border-white/10 bg-coal p-4">
        <TextBlock lines={4} />
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
