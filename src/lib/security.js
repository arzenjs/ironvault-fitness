import crypto from "node:crypto";
import { connectDb } from "@/lib/db";
import User from "@/models/User";

/**
 * Small helper module for authorisation, tokens and rate limiting.
 * Everything here runs on the server only.
 */

/** Thrown by requireUser/requireRole; API routes map it to a JSON response. */
export class HttpError extends Error {
  constructor(status, message, extra = {}) {
    super(message);
    this.status = status;
    this.extra = extra;
  }
}

/**
 * Reads the session and re-checks the user in MongoDB.
 * Re-reading is deliberate: roles and disabled accounts change after the JWT
 * was issued, and permission decisions must use current data.
 */
export async function requireUser() {
  // Imported lazily: this module also holds pure helpers (hashing, comparing,
  // rate limiting) that are used by lib/razorpay.js and by unit tests, and those
  // must not pull the whole Auth.js runtime in at import time.
  const { auth } = await import("@/lib/auth");
  const session = await auth();
  const id = session?.user?.id;
  if (!id) throw new HttpError(401, "You need to sign in to continue.");

  await connectDb();
  const user = await User.findById(id).lean();
  if (!user) throw new HttpError(401, "Your session is no longer valid. Please sign in again.");
  if (user.status === "disabled") throw new HttpError(403, "This account has been disabled.");

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
  };
}

/** Requires one of the given roles. Staff endpoints pass ["staff", "admin"]. */
export async function requireRole(allowedRoles) {
  const user = await requireUser();
  if (!allowedRoles.includes(user.role)) {
    throw new HttpError(403, "You do not have access to this area.");
  }
  return user;
}

export function isStaff(user) {
  return user?.role === "staff" || user?.role === "admin";
}

/** Converts a thrown error into a safe JSON payload (never leaks internals). */
export function apiError(error) {
  if (error instanceof HttpError) {
    return { status: error.status, body: { error: error.message, ...error.extra } };
  }
  console.error("[api] unexpected error:", error?.message);
  return { status: 500, body: { error: "Something went wrong on our side. Please try again." } };
}

/* ------------------------------------------------------------------ */
/*  Tokens                                                             */
/* ------------------------------------------------------------------ */

export function generateToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("base64url");
}

export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/** Constant-time comparison for short secrets (signatures, tokens). */
export function safeCompare(a = "", b = "") {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/* ------------------------------------------------------------------ */
/*  Rate limiting                                                      */
/* ------------------------------------------------------------------ */

/**
 * Simple in-memory sliding window limiter.
 *
 * This is per-instance: on a multi-instance serverless deployment each instance
 * keeps its own counters, so it is a speed bump rather than a hard guarantee.
 * The README explains this and what to use in production (e.g. Upstash Redis).
 */
const buckets = new Map();

export function rateLimit(key, { limit = 8, windowMs = 60_000 } = {}) {
  const now = Date.now();
  const entry = buckets.get(key);

  if (!entry || now > entry.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }

  entry.count += 1;
  if (entry.count > limit) {
    return { ok: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { ok: true, remaining: limit - entry.count };
}

export function clientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

/** Basic same-origin check for state-changing POSTs (defence in depth on top of SameSite cookies). */
export function assertSameOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return; // Same-origin navigations and server-to-server calls may omit it.
  const host = request.headers.get("host");
  try {
    if (new URL(origin).host !== host) {
      throw new HttpError(403, "Cross-origin request rejected.");
    }
  } catch {
    throw new HttpError(403, "Invalid request origin.");
  }
}
