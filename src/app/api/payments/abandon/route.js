import { NextResponse } from "next/server";
import { abandonPaymentSchema } from "@/lib/validation";
import { apiError, assertSameOrigin, requireUser, HttpError } from "@/lib/security";
import { markAbandoned } from "@/services/payments";
import { connectDb } from "@/lib/db";

export const runtime = "nodejs";

/**
 * The customer closed Razorpay Checkout without paying. We record "abandoned"
 * for the dashboard, but this is only a bookkeeping state: a payment that later
 * turns out to be captured will still be activated by the webhook/reconciler.
 */
export async function POST(request) {
  try {
    assertSameOrigin(request);
    const user = await requireUser();
    const body = await request.json().catch(() => null);
    const parsed = abandonPaymentSchema.safeParse(body);
    if (!parsed.success) throw new HttpError(400, "Invalid payment reference.");

    await connectDb();
    const payment = await markAbandoned({ user, paymentRecordId: parsed.data.paymentRecordId });
    return NextResponse.json({ ok: true, status: payment?.status || "unknown" });
  } catch (error) {
    const { status, body } = apiError(error);
    return NextResponse.json(body, { status });
  }
}
