import User from "@/models/User";
import Membership from "@/models/Membership";
import Payment from "@/models/Payment";
import { deriveMembershipState } from "@/lib/membership-status";

/**
 * Member search for the staff portal.
 *
 * Kept intentionally simple: load the matching customer accounts (capped), then
 * their memberships and latest payments in two extra queries, and filter the
 * derived state in JS. At current scale that is cheaper to read and maintain than a
 * complex aggregation pipeline.
 */
export async function searchMembers({ query = "", status = "all", planId = "all", limit = 40 } = {}) {
  const conditions = { role: "customer" };

  if (query.trim()) {
    const safe = query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const rx = new RegExp(safe, "i");
    conditions.$or = [{ name: rx }, { email: rx }, { phone: rx }];
  }

  const users = await User.find(conditions).sort({ createdAt: -1 }).limit(200).lean();
  if (!users.length) return { results: [], total: 0, truncated: false };

  const ids = users.map((user) => user._id);

  const [memberships, payments] = await Promise.all([
    Membership.find({ userId: { $in: ids } }).sort({ endDate: -1 }).lean(),
    Payment.aggregate([
      { $match: { userId: { $in: ids } } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$userId",
          status: { $first: "$status" },
          planName: { $first: "$planName" },
          amountPaise: { $first: "$amountPaise" },
          razorpayPaymentId: { $first: "$razorpayPaymentId" },
          createdAt: { $first: "$createdAt" },
        },
      },
    ]),
  ]);

  const paymentsByUser = new Map(payments.map((payment) => [payment._id.toString(), payment]));

  let results = users.map((user) => {
    const key = user._id.toString();
    const mine = memberships.filter((membership) => membership.userId.toString() === key);
    const enriched = mine.map((membership) => ({
      ...membership,
      derived: deriveMembershipState(membership),
    }));

    const active = enriched.find((m) => m.derived.state === "active") || null;
    const queued = enriched.find((m) => m.derived.state === "queued") || null;
    const current = active || queued || enriched[0] || null;

    return {
      id: key,
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      status: user.status,
      createdAt: user.createdAt,
      memberships: enriched.map((membership) => ({
        id: membership._id.toString(),
        planId: membership.planId,
        planName: membership.planName,
        pricePaise: membership.pricePaise,
        startDate: membership.startDate,
        endDate: membership.endDate,
        storedStatus: membership.status,
        statusReason: membership.statusReason,
        state: membership.derived.state,
        daysRemaining: membership.derived.daysRemaining ?? null,
      })),
      currentState: current ? (current.derived?.state || current.state) : "none",
      currentPlanId: current?.planId || null,
      latestPayment: paymentsByUser.get(key) || null,
    };
  });

  if (status !== "all") {
    results = results.filter((result) => result.currentState === status);
  }
  if (planId !== "all") {
    results = results.filter((result) => result.currentPlanId === planId);
  }

  return {
    results: results.slice(0, limit),
    total: results.length,
    truncated: results.length > limit,
  };
}
