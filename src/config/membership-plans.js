/**
 * Membership plan definitions — THE authoritative source of pricing.
 *
 * The browser only ever sends a `planId`. The server looks the plan up here and
 * uses `pricePaise` + `durationMonths` from this file for order creation,
 * payment verification and membership activation. Never trust a client-supplied
 * amount, currency or duration.
 *
 * amount is stored in paise (₹1 = 100 paise), which is what Razorpay expects.
 */
export const membershipPlans = [
  {
    id: "vault-monthly",
    name: "Vault Monthly",
    shortLabel: "Monthly",
    pricePaise: 149900, // ₹1,499
    durationMonths: 1,
    billingLabel: "per month",
    summary: "A one-month pass to the whole floor. Ideal if you are testing the room.",
    benefits: [
      "One month of gym-floor access",
      "Access to strength and cardio equipment",
      "Locker access",
      "Standard gym orientation",
    ],
    recommended: false,
  },
  {
    id: "vault-quarterly",
    name: "Vault Quarterly",
    shortLabel: "Quarterly",
    pricePaise: 399900, // ₹3,999
    durationMonths: 3,
    billingLabel: "per quarter",
    summary: "Three months is where adaptation starts. Our most-picked plan.",
    benefits: [
      "Three months of gym access",
      "All standard gym-floor benefits",
      "One fitness assessment",
      "Priority access to selected group sessions",
    ],
    recommended: true,
  },
  {
    id: "vault-annual",
    name: "Vault Annual",
    shortLabel: "Annual",
    pricePaise: 1399900, // ₹13,999
    durationMonths: 12,
    billingLabel: "per year",
    summary: "A full training year — the cheapest per-month rate on the board.",
    benefits: [
      "Twelve months of gym access",
      "All standard gym-floor benefits",
      "Two fitness assessments",
      "Priority registration for selected group sessions",
    ],
    recommended: false,
  },
];

export function getPlanById(planId) {
  return membershipPlans.find((plan) => plan.id === planId) || null;
}

export function getPlanIds() {
  return membershipPlans.map((plan) => plan.id);
}
