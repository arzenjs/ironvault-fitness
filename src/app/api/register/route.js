import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { connectDb, isDbConfigured } from "@/lib/db";
import User from "@/models/User";
import { registerSchema, fieldErrors } from "@/lib/validation";
import { apiError, assertSameOrigin, clientIp, rateLimit, HttpError } from "@/lib/security";
import { sendWelcomeEmail } from "@/lib/email";

/**
 * Customer registration. Public — but always creates a `customer` account,
 * whatever the request body contains.
 */
export async function POST(request) {
  try {
    assertSameOrigin(request);

    if (!isDbConfigured()) {
      throw new HttpError(503, "Registration is temporarily unavailable (database not configured).");
    }

    const limit = rateLimit(`register:${clientIp(request)}`, { limit: 5, windowMs: 10 * 60_000 });
    if (!limit.ok) {
      throw new HttpError(429, "Too many sign-up attempts. Please try again shortly.");
    }

    const body = await request.json().catch(() => null);
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please check the highlighted fields.", fields: fieldErrors(parsed.error) },
        { status: 422 },
      );
    }

    const { name, email, password, phone } = parsed.data;
    await connectDb();

    const existing = await User.findOne({ email }).select("_id");
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists.", fields: { email: "Email already registered" } },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    let user;
    try {
      user = await User.create({
        name,
        email,
        phone: phone || "",
        passwordHash,
        role: "customer", // hard-coded: the public endpoint can never create staff
        status: "active",
      });
    } catch (error) {
      if (error?.code === 11000) {
        return NextResponse.json(
          { error: "An account with this email already exists.", fields: { email: "Email already registered" } },
          { status: 409 },
        );
      }
      throw error;
    }

    // Best-effort welcome email; a failure must not fail the registration.
    sendWelcomeEmail({ name: user.name, email: user.email }).catch((error) =>
      console.warn("[register] welcome email failed:", error?.message),
    );

    return NextResponse.json({ ok: true, user: user.toSafeJSON() }, { status: 201 });
  } catch (error) {
    const { status, body } = apiError(error);
    return NextResponse.json(body, { status });
  }
}
