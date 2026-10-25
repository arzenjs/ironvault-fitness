import test from "node:test";
import assert from "node:assert/strict";
import {
  defaultPathForRole,
  isPathAllowedForRole,
  resolvePostLoginPath,
  roleHome,
  safeNextPath,
} from "@/lib/redirects";

test("safeNextPath only accepts same-site relative paths", () => {
  assert.equal(safeNextPath("/account"), "/account");
  assert.equal(safeNextPath("/checkout?plan=vault-annual"), "/checkout?plan=vault-annual");
  for (const hostile of [
    "//evil.com",
    "/\\evil.com",
    "https://evil.com",
    "javascript:alert(1)",
    "evil.com",
    "/ok\r\nSet-Cookie: x=1",
    "/ok\u0000",
    "",
    undefined,
    null,
    42,
    `/${"a".repeat(400)}`,
  ]) {
    assert.equal(safeNextPath(hostile, null), null, `rejects ${JSON.stringify(hostile)}`);
  }
});

test("each role has its own home", () => {
  assert.equal(defaultPathForRole("customer"), "/account");
  assert.equal(defaultPathForRole("staff"), "/staff");
  assert.equal(defaultPathForRole("admin"), "/admin");
  // Unknown or missing roles fall back to the least-privileged home.
  assert.equal(defaultPathForRole(undefined), "/account");
  assert.equal(defaultPathForRole("owner"), "/account");
  assert.equal(roleHome("admin").label, "Admin dashboard");
});

test("admin destinations are limited to admins; staff destinations to staff and admins", () => {
  assert.equal(isPathAllowedForRole("/admin", "admin"), true);
  assert.equal(isPathAllowedForRole("/admin/payments?status=review", "admin"), true);
  assert.equal(isPathAllowedForRole("/admin", "staff"), false);
  assert.equal(isPathAllowedForRole("/admin/users", "customer"), false);
  assert.equal(isPathAllowedForRole("/staff", "staff"), true);
  assert.equal(isPathAllowedForRole("/staff", "admin"), true);
  assert.equal(isPathAllowedForRole("/staff", "customer"), false);
  assert.equal(isPathAllowedForRole("/staff/accept-invite?token=abc", "customer"), true);
  assert.equal(isPathAllowedForRole("/memberships", "customer"), true);
});

test("post-login destination: role home by default, requested path only when safe and permitted", () => {
  assert.equal(resolvePostLoginPath("admin", null), "/admin");
  assert.equal(resolvePostLoginPath("staff", undefined), "/staff");
  assert.equal(resolvePostLoginPath("customer", null), "/account");

  assert.equal(resolvePostLoginPath("customer", "/checkout?plan=vault-monthly"), "/checkout?plan=vault-monthly");
  assert.equal(resolvePostLoginPath("admin", "/admin/payments"), "/admin/payments");
  assert.equal(resolvePostLoginPath("staff", "/staff"), "/staff");

  // A customer or staff member cannot be steered into an area their role cannot open.
  assert.equal(resolvePostLoginPath("customer", "/admin"), "/account");
  assert.equal(resolvePostLoginPath("customer", "/staff"), "/account");
  assert.equal(resolvePostLoginPath("staff", "/admin/users"), "/staff");

  // Open-redirect payloads are ignored for every role.
  for (const role of ["customer", "staff", "admin"]) {
    for (const hostile of ["//evil.com", "/\\evil.com", "https://evil.com/admin"]) {
      assert.equal(resolvePostLoginPath(role, hostile), defaultPathForRole(role));
    }
  }

  // No redirect loops back into the login page.
  assert.equal(resolvePostLoginPath("customer", "/login?next=/account"), "/account");
});
