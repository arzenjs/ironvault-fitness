import { NextResponse } from "next/server";
import { apiError, requireUser, HttpError } from "@/lib/security";
import Payment from "@/models/Payment";
import { serialisePayment } from "@/services/payments";
import { connectDb } from "@/lib/db";

export const runtime = "nodejs";

/**
 * Polled by the result page while Razorpay's confirmation (usually the webhook)
 * arrives. Scoped to the signed-in user, so one customer can never read another
 * customer's payment.
 */
export async function GET(request) {
  try {
    const user = await requireUser();
    const ref = new URL(request.url).searchParams.get("ref");

    if (!ref || !/^[a-f0-9]{24}$/i.test(ref)) {
      throw new HttpError(400, "Invalid payment reference.");
    }

    await connectDb();
    const payment = await Payment.findOne({ _id: ref, userId: user.id }).lean();
    if (!payment) throw new HttpError(404, "Payment not found.");

    return NextResponse.json({
      payment: serialisePayment(payment),
      emailSent: Boolean(payment.emailSentAt),
    });
  } catch (error) {
    const { status, body } = apiError(error);
    return NextResponse.json(body, { status });
  }
}
