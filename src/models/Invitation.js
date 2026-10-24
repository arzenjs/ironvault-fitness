import mongoose from "mongoose";

/**
 * Staff invitations. Only the SHA-256 hash of the token is stored — the raw
 * token exists once, in the invite email. Invitations expire and are
 * single-use; `usedAt` is set atomically on acceptance.
 */
const invitationSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    role: { type: String, enum: ["staff", "admin"], default: "staff" },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true, index: true },
    usedAt: Date,
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    revokedAt: Date,
    acceptedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true },
);

export default mongoose.models.Invitation || mongoose.model("Invitation", invitationSchema);
