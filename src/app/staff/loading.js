import { Skeleton, TextBlock } from "@/components/ui/Skeleton";

export default function StaffLoading() {
  return (
    <section className="pt-28 md:pt-32" role="status" aria-live="polite" aria-label="Loading the staff portal">
      <div className="shell pb-20">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="mt-3 h-9 w-72 max-w-full" />
        <Skeleton className="mt-6 h-24 w-full rounded-2xl" />
        <div className="mt-8 space-y-2">
          <Skeleton className="h-3 w-48" />
          <div className="rounded-xl border border-white/10 bg-coal p-4">
            <TextBlock lines={2} />
          </div>
          <div className="rounded-xl border border-white/10 bg-coal p-4">
            <TextBlock lines={2} />
          </div>
        </div>
        <span className="sr-only">Loading member records…</span>
      </div>
    </section>
  );
}
