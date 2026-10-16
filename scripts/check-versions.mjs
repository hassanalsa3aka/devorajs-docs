#!/usr/bin/env node
/**
 * Fails the build when a page names an old version as if it were current, or uses wording about an
 * unfinished release ("unreleased", "not yet released"). The current release is apps/docs/data/release.json.
 *
 * An old version string (0.1.x to 0.3.<current - 1>) is fine on a line that reads as history (before, since,
 * from, up to, through, until, earlier, was, were, tested, measured, published, an arrow...) or that carries
 * "version-ok". The by-version pages (roadmap, upgrading, blog posts, the findings data) are about old versions,
 * so only the wording rule applies to them.
 *
 * Usage: node scripts/check-versions.mjs
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const current = JSON.parse(readFileSync(path.join(root, "apps/docs/data/release.json"), "utf-8")).version;
const [major, minor, patch] = current.split(".").map(Number);

// One source: apps/docs/data/release.json. The installed @devorajs/core and @devorajs/cli, the ranges in
// package.json, the page text and the footer/sidebar all have to agree with it.
const mismatches = [];
for (const pkg of ["core", "cli"]) {
  try {
    const installed = JSON.parse(readFileSync(path.join(root, "node_modules/@devorajs", pkg, "package.json"), "utf-8")).version;
    if (installed !== current) mismatches.push(`installed @devorajs/${pkg} is ${installed}, release.json says ${current}`);
  } catch { mismatches.push(`@devorajs/${pkg} is not installed`); }
}
const docsPkg = JSON.parse(readFileSync(path.join(root, "apps/docs/package.json"), "utf-8"));
for (const pkg of ["@devorajs/core", "@devorajs/cli"]) {
  if (docsPkg.dependencies?.[pkg] !== `^${current}`) mismatches.push(`apps/docs/package.json ${pkg} is "${docsPkg.dependencies?.[pkg]}", expected "^${current}"`);
}
for (const [file, needle] of [["apps/docs/version.ts", "data/release.json"], ["apps/docs/site-footer.tsx", "RELEASE_VERSION"], ["apps/docs/docs-layout.tsx", "RELEASE_VERSION"], ["apps/docs/routes/index.tsx", "RELEASE_URL"]]) {
  if (!readFileSync(path.join(root, file), "utf-8").includes(needle)) mismatches.push(`${file} no longer reads the release from one place (missing ${needle})`);
}
if (mismatches.length) { console.error(mismatches.join("\n") + `\n\n${mismatches.length} version mismatch(es). Update apps/docs/data/release.json and reinstall, or fix the file.`); process.exit(1); }

const ROOTS = ["apps/docs", "README.md", "scripts"];
const SKIP_DIRS = new Set(["node_modules", "dist", ".vercel", ".git", "pagefind", "assets"]);
const SKIP_FILES = [/^apps\/docs\/data\/release\.json$/, /(^|\/)package(-lock)?\.json$/, /^apps\/docs\/site-theme\.ts$/, /^scripts\/check-versions\.mjs$/];
const BY_VERSION = [/^apps\/docs\/routes\/roadmap\.tsx$/, /^apps\/docs\/routes\/upgrading\.tsx$/, /^apps\/docs\/routes\/blog\//, /^apps\/docs\/data\//];
const TEXT = /\.(tsx?|mjs|md|sh|json)$/;
const OLD = /(?<![\d.])0\.(?:[1-2]\.\d+|3\.(\d+))(?!\d|\.\d)/g;
const HISTORY = /\b(before|since|from|up to|through|until|earlier|older|prior|was|were|had|used to|first|introduced|added|changed|fixed|replaced|published|tested|measured|ran|run on|captured|history|release notes|pinned|ranges?|tag|and earlier|or later|went)\b|→|CHANGELOG|version-ok|version: "/i;

function* walk(rel) {
  const abs = path.join(root, rel);
  if (statSync(abs).isFile()) { yield rel; return; }
  for (const name of readdirSync(abs)) {
    if (SKIP_DIRS.has(name)) continue;
    yield* walk(path.join(rel, name));
  }
}

const problems = [];
let scanned = 0;
for (const top of ROOTS) for (const file of walk(top)) {
  if (!TEXT.test(file) || SKIP_FILES.some((re) => re.test(file))) continue;
  scanned++;
  const byVersion = BY_VERSION.some((re) => re.test(file));
  readFileSync(path.join(root, file), "utf-8").split("\n").forEach((line, i) => {
    if (/version-ok/.test(line)) return;
    if (/unreleased|not yet released/i.test(line)) problems.push(`${file}:${i + 1}: unfinished-release wording: ${line.trim().slice(0, 110)}`);
    if (byVersion || HISTORY.test(line)) return;
    for (const m of line.matchAll(OLD)) {
      const old = m[1] === undefined ? true : major === 0 && minor === 3 && Number(m[1]) < patch;
      if (old) problems.push(`${file}:${i + 1}: old version ${m[0]} (current is ${current}): ${line.trim().slice(0, 110)}`);
    }
  });
}
if (problems.length) { console.error(problems.join("\n") + `\n\n${problems.length} problem(s). Update the line, or add "version-ok" if it is deliberately that version.`); process.exit(1); }
console.log(`versions: no stale version strings or unfinished-release wording (current ${current}, ${scanned} files scanned)`);
