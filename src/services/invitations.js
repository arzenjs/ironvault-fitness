import bcrypt from "bcryptjs";
import Invitation from "@/models/Invitation";
import User from "@/models/User";
import AuditLog from "@/models/AuditLog";
import { generateToken, hashToken, HttpError } from "@/lib/security";
import { sendStaffInvitation } from "@/lib/email";
import { siteUrl } from "@/config/gym";

const INVITE_TTL_HOURS = 48;

/**
 * Staff invitations.
 *
 * - The raw token is generated once, hashed with SHA-256 and only the hash is
 *   stored. A leaked database cannot be used to accept an invitation.
 * - Tokens expire after 48 hours and are single-use (`usedAt`).
 * - Accepting an invitation is the only way to create a staff/admin account —
 *   there is no public staff registration endpoint.
 */
export async function createInvitation({ email, role = "staff", actor }) {
  const normalised = email.toLowerCase().trim();

  const existingUser = await User.findOne({ email: normalised }).select("_id role");
  if (existingUser) {
    throw new HttpError(409, "An account with this email already exists. Change that account's role instead.");
  }

  // Invalidate any earlier open invite for the same address.
  await Invitation.updateMany(
    { email: normalised, usedAt: null, revokedAt: null },
    { $set: { revokedAt: new Date() } },
  );

  const token = generateToken(32);
  const invitation = await Invitation.create({
    email: normalised,
    role,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + INVITE_TTL_HOURS * 60 * 60 * 1000),
    invitedBy: actor.id,
  });

  const inviteUrl = `${siteUrl}/staff/accept-invite?token=${token}`;

  // Email failure does not roll back the invitation: the link is also returned
  // once to the admin so it can be shared manually in a demo environment.
  const delivery = await sendStaffInvitation({
    email: normalised,
    inviteUrl,
    inviterName: actor.name,
    role,
  });

  await AuditLog.create({
    actorId: actor.id,
    actorEmail: actor.email,
    action: "invitation.created",
    targetType: "invitation",
    targetId: invitation._id.toString(),
    meta: { email: normalised, role, emailDelivered: delivery.ok === true },
  });

  return {
    invitation: invitation.toObject(),
    inviteUrl,
    emailDelivered: delivery.ok === true,
    emailSkipped: delivery.skipped === true,
  };
}

/** Reads a token without consuming it (used to render the accept form). */
export async function findInvitationByToken(token) {
  if (!token) return null;
  const invitation = await Invitation.findOne({ tokenHash: hashToken(token) }).lean();
  if (!invitation) return { state: "invalid" };
  if (invitation.usedAt) return { state: "used", invitation };
  if (invitation.revokedAt) return { state: "revoked", invitation };
  if (new Date(invitation.expiresAt) < new Date()) return { state: "expired", invitation };
  return { state: "valid", invitation };
}

export async function acceptInvitation({ token, name, password }) {
  const result = await findInvitationByToken(token);
  if (result.state !== "valid") {
    throw new HttpError(400, `This invitation is ${result.state}. Ask an admin for a new one.`);
  }

  const { invitation } = result;
  const email = invitation.email;

  const passwordHash = await bcrypt.hash(password, 12);

  // Create the user, then atomically burn the token. If the token was consumed
  // by a concurrent request in between, we roll the user back.
  let user;
  try {
    user = await User.create({
      name,
      email,
      passwordHash,
      role: invitation.role,
      status: "active",
    });
  } catch (error) {
    if (error?.code === 11000) {
      throw new HttpError(409, "An account with this email already exists. Try logging in instead.");
    }
    throw error;
  }

  const claimed = await Invitation.findOneAndUpdate(
    { _id: invitation._id, usedAt: null, revokedAt: null },
    { $set: { usedAt: new Date(), acceptedBy: user._id } },
    { new: true },
  );

  if (!claimed) {
    await User.deleteOne({ _id: user._id });
    throw new HttpError(409, "This invitation has already been used. Ask an admin for a new one.");
  }

  await AuditLog.create({
    actorId: user._id,
    actorEmail: user.email,
    action: "invitation.accepted",
    targetType: "user",
    targetId: user._id.toString(),
    meta: { role: user.role, invitationId: invitation._id.toString() },
  });

  return { user: user.toSafeJSON() };
}
