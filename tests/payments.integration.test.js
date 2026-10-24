/**
 * Integration tests for the payment → membership workflow.
 *
 * These run against a real MongoDB (no mocked database). Point them at a
 * throwaway database with:
 *
 *   MONGODB_TEST_URI=mongodb://127.0.0.1:27017/ironvault_test npm test
 *
 * If the variable is not set the suite is skipped, so `npm test` still works
 * without a database. Razorpay's API is never called here: the tests drive the
 * webhook path, which is the authoritative confirmation route.
 */
import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import mongoose from "mongoose";

process.env.RAZORPAY_KEY_SECRET = "test_key_secret";
process.env.RAZORPAY_WEBHOOK_SECRET = "test_webhook_secret";
process.env.RESEND_API_KEY = ""; // keep email disabled during tests

const uri = process.env.MONGODB_TEST_URI;
const describe = uri ? test : test.skip;

let Payment;
let Membership;
let handleWebhook;
let validateProviderPayment;
let activateMembershipForPayment;
let summariseMemberships;

function sign(raw) {
  return crypto.createHmac("sha256", "test_webhook_secret").update(raw).digest("hex");
}

async function seedPayment({ amountPaise = 399900, durationMonths = 3, planId = "vault-quarterly" } = {}) {
  const userId = new mongoose.Types.ObjectId();
  const orderId = `order_${crypto.randomBytes(6).toString("hex")}`;
  const payment = await Payment.create({
    userId,
    customerEmail: "member@example.com",
    customerName: "Test Member",
    planId,
    planName: planId === "vault-monthly" ? "Vault Monthly" : "Vault Quarterly",
    amountPaise,
    durationMonths,
    currency: "INR",
    status: "pending",
    razorpayOrderId: orderId,
  });
  return { payment, orderId, userId };
}

function capturedEvent({ orderId, paymentId, amount = 399900, currency = "INR", status = "captured" }) {
  return {
    event: "payment.captured",
    payload: {
      payment: {
        entity: {
          id: paymentId,
          order_id: orderId,
          amount,
          currency,
          status,
          method: "upi",
        },
      },
    },
  };
}

