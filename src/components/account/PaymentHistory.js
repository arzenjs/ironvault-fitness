import Link from "next/link";
import { Receipt } from "lucide-react";
import { PaymentBadge } from "@/components/account/Badges";
import { formatDateTime, formatINR, paymentStatusMeta } from "@/lib/format";

/**
 * Payment history.
 * Desktop: table. Mobile: stacked rows (no horizontal scrolling, references wrap).
 */
export default function PaymentHistory({ payments }) {
  if (!payments?.length) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 bg-coal px-5 py-10 text-center">
        <Receipt size={22} className="mx-auto text-ash" aria-hidden="true" />
        <p className="mt-3 text-sm font-medium text-fog">No payments yet</p>
        <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-ash">
          When you buy a membership, the attempt appears here with its status and Razorpay reference.
        </p>
        <Link href="/memberships" className="btn btn-outline btn-sm mt-5">
          Choose a plan
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* desktop table */}
      <div className="hidden overflow-hidden rounded-2xl border border-white/10 md:block">
        <table className="w-full border-collapse text-left text-sm">
          <caption className="sr-only">Your membership payment history</caption>
          <thead>
            <tr className="bg-white/[0.04] font-mono text-[0.5625rem] uppercase tracking-[0.16em] text-ash">
              <th scope="col" className="px-4 py-3 font-normal">Date</th>
              <th scope="col" className="px-4 py-3 font-normal">Plan</th>
              <th scope="col" className="px-4 py-3 font-normal">Amount</th>
              <th scope="col" className="px-4 py-3 font-normal">Status</th>
              <th scope="col" className="px-4 py-3 font-normal">Reference</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.07]">
            {payments.map((payment) => {
              const meta = paymentStatusMeta[payment.status] || paymentStatusMeta.pending;
              return (
                <tr key={payment.id} className="align-top">
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-ash">{formatDateTime(payment.createdAt)}</td>
                  <td className="px-4 py-3 text-fog">{payment.planName}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-fog">{formatINR(payment.amountPaise)}</td>
                  <td className="px-4 py-3">
                    <PaymentBadge tone={meta.tone}>{meta.label}</PaymentBadge>
                  </td>
                  <td className="max-w-[220px] px-4 py-3">
                    {payment.razorpayPaymentId ? (
                      <span className="block break-all font-mono text-[0.6875rem] text-ash">{payment.razorpayPaymentId}</span>
                    ) : payment.razorpayOrderId ? (
                      <span className="block break-all font-mono text-[0.6875rem] text-ash/70">
                        order {payment.razorpayOrderId}
                      </span>
                    ) : (
                      <span className="text-xs text-ash">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* mobile cards */}
      <ul className="space-y-3 md:hidden">
        {payments.map((payment) => {
          const meta = paymentStatusMeta[payment.status] || paymentStatusMeta.pending;
          return (
            <li key={payment.id} className="rounded-xl border border-white/10 bg-coal p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-fog">{payment.planName}</p>
                  <p className="mt-0.5 text-[0.6875rem] text-ash">{formatDateTime(payment.createdAt)}</p>
                </div>
                <PaymentBadge tone={meta.tone}>{meta.label}</PaymentBadge>
              </div>
              <div className="mt-3 flex items-baseline justify-between gap-3 border-t border-white/10 pt-3">
                <span className="text-sm font-semibold text-fog">{formatINR(payment.amountPaise)}</span>
                <span className="break-all text-right font-mono text-[0.625rem] text-ash">
                  {payment.razorpayPaymentId || payment.razorpayOrderId || "—"}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
