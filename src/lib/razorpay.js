import crypto from "node:crypto";
import Razorpay from "razorpay";
import { safeCompare } from "@/lib/security";

/**
 * Server-only Razorpay helpers.
 *
 * RAZORPAY_KEY_SECRET and RAZORPAY_WEBHOOK_SECRET must never reach the browser.
 * Only RAZORPAY_KEY_ID is public (it is the publishable key used by Checkout),
 * and it is handed to the client by an API response, not embedded at build time.
 */

export function isRazorpayConfigured() {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

let cachedClient = null;

export function getRazorpayClient() {
  if (!isRazorpayConfigured()) {
    throw new Error(
      "Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.local (test-mode keys).",
    );
  }
  if (!cachedClient) {
    cachedClient = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return cachedClient;
}

/**
 * Checkout signature check, exactly as Razorpay documents it:
 *   expected = HMAC_SHA256(order_id + "|" + payment_id, key_secret)
 * and the checkout response's `razorpay_signature` must equal `expected`.
 */
export function verifyPaymentSignature({ orderId, paymentId, signature }) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;
  if (!orderId || !paymentId || !signature) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return safeCompare(expected, signature);
}

/**
 * Webhook signature check. Razorpay signs the **raw** request body with the
 * webhook secret, so the route must read `await request.text()` and must not
 * re-serialise the JSON before hashing.
 */
export function verifyWebhookSignature(rawBody, signature) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;
  if (!rawBody || !signature) return false;

  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return safeCompare(expected, signature);
}
