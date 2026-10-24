import mongoose from "mongoose";

/**
 * Append-only audit trail for privileged actions (membership suspension,
 * reinstatement, staff invitations, staff activation). Kept intentionally small:
 * who did what, to whom, and why.
 */
const auditLogSchema = new mongoose.Schema(
  {
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    actorEmail: { type: String, required: true },
    action: { type: String, required: true, index: true },
    targetType: { type: String, enum: ["membership", "user", "invitation", "payment"], required: true },
    targetId: { type: String, required: true, index: true },
    reason: { type: String, default: "" },
    meta: { type: Object, default: {} },
  },
  { timestamps: true },
);

export default mongoose.models.AuditLog || mongoose.model("AuditLog", auditLogSchema);
