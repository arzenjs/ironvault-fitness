import { NextResponse } from "next/server";
import { connectDb, isDbConfigured } from "@/lib/db";
import ContactMessage from "@/models/ContactMessage";
import { contactSchema, fieldErrors } from "@/lib/validation";
import { apiError, assertSameOrigin, clientIp, rateLimit, HttpError } from "@/lib/security";
import { sendContactNotification } from "@/lib/email";

/** Contact form: server-side validation, stored in MongoDB, notification email. */
export async function POST(request) {
  try {
    assertSameOrigin(request);

    const limit = rateLimit(`contact:${clientIp(request)}`, { limit: 4, windowMs: 10 * 60_000 });
    if (!limit.ok) {
      throw new HttpError(429, "Too many messages from this connection. Please try again later.");
    }

    const body = await request.json().catch(() => null);
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please check the highlighted fields.", fields: fieldErrors(parsed.error) },
        { status: 422 },
      );
    }

    // Honeypot filled → almost certainly a bot. Pretend it worked.
    if (parsed.data.company) {
      return NextResponse.json({ ok: true });
    }

    if (!isDbConfigured()) {
      throw new HttpError(503, "The contact form is temporarily unavailable. Please call or WhatsApp us.");
    }

    await connectDb();
    await ContactMessage.create({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || "",
      topic: parsed.data.topic,
      message: parsed.data.message,
    });

    // Notification email is best-effort; the message is already saved.
    const delivery = await sendContactNotification(parsed.data).catch(() => ({ ok: false }));

    return NextResponse.json({
      ok: true,
      emailed: delivery.ok === true,
    });
  } catch (error) {
    const { status, body } = apiError(error);
    return NextResponse.json(body, { status });
  }
}
