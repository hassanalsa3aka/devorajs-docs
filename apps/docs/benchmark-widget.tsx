// The benchmark panel (/performance, and a compact copy on the home page).
// Every number comes from data/benchmarks.json, a copy of the devora.js
// repo's benchmarks/results/latest.json (scripts/sync-benchmarks.mjs);
// nothing here is typed by hand. Tabs are radio inputs, so they work with
// no script (the CSP allows none inline) and arrow keys move between them;
// without CSS every tab's table shows.
import type { ReactNode } from "react";
import bench from "./data/benchmarks.json";

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
  format: (n: number) => string;
  note: string;
}

export const METRICS: Metric[] = [
  { id: "build", tab: "Build time", title: "Cold production build", better: "lower", value: (f) => f.build.coldMs.median, format: ms, note: "npm run build with build output and caches deleted" },
  { id: "ssr", tab: "SSR page", title: "Requests/second, SSR page", better: "higher", value: (f) => f.load.items.rps.median, format: rps, note: "A page rendered per request: 100 items from a loader and one interactive counter" },
  { id: "form", tab: "Form POST", title: "Requests/second, form POST", better: "higher", value: (f) => f.load.form.rps.median, format: rps, note: "A valid form submission answered with a 303 redirect" },
  { id: "memory", tab: "Memory", title: "Idle server memory", better: "lower", value: (f) => f.idleMemoryMb.median, format: (n) => `${Math.round(n)} MB`, note: "Resident memory 2 s after start" },
  { id: "js", tab: "JavaScript", title: "JavaScript sent to the browser, SSR page", better: "lower", value: (f) => f.browser["/items"].jsGzip, format: kb, note: "Every script the page loads, gzip" },
];

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
          <tr key={f.key} className={f.key === "devora" ? "bw-devora" : undefined}>
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
      <p className="bw-footnote">
        {m.cpu}, {m.cores} cores, {m.memoryGb} GB, {m.os.split(" (")[0]}, Node {m.node.replace(/^v/, "")}.{" "}
        {c.connections} connections, median of {c.loadRuns} runs (builds: {c.buildRuns}), {BENCH_DATE}. Client and
        server on one machine. <a href={REPRODUCE_URL}>Reproduce</a>
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
