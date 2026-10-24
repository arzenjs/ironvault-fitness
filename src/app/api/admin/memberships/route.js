import { NextResponse } from "next/server";
import { apiError, assertSameOrigin, requireRole } from "@/lib/security";
import { membershipActionSchema, fieldErrors } from "@/lib/validation";
import { changeMembershipStatus } from "@/services/memberships";
import { connectDb } from "@/lib/db";

export const runtime = "nodejs";

/**
 * Admin only: suspend or reinstate a membership.
 * The reason is required and written to the audit log alongside the change.
 * Staff (non-admin) cannot call this.
 */
export async function POST(request) {
  try {
    assertSameOrigin(request);
    const actor = await requireRole(["admin"]);

    const body = await request.json().catch(() => null);
    const parsed = membershipActionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Check the submitted values.", fields: fieldErrors(parsed.error) },
        { status: 422 },
      );
    }

    await connectDb();
    const membership = await changeMembershipStatus({
      membershipId: parsed.data.membershipId,
      action: parsed.data.action,
      reason: parsed.data.reason,
      actor,
    });

    if (!membership) {
      return NextResponse.json({ error: "Membership not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, status: membership.status });
  } catch (error) {
    const { status, body } = apiError(error);
    return NextResponse.json(body, { status });
  }
}
