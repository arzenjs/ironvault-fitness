import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError, assertSameOrigin, requireRole, HttpError } from "@/lib/security";
import { reconcilePayment } from "@/services/payments";
import { connectDb } from "@/lib/db";
import Payment from "@/models/Payment";

export const runtime = "nodejs";

const schema = z.object({
  paymentId: z.string().regex(/^[a-f0-9]{24}$/i, "Invalid payment id"),
});

/**
 * Staff/admin: ask Razorpay what actually happened to a pending payment.
 *
 * This is the manual recovery path. It can only move a payment to a state that
 * Razorpay itself reports — staff cannot mark a payment successful by hand.
 */
export async function POST(request) {
  try {
    assertSameOrigin(request);
    await requireRole(["staff", "admin"]);

    const body = await request.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) throw new HttpError(400, "Invalid payment id.");

    await connectDb();
    const payment = await Payment.findById(parsed.data.paymentId).select("status").lean();
    if (!payment) throw new HttpError(404, "Payment not found.");

    const result = await reconcilePayment({ paymentId: parsed.data.paymentId });
    return NextResponse.json(result);
  } catch (error) {
    const { status, body } = apiError(error);
    return NextResponse.json(body, { status });
  }
}
