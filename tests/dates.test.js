import test from "node:test";
import assert from "node:assert/strict";
import { addMonthsClamped, daysBetween, nextStartDate } from "@/lib/dates";

test("adds a month without overflowing at month end", () => {
  assert.equal(
    addMonthsClamped(new Date("2026-01-31T10:00:00Z"), 1).toISOString(),
    "2026-02-28T10:00:00.000Z",
  );
});

test("handles leap years when clamping", () => {
  assert.equal(
    addMonthsClamped(new Date("2028-01-31T00:00:00Z"), 1).toISOString(),
    "2028-02-29T00:00:00.000Z",
  );
});

test("clamps for three-month and twelve-month durations", () => {
  assert.equal(
    addMonthsClamped(new Date("2026-08-31T06:30:00Z"), 3).toISOString(),
    "2026-11-30T06:30:00.000Z",
  );
  assert.equal(
    addMonthsClamped(new Date("2026-02-28T00:00:00Z"), 12).toISOString(),
    "2027-02-28T00:00:00.000Z",
  );
  assert.equal(
    addMonthsClamped(new Date("2024-02-29T00:00:00Z"), 12).toISOString(),
    "2025-02-28T00:00:00.000Z",
  );
});

test("crosses the year boundary correctly", () => {
  assert.equal(
    addMonthsClamped(new Date("2026-11-15T00:00:00Z"), 3).toISOString(),
    "2027-02-15T00:00:00.000Z",
  );
});

test("daysBetween rounds up partial days and never goes negative", () => {
  assert.equal(daysBetween(new Date("2026-01-01T00:00:00Z"), new Date("2026-01-31T12:00:00Z")), 31);
  assert.equal(daysBetween(new Date("2026-02-01T00:00:00Z"), new Date("2026-01-01T00:00:00Z")), 0);
});

test("nextStartDate queues a new plan after the latest valid membership", () => {
  const now = new Date("2026-05-10T00:00:00Z");
  const start = nextStartDate({
    now,
    existingMemberships: [
      { endDate: new Date("2026-06-10T00:00:00Z") },
      { endDate: new Date("2026-07-01T00:00:00Z") },
      { endDate: new Date("2026-01-01T00:00:00Z") }, // already expired
    ],
  });
  assert.equal(start.toISOString(), "2026-07-01T00:00:00.000Z");
});

test("nextStartDate starts immediately when nothing is active", () => {
  const now = new Date("2026-05-10T00:00:00Z");
  assert.equal(
    nextStartDate({ now, existingMemberships: [{ endDate: new Date("2026-01-01T00:00:00Z") }] }).toISOString(),
    now.toISOString(),
  );
});
