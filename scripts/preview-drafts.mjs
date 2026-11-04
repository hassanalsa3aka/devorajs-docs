#!/usr/bin/env node
/**
 * Lays the blog drafts over a copy of the site so they can be previewed. Nothing is published by this.
 *
 * Drafts are not tracked by git. They live in $DEVORA_DRAFTS_DIR, or drafts/blog/ in this repo if you put them there
 * (the backup is ~/Developer/_lab/drafts-backup/blog): <slug>.tsx (a post route, same shape as apps/docs/routes/blog/*.tsx) and
 * <slug>.json (its metadata: title, description, tags). A draft has no date: a post is dated with the day it is
 * actually published (scripts/release-day.mjs does that).
 *
 * Usage: node scripts/preview-drafts.mjs <target-dir>
 *   <target-dir> is a checkout (a git worktree) of this repo with node_modules linked. The script copies each
 *   draft into <target-dir>/apps/docs/routes/blog/, adds its metadata (with draft: true) to the target's
 *   data/blog-posts.json, and renders the draft's OG card there. Then build and start the target as usual.
 */
import { copyFileSync, existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const target = path.resolve(process.argv[2] ?? "");
if (!process.argv[2] || !existsSync(path.join(target, "apps/docs/data/blog-posts.json"))) {
  console.error("Usage: node scripts/preview-drafts.mjs <target-dir>   (a checkout of this repo)");
  process.exit(1);
}
const dir = path.resolve(process.env.DEVORA_DRAFTS_DIR ?? path.join(root, "drafts/blog"));
if (!existsSync(dir)) {
  console.error(`No drafts in ${dir}. They are not tracked: set DEVORA_DRAFTS_DIR (for example $HOME/Developer/_lab/drafts-backup/blog).`);
  process.exit(1);
}
const jsonFile = path.join(target, "apps/docs/data/blog-posts.json");
const blog = JSON.parse(readFileSync(jsonFile, "utf-8"));
const slugs = readdirSync(dir).filter((f) => f.endsWith(".tsx")).map((f) => f.slice(0, -4));
for (const slug of slugs) {
  const meta = JSON.parse(readFileSync(path.join(dir, `${slug}.json`), "utf-8"));
  copyFileSync(path.join(dir, `${slug}.tsx`), path.join(target, "apps/docs/routes/blog", `${slug}.tsx`));
  blog.posts = blog.posts.filter((p) => p.slug !== slug);
  blog.posts.push({ slug, ...meta, draft: true });
}
writeFileSync(jsonFile, JSON.stringify(blog, null, 2) + "\n");
execFileSync("bash", ["scripts/og-cards.sh", "--blog-only"], { cwd: target, stdio: "inherit", env: process.env });
console.log(`${slugs.length} draft(s) laid over ${target}: ${slugs.join(", ")}`);
