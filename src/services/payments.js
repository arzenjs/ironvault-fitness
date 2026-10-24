import Payment from "@/models/Payment";
import { getPlanById } from "@/config/membership-plans";
import { getRazorpayClient, verifyPaymentSignature, verifyWebhookSignature } from "@/lib/razorpay";
import { activateMembershipForPayment } from "@/services/memberships";
import { sendMembershipConfirmation } from "@/lib/email";
import { HttpError } from "@/lib/security";

/**
 * Payment service — the only place that moves a payment between states.
 *
 * Ground rules implemented here:
 *  - Amounts and durations always come from config/membership-plans.js, never
 *    from the request body.
 *  - A membership is activated only after (a) the checkout signature verifies,
 *    (b) Razorpay's API confirms the payment belongs to our order with the same
 *    amount and currency, or (b) a webhook with a valid signature says so.
 *  - Every activation path is idempotent: the unique index on
 *    Membership.paymentId guarantees a single membership per payment.
 *  - Nothing here relies on a MongoDB multi-document transaction. Razorpay lives
 *    outside MongoDB, so the workflow is "write pending → confirm → converge",
 *    with retries (webhook) and reconciliation (scripts/reconcile-payments.js)
 *    covering the gap. See README → Database consistency.
 */

/* ------------------------------------------------------------------ */
/*  Step 1 — create the pending record and the Razorpay order          */
/* ------------------------------------------------------------------ */
export async function createOrderForPlan({ user, planId }) {
  const plan = getPlanById(planId);
  if (!plan) throw new HttpError(400, "Unknown membership plan.");

  const razorpay = getRazorpayClient();

  // Pending record first: we always have a local row before money can move.
  const payment = await Payment.create({
    userId: user.id,
    customerEmail: user.email,
    customerName: user.name,
    planId: plan.id,
    planName: plan.name,
    amountPaise: plan.pricePaise,
    durationMonths: plan.durationMonths,
    currency: "INR",
    status: "created",
  });

  try {
    const order = await razorpay.orders.create({
      amount: plan.pricePaise, // server-authoritative amount in paise
      currency: "INR",
      receipt: `iv_${payment._id.toString()}`,
      notes: {
        paymentRecordId: payment._id.toString(),
        userId: user.id,
        planId: plan.id,
      },
    });

    payment.razorpayOrderId = order.id;
    payment.status = "pending";
    await payment.save();

    return {
      paymentRecordId: payment._id.toString(),
      orderId: order.id,
      amount: plan.pricePaise,
      currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID,
      plan: { id: plan.id, name: plan.name, durationMonths: plan.durationMonths },
      prefill: { name: user.name, email: user.email },
    };
  } catch (error) {
    payment.status = "failed";
    payment.failureReason = "order_creation_failed";
    await payment.save();
    console.error("[payments] order creation failed:", error?.error?.description || error?.message);
    throw new HttpError(502, "We could not start the payment right now. Please try again in a moment.");
  }
}

/* ------------------------------------------------------------------ */
/*  Step 2 — browser callback: verify signature, then confirm with API */
/* ------------------------------------------------------------------ */
export async function confirmCheckoutPayment({ user, payload }) {
  const payment = await Payment.findOne({ _id: payload.paymentRecordId, userId: user.id });
  // Ownership is part of the query, so a customer can never verify (or read)
  // another customer's payment by guessing an id.
  if (!payment) throw new HttpError(404, "Payment not found for this account.");

  if (payment.status === "successful") {
    return { status: "successful", alreadyProcessed: true, payment: serialisePayment(payment) };
  }

  if (payment.razorpayOrderId !== payload.razorpay_order_id) {
    await flagForReview(payment, "order_mismatch");
    throw new HttpError(400, "This payment does not belong to your order.");
  }

  if (!verifyPaymentSignature({
    orderId: payload.razorpay_order_id,
    paymentId: payload.razorpay_payment_id,
    signature: payload.razorpay_signature,
  })) {
    // A bad signature means the callback cannot be trusted. It never activates
    // anything; the record is parked for a human/webhook follow-up.
    await flagForReview(payment, "signature_mismatch");
    throw new HttpError(400, "Payment signature could not be verified.");
  }

  // Signature is valid, but the signature alone does not prove the amount is
  // right. Ask Razorpay for the authoritative payment object.
  const providerPayment = await fetchProviderPayment(payload.razorpay_payment_id);

  const validation = validateProviderPayment(providerPayment, payment);
  if (!validation.ok) {
    await flagForReview(payment, validation.reason);
    throw new HttpError(409, "The payment details did not match this order. Our team will review it.");
  }

  const result = await activate(payment, {
    razorpayPaymentId: providerPayment.id,
    signature: payload.razorpay_signature,
    method: providerPayment.method,
    providerStatus: providerPayment.status,
  });

  return { status: "successful", membership: result.membership, payment: serialisePayment(result.payment) };
}

