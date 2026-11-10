#!/usr/bin/env node
// Writes apps/docs/data/engines-bench.json from the result files in the devora.js repository's benchmarks/results/<folder>/:
// request scenarios (backend-<machine>-node<v>*.json), build time and memory (build-<machine>-node<v>.json) and the dev server
// (devperf-mac-node<v>.json). No number on the Performance page's engine section is typed by hand.
//   node scripts/sync-engine-bench.mjs /path/to/devora.js/benchmarks/results/engines-2026-11-09 [--requests-node=22.23.4]
import fs from "node:fs";
import path from "node:path";

const dir = process.argv.find((a, i) => i >= 2 && !a.startsWith("--"));
if (!dir) throw new Error("give the results folder");
// --prefix=node26: the current run (files node26-<machine>-backend*.json, -build.json, -devperf.json); without it, the first run's naming (history)
const prefix = (process.argv.find((a) => a.startsWith("--prefix=")) ?? "").split("=")[1];
const outName = prefix ? "engines-bench.json" : "engines-bench-history.json";
const reqNode = (process.argv.find((a) => a.startsWith("--requests-node=")) ?? "--requests-node=22.23.4").split("=")[1];
const read = (f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
const has = (f) => fs.existsSync(path.join(dir, f));
const named = (machine, kind) => fs.readdirSync(dir).filter((n) => n.startsWith(`${prefix}-${machine}-${kind}`) && n.endsWith(".json")).sort();
const SCEN = ["items", "me", "postValid", "postInvalid", "slow"];
const stat = (s) => ({ median: s.median, min: s.min, max: s.max });

function requests(machine, files) {
  const fws = {};
  let meta;
  for (const f of files) {
    const j = read(f);
    meta ??= { ...j.machine, config: j.config, loadAvgAtStart: Object.values(j.frameworks)[0]?.loadAvgAtStart };
    Object.assign(fws, j.frameworks);
  }
  return {
    machine: meta,
    rows: Object.entries(fws).map(([key, f]) => ({
      key,
      name: f.name,
      scenarios: Object.fromEntries(SCEN.map((s) => [s, f.load?.[s] ? { rps: stat(f.load[s].rps), p99: f.load[s].p99.median } : null])),
      buildMs: f.build?.coldMs?.median ?? null,
      startMs: f.startMs?.median ?? null,
      idleMb: f.idleMemoryMb?.median || null, // 0 means the sampler found no process: not recorded
    })),
  };
}

function builds(machine) {
  const out = {};
  const files = prefix ? named(machine, "build") : fs.readdirSync(dir).filter((n) => n.startsWith(`build-${machine}-node`) && n.endsWith(".json") && /node\d+\.\d+\.\d+\.json/.test(n));
  for (const f of files) {
    const j = read(f);
    out[j.info.node.replace(/^v/, "")] = {
      runs: j.info.runs,
      variants: Object.fromEntries(Object.entries(j.results).map(([k, r]) => [k, { ms: [...r.ms].sort((a, b) => a - b)[Math.floor(r.ms.length / 2)], min: Math.min(...r.ms), max: Math.max(...r.ms), rssMb: [...r.rssMb].sort((a, b) => a - b)[Math.floor(r.rssMb.length / 2)], outputKb: Math.round(r.bytes / 1024) }])),
    };
  }
  return out;
}

const med = (xs) => [...xs].sort((x, y) => x - y)[Math.floor(xs.length / 2)];
const dev = {};
for (const f of prefix ? named("mac", "devperf") : fs.readdirSync(dir).filter((n) => /^devperf-mac-node\d+\.\d+\.\d+\.json$/.test(n))) {
  const j = read(f);
  const node = prefix ? String(j.node ?? reqNode).replace(/^v/, "") : f.match(/node(\d+\.\d+\.\d+)/)[1];
  dev[node] = Object.fromEntries(
    Object.entries(j.results)
      .filter(([k]) => k.startsWith("small/"))
      .map(([k, v]) => [k.slice(6), { warmInteractiveMs: med(v.warm.map((r) => r.interactive_ms)), warmHtmlMs: med(v.warm.map((r) => r.firstHtml_ms)), readyMs: med(v.warm.map((r) => r.ready_ms)), hmrMs: med(v.edit.map((r) => r.hmr_ms)), serverEditMs: med(v.edit.map((r) => r.serverEdit_ms)), rssMb: med(v.edit.map((r) => r.rss_mb)) }])
  );
}

const macFiles = prefix ? named("mac", "backend") : [`backend-mac-node${reqNode}.json`];
const oracleFiles = prefix ? named("oracle", "backend") : [`backend-oracle-node${reqNode}-core.json`, `backend-oracle-node${reqNode}-rest.json`].filter(has);
const result = {
  generatedFrom: path.basename(dir),
  requestsNode: reqNode,
  requests: { mac: requests("mac", macFiles), oracle: requests("oracle", oracleFiles) },
  build: { mac: builds("mac"), oracle: builds("oracle") },
  dev,
};
fs.writeFileSync(path.join(path.dirname(new URL(import.meta.url).pathname), "..", "apps/docs/data", outName), JSON.stringify(result, null, 2) + "\n");
console.log(`wrote ${outName}: ${result.requests.mac.rows.length} + ${result.requests.oracle.rows.length} request rows, builds ${Object.keys(result.build.mac)} / ${Object.keys(result.build.oracle)}, dev ${Object.keys(dev)}`);
