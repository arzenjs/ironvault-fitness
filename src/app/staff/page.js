import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle, ArrowUpRight } from "lucide-react";
import AccessDenied from "@/components/dashboard/AccessDenied";
import MemberSearchForm from "@/components/dashboard/MemberSearchForm";
import MemberTable from "@/components/dashboard/MemberTable";
import ReconcileButton from "@/components/dashboard/ReconcileButton";
import { PaymentBadge } from "@/components/account/Badges";
import { getSessionUser } from "@/lib/session";
import { connectDb } from "@/lib/db";
import { searchMembers } from "@/services/staff";
import { listPendingPayments } from "@/services/payments";
import { formatDateTime, formatINR, paymentStatusMeta } from "@/lib/format";

export const metadata = {
  title: "Staff portal",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function StaffPage({ searchParams }) {
  const user = await getSessionUser();

  // 1) Not signed in → authenticate first.
  if (!user) redirect(`/login?next=${encodeURIComponent("/staff")}`);
  // 2) Wrong role → refuse here (every API route re-checks on its own too).
  if (!["staff", "admin"].includes(user.role)) return <AccessDenied required="staff or admin" area="The staff portal" />;

  const params = await searchParams;
  const query = typeof params?.q === "string" ? params.q.slice(0, 120) : "";
  const status = typeof params?.status === "string" ? params.status : "all";
  const planId = typeof params?.plan === "string" ? params.plan : "all";

  await connectDb();
  const [{ results, total, truncated }, pendingPayments] = await Promise.all([
    searchMembers({ query, status, planId }),
    listPendingPayments(8),
  ]);

  return (
    <section className="pt-28 md:pt-32">
      <div className="shell pb-20">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">Staff portal</p>
            <h1 className="display mt-3 text-[clamp(2rem,4.4vw,3rem)]">
              Member <span className="text-signal">lookup</span>
            </h1>
            <p className="mt-2 max-w-xl text-sm text-ash">
              Search members, check membership validity and see verified payment state. You can reconcile a
              stuck payment, but you cannot mark a payment successful by hand.
            </p>
          </div>
          {user.role === "admin" ? (
            <Link href="/admin" className="btn btn-outline btn-sm shrink-0">
              Admin dashboard <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
          ) : null}
        </div>

        <div className="mt-8">
          <MemberSearchForm query={query} status={status} planId={planId} />
        </div>

        {/* pending payments */}
        <section className="mt-8" aria-labelledby="pending-heading">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle size={15} className="text-amber-300" aria-hidden="true" />
            <h2 id="pending-heading" className="text-sm font-semibold text-fog">
              Payments needing reconciliation
            </h2>
            <span className="font-mono text-[0.5625rem] uppercase tracking-[0.16em] text-ash">
              {pendingPayments.length} shown
            </span>
          </div>

          {pendingPayments.length ? (
            <ul className="space-y-2">
              {pendingPayments.map((payment) => {
                const meta = paymentStatusMeta[payment.status] || paymentStatusMeta.pending;
                return (
                  <li
                    key={payment._id.toString()}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300/25 bg-amber-300/[0.05] px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-fog">
                        {payment.customerName || "Member"} · {payment.planName} · {formatINR(payment.amountPaise)}
                      </p>
                      <p className="mt-0.5 break-all font-mono text-[0.625rem] text-ash">
                        {payment.razorpayOrderId || "no order"} · {formatDateTime(payment.createdAt)}
                        {payment.failureReason ? ` · ${payment.failureReason}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <PaymentBadge tone={meta.tone}>{meta.label}</PaymentBadge>
                      <ReconcileButton paymentId={payment._id.toString()} />
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="rounded-xl border border-white/10 bg-coal px-4 py-5 text-xs text-ash">
              No payments are waiting. Pending and review rows appear here automatically.
            </p>
          )}
        </section>

        {/* member results */}
        <section className="mt-10" aria-labelledby="results-heading">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="results-heading" className="text-sm font-semibold text-fog">
              Members
            </h2>
            <p className="font-mono text-[0.5625rem] uppercase tracking-[0.16em] text-ash" aria-live="polite">
              {total} match{total === 1 ? "" : "es"}
              {truncated ? " · showing first 40" : ""}
            </p>
          </div>
          <MemberTable members={results} />
        </section>

        <p className="mt-6 rounded-xl border border-white/10 bg-coal px-4 py-3 text-[0.6875rem] leading-relaxed text-ash">
          Staff access is read-only for payment amounts and membership activation. Role and account status are
          re-checked against the database on every request.
        </p>
      </div>
    </section>
  );
}
