#!/usr/bin/env node
/**
 * Fails the build when a docs page's sidebar label, page title (pageMeta title) and <h1> differ.
 * The sidebar is DOCS_GROUPS in apps/docs/docs-layout.tsx; each item's href maps to
 * apps/docs/routes/<href>.tsx. One name per page, everywhere it is shown.
 * Usage: node scripts/check-guide-names.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const layout = readFileSync(path.join(root, "apps/docs/docs-layout.tsx"), "utf-8");
const items = [...layout.matchAll(/\{\s*id:\s*"([^"]+)",\s*label:\s*"([^"]+)",\s*href:\s*"([^"]+)"\s*\}/g)].map((m) => ({ id: m[1], label: m[2], href: m[3] }));
if (items.length === 0) throw new Error("no sidebar items found in docs-layout.tsx; the check needs updating");

let failed = 0;
for (const item of items) {
  const file = path.join(root, "apps/docs/routes", `${item.href.slice(1)}.tsx`);
  if (!existsSync(file)) { console.error(`FAIL ${item.href}: no route file ${path.relative(root, file)}`); failed++; continue; }
  const src = readFileSync(file, "utf-8");
  const title = src.match(/pageMeta\(\s*"[^"]*"\s*,\s*\{[^}]*?\btitle:\s*"([^"]*)"/s)?.[1];
  const h1 = src.match(/<h1[^>]*>([^<{]*)<\/h1>/)?.[1]?.trim();
  const problems = [];
  if (title === undefined) problems.push("no pageMeta title found");
  else if (title !== item.label) problems.push(`title "${title}"`);
  if (h1 === undefined) problems.push("no plain-text <h1> found");
  else if (h1 !== item.label) problems.push(`<h1> "${h1}"`);
  if (problems.length) { console.error(`FAIL ${item.href}: sidebar label "${item.label}" but ${problems.join(", ")}`); failed++; }
}
if (failed) { console.error(`\n${failed} page(s) with differing names (${items.length} checked).`); process.exit(1); }
console.log(`guide names: ${items.length} sidebar pages checked, ${items.length} with label = title = <h1>`);
