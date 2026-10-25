import User from "@/models/User";
import Invitation from "@/models/Invitation";
import AuditLog from "@/models/AuditLog";
import Payment from "@/models/Payment";
import Membership from "@/models/Membership";
import { getRevenueSummary } from "@/services/payments";

/**
 * Read-only queries behind the admin dashboard.
 *
 * Nothing here authorises anything: callers (the /admin pages) must run
 * adminGuard() first. Mutations are NOT duplicated here — suspension,
 * reinstatement, account enable/disable, invitations and reconciliation keep
 * going through their existing, admin-checked API routes and services.
 */

export const PAYMENT_STATUSES = ["created", "pending", "successful", "failed", "abandoned", "review"];
export const RECONCILE_STATUSES = ["created", "pending", "review"];
export const AUDIT_TARGETS = ["membership", "user", "invitation", "payment"];

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function invitationState(invitation, now = new Date()) {
  if (invitation.usedAt) return "used";
  if (invitation.revokedAt) return "revoked";
  if (new Date(invitation.expiresAt) < now) return "expired";
  return "open";
}

export async function getAdminOverview() {
  const now = new Date();
  const since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    revenue,
    recent,
    customers,
    staffAccounts,
    disabledAccounts,
    activeMemberships,
    queuedMemberships,
    suspendedMemberships,
    needsReconcile,
    inReview,
    openInvitations,
    reconcileList,
    audit,
  ] = await Promise.all([
    getRevenueSummary(),
    Payment.aggregate([
      { $match: { status: "successful", verifiedAt: { $gte: since } } },
      { $group: { _id: null, totalPaise: { $sum: "$amountPaise" }, count: { $sum: 1 } } },
    ]),
    User.countDocuments({ role: "customer" }),
    User.countDocuments({ role: { $in: ["staff", "admin"] } }),
    User.countDocuments({ status: "disabled" }),
    // Same definition as deriveMembershipState(): not suspended, inside its date window.
    Membership.countDocuments({ status: { $ne: "suspended" }, startDate: { $lte: now }, endDate: { $gte: now } }),
    Membership.countDocuments({ status: { $ne: "suspended" }, startDate: { $gt: now } }),
    Membership.countDocuments({ status: "suspended" }),
    Payment.countDocuments({ status: { $in: RECONCILE_STATUSES } }),
    Payment.countDocuments({ status: "review" }),
    Invitation.countDocuments({ usedAt: null, revokedAt: null, expiresAt: { $gt: now } }),
    Payment.find({ status: { $in: RECONCILE_STATUSES } }).sort({ createdAt: -1 }).limit(5).lean(),
    AuditLog.find({}).sort({ createdAt: -1 }).limit(6).lean(),
  ]);

  return {
    revenue,
    last30Days: { totalPaise: recent[0]?.totalPaise || 0, count: recent[0]?.count || 0 },
    counts: {
      customers,
      staffAccounts,
      disabledAccounts,
      activeMemberships,
      queuedMemberships,
      suspendedMemberships,
      needsReconcile,
      inReview,
      openInvitations,
    },
    reconcileList,
    audit,
  };
}

/** Accounts of every role (never includes password hashes: the field is select:false). */
export async function listUsers({ query = "", role = "all", status = "all", limit = 60 } = {}) {
  const conditions = {};
  if (["customer", "staff", "admin"].includes(role)) conditions.role = role;
  if (["active", "disabled"].includes(status)) conditions.status = status;
  if (query.trim()) {
    const rx = new RegExp(escapeRegExp(query.trim()), "i");
    conditions.$or = [{ name: rx }, { email: rx }, { phone: rx }];
  }
  const [users, total] = await Promise.all([
    User.find(conditions).sort({ createdAt: -1 }).limit(limit).lean(),
    User.countDocuments(conditions),
  ]);
  return { users, total, truncated: total > users.length };
}

export async function listInvitations(limit = 50) {
  const invitations = await Invitation.find({}).sort({ createdAt: -1 }).limit(limit).lean();
  const inviterIds = [...new Set(invitations.map((invitation) => invitation.invitedBy?.toString()).filter(Boolean))];
  const inviters = inviterIds.length ? await User.find({ _id: { $in: inviterIds } }).select("name email").lean() : [];
  const byId = new Map(inviters.map((inviter) => [inviter._id.toString(), inviter]));
  return invitations.map((invitation) => ({
    ...invitation,
    state: invitationState(invitation),
    inviter: byId.get(invitation.invitedBy?.toString()) || null,
  }));
}

export async function listPayments({ status = "all", query = "", limit = 60 } = {}) {
  const conditions = {};
  if (PAYMENT_STATUSES.includes(status)) conditions.status = status;
  if (status === "attention") conditions.status = { $in: RECONCILE_STATUSES };
  if (query.trim()) {
    const rx = new RegExp(escapeRegExp(query.trim()), "i");
    conditions.$or = [{ customerEmail: rx }, { customerName: rx }, { razorpayOrderId: rx }, { razorpayPaymentId: rx }];
  }
  const [payments, total] = await Promise.all([
    Payment.find(conditions).sort({ createdAt: -1 }).limit(limit).lean(),
    Payment.countDocuments(conditions),
  ]);
  return { payments, total, truncated: total > payments.length };
}

export async function listAuditLogs({ targetType = "all", page = 1, pageSize = 40 } = {}) {
  const conditions = AUDIT_TARGETS.includes(targetType) ? { targetType } : {};
  const safePage = Math.max(1, Math.min(Number.parseInt(page, 10) || 1, 500));
  const [entries, total] = await Promise.all([
    AuditLog.find(conditions)
      .sort({ createdAt: -1 })
      .skip((safePage - 1) * pageSize)
      .limit(pageSize)
      .lean(),
    AuditLog.countDocuments(conditions),
  ]);
  return { entries, total, page: safePage, pageSize, pageCount: Math.max(1, Math.ceil(total / pageSize)) };
}
