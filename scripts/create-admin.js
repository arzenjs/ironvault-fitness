#!/usr/bin/env node
/**
 * Secure initial-admin bootstrap.
 *
 * There is no public endpoint that can create an admin. The first admin is made
 * locally with database credentials, like a migration:
 *
 *   npm run create-admin -- --email=owner@example.com --name="Gym Owner"
 *
 * The password is read from the CREATE_ADMIN_PASSWORD env var, or asked for
 * interactively (hidden input) so it never lands in shell history.
 *
 * Re-running for an existing email either promotes the account (with --promote)
 * or refuses, so this cannot silently take over an account.
 */
import { createInterface } from "node:readline";
import process from "node:process";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const { MONGODB_URI } = process.env;

function arg(name) {
  const found = process.argv.find((value) => value.startsWith(`--${name}=`));
  return found ? found.split("=").slice(1).join("=") : null;
}

function fail(message) {
  console.error(`✖ ${message}`);
  process.exit(1);
}

async function promptHidden(question) {
  process.stdout.write(question);
  const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  // Hide typed characters.
  const originalWrite = rl._writeToOutput.bind(rl);
  rl._writeToOutput = () => {};
  return new Promise((resolve) => {
    rl.question("", (answer) => {
      rl._writeToOutput = originalWrite;
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });
  });
}

async function main() {
  if (!MONGODB_URI) fail("MONGODB_URI is not set. Run with: npm run create-admin -- --email=... (loads .env.local)");

  const email = (arg("email") || "").toLowerCase().trim();
  const name = (arg("name") || "IronVault Admin").trim();
  const promote = process.argv.includes("--promote");

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    fail("Provide a valid email: npm run create-admin -- --email=owner@example.com --name=\"Gym Owner\"");
  }

  let password = process.env.CREATE_ADMIN_PASSWORD;
  if (!password) {
    if (!process.stdin.isTTY) fail("No TTY available. Set CREATE_ADMIN_PASSWORD for non-interactive use.");
    password = await promptHidden("Admin password (hidden): ");
    const confirm = await promptHidden("Confirm password: ");
    if (password !== confirm) fail("Passwords did not match.");
  }

  if (password.length < 10) fail("Use a password of at least 10 characters.");
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) fail("Password needs a letter and a number.");

  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });

  // Imported after connecting so the model registers against this connection.
  const { default: User } = await import("../src/models/User.js");

  const existing = await User.findOne({ email });

  if (existing) {
    if (promote) {
      existing.role = "admin";
      existing.status = "active";
      await existing.save();
      console.log(`✔ Promoted existing account ${email} to admin.`);
    } else {
      console.log(`ℹ An account with ${email} already exists (role: ${existing.role}).`);
      console.log("  Re-run with --promote to grant it admin rights.");
    }
  } else {
    const passwordHash = await bcrypt.hash(password, 12);
    await User.create({ name, email, passwordHash, role: "admin", status: "active" });
    console.log(`✔ Admin account created for ${email}.`);
  }

  await mongoose.disconnect();
  console.log("Done. Sign in at /login (admin tools live at /admin).");
}

main().catch(async (error) => {
  console.error("✖", error?.message || error);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
