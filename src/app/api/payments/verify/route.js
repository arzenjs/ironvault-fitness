import { NextResponse } from "next/server";
import { verifyPaymentSchema, fieldErrors } from "@/lib/validation";
import { apiError, assertSameOrigin, requireUser, clientIp, rateLimit, HttpError } from "@/lib/security";
import { confirmCheckoutPayment } from "@/services/payments";

export const runtime = "nodejs";

/**
 * Called by the browser after Razorpay Checkout returns.
 *
 * This is a *hint*, not proof. The service verifies the HMAC signature and then
 * re-checks the payment with Razorpay's API before anything is activated, so a
 * crafted request cannot grant a membership.
 */
export async function POST(request) {
  try {
    assertSameOrigin(request);
    const user = await requireUser();

    const limit = rateLimit(`verify:${user.id}:${clientIp(request)}`, { limit: 20, windowMs: 5 * 60_000 });
    if (!limit.ok) throw new HttpError(429, "Too many verification attempts. Please wait a minute.");

    const body = await request.json().catch(() => null);
    const parsed = verifyPaymentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "The payment details were incomplete.", fields: fieldErrors(parsed.error) },
        { status: 422 },
      );
    }

    const result = await confirmCheckoutPayment({ user, payload: parsed.data });
    return NextResponse.json(result);
  } catch (error) {
    const { status, body } = apiError(error);
    return NextResponse.json(body, { status });
  }
}
