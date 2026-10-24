import Membership from "@/models/Membership";
import AuditLog from "@/models/AuditLog";
import { addMonthsClamped, nextStartDate } from "@/lib/dates";
import { getPlanById } from "@/config/membership-plans";
import { deriveMembershipState } from "@/lib/membership-status";

/**
 * Membership lifecycle rules (all server-side):
 *
 * - A membership begins when the payment is verified (or immediately after the
 *   latest still-valid membership ends, if one exists). Paid days are never
 *   shortened.
 * - The expiry date is calendar-month arithmetic with day clamping.
 * - One payment can activate exactly one membership: the unique index on
 *   `paymentId` enforces that at the database level.
 */

export async function listUserMemberships(userId) {
  return Membership.find({ userId }).sort({ startDate: 1 }).lean();
}

/**
 * Groups a customer's memberships into what the dashboard needs.
 * Derived from dates, not only from the stored status field.
 */
export function summariseMemberships(memberships, now = new Date()) {
  const enriched = memberships.map((membership) => ({
    ...membership,
    derived: deriveMembershipState(membership, now),
  }));

  const active = enriched.find((m) => m.derived.state === "active") || null;
  const queued = enriched
    .filter((m) => m.derived.state === "queued")
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  const past = enriched
    .filter((m) => m.derived.state === "expired")
    .sort((a, b) => new Date(b.endDate) - new Date(a.endDate));

  return { active, queued, past, all: enriched };
}

/**
 * Creates the membership for a verified payment, idempotently.
 *
 * Call order matters: the membership row is created first, then the payment is
 * marked successful. If the process dies between the two steps, the webhook
 * retry finds the existing membership (unique index) and finishes the payment
 * update — so the pair always converges.
 */
export async function activateMembershipForPayment(payment, { source = "razorpay" } = {}) {
  const existingForPayment = await Membership.findOne({ paymentId: payment._id }).lean();
  if (existingForPayment) return { membership: existingForPayment, created: false };

  const now = new Date();
  const existingValid = await Membership.find({
    userId: payment.userId,
    endDate: { $gt: now },
    status: { $ne: "suspended" },
  })
    .select("endDate")
    .lean();

  const startDate = nextStartDate({ existingMemberships: existingValid, now });
  const durationMonths = payment.durationMonths || getPlanById(payment.planId)?.durationMonths;
  if (!durationMonths) throw new Error(`Cannot resolve duration for plan ${payment.planId}`);
  const endDate = addMonthsClamped(startDate, durationMonths);
  const isQueued = startDate.getTime() > now.getTime();

  try {
    const membership = await Membership.create({
      userId: payment.userId,
      paymentId: payment._id,
      planId: payment.planId,
      planName: payment.planName,
      pricePaise: payment.amountPaise,
      durationMonths,
      startDate,
      endDate,
      status: isQueued ? "queued" : "active",
    });

    return { membership: membership.toObject(), created: true, source };
  } catch (error) {
    // E11000 here means a concurrent webhook/verify already created the row.
    if (error?.code === 11000) {
      const membership = await Membership.findOne({ paymentId: payment._id }).lean();
      return { membership, created: false };
    }
    throw error;
  }
}

/** Admin action: suspend or reinstate, with an audit record. */
export async function changeMembershipStatus({ membershipId, action, reason, actor }) {
  const membership = await Membership.findById(membershipId);
  if (!membership) return null;

  if (action === "suspend") {
    membership.status = "suspended";
  } else {
    // Reinstate to the state the dates imply, not blindly to "active".
    const derived = deriveMembershipState({ ...membership.toObject(), status: "active" });
    membership.status = derived.state === "queued" ? "queued" : "active";
  }

  membership.statusReason = reason || "";
  membership.statusChangedBy = actor.id;
  membership.statusChangedAt = new Date();
  await membership.save();

  await AuditLog.create({
    actorId: actor.id,
    actorEmail: actor.email,
    action: action === "suspend" ? "membership.suspended" : "membership.reinstated",
    targetType: "membership",
    targetId: membership._id.toString(),
    reason: reason || "",
    meta: { planId: membership.planId, userId: membership.userId.toString() },
  });

  return membership.toObject();
}
