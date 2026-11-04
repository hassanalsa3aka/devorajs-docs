#!/usr/bin/env node
/**
 * Release day for Devora.js 0.4.0 on the documentation site. One argument, the publishing date:
 *
 *   node scripts/release-day.mjs 2026-11-20            apply everything
 *   node scripts/release-day.mjs 2026-11-20 --dry-run  say what would change, write nothing
 *   node scripts/release-day.mjs 2026-11-20 --no-build skip the og cards and the RSS feed (they need Chrome)
 *
 * Run it only after 0.4.0 is on npm. It changes:
 *   1. @devorajs/core and @devorajs/cli to ^0.4.0 (and vite to ^6.4.4) in apps/docs/package.json, package.json,
 *      README.md and Getting started;
 *   2. apps/docs/data/release.json (version, date, post);
 *   3. the two drafts in drafts/blog: moved to apps/docs/routes/blog, their metadata added to data/blog-posts.json
 *      with the date, the draft JSON files removed, the CHANGELOG anchor in the release post set to the dated heading;
 *   4. the og cards and the RSS feed (unless --no-build);
 *   5. Getting started: the Yarn 4 and pnpm 11+ notes ("new projects work; projects from 0.3.x need the file or
 *      keys") and the "what is covered" sentence (the 0.4.0 matrix);
 *   6. findings T3 and T4: Fixed in 0.4.0 (data/roadmap-findings.json), and the roadmap page's 0.4.0 block;
 *   7. the Security model page: the "Next release" section becomes "New in 0.4.0", and a note on the CSRF section;
 *   8. the Upgrading page: "Upgrading to 0.4.0" with the migrations (templates in scripts/release-day/).
 *
 * Every text edit names the text it expects. If the page changed and the text is gone, the script stops with the
 * file and the text instead of guessing. Running it twice is safe: an edit that is already in place is skipped.
 * It does not run npm, git or the build: the last lines it prints are what to run next.
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const date = args.find((a) => !a.startsWith("--"));
const DRY = args.includes("--dry-run");
const NO_BUILD = args.includes("--no-build");

if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00Z`)) || new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) !== date) {
  console.error("usage: node scripts/release-day.mjs <YYYY-MM-DD> [--dry-run] [--no-build]   (a real date, the day 0.4.0 is published)");
  process.exit(2);
}
const VERSION = "0.4.0";
const ANCHOR = `040--${date}`; // CHANGELOG.md heading "## 0.4.0 — <date>", as GitHub turns it into an anchor
const POSTS = ["devora-0-4-0", "security-review-nextjs-advisories"];

const rel = (p) => path.relative(root, p);
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const changed = [];
function write(p, text) {
  if (read(p) === text) return;
  changed.push(p);
  if (!DRY) fs.writeFileSync(path.join(root, p), text);
}
/** Replaces `from` with `to` (once, or everywhere with `all`); skips an edit already in place; throws when neither is there. */
function edit(file, pairs) {
  let s = read(file);
  for (const { from, to, all } of pairs) {
    // `to` first: some edits insert text that still contains `from`, and must not be inserted twice.
    if (s.includes(to)) console.log(`  (already applied in ${file}: ${to.slice(0, 60).replace(/\n/g, " ")}...)`);
    else if (s.includes(from)) s = all ? s.split(from).join(to) : s.replace(from, () => to);
    else throw new Error(`${file}: expected text not found, the page changed since this script was written:\n${from.slice(0, 200)}`);
  }
  write(file, s);
}
const step = (n, text) => console.log(`\n${n}. ${text}`);

console.log(`Release day for Devora.js ${VERSION}, dated ${date}${DRY ? " (dry run: nothing is written)" : ""}`);

