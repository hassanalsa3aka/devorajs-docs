// The pages suite on /performance (pre-rendered page, server-rendered page with an island, form POST, build, start, memory,
// JavaScript) on Node 26.13.0. Every number comes from data/pages-bench.json, written by scripts/sync-pages-bench.mjs from the
// devora.js repository's benchmarks/results/. "First" is shown only where the table shows it: a lead of more than 3 % over the next
// framework; inside 3 % it is called level.
import bench from "./data/pages-bench.json";
import oracle from "./data/pages-bench-oracle.json";
import scenarios from "./data/scenarios-bench.json";

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
export function verdict(m: Metric, b: typeof bench = bench): { kind: "first" | "level" | "behind"; devora: Row; other: Row; text: string } {
  const withValue = b.rows.filter((r) => value(r, m) !== null);
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

const ms = (n: number, d = 0) => `${num(n, d)} ms`;

/** Cold start, time to first byte and 1,000 connections on the same pages apps, Node 26.13.0, Mac. */
export function ScenarioResults() {
  const rows = scenarios.rows;
  const minOf = (f: (r: (typeof rows)[number]) => number) => Math.min(...rows.map(f));
  const maxOf = (f: (r: (typeof rows)[number]) => number) => Math.max(...rows.map(f));
  const best = {
    cold: minOf((r) => r.coldStartMs),
    first: minOf((r) => r.firstPageMs),
    p50: minOf((r) => r.ttfbP50),
    p99: minOf((r) => r.ttfbP99),
    s: maxOf((r) => r.staticRps),
    i: maxOf((r) => r.itemsRps),
  };
  const cls = (v: number, b: number) => (v === b ? "eb-best" : undefined);
  const m = scenarios.machine;
  return (
    <>
      <h3 id="scenarios">Cold start, first byte and 1,000 connections</h3>
      <p className="perf-intro">
        The same apps as above, started the same way ({m.cpu}, {m.cores} cores, {m.os}, Node {m.node.replace(/^v/, "")}). Cold: a fresh server per run, 5 runs, from <code>npm start</code> to the first byte of the first
        server-rendered page, and how long that first request takes. First byte: {scenarios.ttfbRequests} requests one at a time after a warm-up. 1,000 connections: 2 runs of 10 s with {scenarios.connections.toLocaleString("en-US")} connections.
      </p>
      <div className="be-wrap" role="region" aria-label="Cold start, time to first byte and 1,000 connections" tabIndex={0}>
        <table className="be-table">
          <thead>
            <tr>
              <th scope="col">Framework</th>
              <th scope="col" className="num">Start to first page byte<span className="eb-sub">ms, lower is better</span></th>
              <th scope="col" className="num">First page request<span className="eb-sub">ms, lower is better</span></th>
              <th scope="col" className="num">First byte, median<span className="eb-sub">ms, lower is better</span></th>
              <th scope="col" className="num">First byte, p99<span className="eb-sub">ms, lower is better</span></th>
              <th scope="col" className="num">1,000 connections, pre-rendered<span className="eb-sub">req/s</span></th>
              <th scope="col" className="num">1,000 connections, server-rendered<span className="eb-sub">req/s</span></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key} className={r.key.startsWith("devora") ? "be-devora" : undefined}>
                <th scope="row">{r.key === "devora-pages-vite" ? "Devora.js with Vite" : r.key === "devora-pages-sekhem" ? "Devora.js with Sekhem" : r.name}</th>
                <td className="num"><span className={cls(r.coldStartMs, best.cold)}>{num(r.coldStartMs)}</span></td>
                <td className="num"><span className={cls(r.firstPageMs, best.first)}>{num(r.firstPageMs)}</span></td>
                <td className="num"><span className={cls(r.ttfbP50, best.p50)}>{num(r.ttfbP50, 2)}</span></td>
                <td className="num"><span className={cls(r.ttfbP99, best.p99)}>{num(r.ttfbP99, 2)}</span></td>
                <td className="num"><span className={cls(r.staticRps, best.s)}>{num(r.staticRps)}</span></td>
                <td className="num"><span className={cls(r.itemsRps, best.i)}>{num(r.itemsRps)}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="eb-note eb-warn">
        <strong>Read the 1,000-connection columns with care</strong>
        On this Mac the system queue for new connections holds 128 (<code>kern.ipc.somaxconn</code>), so opening 1,000 connections at once makes the load tool report tens of thousands of failed connections for every framework, on the
        server-rendered page (66,000 to 85,000 per run). The requests per second above are the requests that were answered; the 99th percentile latencies of this run are not shown because of the failures. The pre-rendered page failed to connect far less often
        with Devora.js ({num(rows[0]!.staticErrors)} and {num(rows[1]!.staticErrors)} on average) than with the others ({num(Math.min(...rows.slice(2).map((r) => r.staticErrors)))} or more), and every server except React Router answered a normal request afterwards. React Router answered most of the pre-rendered page requests at 1,000 connections with an error status, so its number in that column is not comparable.
        A Linux machine with a larger queue is the right place for this test; it is not done yet.
        The start to first page byte includes <code>npm start</code> for every framework. The Sekhem server answered the first request in the same time as the Vite one; the two engines only differ in how the app was built.
      </div>
    </>
  );
}

