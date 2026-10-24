import { NextResponse } from "next/server";
import { apiError, assertSameOrigin, requireRole, HttpError } from "@/lib/security";
import { invitationSchema, fieldErrors } from "@/lib/validation";
import { createInvitation } from "@/services/invitations";
import { connectDb } from "@/lib/db";

export const runtime = "nodejs";

/** Admin only: issue a single-use staff invitation. */
export async function POST(request) {
  try {
    assertSameOrigin(request);
    const actor = await requireRole(["admin"]);

    const body = await request.json().catch(() => null);
    const parsed = invitationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Check the invitation details.", fields: fieldErrors(parsed.error) },
        { status: 422 },
      );
    }

    await connectDb();
    const result = await createInvitation({
      email: parsed.data.email,
      role: parsed.data.role,
      actor,
    });

    return NextResponse.json({
      ok: true,
      inviteUrl: result.inviteUrl,
      emailDelivered: result.emailDelivered,
      emailSkipped: result.emailSkipped,
      expiresAt: result.invitation.expiresAt,
    });
  } catch (error) {
    if (error instanceof HttpError) {
      const { status, body } = apiError(error);
      return NextResponse.json(body, { status });
    }
    const { status, body } = apiError(error);
    return NextResponse.json(body, { status });
  }
}