// 1. Package ranges.
step(1, "package ranges");
edit("apps/docs/package.json", [
  { from: '"@devorajs/core": "^0.3.5"', to: '"@devorajs/core": "^0.4.0"' },
  { from: '"@devorajs/cli": "^0.3.5"', to: '"@devorajs/cli": "^0.4.0"' },
  { from: '"vite": "^5.4.0"', to: '"vite": "^6.4.4"' },
]);
edit("package.json", [
  { from: '"@devorajs/core": "^0.3.5"', to: '"@devorajs/core": "^0.4.0"' },
  { from: '"@devorajs/cli": "^0.3.5"', to: '"@devorajs/cli": "^0.4.0"' },
]);
edit("README.md", [
  { from: "`@devorajs/cli` `^0.3.5`", to: "`@devorajs/cli` `^0.4.0`" },
  { from: "The docs describe the framework as of 0.3.5", to: `The docs describe the framework as of ${VERSION}` },
]);
edit("apps/docs/routes/getting-started.tsx", [
  { from: "<code>@devorajs/cli</code> <code>^0.3.5</code> and start on React 18.", to: "<code>@devorajs/cli</code> <code>^0.4.0</code> and start on React 18." },
]);

// 2. release.json
step(2, "apps/docs/data/release.json");
write("apps/docs/data/release.json", `{ "version": "${VERSION}", "date": "${date}", "post": "/blog/devora-0-4-0" }\n`);

// 3. The two drafts become posts.
step(3, "the two drafts become posts");
const blogFile = "apps/docs/data/blog-posts.json";
const blog = JSON.parse(read(blogFile));
for (const slug of POSTS) {
  const draftTsx = `drafts/blog/${slug}.tsx`, draftJson = `drafts/blog/${slug}.json`, postTsx = `apps/docs/routes/blog/${slug}.tsx`;
  if (!fs.existsSync(path.join(root, draftTsx))) {
    if (fs.existsSync(path.join(root, postTsx))) { console.log(`  (${slug}: already moved)`); continue; }
    throw new Error(`neither ${draftTsx} nor ${postTsx} exists`);
  }
  let post = read(draftTsx);
  if (slug === "devora-0-4-0") {
    const anchorLine = /\/\/ RELEASE-DAY:[^\n]*\n(\/\/[^\n]*\n)+/;
    if (!anchorLine.test(post)) throw new Error(`${draftTsx}: the RELEASE-DAY comment about the CHANGELOG anchor is gone`);
    post = post.replace(anchorLine, "");
    if (!post.includes("#040--DATE-TO-FILL")) throw new Error(`${draftTsx}: the CHANGELOG anchor placeholder is gone`);
    post = post.replace("#040--DATE-TO-FILL", `#${ANCHOR}`);
  }
  if (/DATE-TO-FILL/.test(post)) throw new Error(`${draftTsx}: a DATE-TO-FILL placeholder is left`);
  const meta = JSON.parse(read(draftJson));
  blog.posts = blog.posts.filter((p) => p.slug !== slug);
  blog.posts.push({ slug, title: meta.title, ...(meta.seoTitle ? { seoTitle: meta.seoTitle } : {}), date, description: meta.description, tags: meta.tags });
  changed.push(postTsx, `${draftTsx} (removed)`, `${draftJson} (removed)`);
  if (!DRY) {
    fs.writeFileSync(path.join(root, postTsx), post);
    fs.rmSync(path.join(root, draftTsx));
    fs.rmSync(path.join(root, draftJson));
  }
  console.log(`  ${slug}: moved, dated ${date}`);
}
write(blogFile, JSON.stringify(blog, null, 2) + "\n");

// 4. og cards, then the RSS feed, robots.txt and sitemap.xml (need the posts in blog-posts.json first)
step(4, "og cards and the RSS feed");
if (NO_BUILD || DRY) console.log("  skipped (--no-build or --dry-run)");
else {
  execFileSync("bash", ["scripts/og-cards.sh", "--blog-only"], { cwd: root, stdio: "inherit" });
  execFileSync("node", ["scripts/build-seo-files.mjs"], { cwd: root, stdio: "inherit" });
}

