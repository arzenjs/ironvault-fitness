#!/usr/bin/env node
/**
 * Secure initial-admin bootstrap.
 *
 *   npm run create-admin
 * Reads ADMIN_EMAIL, ADMIN_NAME, and ADMIN_PASSWORD from environment variables or prompts.
 */
import readline from "node:readline";
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

function ask(question, { hidden = false } = {}) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) {
      rl._writeToOutput = (text) => {
        if (text.includes(question)) rl.output.write(text);
      };
    }
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write("\n");
      resolve(answer.trim());
    });
  });
}

async function main() {
  if (!MONGODB_URI) fail("MONGODB_URI is not set. Check your .env.local file.");

  let emailInput = process.env.ADMIN_EMAIL || arg("email");
  if (!emailInput) {
    emailInput = await ask("Admin email: ");
  }
  const email = emailInput.toLowerCase().trim();

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    fail("Provide a valid email address.");
  }

  let nameInput = process.env.ADMIN_NAME || arg("name");
  if (!nameInput) {
    nameInput = await ask("Admin full name [IronVault Admin]: ");
  }
  const name = nameInput.trim() || "IronVault Admin";

  const promote = process.argv.includes("--promote");

  let password = process.env.ADMIN_PASSWORD || process.env.CREATE_ADMIN_PASSWORD;
  if (!password) {
    password = await ask("Password (hidden): ", { hidden: true });
    const repeatPassword = await ask("Repeat password: ", { hidden: true });
    if (password !== repeatPassword) fail("Passwords do not match.");
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