/* ------------------------------------------------------------------ */
/*  Step 3 — webhooks                                                  */
/* ------------------------------------------------------------------ */
export async function handleWebhook(rawBody, signature, eventId) {
  if (!verifyWebhookSignature(rawBody, signature)) {
    throw new HttpError(400, "Invalid webhook signature.");
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    throw new HttpError(400, "Malformed webhook payload.");
  }

  const type = event?.event;
  const entity = event?.payload?.payment?.entity || event?.payload?.order?.entity || null;
  const orderId = entity?.order_id || (event?.payload?.order?.entity?.id ?? null);

  if (!orderId) {
    return { ok: true, ignored: true, reason: "no_order_reference" };
  }

  const payment = await Payment.findOne({ razorpayOrderId: orderId });
  if (!payment) {
    // Unknown order: acknowledge so Razorpay stops retrying, but log for review.
    console.warn("[webhook] unknown order:", orderId, "event:", type);
    return { ok: true, ignored: true, reason: "unknown_order" };
  }

  // Idempotency key: Razorpay sends x-razorpay-event-id on every delivery and
  // redelivers the same id on retries.
  if (eventId && payment.webhookEvents.some((item) => item.eventId === eventId)) {
    return { ok: true, duplicate: true };
  }

  payment.webhookEvents.push({ event: type, eventId: eventId || "", receivedAt: new Date() });
  if (payment.webhookEvents.length > 20) payment.webhookEvents = payment.webhookEvents.slice(-20);

  switch (type) {
    case "payment.captured":
    case "order.paid": {
      if (payment.status === "successful") {
        await payment.save();
        return { ok: true, duplicate: true };
      }
      const providerPayment =
        event?.payload?.payment?.entity ||
        (entity?.payments?.[0] ? entity.payments[0] : null);

      if (!providerPayment) {
        await payment.save();
        return { ok: true, ignored: true, reason: "no_payment_entity" };
      }

      const validation = validateProviderPayment(providerPayment, payment);
      if (!validation.ok) {
        await flagForReview(payment, validation.reason);
        return { ok: true, review: true };
      }

      await activate(payment, {
        razorpayPaymentId: providerPayment.id,
        signature: null,
        method: providerPayment.method,
        providerStatus: providerPayment.status,
      });
      return { ok: true, activated: true };
    }

    case "payment.failed": {
      if (payment.status === "successful") {
        await payment.save();
        // A late failure event must never un-pay a verified membership.
        return { ok: true, ignored: true, reason: "already_successful" };
      }
      payment.status = "failed";
      payment.razorpayPaymentId = entity?.id || payment.razorpayPaymentId;
      payment.failureReason = entity?.error_description || entity?.error_code || "payment_failed";
      payment.providerStatus = entity?.status || "failed";
      await payment.save();
      return { ok: true, failed: true };
    }

    case "order.expired": {
      if (payment.status === "pending" || payment.status === "created") {
        payment.status = "abandoned";
        payment.failureReason = "order_expired";
      }
      await payment.save();
      return { ok: true };
    }

    default: {
      // Unrecognised events are stored on the record for auditing but never
      // change payment state.
      await payment.save();
      return { ok: true, ignored: true, reason: "unhandled_event" };
    }
  }
}

/* ------------------------------------------------------------------ */
/*  Shared helpers                                                     */
/* ------------------------------------------------------------------ */

async function activate(payment, { razorpayPaymentId, signature, method, providerStatus }) {
  const { membership } = await activateMembershipForPayment(payment);

  // Only claim "successful" once the membership row exists.
  const updated = await Payment.findOneAndUpdate(
    { _id: payment._id },
    {
      $set: {
        status: "successful",
        razorpayPaymentId,
        razorpaySignature: signature || payment.razorpaySignature || null,
        method: method || "",
        providerStatus: providerStatus || "captured",
        membershipId: membership?._id || null,
        verifiedAt: new Date(),
        failureReason: "",
      },
    },
    { new: true },
  );

  // Email is best-effort: a delivery failure must never roll back a paid membership.
  try {
    await sendMembershipConfirmation({ payment: updated, membership });
    await Payment.updateOne({ _id: updated._id }, { $set: { emailSentAt: new Date(), emailError: "" } });
  } catch (error) {
    const message = error?.message?.slice(0, 300) || "email_failed";
    console.error("[email] membership confirmation failed:", message);
    await Payment.updateOne({ _id: updated._id }, { $set: { emailError: message } });
  }

  return { payment: updated, membership };
}

async function flagForReview(payment, reason) {
  payment.status = "review";
  payment.failureReason = reason;
  await payment.save();
  console.warn("[payments] flagged for review:", payment._id.toString(), reason);
}

