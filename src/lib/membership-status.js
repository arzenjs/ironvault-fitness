import { daysBetween } from "@/lib/dates";

/**
 * The stored `status` field is a cache, not the source of truth.
 * Everything the customer sees is derived from the dates, so an expired
 * membership can never keep looking active just because a cron job did not run.
 */
export function deriveMembershipState(membership, now = new Date()) {
  if (!membership) return { state: "none" };
  if (membership.status === "suspended") return { state: "suspended" };

  const start = new Date(membership.startDate);
  const end = new Date(membership.endDate);

  if (now < start) return { state: "queued", startsInDays: daysBetween(now, start) };
  if (now > end) return { state: "expired" };
  return { state: "active", daysRemaining: daysBetween(now, end) };
}

export const stateLabels = {
  active: "Active",
  queued: "Queued",
  expired: "Expired",
  suspended: "Suspended",
  none: "No plan",
};
