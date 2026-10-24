/**
 * Minimal resolver hook so `node --test` can import the app's modules.
 *
 * The app uses the `@/` alias (configured in jsconfig.json for Next.js) and
 * extensionless relative imports, neither of which Node resolves out of the box.
 * This hook maps `@/foo` → src/foo and appends `.js` when it is missing, so the
 * service modules under test behave exactly as they do inside Next.js.
 */
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import fs from "node:fs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(path.join(projectRoot, "package.json"));

function existsAsFile(candidate) {
  try {
    return fs.statSync(candidate).isFile();
  } catch {
    return false;
  }
}

export async function resolve(specifier, context, nextResolve) {
  let target = null;

  if (specifier.startsWith("@/")) {
    target = path.join(projectRoot, "src", specifier.slice(2));
  } else if (specifier.startsWith("./") || specifier.startsWith("../")) {
    if (context.parentURL?.startsWith("file:")) {
      target = path.resolve(path.dirname(fileURLToPath(context.parentURL)), specifier);
    }
  } else if (specifier.startsWith("/")) {
    target = specifier;
  }

  if (target) {
    const candidates = [target, `${target}.js`, `${target}.mjs`, path.join(target, "index.js")];
    for (const candidate of candidates) {
      if (existsAsFile(candidate)) {
        return { url: pathToFileURL(candidate).href, shortCircuit: true };
      }
    }
  }

  // Packages that ship CommonJS entry points without an explicit extension
  // (e.g. `next/server` inside next-auth) need Node's CommonJS resolver.
  if (!specifier.startsWith("node:") && !target) {
    try {
      const resolved = require.resolve(specifier);
      return { url: pathToFileURL(resolved).href, shortCircuit: true };
    } catch {
      // Not a resolvable bare specifier — fall through to Node's resolver.
    }
  }

  return nextResolve(specifier, context);
}
