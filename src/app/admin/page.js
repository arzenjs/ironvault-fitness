import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AdminPageHeader, EmptyState, SectionTitle, StatCard } from "@/components/admin/AdminUI";
import { PaymentBadge } from "@/components/account/Badges";
import ReconcileButton from "@/components/dashboard/ReconcileButton";
import { adminGuard } from "@/lib/admin-guard";
import { connectDb } from "@/lib/db";
import { getAdminOverview } from "@/services/admin";
import { formatDateTime, formatINR, paymentStatusMeta } from "@/lib/format";

export const metadata = { title: "Overview" };
export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const guard = await adminGuard("/admin");
  if (guard.denied) return guard.denied;

  await connectDb();
  const { revenue, last30Days, counts, reconcileList, audit } = await getAdminOverview();

  return (
    <>
      <AdminPageHeader
        title="Operations"
        accent="overview"
        description="Revenue counts verified successful payments only. Pending and review rows are never included in totals."
        actions={
          <Link href="/staff" className="btn btn-outline btn-sm">
            Staff lookup <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
        }
      />

      <section className="mt-8" aria-labelledby="metrics-heading">
        <h2 id="metrics-heading" className="sr-only">
          Key metrics
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Verified revenue"
            value={formatINR(revenue.totalPaise)}
            hint={`${revenue.count} membership${revenue.count === 1 ? "" : "s"} sold · ${formatINR(last30Days.totalPaise)} in the last 30 days`}
            href="/admin/payments?status=successful"
          />
          <StatCard
            label="Active memberships"
            value={counts.activeMemberships}
            hint={`${counts.queuedMemberships} queued to start`}
            href="/admin/members?status=active"
          />
          <StatCard
            label="Suspended memberships"
            value={counts.suspendedMemberships}
            hint="Access paused by an admin"
            href="/admin/members?status=suspended"
            tone={counts.suspendedMemberships ? "warn" : "default"}
          />
          <StatCard
            label="Needs reconciliation"
            value={counts.needsReconcile}
            hint={`${counts.inReview} need manual review`}
            href="/admin/payments?status=attention"
            tone={counts.inReview ? "bad" : counts.needsReconcile ? "warn" : "default"}
          />
          <StatCard label="Customers" value={counts.customers} hint="Registered customer accounts" href="/admin/users?role=customer" />
          <StatCard label="Staff & admins" value={counts.staffAccounts} hint="Invitation-only accounts" href="/admin/staff" />
          <StatCard
            label="Open invitations"
            value={counts.openInvitations}
            hint="Single-use, 48-hour links"
            href="/admin/staff"
          />
          <StatCard
            label="Disabled accounts"
            value={counts.disabledAccounts}
            hint="Cannot sign in"
            href="/admin/users?status=disabled"
            tone={counts.disabledAccounts ? "warn" : "default"}
          />
        </div>
      </section>

      <div className="mt-10 grid gap-8 xl:grid-cols-2">
        <section aria-labelledby="by-plan-heading">
          <SectionTitle id="by-plan-heading">Revenue by plan</SectionTitle>
          {revenue.byPlan.length ? (
            <ul className="card divide-y divide-white/[0.07] px-4">
              {revenue.byPlan.map((row) => (
                <li key={row._id} className="flex items-baseline justify-between gap-3 py-3 text-sm">
                  <span className="min-w-0 truncate text-fog">{row._id}</span>
                  <span className="whitespace-nowrap font-mono text-xs text-fog">
                    {formatINR(row.totalPaise)} <span className="text-ash">· {row.count}</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState>No verified sales yet.</EmptyState>
          )}
        </section>

        <section aria-labelledby="recent-actions-heading">
          <SectionTitle
            id="recent-actions-heading"
            aside={
              <Link href="/admin/audit" className="hover:text-fog">
                Full audit log →
              </Link>
            }
          >
            Recent admin actions
          </SectionTitle>
          {audit.length ? (
            <ul className="divide-y divide-white/[0.07] rounded-xl border border-white/10 bg-coal">
              {audit.map((entry) => (
                <li key={entry._id.toString()} className="px-4 py-2.5 text-xs">
                  <p className="min-w-0 break-words">
                    <span className="font-mono text-[0.625rem] text-signal">{entry.action}</span>{" "}
                    <span className="text-ash">by {entry.actorEmail}</span>
                  </p>
                  <p className="mt-0.5 font-mono text-[0.5625rem] text-ash">{formatDateTime(entry.createdAt)}</p>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState>No privileged actions recorded yet.</EmptyState>
          )}
        </section>
      </div>

      <section className="mt-10" aria-labelledby="recon-heading">
        <SectionTitle
          id="recon-heading"
          aside={
            <Link href="/admin/payments?status=attention" className="hover:text-fog">
              All payments needing attention →
            </Link>
          }
        >
          Needs reconciliation
        </SectionTitle>
        {reconcileList.length ? (
          <ul className="space-y-2">
            {reconcileList.map((payment) => {
              const meta = paymentStatusMeta[payment.status] || paymentStatusMeta.pending;
              return (
                <li
                  key={payment._id.toString()}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-coal px-4 py-3"
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
          <EmptyState>Nothing pending. New rows appear here as customers start checkout.</EmptyState>
        )}
      </section>
    </>
  );
}