describe("payment workflow", async (t) => {
  t.before(async () => {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    await mongoose.connection.dropDatabase();

    ({ default: Payment } = await import("@/models/Payment"));
    ({ default: Membership } = await import("@/models/Membership"));
    ({ handleWebhook, validateProviderPayment } = await import("@/services/payments"));
    ({ activateMembershipForPayment, summariseMemberships } = await import("@/services/memberships"));

    // Ensure unique indexes exist — these are what make activation idempotent.
    await Promise.all([Payment.init(), Membership.init()]);
  });

  t.after(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });

  await t.test("rejects a webhook with an invalid signature", async () => {
    const raw = JSON.stringify({ event: "payment.captured" });
    await assert.rejects(() => handleWebhook(raw, "not-a-valid-signature", "evt_bad"), /Invalid webhook signature/);
  });

  await t.test("activates a membership on a signed payment.captured event", async () => {
    const { payment, orderId } = await seedPayment();
    const paymentId = `pay_${crypto.randomBytes(6).toString("hex")}`;

    const raw = JSON.stringify(capturedEvent({ orderId, paymentId }));
    const result = await handleWebhook(raw, sign(raw), "evt_activate_1");
    assert.equal(result.activated, true);

    const updated = await Payment.findById(payment._id).lean();
    assert.equal(updated.status, "successful");
    assert.equal(updated.razorpayPaymentId, paymentId);

    const membership = await Membership.findOne({ paymentId: payment._id }).lean();
    assert.ok(membership, "membership should exist");
    assert.equal(membership.status, "active");
    assert.equal(membership.durationMonths, 3);
  });

  await t.test("a duplicate webhook delivery does not create a second membership", async () => {
    const { payment, orderId } = await seedPayment();
    const paymentId = `pay_${crypto.randomBytes(6).toString("hex")}`;
    const raw = JSON.stringify(capturedEvent({ orderId, paymentId }));

    await handleWebhook(raw, sign(raw), "evt_dup_1");
    const second = await handleWebhook(raw, sign(raw), "evt_dup_1"); // same event id
    const third = await handleWebhook(raw, sign(raw), "evt_dup_2"); // different id, same payment

    assert.equal(second.duplicate, true);
    assert.equal(third.duplicate, true);

    const count = await Membership.countDocuments({ paymentId: payment._id });
    assert.equal(count, 1);
    assert.equal((await Payment.findById(payment._id).lean()).status, "successful");
  });

  await t.test("an amount mismatch is parked for review and never activates", async () => {
    const { payment, orderId } = await seedPayment();
    const raw = JSON.stringify(
      capturedEvent({ orderId, paymentId: `pay_${crypto.randomBytes(6).toString("hex")}`, amount: 100 }),
    );

    const result = await handleWebhook(raw, sign(raw), "evt_amount");
    assert.equal(result.review, true);

    const updated = await Payment.findById(payment._id).lean();
    assert.equal(updated.status, "review");
    assert.equal(updated.failureReason, "amount_mismatch");
    assert.equal(await Membership.countDocuments({ paymentId: payment._id }), 0);
  });

  await t.test("a non-INR payment is rejected by provider validation", async () => {
    const { payment, orderId } = await seedPayment();
    const raw = JSON.stringify(
      capturedEvent({ orderId, paymentId: `pay_${crypto.randomBytes(6).toString("hex")}`, currency: "USD" }),
    );

    const result = await handleWebhook(raw, sign(raw), "evt_currency");
    assert.equal(result.review, true);
    assert.equal((await Payment.findById(payment._id).lean()).failureReason, "currency_mismatch");
  });

  await t.test("payment.failed marks the payment failed without activating", async () => {
    const { payment, orderId } = await seedPayment();
    const raw = JSON.stringify({
      event: "payment.failed",
      payload: {
        payment: {
          entity: {
            id: `pay_${crypto.randomBytes(5).toString("hex")}`,
            order_id: orderId,
            amount: 399900,
            currency: "INR",
            status: "failed",
            error_description: "Payment declined by bank",
          },
        },
      },
    });

    const result = await handleWebhook(raw, sign(raw), "evt_failed");
    assert.equal(result.failed, true);

    const updated = await Payment.findById(payment._id).lean();
    assert.equal(updated.status, "failed");
    assert.equal(updated.failureReason, "Payment declined by bank");
    assert.equal(await Membership.countDocuments({ paymentId: payment._id }), 0);
  });

  await t.test("a late failure event cannot un-pay a successful payment", async () => {
    const { payment, orderId } = await seedPayment();
    const paymentId = `pay_${crypto.randomBytes(6).toString("hex")}`;

    const success = JSON.stringify(capturedEvent({ orderId, paymentId }));
    await handleWebhook(success, sign(success), "evt_seq_1");

    const failure = JSON.stringify({
      event: "payment.failed",
      payload: { payment: { entity: { id: paymentId, order_id: orderId, status: "failed" } } },
    });
    const result = await handleWebhook(failure, sign(failure), "evt_seq_2");

    assert.equal(result.ignored, true);
    assert.equal(result.reason, "already_successful");
    const updated = await Payment.findById(payment._id).lean();
    assert.equal(updated.status, "successful");
    assert.equal(await Membership.countDocuments({ paymentId: payment._id }), 1);
  });

  await t.test("unknown orders are acknowledged but ignored", async () => {
    const raw = JSON.stringify(capturedEvent({ orderId: "order_does_not_exist", paymentId: "pay_x" }));
    const result = await handleWebhook(raw, sign(raw), "evt_unknown");
    assert.equal(result.ignored, true);
    assert.equal(result.reason, "unknown_order");
  });

  await t.test("unrecognised events never change payment state", async () => {
    const { payment, orderId } = await seedPayment();
    const raw = JSON.stringify({ event: "refund.created", payload: { payment: { entity: { order_id: orderId } } } });
    const result = await handleWebhook(raw, sign(raw), "evt_other");
    assert.equal(result.ignored, true);
    assert.equal((await Payment.findById(payment._id).lean()).status, "pending");
  });

  await t.test("a second purchase while active is queued, not shortened", async () => {
    const { payment: first, orderId: firstOrder } = await seedPayment({ planId: "vault-monthly", durationMonths: 1, amountPaise: 149900 });
    const rawFirst = JSON.stringify(capturedEvent({ orderId: firstOrder, paymentId: "pay_first", amount: 149900 }));
    await handleWebhook(rawFirst, sign(rawFirst), "evt_queue_1");

    const firstMembership = await Membership.findOne({ paymentId: first._id }).lean();
    assert.ok(firstMembership);

    // Buy a second plan immediately: it must start when the first ends.
    const second = await Payment.create({
      userId: first.userId,
      customerEmail: "member@example.com",
      customerName: "Test Member",
      planId: "vault-annual",
      planName: "Vault Annual",
      amountPaise: 1399900,
      durationMonths: 12,
      currency: "INR",
      status: "successful",
    });
    const { membership } = await activateMembershipForPayment(second);

    assert.equal(membership.status, "queued");
    assert.equal(new Date(membership.startDate).getTime(), new Date(firstMembership.endDate).getTime());
    assert.ok(new Date(membership.endDate) > new Date(membership.startDate));

    const all = await Membership.find({ userId: first.userId }).lean();
    const summary = summariseMemberships(all);
    assert.ok(summary.active, "first membership stays active");
    assert.equal(summary.queued.length, 1);
  });

  await t.test("activation is idempotent when called twice for the same payment", async () => {
    const { payment } = await seedPayment();
    await Payment.updateOne({ _id: payment._id }, { $set: { status: "successful" } });
    const fresh = await Payment.findById(payment._id);

    const [a, b] = await Promise.all([
      activateMembershipForPayment(fresh),
      activateMembershipForPayment(fresh),
    ]);

    assert.equal(await Membership.countDocuments({ paymentId: payment._id }), 1);
    assert.ok(a.membership && b.membership);
  });

  await t.test("validateProviderPayment enforces order, amount, currency and status", () => {
    const record = { razorpayOrderId: "order_1", amountPaise: 149900 };

    assert.equal(
      validateProviderPayment({ order_id: "order_1", amount: 149900, currency: "INR", status: "captured" }, record).ok,
      true,
    );
    assert.equal(
      validateProviderPayment({ order_id: "order_1", amount: 149900, currency: "INR", status: "failed" }, record).ok,
      false,
    );
    assert.equal(
      validateProviderPayment({ order_id: "order_2", amount: 149900, currency: "INR", status: "captured" }, record)
        .reason,
      "provider_order_mismatch",
    );
  });
});