/** A short version of the pages suite for /compare: four columns, the rows that matter for a choice, and where Devora.js is not first. */
export function CompareSpeed() {
  const cols: Metric[] = [METRICS[1]!, METRICS[3]!, METRICS[5]!, METRICS[6]!];
  const best = Object.fromEntries(
    cols.map((x) => {
      const vals = bench.rows.map((r) => value(r, x)).filter((v): v is number => v !== null);
      return [x.id, x.lower ? Math.min(...vals) : Math.max(...vals)];
    }),
  );
  const behind = METRICS.map((x) => ({ x, v: verdict(x) })).filter(({ v }) => v.kind !== "first");
  return (
    <>
      <p>
        The same three pages written for each framework, built and run with each one&apos;s own commands on Node {bench.machine.node.replace(/^v/, "")}, one Mac, medians of {bench.machine.runs} runs. Devora.js is shown with its default
        engine (Vite 8) and with Sekhem, the experimental engine of our own.
      </p>
      <div className="be-wrap" role="region" aria-label="Speed of each framework on the same pages" tabIndex={0}>
        <table className="be-table">
          <thead>
            <tr>
              <th scope="col">Framework</th>
              {cols.map((x) => (
                <th key={x.id as string} scope="col" className="num">
                  {x.label}
                  <span className="eb-sub">{x.unit}{x.lower ? ", lower is better" : ""}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bench.rows.map((r) => (
              <tr key={r.key} className={isDevora(r) ? "be-devora" : undefined}>
                <th scope="row">{r.name}</th>
                {cols.map((x) => {
                  const v = value(r, x);
                  return (
                    <td key={x.id as string} className="num">
                      {v === null ? "-" : <span className={v === best[x.id as string] ? "eb-best" : undefined}>{num(v, x.digits)}</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        Where Devora.js is not first: {behind.map(({ x, v }, i) => (
          <span key={x.id as string}>{i > 0 ? "; " : ""}{x.label.toLowerCase()} ({v.kind === "level" ? "level with" : "behind"} {v.other.name}, {num(value(v.other, x)!, x.digits)} {x.unit} against {num(value(v.devora, x)!, x.digits)})</span>
        ))}. Every row, the other pages, cold start and time to first byte are on <a href="/performance#pages-suite">Performance</a>.
      </p>
    </>
  );
}

/** The pages suite on the Oracle ARM server (Linux, 2 CPUs): the same table and the same first, level or behind rule. */
export function OraclePages() {
  const b = oracle as unknown as typeof bench;
  const m = b.machine;
  const best = Object.fromEntries(
    METRICS.map((x) => {
      const vals = b.rows.map((r) => value(r, x)).filter((v): v is number => v !== null);
      return [x.id, x.lower ? Math.min(...vals) : Math.max(...vals)];
    }),
  );
  const verdicts = METRICS.map((x) => ({ x, v: verdict(x, b) }));
  return (
    <>
      <h3 id="pages-oracle">The same pages on a small ARM server</h3>
      <p className="perf-intro">
        {m.cpu}, {m.cores} CPUs, {m.memoryGb} GB, {m.os}, Node {m.node.replace(/^v/, "")}, {m.tool}, medians of {b.machine.runs} runs. The load tool runs on the same two CPUs as the server, so every request number is lower than on the Mac and the two
        machines must not be compared with each other. Nuxt was not run here.
      </p>
      <div className="be-wrap" role="region" aria-label="Pages suite on the Oracle ARM server" tabIndex={0}>
        <table className="be-table">
          <thead>
            <tr>
              <th scope="col">Framework</th>
              {METRICS.map((x) => (
                <th key={x.id as string} scope="col" className="num">
                  {x.label}
                  <span className="eb-sub">{x.unit}{x.lower ? ", lower is better" : ""}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {b.rows.map((r) => (
              <tr key={r.key} className={isDevora(r) ? "be-devora" : undefined}>
                <th scope="row">{r.name}<span className="eb-sub">{isDevora(r) ? `Devora.js ${r.version}` : r.version}</span></th>
                {METRICS.map((x) => {
                  const v = value(r, x);
                  return (
                    <td key={x.id as string} className="num">
                      {v === null ? "-" : <span className={v === best[x.id as string] ? "eb-best" : undefined}>{num(v, x.digits)}</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="perf-intro">
        {verdicts.map(({ x, v }) => (
          <li key={x.id as string}>
            <strong>{x.label}: {v.kind === "first" ? "first" : v.kind === "level" ? "level" : "not first"}.</strong> {v.text}
          </li>
        ))}
      </ul>
      <div className="eb-note eb-warn">
        <strong>Two cautions about this table</strong>
        The Sekhem build time here (872 ms against 666 ms for Vite) probably includes the start-up of a TypeScript runner that the benchmark setup used at the time; it is not comparable with the Mac result and
        will be measured again. The browser steps used Playwright&apos;s headless shell on this server and Google Chrome on the Mac; the JavaScript sizes are identical on both.
      </div>
    </>
  );
}
