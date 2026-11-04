#!/usr/bin/env node
/**
 * Audits the built docs site (apps/docs/dist/static, written by `devora build`) for what search engines
 * and link previews read, and the generated files in assets/. Fails on:
 *   - a <title> over 60 characters, missing, or shared by two pages
 *   - a meta description missing, over 160 characters, or shared by two pages
 *   - not exactly one <h1>
 *   - a canonical link that is missing or is not <site url> + the page's path
 *   - Open Graph tags (title, description, type, url, image) or twitter:card missing, og:url or og:image
 *     off the site address
 *   - JSON-LD that does not parse, lacks @context/@type, has a BreadcrumbList with broken positions, or
 *     names a URL off the site address
 *   - a page missing from assets/sitemap.xml or without lastmod, a sitemap entry with no page,
 *     robots.txt not pointing at <site url>/sitemap.xml, an rss.xml link off the site address
 * The site address is apps/docs/data/site.json, the same value everything else reads.
 * Run `devora build` first (it builds apps/docs/dist). Usage: node scripts/check-seo.mjs
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const SITE = JSON.parse(readFileSync(path.join(root, "apps/docs/data/site.json"), "utf-8")).url.replace(/\/+$/, "");
const staticDir = path.join(root, "apps/docs/dist/static");
if (!existsSync(staticDir)) {
  console.error("apps/docs/dist/static is missing: run `devora build` first");
  process.exit(2);
}

const decode = (s) => s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'");
const attr = (tag, name) => decode(tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1] ?? "");

const pages = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) walk(full);
    else if (name === "index.html") pages.push(full);
  }
})(staticDir);

const failures = [];
const fail = (route, msg) => failures.push(`${route}: ${msg}`);
const titles = new Map();
const descriptions = new Map();
const routes = [];

for (const file of pages.sort()) {
  const dirRel = path.relative(staticDir, path.dirname(file));
  const route = dirRel === "" ? "/" : `/${dirRel}`;
  routes.push(route);
  const html = readFileSync(file, "utf-8");
  const head = html.slice(0, html.indexOf("</head>"));
  const metas = [...head.matchAll(/<meta\b[^>]*>/g)].map((m) => m[0]);
  const meta = (key) => {
    const tag = metas.find((t) => attr(t, "name") === key || attr(t, "property") === key);
    return tag ? attr(tag, "content") : undefined;
  };

  const title = decode(head.match(/<title>([^<]*)<\/title>/)?.[1] ?? "");
  if (!title) fail(route, "no <title>");
  else {
    if (title.length > 60) fail(route, `title is ${title.length} characters (max 60): "${title}"`);
    if (titles.has(title)) fail(route, `title shared with ${titles.get(title)}: "${title}"`);
    titles.set(title, route);
  }

  const description = meta("description");
  if (!description) fail(route, "no meta description");
  else {
    if (description.length > 160) fail(route, `description is ${description.length} characters (max 160)`);
    if (descriptions.has(description)) fail(route, `description shared with ${descriptions.get(description)}`);
    descriptions.set(description, route);
  }

  const h1s = (html.match(/<h1[\s>]/g) ?? []).length;
  if (h1s !== 1) fail(route, `${h1s} <h1> elements (want 1)`);

  const expected = route === "/" ? `${SITE}/` : `${SITE}${route}`;
  const canonicals = [...head.matchAll(/<link\b[^>]*>/g)].map((m) => m[0]).filter((t) => attr(t, "rel") === "canonical");
  if (canonicals.length !== 1) fail(route, `${canonicals.length} canonical links (want 1)`);
  else if (attr(canonicals[0], "href") !== expected) fail(route, `canonical is ${attr(canonicals[0], "href")}, want ${expected}`);

  for (const key of ["og:title", "og:description", "og:type", "og:url", "og:image"]) {
    if (!meta(key)) fail(route, `no ${key}`);
  }
  if (meta("og:url") && meta("og:url") !== expected) fail(route, `og:url is ${meta("og:url")}, want ${expected}`);
  if (meta("og:image") && !meta("og:image").startsWith(`${SITE}/`)) fail(route, `og:image is not on ${SITE}: ${meta("og:image")}`);
  if (!meta("twitter:card")) fail(route, "no twitter:card");
  if (!/<html[^>]*\blang="[a-z]/.test(html.slice(0, 400))) fail(route, "no <html lang>");

  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  for (const raw of blocks) {
    let data;
    try { data = JSON.parse(raw); } catch (e) { fail(route, `JSON-LD does not parse: ${e.message}`); continue; }
    for (const node of Array.isArray(data) ? data : [data]) {
      if (node["@context"] !== "https://schema.org") fail(route, `JSON-LD ${node["@type"] ?? "?"}: @context is not https://schema.org`);
      if (!node["@type"]) fail(route, "JSON-LD node without @type");
      if (node["@type"] === "BreadcrumbList") {
        const items = node.itemListElement ?? [];
        if (items.length === 0) fail(route, "BreadcrumbList is empty");
        items.forEach((it, i) => {
          if (it.position !== i + 1) fail(route, `BreadcrumbList position ${it.position} at index ${i}`);
          if (!it.name) fail(route, `BreadcrumbList item ${i + 1} has no name`);
          if (!it.item) fail(route, `BreadcrumbList item ${i + 1} has no item URL`);
        });
      }
      if ((node["@type"] === "TechArticle" || node["@type"] === "BlogPosting") && !node.headline) fail(route, `${node["@type"]} without headline`);
      // Addresses that belong to this site (not an author's or a project's external profile).
      const own = [node.url, node.image, typeof node.mainEntityOfPage === "string" ? node.mainEntityOfPage : node.mainEntityOfPage?.["@id"]];
      if (node["@type"] === "BreadcrumbList") own.push(...(node.itemListElement ?? []).map((it) => it.item));
      for (const url of own.flat().filter((u) => typeof u === "string" && /^https?:/.test(u))) {
        if (!url.startsWith(`${SITE}/`) && url !== SITE) fail(route, `JSON-LD ${node["@type"]} URL is not on ${SITE}: ${url}`);
      }
    }
  }
}

// ---- generated files ---------------------------------------------------------
const read = (f) => (existsSync(path.join(root, f)) ? readFileSync(path.join(root, f), "utf-8") : "");
const sitemap = read("assets/sitemap.xml");
const entries = new Map([...sitemap.matchAll(/<url>\s*<loc>([^<]+)<\/loc>(?:\s*<lastmod>([^<]*)<\/lastmod>)?/g)].map((m) => [m[1], m[2]]));
if (entries.size === 0) fail("assets/sitemap.xml", "missing or empty (run scripts/build-seo-files.mjs)");
for (const route of routes) {
  const loc = route === "/" ? `${SITE}/` : `${SITE}${route}`;
  if (!entries.has(loc)) fail("assets/sitemap.xml", `no entry for ${loc}`);
  else if (!/^\d{4}-\d{2}-\d{2}$/.test(entries.get(loc) ?? "")) fail("assets/sitemap.xml", `no valid lastmod for ${loc}`);
}
for (const loc of entries.keys()) {
  const route = loc === `${SITE}/` ? "/" : loc.startsWith(`${SITE}/`) ? loc.slice(SITE.length) : undefined;
  if (route === undefined) fail("assets/sitemap.xml", `entry off the site address: ${loc}`);
  else if (!routes.includes(route)) fail("assets/sitemap.xml", `entry with no built page: ${loc}`);
}
if (!read("assets/robots.txt").includes(`Sitemap: ${SITE}/sitemap.xml`)) fail("assets/robots.txt", `no "Sitemap: ${SITE}/sitemap.xml" line`);
const rss = read("assets/rss.xml");
for (const [, url] of rss.matchAll(/<(?:link|guid[^>]*)>(https?:[^<]+)</g)) {
  if (!url.startsWith(`${SITE}/`) && url !== SITE) fail("assets/rss.xml", `URL off the site address: ${url}`);
}
for (const [, url] of rss.matchAll(/<atom:link href="([^"]+)"/g)) {
  if (url !== `${SITE}/rss.xml`) fail("assets/rss.xml", `atom:link is ${url}`);
}

if (failures.length) {
  console.error(failures.map((f) => `FAIL ${f}`).join("\n"));
  console.error(`\nseo: ${failures.length} problem(s) in ${routes.length} pages`);
  process.exit(1);
}
console.log(`seo: ${routes.length} pages, ${entries.size} sitemap entries, all checks pass (site ${SITE})`);
