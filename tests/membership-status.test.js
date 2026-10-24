import test from "node:test";
import assert from "node:assert/strict";
import { deriveMembershipState } from "@/lib/membership-status";

const now = new Date("2026-06-15T12:00:00Z");

test("an active membership reports days remaining", () => {
  const state = deriveMembershipState(
    { startDate: "2026-06-01T00:00:00Z", endDate: "2026-06-30T00:00:00Z", status: "active" },
    now,
  );
  assert.equal(state.state, "active");
  assert.equal(state.daysRemaining, 15);
});

test("a future membership is queued", () => {
  const state = deriveMembershipState(
    { startDate: "2026-07-01T00:00:00Z", endDate: "2026-09-30T00:00:00Z", status: "queued" },
    now,
  );
  assert.equal(state.state, "queued");
  assert.equal(state.startsInDays, 16);
});

test("dates win over a stale stored status", () => {
  // The stored field still says "active", but the paid period is over.
  const state = deriveMembershipState(
    { startDate: "2026-01-01T00:00:00Z", endDate: "2026-02-01T00:00:00Z", status: "active" },
    now,
  );
  assert.equal(state.state, "expired");
});

test("suspension is respected even inside a valid date window", () => {
  const state = deriveMembershipState(
    { startDate: "2026-06-01T00:00:00Z", endDate: "2026-09-01T00:00:00Z", status: "suspended" },
    now,
  );
  assert.equal(state.state, "suspended");
});
