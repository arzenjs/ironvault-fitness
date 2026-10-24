import { NextResponse } from "next/server";
import { apiError, assertSameOrigin, requireRole, HttpError } from "@/lib/security";
import { userStatusSchema, fieldErrors } from "@/lib/validation";
import { connectDb } from "@/lib/db";
import User from "@/models/User";
import AuditLog from "@/models/AuditLog";

export const runtime = "nodejs";

/** Admin only: enable/disable a staff or customer account. */
export async function POST(request) {
  try {
    assertSameOrigin(request);
    const actor = await requireRole(["admin"]);

    const body = await request.json().catch(() => null);
    const parsed = userStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Check the submitted values.", fields: fieldErrors(parsed.error) },
        { status: 422 },
      );
    }

    const { userId, action, reason } = parsed.data;
    if (userId === actor.id) {
      throw new HttpError(400, "You cannot change the status of your own account.");
    }

    await connectDb();
    const target = await User.findById(userId);
    if (!target) throw new HttpError(404, "User not found.");

    // Keep at least one admin able to log in.
    if (target.role === "admin" && action === "disable") {
      const activeAdmins = await User.countDocuments({ role: "admin", status: "active" });
      if (activeAdmins <= 1) {
        throw new HttpError(400, "At least one active admin account must remain.");
      }
    }

    target.status = action === "disable" ? "disabled" : "active";
    await target.save();

    await AuditLog.create({
      actorId: actor.id,
      actorEmail: actor.email,
      action: action === "disable" ? "user.disabled" : "user.enabled",
      targetType: "user",
      targetId: target._id.toString(),
      reason: reason || "",
      meta: { role: target.role, email: target.email },
    });

    return NextResponse.json({ ok: true, status: target.status });
  } catch (error) {
    const { status, body } = apiError(error);
    return NextResponse.json(body, { status });
  }
}
