import { Skeleton, TextBlock } from "@/components/ui/Skeleton";

/**
 * Account dashboard skeleton. It mirrors the real layout (membership panel +
 * payment table) so the page does not jump when the database read finishes.
 */
export default function AccountLoading() {
  return (
    <section className="pt-28 md:pt-32" role="status" aria-live="polite" aria-label="Loading your account">
      <div className="shell pb-20">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="mt-4 h-10 w-64" />
        <Skeleton className="mt-3 h-3 w-80 max-w-full" />

        <div className="mt-8 flex gap-2 border-b border-white/10 pb-4">
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-16 rounded-full" />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="space-y-5">
            <div className="rounded-[1.3rem] border border-white/10 bg-coal p-6">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="mt-3 h-7 w-48" />
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                <TextBlock lines={2} />
                <TextBlock lines={2} />
                <TextBlock lines={2} />
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-coal p-4">
              <Skeleton className="h-4 w-32" />
              <div className="mt-4 space-y-3">
                <TextBlock lines={1} />
                <TextBlock lines={1} />
                <TextBlock lines={1} />
              </div>
            </div>
          </div>
          <div className="space-y-5">
            <div className="rounded-[1.3rem] border border-white/10 bg-coal p-5">
              <Skeleton className="h-3 w-24" />
              <TextBlock lines={4} className="mt-4" />
            </div>
            <div className="rounded-[1.3rem] border border-white/10 bg-coal p-5">
              <Skeleton className="h-3 w-28" />
              <TextBlock lines={3} className="mt-4" />
            </div>
          </div>
        </div>
        <span className="sr-only">Loading your membership details…</span>
      </div>
    </section>
  );
}