// 5. Getting started: package manager notes and coverage
step(5, "Getting started: Yarn 4 and pnpm 11+ notes, coverage sentence");
edit("apps/docs/routes/getting-started.tsx", [
  {
    from: `          <strong>Yarn 4</strong> installs with Plug'n'Play by default, and the CLI does not run under it: it stops
          with <code>@devorajs/cli tried to access esbuild</code>. Before installing, put{" "}
          <code>nodeLinker: node-modules</code> in a <code>.yarnrc.yml</code> at the project root; then everything
          below works. Yarn 4 also prints peer-dependency warnings (<code>YN0002</code>) about <code>react</code>.`,
    to: `          <strong>Yarn 4</strong> prints peer-dependency warnings (<code>YN0002</code>) about <code>react</code>. A new
          project works with Yarn 4's default settings, because <code>create-devora</code> writes a{" "}
          <code>.yarnrc.yml</code> with <code>nodeLinker: node-modules</code> when you pick Yarn (Plug'n'Play, Yarn 4's
          default, does not run the CLI: <code>@devorajs/cli tried to access esbuild</code>). A project made by{" "}
          <code>create-devora</code> 0.3.x needs that one-line file added before installing.`,
  },
  {
    from: `          <strong>pnpm 11 and later</strong> (12.10 was tried) cannot install a fresh project: it ignores the{" "}
          <code>link-workspace-packages</code> setting in <code>.npmrc</code> and looks for the project's own{" "}
          <code>@devorajs/backend</code> on npm (<code>ERR_PNPM_FETCH_404</code>), and then fails on esbuild's
          ignored build script (<code>ERR_PNPM_IGNORED_BUILDS</code>). Use pnpm 9 or 10, or replace the contents of{" "}
          <code>pnpm-workspace.yaml</code> with the block below and install again. This is a known gap in the
          scaffold; it is tracked on the <a href="/roadmap">roadmap</a>.`,
    to: `          <strong>pnpm 11 and later</strong> (12.10 was tried) work with a new project, because its{" "}
          <code>pnpm-workspace.yaml</code> carries the two settings below. A project made by{" "}
          <code>create-devora</code> 0.3.x cannot install on pnpm 11 or later: pnpm ignores the{" "}
          <code>link-workspace-packages</code> setting in <code>.npmrc</code>, looks for the project's own{" "}
          <code>@devorajs/backend</code> on npm (<code>ERR_PNPM_FETCH_404</code>) and then fails on esbuild's ignored
          build script (<code>ERR_PNPM_IGNORED_BUILDS</code>). Use pnpm 9 or 10 with it, or replace the contents of{" "}
          <code>pnpm-workspace.yaml</code> with the block below and install again.`,
  },
  { from: "{`# pnpm-workspace.yaml, for pnpm 11 and later", to: "{`# pnpm-workspace.yaml of a new project; add the last two keys to a 0.3.x project for pnpm 11 and later" },
  {
    from: `        <strong>What is covered.</strong> On every push, CI installs the repository's own workspace with npm 10, Yarn 1
        and pnpm 9.9; the tests and every app build run under pnpm only. The commands in the table were run by hand
        on Node 20 against a new project: npm 10.8 and 11.17, Yarn 1.22 and 4.18 (through corepack), and pnpm 9.15,
        10.34 and 12.10. Bun and Deno were not tested, so they are not listed as supported.`,
    to: `        <strong>What is covered.</strong> On every push, CI installs the repository's own workspace with npm 10, Yarn 1
        and pnpm 9.9; the tests and every app build run under pnpm only. A new project from the 0.4.0{" "}
        <code>create-devora</code> was installed, run in dev, built, served, given a package and a script and the
        one-off command, by hand, on Node 20 and Node 22 with npm 10 and 11, Yarn 1.22 and 4.18 (through corepack,
        default settings) and pnpm 9.15, 10.34 and 12.10: all passed. Bun and Deno were not tested, so they are not
        listed as supported.`,
  },
  { from: "      <p>Only what was seen when these commands were run (see the last paragraph of this section):</p>", to: "      <p>Only what was seen when these commands were run (see the last paragraph of this section). The Yarn 4 and pnpm 11 notes are about the 0.4.0 scaffold and the 0.3.x one:</p>" },
]);

