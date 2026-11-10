// The benchmark panel (/performance, and a compact copy on the home page).
// Every number comes from data/benchmarks.json, a copy of the devora.js
// repo's benchmarks/results/latest.json (scripts/sync-benchmarks.mjs);
// nothing here is typed by hand. Tabs are radio inputs, so they work with
// no script (the CSP allows none inline) and arrow keys move between them;
// without CSS every tab's table shows.
import type { ReactNode } from "react";
import bench from "./data/benchmarks.json";
import { join, judge, point, type Point } from "./bench-compare.js";

type Fw = (typeof bench.frameworks)[keyof typeof bench.frameworks];
const FWS = Object.entries(bench.frameworks).map(([key, f]) => ({ key, ...(f as Fw) }));

export const BENCH = bench;
export const BENCH_DATE = bench.date.slice(0, 10);
export const REPRODUCE_URL = "https://github.com/hassanalsa3aka/devora.js/tree/main/benchmarks";

const ms = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(2)} s` : `${Math.round(n)} ms`);
const kb = (n: number) => `${(n / 1024).toFixed(1)} kB`;
const rps = (n: number) => `${Math.round(n).toLocaleString("en-US")} req/s`;

export interface Metric {
  id: string;
  tab: string;
  title: string;
  better: "lower" | "higher";
  value: (f: Fw) => number;
  /** min and max of the runs, when the metric has a spread */
  spread?: (f: Fw) => { min: number; max: number };
  format: (n: number) => string;
  note: string;
}

export const METRICS: Metric[] = [
  { id: "ssr", tab: "Server-rendered page", title: "Requests/second, server-rendered page", better: "higher", value: (f) => f.load.items.rps.median, spread: (f) => f.load.items.rps, format: rps, note: "A page rendered per request: 100 items from a loader and one interactive counter. The scenario closest to a real application" },
  { id: "static", tab: "Pre-rendered page", title: "Requests/second, pre-rendered page", better: "higher", value: (f) => f.load.static.rps.median, spread: (f) => f.load.static.rps, format: rps, note: "A tiny page with no data, built ahead of time. Each framework sends its own output (sizes under \"Response size\"), so this mostly measures the HTTP layer" },
  { id: "form", tab: "Form POST", title: "Requests/second, form POST", better: "higher", value: (f) => f.load.form.rps.median, spread: (f) => f.load.form.rps, format: rps, note: "A valid form submission answered with a 303 redirect" },
  { id: "build", tab: "Build time", title: "Cold production build", better: "lower", value: (f) => f.build.coldMs.median, spread: (f) => f.build.coldMs, format: ms, note: "npm run build with build output and caches deleted" },
  { id: "memory", tab: "Memory", title: "Idle server memory", better: "lower", value: (f) => f.idleMemoryMb.median, spread: (f) => f.idleMemoryMb, format: (n) => `${Math.round(n)} MB`, note: "Resident memory 2 s after start" },
  { id: "js", tab: "JavaScript", title: "JavaScript sent to the browser, SSR page", better: "lower", value: (f) => f.browser["/items"].jsGzip, format: kb, note: "Every script the page loads, gzip" },
];

/** Where Devora.js stands on each tab, as one sentence generated from the data. A difference inside the
 * run-to-run spread is a tie (see bench-compare.ts). */
function standing() {
  const devora = FWS.find((f) => f.key === "devora")!;
  const first: string[] = [];
  const tied: string[] = [];
  const behind: string[] = [];
  const label = (m: Metric) => m.tab.toLowerCase().replace("javascript", "JavaScript");
  for (const m of METRICS) {
    const pt = (f: Fw): Point => point(m.value(f), m.spread?.(f));
    const v = judge(pt(devora), FWS.filter((f) => !f.key.startsWith("devora")).map((f) => ({ name: f.name, point: pt(f) })), m.better);
    if (v.kind === "first") first.push(label(m));
    else if (v.kind === "tie") tied.push(`${label(m)} (with ${join(v.with)})`);
    else behind.push(`${label(m)} (${v.leader})`);
  }
  const parts: string[] = [];
  if (first.length) parts.push(`Devora.js was ahead of every other framework on ${join(first)}`);
  if (tied.length) parts.push(`${parts.length ? "level, within the run-to-run spread, on " : "Devora.js was level, within the run-to-run spread, on "}${join(tied)}`);
  if (behind.length) parts.push(`${parts.length ? "behind on " : "Devora.js was behind on "}${join(behind)}`);
  return `In this run ${parts.join("; ")}.`;
}

function Bars({ metric }: { metric: Metric }) {
  const rows = FWS.map((f) => ({ f, v: metric.value(f) })).sort((a, b) => (metric.better === "lower" ? a.v - b.v : b.v - a.v));
  const max = Math.max(...rows.map((r) => r.v));
  return (
    <table className="bw-table">
      <caption className="bw-sr">
        {metric.title}, {metric.better} is better
      </caption>
      <thead className="bw-sr">
        <tr>
          <th scope="col">Framework</th>
          <th scope="col">Result</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(({ f, v }) => (
          <tr key={f.key} className={f.key.startsWith("devora") ? "bw-devora" : undefined}>
            <th scope="row">
              {f.name} <span className="bw-version">{f.version}</span>
            </th>
            <td>
              <span className="bw-track" aria-hidden="true">
                <span className="bw-bar" style={{ width: `${Math.max((v / max) * 100, 1)}%` }} />
              </span>
              <span className="bw-value">{metric.format(v)}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function WireSizes() {
  const rows = FWS.filter((f) => (f as any).wire);
  if (rows.length === 0) return null;
  const cell = (p: { bodyBytes: number; contentEncoding: string | null }) =>
    `${p.bodyBytes.toLocaleString("en-US")} B${p.contentEncoding ? ` (${p.contentEncoding})` : ""}`;
  return (
    <details className="bw-wire">
      <summary>Response size and encoding</summary>
      <p className="bw-note">
        What each framework actually sent for one request after the run, read as raw bytes. The
        load tool sends no <code>Accept-Encoding</code>, so nothing was compressed during the timed
        runs; the browser column adds what a browser sends.
      </p>
      <table className="bw-table bw-wire-table">
        <thead>
          <tr>
            <th scope="col">Framework</th>
            <th scope="col">Pre-rendered page</th>
            <th scope="col">Server-rendered page</th>
            <th scope="col">Same, with browser Accept-Encoding</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((f) => {
            const w = (f as any).wire;
            return (
              <tr key={f.key}>
                <th scope="row">{f.name}</th>
                <td>{cell(w.static.loadTool)}</td>
                <td>{cell(w.items.loadTool)}</td>
                <td>{cell(w.static.browser)} / {cell(w.items.browser)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </details>
  );
}

export function BenchmarkWidget({ id = "bench", compact = false, footer }: { id?: string; compact?: boolean; footer?: ReactNode }) {
  const m = bench.machine;
  const c = bench.config;
  const tabCss = METRICS.map(
    (metric) =>
      `#${id}-${metric.id}:checked ~ .bw-panels .bw-panel-${metric.id} { display: block; }\n` +
      `#${id}-${metric.id}:checked ~ .bw-tabs label[for="${id}-${metric.id}"] { color: var(--devora-fg); border-color: var(--devora-accent-from); background: var(--devora-card); }\n` +
      `#${id}-${metric.id}:focus-visible ~ .bw-tabs label[for="${id}-${metric.id}"] { outline: 2px solid var(--devora-ring); outline-offset: 2px; }`
  ).join("\n");
  return (
    <section className={`bw${compact ? " bw-compact" : ""}`} aria-labelledby={`${id}-heading`}>
      <style dangerouslySetInnerHTML={{ __html: tabCss }} />
      <h2 id={`${id}-heading`} className="bw-heading">
        Benchmarks
      </h2>
      {METRICS.map((metric, i) => (
        <input
          key={metric.id}
          className="bw-radio"
          type="radio"
          name={`${id}-tab`}
          id={`${id}-${metric.id}`}
          defaultChecked={i === 0}
          aria-label={metric.tab}
        />
      ))}
      <p className="bw-summary">{standing()}</p>
      <div className="bw-tabs" aria-hidden="true">
        {METRICS.map((metric) => (
          <label key={metric.id} htmlFor={`${id}-${metric.id}`}>
            {metric.tab}
          </label>
        ))}
      </div>
      <div className="bw-panels">
        {METRICS.map((metric) => (
          <div key={metric.id} className={`bw-panel bw-panel-${metric.id}`}>
            <p className="bw-panel-title">
              <strong>{metric.title}</strong>
              <span className="bw-better">{metric.better === "lower" ? "Lower is better" : "Higher is better"}</span>
            </p>
            <Bars metric={metric} />
            <p className="bw-note">{metric.note}.</p>
          </div>
        ))}
      </div>
      {!compact ? <WireSizes /> : null}
      <p className="bw-footnote">
        {m.cpu}, {m.cores} cores, {m.memoryGb} GB, {m.os.split(" (")[0]}, Node {m.node.replace(/^v/, "")}.{" "}
        {c.connections} connections, median of {c.loadRuns} runs (builds: {c.buildRuns}), {BENCH_DATE}. Client and
        server on one machine, tiny pages. <a href={REPRODUCE_URL}>Reproduce</a>
        {footer}
      </p>
    </section>
  );
}

