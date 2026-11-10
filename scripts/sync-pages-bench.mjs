// Writes apps/docs/data/pages-bench.json from the devora.js repository's pages-suite results
// (benchmarks/results/engines-2026-11-09-node26/node26-pages.json). Usage: node scripts/sync-pages-bench.mjs <path to that file>
import fs from "node:fs";
import path from "node:path";

const file = process.argv[2];
if (!file) throw new Error("usage: node scripts/sync-pages-bench.mjs <node26-pages.json>");
const r = JSON.parse(fs.readFileSync(file, "utf-8"));
const med = (s) => (s && typeof s.median === "number" ? s.median : null);
const rows = Object.entries(r.frameworks).map(([key, f]) => ({
  key,
  name: key === "devora-pages-vite" ? "Devora.js with Vite" : key === "devora-pages-sekhem" ? "Devora.js with Sekhem" : f.name,
  version: f.version,
  staticRps: med(f.load?.static?.rps),
  pageRps: med(f.load?.items?.rps),
  formRps: med(f.load?.form?.rps),
  buildMs: med(f.build?.coldMs),
  warmBuildMs: med(f.build?.warmMs),
  startMs: med(f.startMs),
  idleMb: med(f.idleMemoryMb),
  afterLoadMb: typeof f.memoryAfterLoadMb === "number" ? f.memoryAfterLoadMb : null,
  jsGzipKb: f.browser?.["/items"]?.jsGzip ? Math.round(f.browser["/items"].jsGzip / 100) / 10 : null,
  hydrationMs: med(f.browser?.["/items"]?.hydrationMs),
}));
const out = {
  date: r.date,
  note: r.note ?? null,
  machine: { cpu: r.machine.cpu, cores: r.machine.cores, memoryGb: r.machine.memoryGb, os: r.machine.os, node: r.machine.node, tool: r.config?.tool ?? null, connections: r.config?.connections ?? null, runs: r.config?.runs ?? 5 },
  rows,
};
fs.writeFileSync(path.join(path.dirname(new URL(import.meta.url).pathname), "..", "apps/docs/data/pages-bench.json"), JSON.stringify(out, null, 2) + "\n");
console.log(`wrote ${rows.length} rows`);
