import { z } from "zod";
import { getPlanIds } from "@/config/membership-plans";

/**
 * Server-side validation schemas.
 *
 * Every API route parses its input with one of these before touching the
 * database. The browser may run the same rules for instant feedback, but the
 * server never trusts the client's copy.
 */

const email = z.email({ message: "Enter a valid email address" }).max(180).toLowerCase().trim();

const password = z
  .string()
  .min(8, "Use at least 8 characters")
  .max(72, "Password must be 72 characters or fewer")
  .regex(/[a-zA-Z]/, "Include at least one letter")
  .regex(/[0-9]/, "Include at least one number");

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your name").max(80),
    email,
    phone: z
      .string()
      .trim()
      .max(20)
      .regex(/^[+0-9 ()-]*$/, "Use digits, spaces, +, - or ( ) only")
      .optional()
      .or(z.literal("")),
    password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password").max(72),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  email,
  phone: z
    .string()
    .trim()
    .max(24)
    .regex(/^[+0-9 ()-]*$/, "Use digits, spaces, +, - or ( ) only")
    .optional()
    .or(z.literal("")),
  topic: z.enum(["general", "membership", "coaching", "billing"]).default("general"),
  message: z.string().trim().min(20, "Tell us a little more (20+ characters)").max(2000),
  // Hidden honeypot: real users never fill this field.
  company: z.string().max(0).optional().or(z.literal("")),
});

export const createOrderSchema = z.object({
  planId: z.enum(getPlanIds(), { message: "Unknown membership plan" }),
});

export const verifyPaymentSchema = z.object({
  paymentRecordId: z.string().regex(/^[a-f0-9]{24}$/i, "Invalid payment reference"),
  razorpay_order_id: z.string().min(6).max(120),
  razorpay_payment_id: z.string().min(6).max(120),
  razorpay_signature: z.string().min(16).max(256),
});

export const abandonPaymentSchema = z.object({
  paymentRecordId: z.string().regex(/^[a-f0-9]{24}$/i, "Invalid payment reference"),
});

export const invitationSchema = z.object({
  email,
  role: z.enum(["staff", "admin"]).default("staff"),
});

export const acceptInvitationSchema = z
  .object({
    token: z.string().min(20).max(200),
    name: z.string().trim().min(2, "Enter your name").max(80),
    password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const membershipActionSchema = z.object({
  membershipId: z.string().regex(/^[a-f0-9]{24}$/i, "Invalid membership id"),
  action: z.enum(["suspend", "reinstate"]),
  reason: z.string().trim().min(4, "Add a short reason").max(300),
});

export const userStatusSchema = z.object({
  userId: z.string().regex(/^[a-f0-9]{24}$/i, "Invalid user id"),
  action: z.enum(["disable", "enable"]),
  reason: z.string().trim().max(300).optional().or(z.literal("")),
});

/** Turns a ZodError into `{ field: message }` for form rendering. */
export function fieldErrors(error) {
  const out = {};
  for (const issue of error.issues || []) {
    const key = issue.path?.[0] || "form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
