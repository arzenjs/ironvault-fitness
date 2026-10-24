import mongoose from "mongoose";

/**
 * Payment states are deliberately separate from membership states:
 *
 *   created     order exists at Razorpay, checkout not started by the browser
 *   pending     checkout opened / callback not yet verified
 *   successful  signature verified AND provider state confirmed; membership activated
 *   failed      provider reported failure (never activates a membership)
 *   abandoned   customer closed checkout or the order expired without payment
 *   review      amount / currency / order mismatch or an unrecognised event —
 *               needs a human; never auto-activates
 *
 * `razorpayOrderId` and `razorpayPaymentId` are uniquely indexed so duplicate
 * webhooks and replayed callbacks cannot create parallel records.
 */
const paymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    // Snapshots so receipts still render correctly if the account is later renamed.
    customerEmail: { type: String, required: true, lowercase: true, trim: true },
    customerName: { type: String, required: true, trim: true },
    planId: { type: String, required: true },
    planName: { type: String, required: true },
    // Snapshot of the plan duration so an old payment keeps its own terms even
    // if the plan config changes later.
    durationMonths: { type: Number, required: true },
    amountPaise: { type: Number, required: true },
    currency: { type: String, required: true, default: "INR" },
    status: {
      type: String,
      enum: ["created", "pending", "successful", "failed", "abandoned", "review"],
      default: "created",
      index: true,
    },
    // NOTE: no `default: null` on the two unique fields below. A sparse unique
    // index skips *missing* fields but still enforces uniqueness on explicit
    // nulls, so defaulting to null would allow only one un-paid record ever.
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String, default: null },
    method: { type: String, default: "" },
    providerStatus: { type: String, default: "" },
    failureReason: { type: String, default: "" },
    membershipId: { type: mongoose.Schema.Types.ObjectId, ref: "Membership" },
    verifiedAt: Date,
    // Short audit trail of webhook events; capped so the document stays small.
    webhookEvents: [
      {
        _id: false,
        event: String,
        eventId: String,
        receivedAt: Date,
      },
    ],
    emailSentAt: Date,
    emailError: { type: String, default: "" },
  },
  { timestamps: true },
);

paymentSchema.index({ razorpayOrderId: 1 }, { unique: true, sparse: true });
paymentSchema.index({ razorpayPaymentId: 1 }, { unique: true, sparse: true });
paymentSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.Payment || mongoose.model("Payment", paymentSchema);
