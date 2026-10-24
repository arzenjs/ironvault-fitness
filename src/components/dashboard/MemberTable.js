import { ChevronDown } from "lucide-react";
import { MembershipBadge, PaymentBadge, RoleBadge } from "@/components/account/Badges";
import { formatDate, formatINR, paymentStatusMeta } from "@/lib/format";
import { stateLabels } from "@/lib/membership-status";
import ReconcileButton from "@/components/dashboard/ReconcileButton";

/**
 * Staff member list.
 *
 * Each row is a <details> element, so a member's memberships and latest payment
 * expand inline without a second page. Works with the keyboard and without JS.
 */
export default function MemberTable({ members, canReconcile = true }) {
  if (!members.length) {
    return (
      <div className="rounded-xl border border-dashed border-white/15 bg-coal px-5 py-12 text-center">
        <p className="text-sm font-medium text-fog">No members match this search</p>
        <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-ash">
          Try a different name or email, or clear the membership filters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {members.map((member) => (
        <details key={member.id} className="group rounded-xl border border-white/10 bg-coal open:border-white/20">
          <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3 px-4 py-3 transition hover:bg-white/[0.03]">
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-2">
                <span className="truncate text-sm font-medium text-fog">{member.name}</span>
                {member.status === "disabled" ? (
                  <span className="rounded-full border border-red-400/35 bg-red-400/10 px-2 py-0.5 font-mono text-[0.5rem] uppercase tracking-[0.12em] text-red-200">
                    disabled
                  </span>
                ) : null}
              </span>
              <span className="mt-0.5 block truncate text-xs text-ash">{member.email}</span>
            </span>

            <span className="flex items-center gap-2">
              <MembershipBadge state={member.currentState} label={stateLabels[member.currentState] || member.currentState} />
              <span className="hidden font-mono text-[0.625rem] uppercase tracking-[0.12em] text-ash sm:block">
                {member.latestPayment ? paymentStatusMeta[member.latestPayment.status]?.label : "No payment"}
              </span>
              <ChevronDown
                size={15}
                className="text-ash transition-transform group-open:rotate-180"
                aria-hidden="true"
              />
            </span>
          </summary>

          <div className="border-t border-white/10 px-4 py-4">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <h3 className="eyebrow">Memberships</h3>
                {member.memberships.length ? (
                  <ul className="mt-3 space-y-2.5">
                    {member.memberships.map((membership) => (
                      <li key={membership.id} className="rounded-lg border border-white/[0.08] bg-ink px-3 py-2.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs font-medium text-fog">{membership.planName}</span>
                          <MembershipBadge state={membership.state} label={stateLabels[membership.state]} />
                        </div>
                        <p className="mt-1 font-mono text-[0.625rem] text-ash">
                          {formatDate(membership.startDate)} → {formatDate(membership.endDate)} ·{" "}
                          {formatINR(membership.pricePaise)}
                        </p>
                        {membership.daysRemaining != null ? (
                          <p className="mt-0.5 text-[0.625rem] text-ash/70">{membership.daysRemaining} days remaining</p>
                        ) : null}
                        {membership.statusReason ? (
                          <p className="mt-1 text-[0.625rem] text-amber-200/80">Note: {membership.statusReason}</p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-xs text-ash">No memberships on record.</p>
                )}
              </div>

              <div>
                <h3 className="eyebrow">Latest payment</h3>
                {member.latestPayment ? (
                  <div className="mt-3 rounded-lg border border-white/[0.08] bg-ink px-3 py-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs text-fog">{member.latestPayment.planName}</span>
                      <PaymentBadge tone={paymentStatusMeta[member.latestPayment.status]?.tone}>
                        {paymentStatusMeta[member.latestPayment.status]?.label || member.latestPayment.status}
                      </PaymentBadge>
                    </div>
                    <p className="mt-1 text-xs text-fog/80">{formatINR(member.latestPayment.amountPaise)}</p>
                    <p className="mt-1 break-all font-mono text-[0.625rem] text-ash">
                      {member.latestPayment.razorpayPaymentId || "no payment id"}
                    </p>
                    {canReconcile && ["pending", "review", "created"].includes(member.latestPayment.status) ? (
                      <div className="mt-2.5">
                        <ReconcileButton paymentId={member.latestPayment._id.toString()} />
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-ash">No payment attempts.</p>
                )}

                <h3 className="eyebrow mt-5">Account</h3>
                <dl className="mt-2 space-y-1 text-[0.6875rem] text-ash">
                  <div className="flex justify-between gap-3">
                    <dt>Joined</dt>
                    <dd className="text-fog/80">{formatDate(member.createdAt)}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>Phone</dt>
                    <dd className="text-fog/80">{member.phone || "—"}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt>Role</dt>
                    <dd>
                      <RoleBadge role="customer" />
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </details>
      ))}
    </div>
  );
}
