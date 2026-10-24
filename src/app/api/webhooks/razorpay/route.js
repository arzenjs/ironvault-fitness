import { NextResponse } from "next/server";
import { handleWebhook } from "@/services/payments";
import { connectDb, isDbConfigured } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Razorpay webhook endpoint — the authoritative payment signal.
 *
 * Important details:
 *  - The body is read with `request.text()` (raw), because the signature is an
 *    HMAC over the exact bytes Razorpay sent. Parsing and re-stringifying JSON
 *    would change key order/spacing and break verification.
 *  - `x-razorpay-event-id` is used as the idempotency key; Razorpay repeats it on
 *    retries, so a redelivered event is acknowledged without side effects.
 *  - Any 2xx tells Razorpay "delivered". Non-2xx triggers their retries, which is
 *    what we want for transient database failures.
 */
export async function POST(request) {
  const signature = request.headers.get("x-razorpay-signature") || "";
  const eventId = request.headers.get("x-razorpay-event-id") || "";

  let rawBody;
  try {
    rawBody = await request.text();
  } catch {
    return NextResponse.json({ error: "Unreadable body" }, { status: 400 });
  }

  if (!isDbConfigured()) {
    // Non-2xx so Razorpay retries once the deployment is fixed.
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    await connectDb();
    const result = await handleWebhook(rawBody, signature, eventId);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error?.status === 400) {
      console.warn("[webhook] rejected:", error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("[webhook] processing error:", error?.message);
    // 500 → Razorpay retries, and the reconciler script also covers this case.
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
