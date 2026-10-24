import { gym } from "@/config/gym";

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Kolkata",
  hour12: true,
});

export function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return dateFormatter.format(date);
}

export function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return dateTimeFormatter.format(date);
}

/** paise → "₹1,499" (no decimals for whole rupees, which is all we sell). */
export function formatINR(paise, { withDecimals = false } = {}) {
  const rupees = Number(paise || 0) / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: gym.currency,
    minimumFractionDigits: withDecimals ? 2 : 0,
    maximumFractionDigits: withDecimals ? 2 : 0,
  }).format(rupees);
}

/** "₹3,999 / 3 months" style helper used in summaries. */
export function formatPlanDuration(months) {
  return months === 1 ? "1 month" : `${months} months`;
}

/** Payment status → { label, tone } for badges. */
export const paymentStatusMeta = {
  created: { label: "Awaiting checkout", tone: "neutral" },
  pending: { label: "Pending", tone: "warn" },
  successful: { label: "Paid", tone: "good" },
  failed: { label: "Failed", tone: "bad" },
  abandoned: { label: "Not completed", tone: "neutral" },
  review: { label: "Needs review", tone: "warn" },
};
