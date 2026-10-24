import { NextResponse } from "next/server";
import { createOrderSchema, fieldErrors } from "@/lib/validation";
import { apiError, assertSameOrigin, requireUser, HttpError } from "@/lib/security";
import { createOrderForPlan } from "@/services/payments";
import { isRazorpayConfigured } from "@/lib/razorpay";

export const runtime = "nodejs";

/**
 * Creates the local pending payment + the Razorpay order.
 * The amount is read from config by the service — the request only carries a planId.
 */
export async function POST(request) {
  try {
    assertSameOrigin(request);
    const user = await requireUser();

    if (!isRazorpayConfigured()) {
      throw new HttpError(
        503,
        "Online payments are not configured yet. Add Razorpay test keys to the server environment.",
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Choose a valid membership plan.", fields: fieldErrors(parsed.error) },
        { status: 422 },
      );
    }

    const order = await createOrderForPlan({ user, planId: parsed.data.planId });
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    const { status, body } = apiError(error);
    return NextResponse.json(body, { status });
  }
}
