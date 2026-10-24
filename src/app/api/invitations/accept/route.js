import { NextResponse } from "next/server";
import { acceptInvitationSchema, fieldErrors } from "@/lib/validation";
import { apiError, assertSameOrigin, clientIp, rateLimit, HttpError } from "@/lib/security";
import { acceptInvitation } from "@/services/invitations";
import { connectDb } from "@/lib/db";

export const runtime = "nodejs";

/** Public endpoint guarded by the single-use invitation token itself. */
export async function POST(request) {
  try {
    assertSameOrigin(request);

    const limit = rateLimit(`invite-accept:${clientIp(request)}`, { limit: 10, windowMs: 10 * 60_000 });
    if (!limit.ok) throw new HttpError(429, "Too many attempts. Please try again later.");

    const body = await request.json().catch(() => null);
    const parsed = acceptInvitationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Check the highlighted fields.", fields: fieldErrors(parsed.error) },
        { status: 422 },
      );
    }

    await connectDb();
    const { user } = await acceptInvitation({
      token: parsed.data.token,
      name: parsed.data.name,
      password: parsed.data.password,
    });

    return NextResponse.json({ ok: true, user });
  } catch (error) {
    const { status, body } = apiError(error);
    return NextResponse.json(body, { status });
  }
}
