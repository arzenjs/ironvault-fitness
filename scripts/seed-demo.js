#!/usr/bin/env node
/**
 * Optional demo data: a customer, a staff account and two memberships.
 *
 *   npm run seed-demo
 *
 * Passwords are taken from SEED_PASSWORD (or default to a documented demo value).
 * This script is for local development only — never run it against production.
 */
import process from "node:process";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { addMonthsClamped } from "../src/lib/dates.js";

const { MONGODB_URI } = process.env;
const password = process.env.SEED_PASSWORD || "IronVault#2026";

if (!MONGODB_URI) {
  console.error("✖ MONGODB_URI is not set.");
  process.exit(1);
}

async function main() {
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });

  const { default: User } = await import("../src/models/User.js");
  const { default: Membership } = await import("../src/models/Membership.js");

  const hash = await bcrypt.hash(password, 12);

  const seedUsers = [
    { name: "Demo Customer", email: "member@ironvault.example", role: "customer" },
    { name: "Demo Staff", email: "staff@ironvault.example", role: "staff" },
  ];

  for (const entry of seedUsers) {
    const existing = await User.findOne({ email: entry.email });
    if (existing) {
      console.log(`ℹ ${entry.email} already exists (role: ${existing.role})`);
      continue;
    }
    const user = await User.create({ ...entry, passwordHash: hash, status: "active" });
    console.log(`✔ Created ${entry.role}: ${entry.email}`);

    if (entry.role === "customer") {
      const now = new Date();
      // One expired membership (history) and one active one.
      const pastStart = addMonthsClamped(now, -4);
      await Membership.create({
        userId: user._id,
        planId: "vault-monthly",
        planName: "Vault Monthly",
        pricePaise: 149900,
        durationMonths: 1,
        startDate: pastStart,
        endDate: addMonthsClamped(pastStart, 1),
        status: "expired",
      });
      await Membership.create({
        userId: user._id,
        planId: "vault-quarterly",
        planName: "Vault Quarterly",
        pricePaise: 399900,
        durationMonths: 3,
        startDate: now,
        endDate: addMonthsClamped(now, 3),
        status: "active",
      });
      console.log("✔ Added demo memberships (one expired, one active)");
    }
  }

  console.log(`\nDemo password for both accounts: ${password}`);
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error("✖", error?.message || error);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
