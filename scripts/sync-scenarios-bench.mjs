// Writes apps/docs/data/scenarios-bench.json from the devora.js repository's scenario results
// (benchmarks/results/engines-2026-11-09-node26/node26-scenarios-*.json).
// Usage: node scripts/sync-scenarios-bench.mjs <devora results.json> <others results.json>
import fs from "node:fs";
import path from "node:path";

const [devoraFile, othersFile] = process.argv.slice(2);
if (!devoraFile || !othersFile) throw new Error("usage: node scripts/sync-scenarios-bench.mjs <devora.json> <others.json>");
const a = JSON.parse(fs.readFileSync(devoraFile, "utf-8"));
const b = JSON.parse(fs.readFileSync(othersFile, "utf-8"));
const order = ["devora-pages-vite", "devora-pages-sekhem", "next", "astro", "sveltekit", "react-router"];
const all = { ...a.frameworks, ...b.frameworks };
const sum = (n) => n.reduce((x, y) => x + y, 0);
const rows = order.filter((k) => all[k]).map((key) => {
  const f = all[key];
  return {
    key,
    name: f.name,
    coldStartMs: f.cold.startToFirstPageByteMs.median,
    firstPageMs: f.cold.firstPageRequestMs.median,
    ttfbP50: f.ttfb.p50,
    ttfbP99: f.ttfb.p99,
    staticRps: f.conn1000.static.rps.median,
    staticErrors: Math.round(sum(f.conn1000.static.errors) / f.conn1000.static.errors.length),
    itemsRps: f.conn1000.items.rps.median,
    itemsErrors: Math.round(sum(f.conn1000.items.errors) / f.conn1000.items.errors.length),
    answersAfter: f.conn1000.answersAfter,
  };
});
const out = { date: a.date, machine: a.machine, ttfbRequests: a.config.ttfbRequests, connections: a.config.connections, rows };
fs.writeFileSync(path.join(path.dirname(new URL(import.meta.url).pathname), "..", "apps/docs/data/scenarios-bench.json"), JSON.stringify(out, null, 2) + "\n");
console.log(`wrote ${rows.length} rows`);
