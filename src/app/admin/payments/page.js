import { Search } from "lucide-react";
import { AdminPageHeader, EmptyState, FilterTabs, SectionTitle, StatCard } from "@/components/admin/AdminUI";
import { PaymentBadge } from "@/components/account/Badges";
import ReconcileButton from "@/components/dashboard/ReconcileButton";
import { adminGuard } from "@/lib/admin-guard";
import { connectDb } from "@/lib/db";
import { listPayments, RECONCILE_STATUSES } from "@/services/admin";
import { getRevenueSummary } from "@/services/payments";
import { formatDateTime, formatINR, paymentStatusMeta } from "@/lib/format";

export const metadata = { title: "Payments" };
export const dynamic = "force-dynamic";

const statusOptions = [
  { value: "all", label: "All" },
  { value: "attention", label: "Needs attention" },
  { value: "successful", label: "Paid" },
  { value: "review", label: "Needs review" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
  { value: "abandoned", label: "Not completed" },
];

export default async function AdminPaymentsPage({ searchParams }) {
  const guard = await adminGuard("/admin/payments");
  if (guard.denied) return guard.denied;

  const params = await searchParams;
  const query = typeof params?.q === "string" ? params.q.slice(0, 120) : "";
  const requested = typeof params?.status === "string" ? params.status : "all";
  const status = statusOptions.some((option) => option.value === requested) ? requested : "all";

  await connectDb();
  const [{ payments, total, truncated }, revenue] = await Promise.all([
    listPayments({ status, query }),
    getRevenueSummary(),
  ]);

  return (
    <>
      <AdminPageHeader
        title="Payment"
        accent="records"
        description="Every payment attempt with its provider references. Reconcile asks Razorpay what actually happened — a payment can never be marked successful by hand."
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <StatCard label="Verified revenue" value={formatINR(revenue.totalPaise)} hint="Sum of successful payments only" />
        <StatCard label="Memberships sold" value={revenue.count} hint="One membership per successful payment" />
      </div>

      <form method="GET" role="search" className="card mt-6 grid gap-3 p-4 sm:grid-cols-[1fr_auto] md:p-5">
        <div>
          <label htmlFor="payment-q" className="field-label">
            Search
          </label>
          <input
            id="payment-q"
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Customer, email, order or payment id"
            className="field"
          />
        </div>
        {status !== "all" ? <input type="hidden" name="status" value={status} /> : null}
        <div className="flex items-end">
          <button type="submit" className="btn btn-primary w-full sm:w-auto">
            <Search size={15} aria-hidden="true" /> Search
          </button>
        </div>
      </form>

      <div className="mt-4">
        <FilterTabs basePath="/admin/payments" param="status" current={status} options={statusOptions} extra={{ q: query }} />
      </div>

      <section className="mt-6" aria-labelledby="payments-heading">
        <SectionTitle id="payments-heading" aside={`${total} record${total === 1 ? "" : "s"}${truncated ? ` · showing latest ${payments.length}` : ""}`}>
          Payments
        </SectionTitle>
        {payments.length ? (
          <ul className="space-y-2">
            {payments.map((payment) => {
              const meta = paymentStatusMeta[payment.status] || paymentStatusMeta.pending;
              const needsAttention = RECONCILE_STATUSES.includes(payment.status);
              return (
                <li
                  key={payment._id.toString()}
                  className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 ${
                    needsAttention ? "border-amber-300/25 bg-amber-300/[0.05]" : "border-white/10 bg-coal"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-sm text-fog">
                      {payment.customerName || "Member"} · {payment.planName} · {formatINR(payment.amountPaise)}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-ash">{payment.customerEmail}</p>
                    <p className="mt-1 break-all font-mono text-[0.625rem] text-ash">
                      {payment.razorpayOrderId || "no order"}
                      {payment.razorpayPaymentId ? ` · ${payment.razorpayPaymentId}` : ""} · {formatDateTime(payment.createdAt)}
                    </p>
                    {payment.failureReason ? (
                      <p className="mt-1 text-[0.6875rem] text-amber-200/80">{payment.failureReason}</p>
                    ) : null}
                    {payment.status === "successful" && payment.emailError ? (
                      <p className="mt-1 text-[0.6875rem] text-amber-200/80">
                        Confirmation email not delivered: {payment.emailError}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <PaymentBadge tone={meta.tone}>{meta.label}</PaymentBadge>
                    {needsAttention ? <ReconcileButton paymentId={payment._id.toString()} /> : null}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState>No payments match these filters.</EmptyState>
        )}
      </section>
    </>
  );
}