export const BENCHMARK_CSS = `
.bw-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.bw {
  position: relative;
  margin: 1.5rem 0;
  padding: 1.25rem 1.4rem 1rem;
  border: 1px solid var(--devora-border);
  border-radius: var(--devora-radius-lg);
  background: var(--devora-surface);
}
.devora-page .bw-heading { margin: 0 0 0.85rem; padding: 0; font-size: 1.05rem; }
.devora-page .bw-heading::before { content: none; }
.devora-page .bw-summary { margin: 0 0 0.9rem; font-size: 0.9rem; line-height: 1.55; color: var(--devora-fg); }
.bw-wire { margin-top: 0.9rem; font-size: 0.85rem; }
.bw-wire summary { cursor: pointer; font-weight: 600; }
.bw-wire summary:focus-visible { outline: 2px solid var(--devora-ring); outline-offset: 2px; border-radius: 4px; }
.bw-wire-table td { display: table-cell; }
.bw-wire-table th { width: auto; }
.bw-wire-table thead th { font-size: 0.75rem; color: var(--devora-fg-muted); white-space: normal; }
@media (max-width: 560px) { .bw-wire { overflow-x: auto; } .bw-wire-table tr { display: table-row; } .bw-wire-table th { display: table-cell; } }
.bw-radio { position: absolute; opacity: 0; width: 1px; height: 1px; margin: 0; }
.bw-tabs { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 1rem; }
.bw-tabs label {
  padding: 0.35rem 0.8rem;
  border: 1px solid var(--devora-border);
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--devora-fg-muted);
  cursor: pointer;
  user-select: none;
}
.bw-tabs label:hover { color: var(--devora-fg); }
.bw-panel { display: none; }
.devora-page .bw-panel-title { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 0.25rem 1rem; margin: 0 0 0.6rem; font-size: 0.9rem; }
.bw-better { font-size: 0.78rem; color: var(--devora-fg-muted); }
.bw-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; margin: 0; }
.bw-table th, .bw-table td { padding: 0.35rem 0; border: 0; background: none; vertical-align: middle; }
.bw-table th { width: 13rem; padding-right: 1rem; text-align: left; font-weight: 600; white-space: nowrap; color: var(--devora-fg); }
.bw-version { font-weight: 400; color: var(--devora-fg-subtle); font-size: 0.78rem; }
.bw-table td { display: flex; align-items: center; gap: 0.75rem; }
.bw-track { flex: 1; height: 12px; border-radius: 999px; background: var(--devora-hover); overflow: hidden; }
.bw-bar { display: block; height: 100%; border-radius: 999px; background: var(--devora-fg-subtle); }
.bw-devora .bw-bar { background: linear-gradient(90deg, var(--devora-accent-from), var(--devora-accent-to)); }
.bw-devora th { color: var(--devora-accent-from); }
.bw-value { min-width: 6.5rem; text-align: right; font-variant-numeric: tabular-nums; font-weight: 600; color: var(--devora-fg); }
.devora-page .bw-note { margin: 0.5rem 0 0; font-size: 0.78rem; }
.devora-page .bw-footnote { margin: 1rem 0 0; padding-top: 0.75rem; border-top: 1px solid var(--devora-border); font-size: 0.75rem; line-height: 1.6; }
@media (max-width: 560px) {
  .bw-table th { width: auto; display: block; padding-bottom: 0.1rem; }
  .bw-table tr { display: block; margin-bottom: 0.45rem; }
  .bw-value { min-width: 5.5rem; }
}
@media (prefers-reduced-motion: no-preference) {
  .bw-bar { transition: width 0.3s ease; }
}
`;
