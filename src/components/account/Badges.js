/** Small status pills shared by the account, staff and admin areas. */

const membershipTones = {
  active: "border-emerald-400/35 bg-emerald-400/10 text-emerald-200",
  queued: "border-sky-400/35 bg-sky-400/10 text-sky-200",
  expired: "border-white/15 bg-white/5 text-ash",
  suspended: "border-red-400/35 bg-red-400/10 text-red-200",
  none: "border-white/15 bg-white/5 text-ash",
};

export function MembershipBadge({ state, label }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[0.5625rem] uppercase tracking-[0.14em] ${membershipTones[state] || membershipTones.none}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {label || state}
    </span>
  );
}

const paymentTones = {
  good: "border-emerald-400/35 bg-emerald-400/10 text-emerald-200",
  warn: "border-amber-300/35 bg-amber-300/10 text-amber-200",
  bad: "border-red-400/35 bg-red-400/10 text-red-200",
  neutral: "border-white/15 bg-white/5 text-ash",
};

export function PaymentBadge({ tone = "neutral", children }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[0.5625rem] uppercase tracking-[0.14em] ${paymentTones[tone] || paymentTones.neutral}`}>
      {children}
    </span>
  );
}

export function RoleBadge({ role }) {
  const tone =
    role === "admin"
      ? "border-signal/40 bg-signal/10 text-signal-soft"
      : role === "staff"
        ? "border-sky-400/35 bg-sky-400/10 text-sky-200"
        : "border-white/15 bg-white/5 text-ash";
  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 font-mono text-[0.5rem] uppercase tracking-[0.14em] ${tone}`}>
      {role}
    </span>
  );
}
