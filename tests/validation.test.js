import test from "node:test";
import assert from "node:assert/strict";
import {
  registerSchema,
  loginSchema,
  createOrderSchema,
  contactSchema,
  membershipActionSchema,
  fieldErrors,
} from "@/lib/validation";
import { getPlanById, membershipPlans } from "@/config/membership-plans";

test("plan config is the single source of pricing", () => {
  assert.equal(membershipPlans.length, 3);
  assert.equal(getPlanById("vault-monthly").pricePaise, 149900);
  assert.equal(getPlanById("vault-quarterly").pricePaise, 399900);
  assert.equal(getPlanById("vault-annual").pricePaise, 1399900);
  assert.equal(getPlanById("vault-annual").durationMonths, 12);
  assert.equal(getPlanById("made-up-plan"), null);
});

test("registration requires matching passwords and a strong-enough password", () => {
  const base = {
    name: "Asha Verma",
    email: "ASHA@example.com",
    password: "strength1",
    confirmPassword: "strength1",
  };

  const ok = registerSchema.safeParse(base);
  assert.equal(ok.success, true);
  assert.equal(ok.data.email, "asha@example.com"); // normalised to lowercase

  const mismatch = registerSchema.safeParse({ ...base, confirmPassword: "different1" });
  assert.equal(mismatch.success, false);
  assert.ok(fieldErrors(mismatch.error).confirmPassword);

  const weak = registerSchema.safeParse({ ...base, password: "short", confirmPassword: "short" });
  assert.equal(weak.success, false);

  const lettersOnly = registerSchema.safeParse({ ...base, password: "abcdefgh", confirmPassword: "abcdefgh" });
  assert.equal(lettersOnly.success, false);
});

test("login rejects a malformed email", () => {
  assert.equal(loginSchema.safeParse({ email: "nope", password: "x" }).success, false);
});

test("createOrder only accepts known plan ids and ignores client amounts", () => {
  assert.equal(createOrderSchema.safeParse({ planId: "vault-annual" }).success, true);
  assert.equal(createOrderSchema.safeParse({ planId: "free-forever" }).success, false);

  // Extra fields (a tampered amount) are stripped, never trusted.
  const parsed = createOrderSchema.safeParse({ planId: "vault-annual", amountPaise: 1 });
  assert.equal(parsed.success, true);
  assert.equal(parsed.data.amountPaise, undefined);
});

test("contact form enforces message length and topic enum", () => {
  const good = {
    name: "Ravi",
    email: "ravi@example.com",
    topic: "membership",
    message: "I would like to know more about the quarterly plan and coaching.",
  };
  assert.equal(contactSchema.safeParse(good).success, true);
  assert.equal(contactSchema.safeParse({ ...good, message: "too short" }).success, false);
  assert.equal(contactSchema.safeParse({ ...good, topic: "spam" }).success, false);
});

test("admin membership actions require a reason", () => {
  const id = "0123456789abcdef01234567";
  assert.equal(membershipActionSchema.safeParse({ membershipId: id, action: "suspend", reason: "" }).success, false);
  assert.equal(
    membershipActionSchema.safeParse({ membershipId: id, action: "suspend", reason: "Chargeback" }).success,
    true,
  );
  assert.equal(
    membershipActionSchema.safeParse({ membershipId: "not-an-id", action: "suspend", reason: "Chargeback" }).success,
    false,
  );
});