// 6. Findings T3/T4 and the roadmap page
step(6, "findings T3 and T4, and the roadmap page");
const findingsFile = "apps/docs/data/roadmap-findings.json";
const findings = JSON.parse(read(findingsFile));
const fix = {
  T3: { finding: "A fresh project did not install with pnpm 11 or later (tried 12.10)", evidence: "pnpm 11 and later ignore link-workspace-packages in .npmrc (ERR_PNPM_FETCH_404 for @devorajs/backend, then ERR_PNPM_IGNORED_BUILDS). The 0.4.0 scaffold writes linkWorkspacePackages: true and allowBuilds: esbuild: true into pnpm-workspace.yaml; a new project passed create, install, dev, build, start, add, a package script and the one-off command on pnpm 9.15, 10.34 and 12.10, Node 20 and 22. Projects made by create-devora 0.3.x still need the two keys added by hand (Getting started)." },
  T4: { finding: "A fresh project did not run under Yarn 4's default Plug'n'Play linker", evidence: "Install succeeded, then devora dev and build stopped with \"@devorajs/cli tried to access esbuild\". The 0.4.0 scaffold writes .yarnrc.yml with nodeLinker: node-modules when the package manager is Yarn; a new project passed the same steps on Yarn 4.18 (default settings) and Yarn 1.22, Node 20 and 22. Projects made by 0.3.x need the file added by hand (Getting started)." },
};
for (const id of ["T3", "T4"]) {
  const row = findings.find((f) => f.id === id);
  if (!row) throw new Error(`${findingsFile}: finding ${id} not found`);
  Object.assign(row, { status: "Fixed", version: VERSION, ...fix[id] });
}
write(findingsFile, JSON.stringify(findings, null, 1) + "\n");
edit("apps/docs/routes/roadmap.tsx", [
  {
    from: "const RELEASES: Release[] = [\n",
    to: `const RELEASES: Release[] = [
  {
    version: "${VERSION}",
    date: "${date}",
    tag: "v${VERSION}",
    points: [
      "A security hardening release: CSRF is checked by default for cookie-authenticated writes, redirect() stays on the app's origin, responses that touch the session cookie are private, no-store, and the CLI requires vite 6.4.4 or later. Each breaking change has a migration step.",
      "New settings: allowedHosts, server timeouts and a header size limit, form field and file limits, an opt-in per-route rateLimit; nosniff everywhere, a sandbox policy for .svg files, symlink-safe static files, and a dev server that restarts on config, env and route-file changes.",
      "New projects install and run on pnpm 11 and later and on Yarn 4's default settings. There has been no third-party audit.",
      "Packages: @devorajs/core 0.4.0, @devorajs/cli 0.4.0, @devorajs/adapter-node 0.3.0, @devorajs/adapter-vercel 0.3.0, @devorajs/adapter-netlify 0.3.0, create-devora 0.4.0.", // version-ok
    ],
    anchor: "${ANCHOR}",
    post: "/blog/devora-0-4-0",
  },
`,
  },
]);
edit("apps/docs/routes/roadmap.tsx", [
  { from: "<code>v0.3.4</code> and <code>v0.3.5</code> are the only tags", to: "<code>v0.3.4</code>, <code>v0.3.5</code> and <code>v0.4.0</code> are the only tags" },
  {
    from: "            <li>0.3.5: faster request handling, one clear message for a missing session store, guides for live updates (WebSockets) and background jobs</li>\n",
    to: "            <li>0.3.5: faster request handling, one clear message for a missing session store, guides for live updates (WebSockets) and background jobs</li>\n            <li>0.4.0: CSRF checked by default for cookie-authenticated writes, redirect() on the app's origin, no-store session responses, allowedHosts, server and form limits, a dev server that restarts itself, new projects that install on pnpm 11+ and Yarn 4</li>\n",
  },
]);

