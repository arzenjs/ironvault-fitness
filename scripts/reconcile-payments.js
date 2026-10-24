#!/usr/bin/env node
/**
 * Recovery job for payments whose confirmation never arrived.
 *
 *   npm run reconcile            # dry run: list rows that need attention
 *   npm run reconcile -- --apply # ask Razorpay and update the records
 *
 * Safe to run repeatedly: reconciliation is idempotent (the unique index on
 * Membership.paymentId guarantees one membership per payment).
 *
 * Nothing here can mark a payment successful unless Razorpay's API reports a
 * captured/authorised payment with the correct order, amount and currency.
 */
import process from "node:process";
import mongoose from "mongoose";

const { MONGODB_URI } = process.env;
const apply = process.argv.includes("--apply");

if (!MONGODB_URI) {
  console.error("✖ MONGODB_URI is not set.");
  process.exit(1);
}

async function main() {
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });

  const { default: Payment } = await import("../src/models/Payment.js");
  const { reconcilePayment } = await import("../src/services/payments.js");

  // Only rows older than a minute, so we do not race a checkout that is still open.
  const cutoff = new Date(Date.now() - 60_000);
  const stale = await Payment.find({
    status: { $in: ["created", "pending", "review"] },
    createdAt: { $lt: cutoff },
  })
    .sort({ createdAt: 1 })
    .limit(50)
    .lean();

  if (!stale.length) {
    console.log("✔ No payments need reconciliation.");
    await mongoose.disconnect();
    return;
  }

  console.log(`${stale.length} payment(s) need attention:\n`);
  for (const payment of stale) {
    console.log(
      `- ${payment._id} · ${payment.planName} · ${payment.status} · order ${payment.razorpayOrderId || "none"} · ${payment.createdAt.toISOString()}`,
    );
  }

  if (!apply) {
    console.log("\nDry run only. Re-run with --apply to query Razorpay and update these records.");
    await mongoose.disconnect();
    return;
  }

  console.log("\nApplying…");
  for (const payment of stale) {
    const result = await reconcilePayment({ paymentId: payment._id.toString() });
    console.log(`- ${payment._id}: ${JSON.stringify(result)}`);
  }

  console.log("\nDone.");
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error("✖", error?.message || error);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
