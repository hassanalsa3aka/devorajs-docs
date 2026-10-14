import { PageShell } from "@devorajs/core";
import { DOCS_NAV } from "../nav.js";
import { SiteFooter } from "../site-footer.js";
import { JsonLd, pageMeta, SITE_URL } from "../seo.js";
import { BENCH, BENCH_DATE, BENCHMARK_CSS, BenchmarkWidget, REPRODUCE_URL } from "../benchmark-widget.js";

export const renderMode = "ssg";

export function meta() {
  return pageMeta("/performance", {
    title: "Performance",
    description:
      "Devora.js measured against Next.js, Astro, SvelteKit and React Router on the same three pages: build time, requests/second, memory and JavaScript sent — including where Devora.js is slower.",
    image: "/og/performance.png",
  });
}

export async function loader() {
  return {};
}

type Fw = (typeof BENCH.frameworks)[keyof typeof BENCH.frameworks];
const FWS = Object.entries(BENCH.frameworks).map(([key, f]) => ({ key, ...(f as Fw) }));

const ms = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(2)} s` : `${Math.round(n)} ms`);
const kb = (n: number) => `${(n / 1024).toFixed(1)} kB`;
const num = (n: number) => Math.round(n).toLocaleString("en-US");

// Every row of the full results; also drives "Where Devora.js is behind".
const ROWS: { label: string; better: "lower" | "higher"; value: (f: Fw) => number; show: (f: Fw) => string }[] = [
  { label: "Build, cold", better: "lower", value: (f) => f.build.coldMs.median, show: (f) => ms(f.build.coldMs.median) },
  { label: "Build, warm", better: "lower", value: (f) => f.build.warmMs.median, show: (f) => ms(f.build.warmMs.median) },
  { label: "Server start", better: "lower", value: (f) => f.startMs.median, show: (f) => ms(f.startMs.median) },
  { label: "Idle memory", better: "lower", value: (f) => f.idleMemoryMb.median, show: (f) => `${Math.round(f.idleMemoryMb.median)} MB` },
  { label: "Static page, req/s", better: "higher", value: (f) => f.load.static.rps.median, show: (f) => `${num(f.load.static.rps.median)} (p99 ${f.load.static.p99.median} ms)` },
  { label: "SSR page, req/s", better: "higher", value: (f) => f.load.items.rps.median, show: (f) => `${num(f.load.items.rps.median)} (p99 ${f.load.items.p99.median} ms)` },
  { label: "Form POST, req/s", better: "higher", value: (f) => f.load.form.rps.median, show: (f) => `${num(f.load.form.rps.median)} (p99 ${f.load.form.p99.median} ms)` },
  { label: "JS, SSR page (gzip)", better: "lower", value: (f) => f.browser["/items"].jsGzip, show: (f) => kb(f.browser["/items"].jsGzip) },
  { label: "JS, static page (gzip)", better: "lower", value: (f) => f.browser["/static"].jsGzip, show: (f) => kb(f.browser["/static"].jsGzip) },
  { label: "Counter responds after", better: "lower", value: (f) => f.browser["/items"].hydrationMs.median, show: (f) => ms(f.browser["/items"].hydrationMs.median) },
];

// Place = 1 + how many frameworks did strictly better on the shown value,
// so a tie (same rounded number) never reads as "behind".
function rank(row: (typeof ROWS)[number]) {
  const sorted = [...FWS].sort((a, b) => (row.better === "lower" ? row.value(a) - row.value(b) : row.value(b) - row.value(a)));
  const devora = FWS.find((f) => f.key === "devora")!;
  const shown = (f: Fw) => row.show(f).split(" ")[0];
  const strictlyBetter = sorted.filter(
    (f) => shown(f) !== shown(devora) && (row.better === "lower" ? row.value(f) < row.value(devora) : row.value(f) > row.value(devora))
  );
  return { place: strictlyBetter.length + 1, best: sorted[0] };
}

export default function Performance() {
  const devora = FWS.find((f) => f.key === "devora")!;
  const behind = ROWS.map((row) => ({ row, ...rank(row) })).filter((r) => r.place > 1);
  const ahead = ROWS.map((row) => ({ row, ...rank(row) })).filter((r) => r.place === 1);
  return (
    <PageShell nav={DOCS_NAV} footer={<SiteFooter />}>
      <style dangerouslySetInnerHTML={{ __html: `
        .devora-page { max-width: 1180px; }
        ${BENCHMARK_CSS}
        .perf-intro { max-width: 46rem; }
        .perf-wide { max-width: 62rem; }
        .perf-table-wrap { overflow-x: auto; }
        .perf-table { min-width: 720px; font-size: 0.85rem; }
        .perf-table td.perf-devora, .perf-table th.perf-devora { background: color-mix(in srgb, var(--devora-accent-from) 8%, transparent); }
      ` }} />
      <h1>Performance</h1>
      <p className="devora-lead perf-intro">
        The same three pages — a static page, a server-rendered page with 100 items and one
        interactive counter, and a form — built in Devora.js and four other frameworks, each with
        its own documented production setup. Measured {BENCH_DATE}; every number on this page
        comes from that run's JSON.
      </p>

      <div className="perf-wide">
        <BenchmarkWidget id="perf" />
      </div>

      <h2 id="read-this-first">Read this first</h2>
      <ul className="perf-intro">
        <li>
          Devora.js runs on Node and Vite like most of the others. Requests/second on one machine
          mostly measures Node's HTTP server and the rendering work per request; it isn't how many
          users an app can serve.
        </li>
        <li>
          Devora.js sends the same security headers (CSP, HSTS, X-Frame-Options) on every response
          by default; those are included in its numbers.
        </li>
        <li>One machine, client and server together. Run it on your own hardware before relying on it.</li>
      </ul>

      <h2 id="behind">Where Devora.js is behind</h2>
      {behind.length === 0 ? (
        <p>Nowhere in this run.</p>
      ) : (
        <ul className="perf-intro">
          {behind.map(({ row, place, best }) => (
            <li key={row.label}>
              <strong>{row.label}</strong>: {row.show(devora)}, {ordinal(place)} of {FWS.length}. {best.name}{" "}
              is ahead with {row.show(best)}.
            </li>
          ))}
        </ul>
      )}
      {ahead.length > 0 ? (
        <p className="perf-intro">
          Devora.js measured best (or tied for best) on: {ahead.map((a) => a.row.label).join("; ")}.
        </p>
      ) : null}

      <h2 id="results">All results</h2>
      <p className="perf-intro">Medians of the runs. Spreads (min–max of every run) are in the raw data.</p>
      <div className="perf-table-wrap" role="region" aria-label="All benchmark results" tabIndex={0}>
        <table className="perf-table">
          <thead>
            <tr>
              <th scope="col">Metric</th>
              {FWS.map((f) => (
                <th scope="col" key={f.key} className={f.key === "devora" ? "perf-devora" : undefined}>
                  {f.name} {f.version}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.label}>
                <th scope="row">
                  {row.label}
                  <br />
                  <small>{row.better} is better</small>
                </th>
                {FWS.map((f) => (
                  <td key={f.key} className={f.key === "devora" ? "perf-devora" : undefined}>
                    {row.show(f)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 id="method">How it was measured</h2>
      <div className="perf-intro">
        <p>
          Each framework's app renders the same content with the same status codes: <code>/static</code>{" "}
          pre-rendered at build time, <code>/items</code> rendered per request with a loader returning
          100 items and one counter, <code>/form</code> answering a valid POST with a 303 and an empty
          one with the error. (Next.js answers an invalid Server Action submission with 200 and the
          error, its documented behavior.) Builds and servers are each framework's own: Devora.js{" "}
          <code>devora build</code>/<code>devora start</code>, Next.js <code>next build</code>/
          <code>next start</code>, Astro on <code>@astrojs/node</code>, SvelteKit on{" "}
          <code>adapter-node</code>, React Router with <code>react-router-serve</code>. Defaults
          only.
        </p>
        <ul>
          <li>
            <strong>Load:</strong> {BENCH.config.tool}, {BENCH.config.connections} connections,{" "}
            {BENCH.config.warmupSeconds} s warm-up, then {BENCH.config.loadRuns} runs of{" "}
            {BENCH.config.loadSeconds} s each, with a browser's <code>Accept</code> and{" "}
            <code>Origin</code> headers.
          </li>
          <li>
            <strong>Builds:</strong> {BENCH.config.buildRuns} cold builds (output and caches deleted),
            each followed by a warm one.
          </li>
          <li>
            <strong>Browser:</strong> Chromium, {BENCH.config.browserRuns} runs per page; JavaScript is
            every script the page loads, compressed with gzip -9 and brotli; "counter responds" is the
            time from navigation start until a click changes it.
          </li>
          <li>
            <strong>Machine:</strong> {BENCH.machine.cpu}, {BENCH.machine.cores} cores,{" "}
            {BENCH.machine.memoryGb} GB, {BENCH.machine.os}, Node {BENCH.machine.node}.
          </li>
          <li>
            <strong>Versions:</strong> {FWS.map((f) => `${f.name} ${f.version}`).join(", ")}.
          </li>
        </ul>
        <p>
          Scripts, the five apps and the raw JSON: <a href={REPRODUCE_URL}>benchmarks/ in the devora.js repo</a>.
          To reproduce: <code>cd benchmarks && npm ci && npm run bench && npm run report</code>.
        </p>
      </div>

      <h2 id="caveats">Caveats</h2>
      <ul className="perf-intro">
        <li>Localhost has no network latency; real deployments add it to every request.</li>
        <li>
          The pages are small on purpose. Real apps spend most of their time in their own data
          access, which these numbers don't include.
        </li>
        <li>Idle memory includes the <code>npm start</code> wrapper process, the same for every framework.</li>
        <li>
          Hydration timing clicks every 5 ms on an unthrottled machine; a phone on a slow network
          would see larger differences in JavaScript size.
        </li>
        <li>Results are from one run of the suite on one day; they will change as every framework changes.</li>
      </ul>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Devora.js docs", item: `${SITE_URL}/` },
            { "@type": "ListItem", position: 2, name: "Performance", item: `${SITE_URL}/performance` },
          ],
        }}
      />
    </PageShell>
  );
}

function ordinal(n: number) {
  return ["", "1st", "2nd", "3rd", "4th", "5th", "6th"][n] ?? `${n}th`;
}
