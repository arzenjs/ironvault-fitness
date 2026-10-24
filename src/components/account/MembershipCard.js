import { CalendarDays, Clock3 } from "lucide-react";
import { MembershipBadge } from "@/components/account/Badges";
import { formatDate, formatINR } from "@/lib/format";
import { stateLabels } from "@/lib/membership-status";

/**
 * The customer's primary membership panel. Dates come from the server and are
 * rendered in IST; the state is derived from the dates (see lib/membership-status).
 */
export default function MembershipCard({ membership, derived, title = "Current membership" }) {
  if (!membership) return null;

  const state = derived?.state || membership.status;
  // Fraction of the paid period that has already elapsed (0–100).
  const totalDays = Math.max(
    1,
    Math.round((new Date(membership.endDate) - new Date(membership.startDate)) / 86_400_000),
  );
  const progress =
    state === "active" && derived?.daysRemaining != null
      ? Math.min(100, Math.max(0, Math.round(((totalDays - derived.daysRemaining) / totalDays) * 100)))
      : null;

  return (
    <div
      className={`relative overflow-hidden rounded-[1.3rem] border p-5 md:p-6 ${
        state === "active"
          ? "border-signal/40 bg-gradient-to-br from-signal/[0.14] via-coal to-coal"
          : "border-white/12 bg-coal"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow">{title}</p>
          <h2 className="display mt-2 text-[clamp(1.6rem,3.4vw,2.2rem)]">{membership.planName}</h2>
        </div>
        <MembershipBadge state={state} label={stateLabels[state]} />
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-white/10 pt-5 sm:grid-cols-3">
        <div>
          <dt className="eyebrow flex items-center gap-1.5">
            <CalendarDays size={11} aria-hidden="true" /> Starts
          </dt>
          <dd className="mt-1.5 text-sm font-medium text-fog">{formatDate(membership.startDate)}</dd>
        </div>
        <div>
          <dt className="eyebrow flex items-center gap-1.5">
            <CalendarDays size={11} aria-hidden="true" /> Expires
          </dt>
          <dd className="mt-1.5 text-sm font-medium text-fog">{formatDate(membership.endDate)}</dd>
        </div>
        <div>
          <dt className="eyebrow flex items-center gap-1.5">
            <Clock3 size={11} aria-hidden="true" />
            {state === "active" ? "Days left" : state === "queued" ? "Starts in" : "Duration"}
          </dt>
          <dd className="mt-1.5 text-sm font-medium text-fog">
            {state === "active"
              ? `${derived.daysRemaining} days`
              : state === "queued"
                ? `${derived.startsInDays} days`
                : `${membership.durationMonths} month${membership.durationMonths > 1 ? "s" : ""}`}
          </dd>
        </div>
      </dl>

      {progress !== null ? (
        <div className="mt-5">
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-signal to-ember"
              style={{ width: `${Math.max(2, progress)}%` }}
            />
          </div>
          <p className="mt-2 text-[0.6875rem] text-ash">
            {progress}% of your paid period used · {formatINR(membership.pricePaise)} paid
          </p>
        </div>
      ) : null}

      {membership.status === "suspended" ? (
        <p className="mt-4 rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 text-xs text-red-100">
          This membership is suspended{membership.statusReason ? `: ${membership.statusReason}` : "."} Contact the
          front desk for details.
        </p>
      ) : null}
    </div>
  );
}
