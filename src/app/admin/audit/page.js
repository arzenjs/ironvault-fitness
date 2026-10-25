import Link from "next/link";
import { AdminPageHeader, EmptyState, FilterTabs, SectionTitle } from "@/components/admin/AdminUI";
import { adminGuard } from "@/lib/admin-guard";
import { connectDb } from "@/lib/db";
import { AUDIT_TARGETS, listAuditLogs } from "@/services/admin";
import { formatDateTime } from "@/lib/format";

export const metadata = { title: "Audit log" };
export const dynamic = "force-dynamic";

const targetOptions = [
  { value: "all", label: "Everything" },
  { value: "membership", label: "Memberships" },
  { value: "user", label: "Accounts" },
  { value: "invitation", label: "Invitations" },
  { value: "payment", label: "Payments" },
];

/** Compact, human-readable summary of an entry's metadata (no raw JSON dumps). */
function summariseMeta(meta = {}) {
  return Object.entries(meta)
    .filter(([, value]) => ["string", "number", "boolean"].includes(typeof value) && String(value) !== "")
    .map(([key, value]) => `${key}: ${value}`)
    .join(" · ");
}

export default async function AdminAuditPage({ searchParams }) {
  const guard = await adminGuard("/admin/audit");
  if (guard.denied) return guard.denied;

  const params = await searchParams;
  const requested = typeof params?.type === "string" ? params.type : "all";
  const targetType = AUDIT_TARGETS.includes(requested) ? requested : "all";
  const pageParam = typeof params?.page === "string" ? params.page : "1";

  await connectDb();
  const { entries, total, page, pageCount } = await listAuditLogs({ targetType, page: pageParam });

  const pageHref = (target) => {
    const search = new URLSearchParams();
    if (targetType !== "all") search.set("type", targetType);
    if (target > 1) search.set("page", String(target));
    const qs = search.toString();
    return qs ? `/admin/audit?${qs}` : "/admin/audit";
  };

  return (
    <>
      <AdminPageHeader
        title="Audit"
        accent="log"
        description="Append-only record of privileged actions: who did what, to which record, and why."
      />

      <div className="mt-6">
        <FilterTabs basePath="/admin/audit" param="type" current={targetType} options={targetOptions} />
      </div>

      <section className="mt-6" aria-labelledby="audit-heading">
        <SectionTitle id="audit-heading" aside={`${total} entr${total === 1 ? "y" : "ies"} · page ${page} of ${pageCount}`}>
          Recorded actions
        </SectionTitle>
        {entries.length ? (
          <ul className="divide-y divide-white/[0.07] rounded-xl border border-white/10 bg-coal">
            {entries.map((entry) => {
              const summary = summariseMeta(entry.meta);
              return (
                <li key={entry._id.toString()} className="px-4 py-3 text-xs">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="min-w-0 break-words">
                      <span className="font-mono text-[0.6875rem] text-signal">{entry.action}</span>{" "}
                      <span className="text-ash">by {entry.actorEmail}</span>
                    </span>
                    <span className="font-mono text-[0.5625rem] text-ash">{formatDateTime(entry.createdAt)}</span>
                  </div>
                  <p className="mt-1 break-all font-mono text-[0.5625rem] text-ash/80">
                    {entry.targetType} · {entry.targetId}
                  </p>
                  {entry.reason ? <p className="mt-1 text-[0.6875rem] text-ash">Reason: {entry.reason}</p> : null}
                  {summary ? <p className="mt-1 break-words text-[0.6875rem] text-ash/80">{summary}</p> : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState>No privileged actions recorded yet.</EmptyState>
        )}

        {pageCount > 1 ? (
          <nav aria-label="Audit log pages" className="mt-4 flex items-center justify-between gap-3">
            {page > 1 ? (
              <Link href={pageHref(page - 1)} className="btn btn-outline btn-sm">
                ← Newer
              </Link>
            ) : (
              <span />
            )}
            {page < pageCount ? (
              <Link href={pageHref(page + 1)} className="btn btn-outline btn-sm">
                Older →
              </Link>
            ) : null}
          </nav>
        ) : null}
      </section>
    </>
  );
}
