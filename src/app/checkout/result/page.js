import Link from "next/link";
import { redirect } from "next/navigation";
import PaymentResult from "@/components/memberships/PaymentResult";
import { getSessionUser } from "@/lib/session";
import { connectDb, isDbConfigured } from "@/lib/db";
import Payment from "@/models/Payment";
import { serialisePayment } from "@/services/payments";

export const metadata = {
  title: "Payment status",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function CheckoutResultPage({ searchParams }) {
  const params = await searchParams;
  const ref = typeof params?.ref === "string" ? params.ref : "";
  const user = await getSessionUser();

  if (!user) redirect(`/login?next=${encodeURIComponent(`/checkout/result?ref=${ref}`)}`);

  if (!/^[a-f0-9]{24}$/i.test(ref) || !isDbConfigured()) {
    return (
      <section className="flex min-h-[70vh] items-center pt-24">
        <div className="shell">
          <p className="eyebrow">Payment status</p>
          <h1 className="display mt-4 text-[clamp(1.9rem,4.6vw,3rem)]">No payment to show</h1>
          <p className="lede mt-4 max-w-lg">
            {isDbConfigured()
              ? "This reference is not valid. Open your account to see all payment attempts."
              : "The database is not configured, so payment records cannot be read in this environment."}
          </p>
          <Link href="/account" className="btn btn-primary mt-7">
            Go to my account
          </Link>
        </div>
      </section>
    );
  }

  await connectDb();
  // Ownership is enforced in the query itself.
  const payment = await Payment.findOne({ _id: ref, userId: user.id }).lean();

  if (!payment) {
    return (
      <section className="flex min-h-[70vh] items-center pt-24">
        <div className="shell">
          <p className="eyebrow">Payment status</p>
          <h1 className="display mt-4 text-[clamp(1.9rem,4.6vw,3rem)]">Payment not found</h1>
          <p className="lede mt-4 max-w-lg">
            We could not find a payment with that reference on your account. If you have just paid, check your
            account dashboard — it refreshes automatically.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/account" className="btn btn-primary">
              My account
            </Link>
            <Link href="/memberships" className="btn btn-outline">
              View plans
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-28 md:pt-36">
      <div className="shell pb-20">
        <PaymentResult initialPayment={serialisePayment(payment)} paymentRef={ref} />
      </div>
    </section>
  );
}
