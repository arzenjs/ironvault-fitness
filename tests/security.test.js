import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { hashToken, safeCompare, rateLimit } from "@/lib/security";
import { safeNextPath } from "@/lib/redirects";
import { verifyPaymentSignature, verifyWebhookSignature } from "@/lib/razorpay";

process.env.RAZORPAY_KEY_SECRET = "test_key_secret";
process.env.RAZORPAY_WEBHOOK_SECRET = "test_webhook_secret";

test("payment signature matches Razorpay's HMAC procedure", () => {
  const orderId = "order_TEST123";
  const paymentId = "pay_TEST456";
  const signature = crypto
    .createHmac("sha256", "test_key_secret")
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  assert.equal(verifyPaymentSignature({ orderId, paymentId, signature }), true);
});

test("payment signature rejects tampering", () => {
  const orderId = "order_TEST123";
  const paymentId = "pay_TEST456";
  const signature = crypto.createHmac("sha256", "test_key_secret").update(`${orderId}|${paymentId}`).digest("hex");

  assert.equal(verifyPaymentSignature({ orderId, paymentId, signature: `${signature.slice(0, -1)}0` }), false);
  assert.equal(verifyPaymentSignature({ orderId: "order_OTHER", paymentId, signature }), false);
  assert.equal(verifyPaymentSignature({ orderId, paymentId, signature: "" }), false);
});

test("webhook signature is verified over the raw body", () => {
  const raw = JSON.stringify({ event: "payment.captured", payload: { payment: { entity: { id: "pay_1" } } } });
  const signature = crypto.createHmac("sha256", "test_webhook_secret").update(raw).digest("hex");

  assert.equal(verifyWebhookSignature(raw, signature), true);
  // Re-serialised JSON (different key order/spacing) must NOT verify.
  assert.equal(verifyWebhookSignature(JSON.stringify({ payload: {}, event: "payment.captured" }), signature), false);
  assert.equal(verifyWebhookSignature(raw, "deadbeef"), false);
});

test("hashToken is deterministic and not reversible to the raw token", () => {
  const token = "super-secret-invite-token";
  assert.equal(hashToken(token), hashToken(token));
  assert.notEqual(hashToken(token), token);
  assert.equal(hashToken(token).length, 64);
});

test("safeCompare handles different lengths without throwing", () => {
  assert.equal(safeCompare("abc", "abc"), true);
  assert.equal(safeCompare("abc", "abcd"), false);
  assert.equal(safeCompare("", ""), true);
});

test("safeNextPath blocks open redirects", () => {
  assert.equal(safeNextPath("/checkout?plan=vault-monthly"), "/checkout?plan=vault-monthly");
  assert.equal(safeNextPath("//evil.com"), "/account");
  assert.equal(safeNextPath("/\\evil.com"), "/account");
  assert.equal(safeNextPath("https://evil.com"), "/account");
  assert.equal(safeNextPath(undefined), "/account");
});

test("rateLimit blocks after the configured number of attempts", () => {
  const key = `test-${Math.random()}`;
  for (let i = 0; i < 3; i += 1) {
    assert.equal(rateLimit(key, { limit: 3, windowMs: 60_000 }).ok, true);
  }
  const blocked = rateLimit(key, { limit: 3, windowMs: 60_000 });
  assert.equal(blocked.ok, false);
  assert.ok(blocked.retryAfter > 0);
});
