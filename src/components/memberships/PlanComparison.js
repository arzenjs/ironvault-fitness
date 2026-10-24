import { Check, Minus } from "lucide-react";
import { membershipPlans } from "@/config/membership-plans";
import { formatINR, formatPlanDuration } from "@/lib/format";

/**
 * Comparison table.
 *
 * Desktop: a real <table>.
 * Mobile (< md): the same data rendered as stacked cards — no horizontal
 * scrolling, no shrunken text.
 */
export default function PlanComparison() {
  const features = [
    { label: "Gym-floor access", values: ["1 month", "3 months", "12 months"] },
    { label: "Strength & cardio equipment", values: [true, true, true] },
    { label: "Locker access", values: [true, true, true] },
    { label: "Standard gym orientation", values: [true, true, true] },
    { label: "Fitness assessments", values: ["—", "1 included", "2 included"] },
    { label: "Priority group-session access", values: [false, true, true] },
    { label: "Billing", values: ["One-time", "One-time", "One-time"] },
  ];

  const renderValue = (value) => {
    if (value === true) {
      return (
        <>
          <Check size={15} className="text-signal" aria-hidden="true" />
          <span className="sr-only">Included</span>
        </>
      );
    }
    if (value === false) {
      return (
        <>
          <Minus size={15} className="text-ash/50" aria-hidden="true" />
          <span className="sr-only">Not included</span>
        </>
      );
    }
    return <span className="text-sm text-fog/90">{value}</span>;
  };

  return (
    <div>
      {/* desktop */}
      <div className="hidden overflow-hidden rounded-2xl border border-white/10 md:block">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">Comparison of the three IronVault membership plans</caption>
          <thead>
            <tr className="bg-white/[0.04]">
              <th scope="col" className="w-[32%] px-5 py-4 font-mono text-[0.625rem] uppercase tracking-[0.18em] text-ash">
                What you get
              </th>
              {membershipPlans.map((plan) => (
                <th key={plan.id} scope="col" className="px-5 py-4">
                  <span className="block text-sm font-semibold text-fog">{plan.name}</span>
                  <span className="mt-1 block font-mono text-xs text-ash">{formatINR(plan.pricePaise)}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features.map((feature, index) => (
              <tr key={feature.label} className={index % 2 ? "bg-white/[0.015]" : ""}>
                <th scope="row" className="px-5 py-4 text-sm font-normal text-ash">
                  {feature.label}
                </th>
                {feature.values.map((value, cellIndex) => (
                  <td key={`${feature.label}-${cellIndex}`} className="px-5 py-4">
                    {renderValue(value)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* mobile */}
      <div className="space-y-4 md:hidden">
        {membershipPlans.map((plan) => (
          <div key={plan.id} className="card-flat overflow-hidden">
            <div className="flex items-baseline justify-between gap-3 border-b border-white/10 bg-white/[0.03] px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-fog">{plan.name}</p>
                <p className="mt-0.5 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-ash">
                  {formatPlanDuration(plan.durationMonths)}
                </p>
              </div>
              <p className="display text-xl text-fog">{formatINR(plan.pricePaise)}</p>
            </div>
            <dl className="divide-y divide-white/[0.06]">
              {features.map((feature) => (
                <div key={feature.label} className="flex items-center justify-between gap-4 px-4 py-2.5">
                  <dt className="text-xs text-ash">{feature.label}</dt>
                  <dd className="flex items-center gap-1.5 text-right text-xs text-fog/90">
                    {renderValue(feature.values[membershipPlans.indexOf(plan)])}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </div>
  );
}
