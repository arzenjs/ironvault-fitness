import mongoose from "mongoose";

/**
 * A membership is a paid window of access. `paymentId` is unique + sparse: the
 * unique index is the database-level guarantee that one payment can never
 * activate two memberships, even if the verify route and the webhook race each
 * other.
 *
 * `status` is stored, but the UI treats `endDate < now` as expired regardless of
 * what is stored (see lib/membership-status.js), so a stale field can never make
 * an expired membership look active.
 */
const membershipSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    // Sparse + unique: one payment can activate at most one membership. Kept
    // unset (not null) on rows created without a payment, otherwise the sparse
    // index would only allow a single such row.
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
    planId: { type: String, required: true, index: true },
    planName: { type: String, required: true },
    pricePaise: { type: Number, required: true },
    durationMonths: { type: Number, required: true },
    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: ["active", "queued", "expired", "suspended"],
      default: "active",
      index: true,
    },
    // Admin suspension / reinstatement trail (simple, auditable, not a full ERP).
    statusReason: { type: String, default: "" },
    statusChangedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    statusChangedAt: Date,
  },
  { timestamps: true },
);

membershipSchema.index({ paymentId: 1 }, { unique: true, sparse: true });
membershipSchema.index({ userId: 1, endDate: -1 });

export default mongoose.models.Membership || mongoose.model("Membership", membershipSchema);