// 7. Security model page
step(7, "Security model page");
edit("apps/docs/routes/security.tsx", [
  { from: '<h2 id="next-release">Next release</h2>', to: '<h2 id="new-in-0-4-0">New in 0.4.0</h2>' },
  {
    from: `      <Callout kind="info" title="Not published yet">
        <p>
          This section describes the release after {RELEASE_VERSION}. It is merged into the framework
          repository, no version number has been chosen, and it is not on npm: {RELEASE_VERSION} does
          not behave this way. The rest of this page describes {RELEASE_VERSION}.
        </p>
      </Callout>`,
    to: `      <Callout kind="info" title="Changed in 0.4.0">
        <p>
          This section is new in 0.4.0; 0.3.5 and earlier do not behave this way. The sections below it
          were written for 0.3.x: where they differ (CSRF is an explicit per-route call in 0.3.5; since 0.4.0
          cookie-authenticated writes are also checked by default), this section wins. What to change in an
          existing app is on <a href="/upgrading">Upgrading to 0.4.0</a>.
        </p>
      </Callout>`,
  },
  { from: "checked unless the route or the defaults below say so. In the next release one default", to: "checked unless the route or the defaults below say so. In 0.4.0 one default" },
  { from: '<h2 id="csrf">CSRF</h2>\n', to: `<h2 id="csrf">CSRF</h2>
      <Callout kind="warning" title="Changed in 0.4.0">
        <p>
          The next paragraphs describe 0.3.x, where a route checks CSRF only if it calls{" "}
          <code>ctx{"."}verifyCsrf()</code>. Since 0.4.0 a cookie-authenticated <code>POST</code>,{" "}
          <code>PUT</code>, <code>PATCH</code> or <code>DELETE</code> is also checked before the route runs: see{" "}
          <a href="#new-in-0-4-0">New in 0.4.0</a>. Anonymous writes (a login form) still need the explicit call.
        </p>
      </Callout>
` },
]);
// the sentence about "once it is published" in the same section
edit("apps/docs/routes/security.tsx", [
  { from: "once it is published. None of this has been checked on a live Vercel or Netlify deployment", to: ". None of this has been checked on a live Vercel or Netlify deployment" },
]);

// 8. Upgrading page
step(8, "Upgrading to 0.4.0");
const up = "apps/docs/routes/upgrading.tsx";
let page = read(up);
if (page.includes("CHANGES_040")) console.log("  (already applied)");
else {
  const intro = fs.readFileSync(path.join(root, "scripts/release-day/upgrading-040.intro.tsx"), "utf8");
  const changes = fs.readFileSync(path.join(root, "scripts/release-day/upgrading-040.changes.tsx"), "utf8");
  const h1 = page.indexOf("      <h1>Upgrading to 0.3.5</h1>");
  const next = page.indexOf('      <h2 id="changes-035">');
  const marker = "// From the 0.3.5 section of devora.js/CHANGELOG.md";
  if (h1 === -1 || next === -1 || next < h1 || !page.includes(marker)) throw new Error(`${up}: the structure changed (h1, "changes-035" heading or the 0.3.5 data comment is gone)`);
  page = page.slice(0, h1) + intro + page.slice(next);
  page = page.replace(marker, () => changes + marker);
  page = page.replace('title: "Upgrading to 0.3.5",', 'title: "Upgrading to 0.4.0",');
  page = page.replace(/description:\n\s+"Every behavior change from Devora\.js 0\.3\.4 to 0\.3\.5[^"]*",/, `description:\n      "Every breaking change from Devora.js 0.3.5 to 0.4.0 and what an app has to do about it, the earlier behavior changes back to 0.3.1, and the steps.",`);
  if (!page.includes('title: "Upgrading to 0.4.0"')) throw new Error(`${up}: the page title was not found`);
  write(up, page);
}

console.log(`\n${DRY ? "Would change" : "Changed"} ${new Set(changed).size} file(s):\n  ${[...new Set(changed)].join("\n  ") || "(nothing)"}`);
console.log(`
Next, by hand:
  npm install                       # installs @devorajs/core and cli ${VERSION} from npm and updates package-lock.json
  node scripts/check-guide-names.mjs && node scripts/check-versions.mjs
  npm run build                     # prebuild checks, devora build, Pagefind
  read /upgrading, /security, /getting-started#package-managers and /blog/devora-0-4-0 once in a browser
  git add -A && git commit -m "site: release ${VERSION}"`);
