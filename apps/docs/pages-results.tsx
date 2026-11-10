// The pages suite on /performance (pre-rendered page, server-rendered page with an island, form POST, build, start, memory,
// JavaScript) on Node 26.13.0. Every number comes from data/pages-bench.json, written by scripts/sync-pages-bench.mjs from the
// devora.js repository's benchmarks/results/. "First" is shown only where the table shows it: a lead of more than 3 % over the next
// framework; inside 3 % it is called level.
import bench from "./data/pages-bench.json";

type Row = (typeof bench.rows)[number];
type Metric = { id: keyof Row; label: string; unit: string; lower: boolean; digits?: number };

const METRICS: Metric[] = [
  { id: "staticRps", label: "Pre-rendered page", unit: "req/s", lower: false },
  { id: "pageRps", label: "Server-rendered page with an island", unit: "req/s", lower: false },
  { id: "formRps", label: "Form POST", unit: "req/s", lower: false },
  { id: "buildMs", label: "Build (cold)", unit: "ms", lower: true },
  { id: "startMs", label: "Start", unit: "ms", lower: true },
  { id: "idleMb", label: "Idle memory", unit: "MB", lower: true },
  { id: "jsGzipKb", label: "JavaScript, gzip", unit: "kB", lower: true, digits: 1 },
];
const num = (n: number, d = 0) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const isDevora = (r: Row) => r.key.startsWith("devora");

function value(r: Row, m: Metric): number | null {
  const v = r[m.id];
  return typeof v === "number" ? v : null;
}

/** First, level or behind for the better of the two Devora.js rows against the best other framework. */
function verdict(m: Metric): { kind: "first" | "level" | "behind"; devora: Row; other: Row; text: string } {
  const withValue = bench.rows.filter((r) => value(r, m) !== null);
  const better = (a: number, b: number) => (m.lower ? a < b : a > b);
  const devora = withValue.filter(isDevora).reduce((a, b) => (better(value(b, m)!, value(a, m)!) ? b : a));
  const others = withValue.filter((r) => !isDevora(r));
  const other = others.reduce((a, b) => (better(value(b, m)!, value(a, m)!) ? b : a));
  const d = value(devora, m)!;
  const o = value(other, m)!;
  const lead = m.lower ? (o - d) / o : (d - o) / o;
  const kind = lead > 0.03 ? "first" : lead < -0.03 ? "behind" : "level";
  const dText = `${num(d, m.digits)} ${m.unit}`;
  const oText = `${num(o, m.digits)} ${m.unit}`;
  const text =
    kind === "first"
      ? `${devora.name}: ${dText}, ahead of ${other.name} (${oText}).`
      : kind === "level"
        ? `${devora.name}: ${dText}, level with ${other.name} (${oText}), inside 3 %.`
        : `${devora.name}: ${dText}, behind ${other.name} (${oText}).`;
  return { kind, devora, other, text };
}

export function PagesResults() {
  const m = bench.machine;
  const best = Object.fromEntries(
    METRICS.map((x) => {
      const vals = bench.rows.map((r) => value(r, x)).filter((v): v is number => v !== null);
      return [x.id, x.lower ? Math.min(...vals) : Math.max(...vals)];
    }),
  );
  const verdicts = METRICS.map((x) => ({ m: x, v: verdict(x) }));
  return (
    <>
      <h2 id="pages-suite">Pages suite on Node 26.13.0</h2>
      <p className="perf-intro">
        One page of each kind, the same app written for each framework, all built and started by their own commands on Node {m.node.replace(/^v/, "")}: a pre-rendered page, a server-rendered page with an island, a form POST,
        and the cost of building, starting and holding them in memory. Devora.js appears twice, once with Vite 8 and once with Sekhem, our own engine. {m.cpu}, {m.cores} cores, {m.memoryGb} GB, {m.os}.{" "}
        {m.connections} connections, medians of {m.runs} runs, load from {m.tool}. One machine (the Mac); not repeated on the Oracle server yet. The tables above this section are the earlier 0.3.5 run on Node 24.19.0; this section is the current one.
      </p>
      <div className="be-wrap" role="region" aria-label="Pages suite results" tabIndex={0}>
        <table className="be-table">
          <thead>
            <tr>
              <th scope="col">Framework</th>
              {METRICS.map((x) => (
                <th key={x.id} scope="col" className="num">
                  {x.label}
                  <span className="eb-sub">{x.unit}{x.lower ? ", lower is better" : ""}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bench.rows.map((r) => (
              <tr key={r.key} className={isDevora(r) ? "be-devora" : undefined}>
                <th scope="row">
                  {r.name}
                  <span className="eb-sub">{isDevora(r) ? `Devora.js ${r.version}` : r.version}</span>
                </th>
                {METRICS.map((x) => {
                  const v = value(r, x);
                  return (
                    <td key={x.id} className="num">
                      {v === null ? "-" : <span className={v === best[x.id] ? "eb-best" : undefined}>{num(v, x.digits)}</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h3>Where Devora.js is first, level or behind</h3>
      <ul className="perf-intro">
        {verdicts.map(({ m: x, v }) => (
          <li key={x.id as string}>
            <strong>{x.label}: {v.kind === "first" ? "first" : v.kind === "level" ? "level" : "not first"}.</strong> {v.text}
          </li>
        ))}
      </ul>
      <div className="eb-note eb-warn">
        <strong>How to read this</strong>
        Start time includes <code>npm start</code>, the same for every row. JavaScript is what the browser downloads for the server-rendered page, gzip, measured in a real browser (Google Chrome, not Playwright&apos;s headless shell).
        Devora.js ships React for the island; that is part of why the JavaScript row is not first. Next.js, Astro, SvelteKit and React Router are the versions shown in the table; all five apps do the same thing, written the way each framework documents.
        A form POST answers with a redirect, which the load tool counts as non-2xx; the status each framework returns is checked separately.
        {bench.note ? ` ${bench.note}` : ""}
      </div>
    </>
  );
}