async function fetchProviderPayment(paymentId) {
  try {
    return await getRazorpayClient().payments.fetch(paymentId);
  } catch (error) {
    console.error("[payments] provider fetch failed:", error?.error?.description || error?.message);
    throw new HttpError(502, "We could not confirm the payment with Razorpay. Please wait a moment.");
  }
}

/**
 * Validates the provider object against our local record:
 * order association, amount, currency and a successful provider status.
 */
export function validateProviderPayment(providerPayment, payment) {
  if (!providerPayment) return { ok: false, reason: "missing_provider_payment" };
  if (providerPayment.order_id !== payment.razorpayOrderId) {
    return { ok: false, reason: "provider_order_mismatch" };
  }
  if (Number(providerPayment.amount) !== Number(payment.amountPaise)) {
    return { ok: false, reason: "amount_mismatch" };
  }
  if ((providerPayment.currency || "").toUpperCase() !== "INR") {
    return { ok: false, reason: "currency_mismatch" };
  }
  if (!["authorized", "captured"].includes(providerPayment.status)) {
    return { ok: false, reason: `provider_status_${providerPayment.status || "unknown"}` };
  }
  return { ok: true };
}

/**
 * Reconciliation for a payment stuck in pending/review: ask Razorpay directly.
 * Used by the staff "reconcile" button and scripts/reconcile-payments.js.
 */
export async function reconcilePayment({ paymentId }) {
  const payment = await Payment.findById(paymentId);
  if (!payment) return { ok: false, reason: "not_found" };
  if (payment.status === "successful") return { ok: true, alreadySuccessful: true };

  if (!payment.razorpayOrderId) return { ok: false, reason: "no_order" };

  let orderPayments;
  try {
    orderPayments = await getRazorpayClient().orders.fetchPayments(payment.razorpayOrderId);
  } catch (error) {
    console.error("[reconcile] provider lookup failed:", error?.message);
    return { ok: false, reason: "provider_unavailable" };
  }

  const captured = (orderPayments?.items || []).find(
    (item) => item.status === "captured" || item.status === "authorized",
  );

  if (!captured) {
    if (payment.status === "pending" || payment.status === "created") {
      // No successful provider payment: close it locally as abandoned.
      const newest = (orderPayments?.items || [])[0];
      payment.status = newest?.status === "failed" ? "failed" : "abandoned";
      payment.failureReason = newest?.error_description || "no_successful_payment";
      await payment.save();
      return { ok: true, status: payment.status };
    }
    return { ok: false, reason: "no_payment" };
  }

  const validation = validateProviderPayment(captured, payment);
  if (!validation.ok) {
    await flagForReview(payment, validation.reason);
    return { ok: false, reason: validation.reason };
  }

  await activate(payment, {
    razorpayPaymentId: captured.id,
    signature: null,
    method: captured.method,
    providerStatus: captured.status,
  });

  return { ok: true, status: "successful" };
}

/** Marks a pending payment abandoned after the customer closes checkout. */
export async function markAbandoned({ user, paymentRecordId }) {
  const payment = await Payment.findOne({ _id: paymentRecordId, userId: user.id });
  if (!payment) return null;
  if (payment.status === "created" || payment.status === "pending") {
    payment.status = "abandoned";
    payment.failureReason = "checkout_closed";
    await payment.save();
  }
  return payment;
}

/** Data sent to the browser — deliberately limited (no signatures, no secrets). */
export function serialisePayment(payment) {
  return {
    id: payment._id.toString(),
    planId: payment.planId,
    planName: payment.planName,
    amountPaise: payment.amountPaise,
    currency: payment.currency,
    status: payment.status,
    razorpayOrderId: payment.razorpayOrderId,
    razorpayPaymentId: payment.razorpayPaymentId,
    createdAt: payment.createdAt,
  };
}

/** Used by the staff dashboard to spot rows that need attention. */
export async function listPendingPayments(limit = 25) {
  return Payment.find({ status: { $in: ["created", "pending", "review"] } })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}

export async function getRevenueSummary() {
  // Revenue counts verified successful payments only.
  const [totals] = await Payment.aggregate([
    { $match: { status: "successful" } },
    {
      $group: {
        _id: null,
        totalPaise: { $sum: "$amountPaise" },
        count: { $sum: 1 },
      },
    },
  ]);

  const byPlan = await Payment.aggregate([
    { $match: { status: "successful" } },
    { $group: { _id: "$planName", totalPaise: { $sum: "$amountPaise" }, count: { $sum: 1 } } },
    { $sort: { totalPaise: -1 } },
  ]);

  return {
    totalPaise: totals?.totalPaise || 0,
    count: totals?.count || 0,
    byPlan,
  };
}
