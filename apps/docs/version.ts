import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";

/**
 * The installed @devorajs/core version, read from its package.json at
 * render time (pages are ssg, so at build time) — the site never hard-codes
 * the version it documents. null if it can't be resolved.
 */
export function getCoreVersion(): string | null {
  try {
    const require = createRequire(import.meta.url);
    let dir = dirname(require.resolve("@devorajs/core"));
    for (let i = 0; i < 5; i++) {
      try {
        const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf-8"));
        if (pkg.name === "@devorajs/core") return pkg.version;
      } catch {
        // keep walking up
      }
      dir = dirname(dir);
    }
  } catch {
    // package not resolvable; fall through
  }
  return null;
}
