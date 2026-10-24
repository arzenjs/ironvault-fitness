import mongoose from "mongoose";

/** Contact-form submissions. Validated server-side before insert. */
const contactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 180 },
    phone: { type: String, trim: true, maxlength: 24, default: "" },
    topic: { type: String, default: "general" },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    handledAt: Date,
  },
  { timestamps: true },
);

export default mongoose.models.ContactMessage || mongoose.model("ContactMessage", contactMessageSchema);
