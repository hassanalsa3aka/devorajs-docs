#!/usr/bin/env node
/**
 * Writes assets/rss.xml from apps/docs/data/blog-posts.json. A static file
 * in the public folder, not an API route: Devora.js API routes always
 * answer JSON. Runs before every build (package.json "prebuild" and
 * scripts/build-docs.sh), so the feed can't drift from the blog index.
 */
import { readFileSync, writeFileSync } from "node:fs";

const SITE = "https://devorajs-docs-docs.vercel.app";
const { author, posts } = JSON.parse(readFileSync(new URL("../apps/docs/data/blog-posts.json", import.meta.url), "utf-8"));

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const rfc822 = (iso) => new Date(`${iso}T00:00:00Z`).toUTCString();
const sorted = posts.filter((p) => p.date && !p.draft).sort((a, b) => b.date.localeCompare(a.date));

const items = sorted
  .map(
    (p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${SITE}/blog/${p.slug}</link>
      <guid isPermaLink="true">${SITE}/blog/${p.slug}</guid>
      <pubDate>${rfc822(p.date)}</pubDate>
      <dc:creator>${esc(author.name)}</dc:creator>
      ${(p.tags ?? []).map((t) => `<category>${esc(t)}</category>`).join("\n      ")}
      <description>${esc(p.description)}</description>
    </item>`
  )
  .join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Devora.js blog</title>
    <link>${SITE}/blog</link>
    <description>Release notes and design write-ups from the Devora.js project.</description>
    <language>en</language>
    <lastBuildDate>${rfc822(sorted[0].date)}</lastBuildDate>
    <atom:link href="${SITE}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
writeFileSync(new URL("../assets/rss.xml", import.meta.url), xml);
console.log(`assets/rss.xml: ${sorted.length} posts`);
