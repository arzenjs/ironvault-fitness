import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, BadgeIndianRupee, ClipboardList, Mail, Users } from "lucide-react";
import AccessDenied from "@/components/dashboard/AccessDenied";
import MemberSearchForm from "@/components/dashboard/MemberSearchForm";
import MemberTable from "@/components/dashboard/MemberTable";
import InviteStaffForm from "@/components/dashboard/InviteStaffForm";
import ReconcileButton from "@/components/dashboard/ReconcileButton";
import { MembershipAction, UserStatusAction } from "@/components/dashboard/AdminActions";
import { MembershipBadge, PaymentBadge, RoleBadge } from "@/components/account/Badges";
import { getSessionUser } from "@/lib/session";
import { connectDb } from "@/lib/db";
import { searchMembers } from "@/services/staff";
import { getRevenueSummary, listPendingPayments } from "@/services/payments";
import User from "@/models/User";
import Invitation from "@/models/Invitation";
import AuditLog from "@/models/AuditLog";
import { formatDate, formatDateTime, formatINR, paymentStatusMeta } from "@/lib/format";
import { stateLabels } from "@/lib/membership-status";

export const metadata = {
  title: "Admin dashboard",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPage({ searchParams }) {
  const user = await getSessionUser();
  if (!user) redirect(`/login?next=${encodeURIComponent("/admin")}`);
  if (user.role !== "admin") return <AccessDenied required="admin" area="The admin dashboard" />;

  const params = await searchParams;
  const query = typeof params?.q === "string" ? params.q.slice(0, 120) : "";
  const status = typeof params?.status === "string" ? params.status : "all";
  const planId = typeof params?.plan === "string" ? params.plan : "all";

  await connectDb();
  const [{ results, total }, revenue, pendingPayments, staffUsers, invitations, audit] = await Promise.all([
    searchMembers({ query, status, planId, limit: 30 }),
    getRevenueSummary(),
    listPendingPayments(8),
    User.find({ role: { $in: ["staff", "admin"] } }).sort({ createdAt: -1 }).limit(30).lean(),
    Invitation.find({}).sort({ createdAt: -1 }).limit(10).lean(),
    AuditLog.find({}).sort({ createdAt: -1 }).limit(12).lean(),
  ]);

  const suspendedMemberships = results.flatMap((member) =>
    member.memberships
      .filter((membership) => membership.storedStatus === "suspended")
      .map((membership) => ({ ...membership, memberName: member.name, memberEmail: member.email })),
  );

  return (
    <section className="pt-28 md:pt-32">
      <div className="shell pb-20">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">Admin</p>
            <h1 className="display mt-3 text-[clamp(2rem,4.4vw,3rem)]">
              Operations <span className="text-signal">dashboard</span>
            </h1>
            <p className="mt-2 max-w-xl text-sm text-ash">
              Revenue counts verified successful payments only. Pending and review rows are never included in
              totals.
            </p>
          </div>
          <Link href="/staff" className="btn btn-outline btn-sm shrink-0">
            Staff lookup <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
        </div>

        {/* revenue */}
        <section className="mt-8" aria-labelledby="revenue-heading">
          <h2 id="revenue-heading" className="sr-only">
            Revenue summary
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="card p-5">
              <p className="eyebrow flex items-center gap-2">
                <BadgeIndianRupee size={12} className="text-signal" aria-hidden="true" /> Verified revenue
              </p>
              <p className="display mt-2 text-[clamp(1.8rem,3.4vw,2.4rem)]">{formatINR(revenue.totalPaise)}</p>
              <p className="mt-1 text-[0.6875rem] text-ash">Sum of successful payments only</p>
            </div>
            <div className="card p-5">
              <p className="eyebrow flex items-center gap-2">
                <ClipboardList size={12} className="text-signal" aria-hidden="true" /> Memberships sold
              </p>
              <p className="display mt-2 text-[clamp(1.8rem,3.4vw,2.4rem)]">{revenue.count}</p>
              <p className="mt-1 text-[0.6875rem] text-ash">One membership per successful payment</p>
            </div>
            <div className="card p-5">
              <p className="eyebrow">By plan</p>
              {revenue.byPlan.length ? (
                <ul className="mt-3 space-y-1.5 text-xs">
                  {revenue.byPlan.map((row) => (
                    <li key={row._id} className="flex items-baseline justify-between gap-3">
                      <span className="truncate text-ash">{row._id}</span>
                      <span className="whitespace-nowrap font-mono text-fog">
                        {formatINR(row.totalPaise)} <span className="text-ash">· {row.count}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-xs text-ash">No verified sales yet.</p>
              )}
            </div>
          </div>
        </section>

        {/* reconciliation */}
        <section className="mt-10" aria-labelledby="recon-heading">
          <h2 id="recon-heading" className="text-sm font-semibold text-fog">
            Needs reconciliation
          </h2>
          {pendingPayments.length ? (
            <ul className="mt-3 space-y-2">
              {pendingPayments.map((payment) => {
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
            <p className="mt-3 rounded-xl border border-white/10 bg-coal px-4 py-5 text-xs text-ash">
              Nothing pending. New rows appear here as customers start checkout.
            </p>
          )}
        </section>

        {/* members */}
        <section className="mt-10" aria-labelledby="members-heading">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="members-heading" className="text-sm font-semibold text-fog">
              Member records
            </h2>
            <p className="font-mono text-[0.5625rem] uppercase tracking-[0.16em] text-ash">{total} match(es)</p>
          </div>
          <MemberSearchForm query={query} status={status} planId={planId} />
          <div className="mt-4">
            <MemberTable members={results} />
          </div>
        </section>

        {/* suspensions */}
        <section className="mt-10" aria-labelledby="suspensions-heading">
          <h2 id="suspensions-heading" className="text-sm font-semibold text-fog">
            Access control
          </h2>
          <p className="mt-1 text-xs text-ash">
            Suspended memberships in the current search results. Every change requires a reason and is logged.
          </p>
          {suspendedMemberships.length ? (
            <ul className="mt-3 space-y-2">
              {suspendedMemberships.map((membership) => (
                <li
                  key={membership.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-400/25 bg-red-400/[0.05] px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm text-fog">
                      {membership.memberName} · {membership.planName}
                    </p>
                    <p className="mt-0.5 truncate text-[0.625rem] text-ash">
                      {membership.memberEmail} · {formatDate(membership.startDate)} → {formatDate(membership.endDate)}
                    </p>
                    {membership.statusReason ? (
                      <p className="mt-1 text-[0.625rem] text-amber-200/80">Reason: {membership.statusReason}</p>
                    ) : null}
                  </div>
                  <MembershipAction
                    membershipId={membership.id}
                    suspended
                    label={`${membership.memberName}'s ${membership.planName}`}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 rounded-xl border border-white/10 bg-coal px-4 py-4 text-xs text-ash">
              No suspended memberships in these results. Search for a member above to suspend or reinstate their
              access.
            </p>
          )}

          {results.some((member) => member.memberships.some((m) => m.storedStatus !== "suspended")) ? (
            <div className="mt-4 space-y-2">
              {results
                .flatMap((member) =>
                  member.memberships
                    .filter((membership) => membership.storedStatus !== "suspended" && membership.state === "active")
                    .map((membership) => ({ ...membership, memberName: member.name })),
                )
                .slice(0, 6)
                .map((membership) => (
                  <div
                    key={membership.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-coal px-4 py-2.5"
                  >
                    <p className="min-w-0 truncate text-xs text-ash">
                      <span className="text-fog">{membership.memberName}</span> · {membership.planName} ·{" "}
                      {stateLabels[membership.state]}
                    </p>
                    <MembershipAction
                      membershipId={membership.id}
                      suspended={false}
                      label={`${membership.memberName}'s ${membership.planName}`}
                    />
                  </div>
                ))}
            </div>
          ) : null}
        </section>

        {/* staff + invitations */}
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <section aria-labelledby="invite-heading" className="card p-5">
            <h2 id="invite-heading" className="flex items-center gap-2 text-sm font-semibold text-fog">
              <Mail size={14} className="text-signal" aria-hidden="true" /> Invite staff
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-ash">
              Invitations are single-use and expire after 48 hours. Only the hash of the token is stored.
            </p>
            <div className="mt-4">
              <InviteStaffForm />
            </div>

            <h3 className="eyebrow mt-6">Recent invitations</h3>
            {invitations.length ? (
              <ul className="mt-2 space-y-2">
                {invitations.map((invitation) => {
                  const state = invitation.usedAt
                    ? "used"
                    : invitation.revokedAt
                      ? "revoked"
                      : new Date(invitation.expiresAt) < new Date()
                        ? "expired"
                        : "open";
                  return (
                    <li key={invitation._id.toString()} className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.07] pb-2 text-xs last:border-0">
                      <span className="min-w-0 truncate text-ash">{invitation.email}</span>
                      <span className="flex items-center gap-2">
                        <RoleBadge role={invitation.role} />
                        <span className={`font-mono text-[0.5625rem] uppercase tracking-[0.12em] ${state === "open" ? "text-emerald-300" : "text-ash"}`}>
                          {state}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-2 text-xs text-ash">No invitations yet.</p>
            )}
          </section>

          <section aria-labelledby="staff-heading" className="card p-5">
            <h2 id="staff-heading" className="flex items-center gap-2 text-sm font-semibold text-fog">
              <Users size={14} className="text-signal" aria-hidden="true" /> Staff accounts
            </h2>
            {staffUsers.length ? (
              <ul className="mt-3 space-y-2">
                {staffUsers.map((staff) => (
                  <li
                    key={staff._id.toString()}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/[0.08] bg-ink px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-fog">{staff.name}</p>
                      <p className="truncate text-[0.625rem] text-ash">{staff.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <RoleBadge role={staff.role} />
                      <MembershipBadge state={staff.status === "active" ? "active" : "suspended"} label={staff.status} />
                      {staff._id.toString() !== user.id ? (
                        <UserStatusAction
                          userId={staff._id.toString()}
                          disabled={staff.status === "disabled"}
                          label={staff.email}
                        />
                      ) : (
                        <span className="font-mono text-[0.5rem] uppercase tracking-[0.12em] text-ash">you</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-xs text-ash">No staff accounts yet.</p>
            )}
          </section>
        </div>

        {/* audit */}
        <section className="mt-10" aria-labelledby="audit-heading">
          <h2 id="audit-heading" className="text-sm font-semibold text-fog">
            Recent admin actions
          </h2>
          {audit.length ? (
            <ul className="mt-3 divide-y divide-white/[0.07] rounded-xl border border-white/10 bg-coal">
              {audit.map((entry) => (
                <li key={entry._id.toString()} className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-2.5 text-xs">
                  <span className="min-w-0">
                    <span className="font-mono text-[0.625rem] text-signal">{entry.action}</span>{" "}
                    <span className="text-ash">by {entry.actorEmail}</span>
                    {entry.reason ? <span className="text-ash/70"> · “{entry.reason}”</span> : null}
                  </span>
                  <span className="font-mono text-[0.5625rem] text-ash">{formatDateTime(entry.createdAt)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 rounded-xl border border-white/10 bg-coal px-4 py-4 text-xs text-ash">
              No privileged actions recorded yet.
            </p>
          )}
        </section>
      </div>
    </section>
  );
}
