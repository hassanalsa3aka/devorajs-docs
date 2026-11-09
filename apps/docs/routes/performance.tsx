import { PageShell } from "@devorajs/core";
import { DOCS_NAV } from "../nav.js";
import { SiteFooter } from "../site-footer.js";
import { JsonLd, pageMeta, SITE_URL } from "../seo.js";
import { judge, point, join, type Point } from "../bench-compare.js";
import { BACKEND_CSS, BackendResults } from "../backend-results.js";
import { BENCH, BENCH_DATE, BENCHMARK_CSS, BenchmarkWidget, REPRODUCE_URL } from "../benchmark-widget.js";

export const renderMode = "ssg";

export function meta() {
  return pageMeta("/performance", {
    title: "Performance",
    description:
      "Devora.js measured against Next.js, Astro, SvelteKit and React Router on the same three pages: build time, requests/second, memory, JavaScript sent.",
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
const ROWS: { label: string; better: "lower" | "higher"; value: (f: Fw) => number; spread?: (f: Fw) => { min: number; max: number }; show: (f: Fw) => string }[] = [
  { label: "Build, cold", better: "lower", value: (f) => f.build.coldMs.median, spread: (f) => f.build.coldMs, show: (f) => ms(f.build.coldMs.median) },
  { label: "Build, warm", better: "lower", value: (f) => f.build.warmMs.median, spread: (f) => f.build.warmMs, show: (f) => ms(f.build.warmMs.median) },
  { label: "Server start", better: "lower", value: (f) => f.startMs.median, spread: (f) => f.startMs, show: (f) => ms(f.startMs.median) },
  { label: "Idle memory", better: "lower", value: (f) => f.idleMemoryMb.median, spread: (f) => f.idleMemoryMb, show: (f) => `${Math.round(f.idleMemoryMb.median)} MB` },
  { label: "Static page, req/s", better: "higher", value: (f) => f.load.static.rps.median, spread: (f) => f.load.static.rps, show: (f) => `${num(f.load.static.rps.median)} (p99 ${f.load.static.p99.median} ms)` },
  { label: "SSR page, req/s", better: "higher", value: (f) => f.load.items.rps.median, spread: (f) => f.load.items.rps, show: (f) => `${num(f.load.items.rps.median)} (p99 ${f.load.items.p99.median} ms)` },
  { label: "Form POST, req/s", better: "higher", value: (f) => f.load.form.rps.median, spread: (f) => f.load.form.rps, show: (f) => `${num(f.load.form.rps.median)} (p99 ${f.load.form.p99.median} ms)` },
  { label: "JS, SSR page (gzip)", better: "lower", value: (f) => f.browser["/items"].jsGzip, show: (f) => kb(f.browser["/items"].jsGzip) },
  { label: "JS, static page (gzip)", better: "lower", value: (f) => f.browser["/static"].jsGzip, show: (f) => kb(f.browser["/static"].jsGzip) },
  { label: "Counter responds after", better: "lower", value: (f) => f.browser["/items"].hydrationMs.median, spread: (f) => f.browser["/items"].hydrationMs, show: (f) => ms(f.browser["/items"].hydrationMs.median) },
];

// A difference inside the run-to-run spread is a tie, not a lead (see bench-compare.ts).
function verdict(row: (typeof ROWS)[number]) {
  const devora = FWS.find((f) => f.key === "devora")!;
  const pt = (f: Fw): Point => point(row.value(f), row.spread?.(f));
  const others = FWS.filter((f) => f.key !== "devora");
  const v = judge(pt(devora), others.map((f) => ({ name: f.name, point: pt(f) })), row.better);
  const best = [...FWS].sort((a, b) => (row.better === "lower" ? row.value(a) - row.value(b) : row.value(b) - row.value(a)))[0]!;
  // Place = 1 + how many frameworks are beyond Devora.js's whole range.
  const place = 1 + others.filter((f) => judge(pt(devora), [{ name: f.name, point: pt(f) }], row.better).kind === "behind").length;
  return { v, best, place };
}

export default function Performance() {
  const devora = FWS.find((f) => f.key === "devora")!;
  const all = ROWS.map((row) => ({ row, ...verdict(row) }));
  const behind = all.filter((r) => r.v.kind === "behind");
  const tied = all.filter((r) => r.v.kind === "tie");
  const first = all.filter((r) => r.v.kind === "first");
  const staticRow = ROWS.find((r) => r.label.startsWith("Static page"))!;
  const staticLine = [...FWS].sort((a, b) => staticRow.value(b) - staticRow.value(a)).map((f) => `${f.name} ${num(staticRow.value(f))}`);
  return (
    <PageShell nav={DOCS_NAV} footer={<SiteFooter />}>
      <style dangerouslySetInnerHTML={{ __html: `
        .devora-page { max-width: 1180px; }
        ${BENCHMARK_CSS}
        ${BACKEND_CSS}
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
        <li>
          The load tool sends no <code>Accept-Encoding</code>, so no framework compressed during the
          timed runs; the pages differ in size because each framework emits different HTML (see
          "Response size and encoding" in the panel). The pre-rendered page is tiny, and a smaller
          page is part of why a framework is fast on it.
        </li>
        <li>
          On the pre-rendered page this run measured {staticLine.join(", ")} requests/s (medians of{" "}
          {BENCH.config.loadRuns} runs). The page is tiny, so this mostly compares the HTTP layer, and
          a result is only called a lead when it is outside the other's run-to-run spread.
        </li>
      </ul>

      <h2 id="behind">Where Devora.js is behind, level, or ahead</h2>
      <p className="perf-intro">
        A difference smaller than the spread between a framework's own runs is called a tie.
      </p>
      <h3>Behind</h3>
      {behind.length === 0 ? (
        <p>Nowhere in this run.</p>
      ) : (
        <ul className="perf-intro">
          {behind.map(({ row, place, best }) => (
            <li key={row.label}>
              <strong>{row.label}</strong>: {row.show(devora)}, {ordinal(place)} of {FWS.length}.{" "}
              {best.name} is ahead with {row.show(best)}.
            </li>
          ))}
        </ul>
      )}
      <h3>Level, within the run-to-run spread</h3>
      {tied.length === 0 ? (
        <p>Nothing in this run.</p>
      ) : (
        <ul className="perf-intro">
          {tied.map(({ row, v }) => (
            <li key={row.label}>
              <strong>{row.label}</strong>: {row.show(devora)}, level with {v.kind === "tie" ? join(v.with) : ""}.
            </li>
          ))}
        </ul>
      )}
      <h3>Ahead of every other framework</h3>
      <p className="perf-intro">{first.length === 0 ? "Nothing in this run." : first.map((a) => a.row.label).join("; ") + "."}</p>

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

      <h2 id="api-routes">API routes</h2>
      <p className="perf-intro">
        The same JSON API (identical payloads, status codes and validation, checked before timing) in
        Devora.js, Express, Fastify, Hono, NestJS on its Express and on its Fastify platform, and the
        API routes of Next.js, SvelteKit, React Router and Astro. Devora.js sends CSP, HSTS and
        X-Frame-Options on every response and runs a real session layer for the authenticated
        scenario; the bare backend frameworks do neither, so part of any gap to them is that work.
        Memory and start time for these apps are in the repository's backend report.
      </p>
      <BackendResults />

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

      <h2 id="node-versions">Node versions and the two engines</h2>
      <ul className="perf-intro">
        <li>
          Measured on 9 November 2026 on one Mac (Apple M5, 10 cores, 16 GB, macOS, arm64). Five runs per cell, medians, the
          four apps of the devora.js repository built with <code>devora build</code> from a clean output folder. Vite 6.4.5,
          7.3.7 and 8.3.6; Sekhem is the experimental engine (<code>--engine=own</code>). Peak memory is the whole process
          tree. The raw JSON is in <a href={`${REPRODUCE_URL}/results`}>benchmarks/results/</a>; reproduce with{" "}
          <code>pnpm run measure:build</code> in the repository (Vite 7 and 8 through <code>DEVORA_VITE7_DIR</code> and{" "}
          <code>DEVORA_VITE8_DIR</code>). No Oracle or other machine was measured.
        </li>
      </ul>
      <div className="perf-table-wrap">
      <table className="perf-table">
        <thead>
          <tr><th>Node</th><th>Vite 6</th><th>Vite 7</th><th>Vite 8</th><th>Sekhem</th></tr>
        </thead>
        <tbody>
          <tr><td>20.20.2</td><td>1.73 s, 549 MB</td><td>not run</td><td>not run</td><td>refuses (needs 22.15)</td></tr>
          <tr><td>22.23.4</td><td>1.64 s, 511 MB</td><td>1.84 s, 511 MB</td><td>1.11 s, 478 MB</td><td>0.62 s, 218 MB</td></tr>
          <tr><td>24.22.2</td><td>1.44 s, 486 MB</td><td>1.62 s, 532 MB</td><td>0.97 s, 486 MB</td><td>0.58 s, 217 MB</td></tr>
          <tr><td>26.13.0</td><td>1.42 s, 566 MB</td><td>1.59 s, 486 MB</td><td>0.95 s, 461 MB</td><td>0.56 s, 234 MB</td></tr>
        </tbody>
      </table>
      </div>
      <ul className="perf-intro">
        <li>
          Build time, median of five, four apps together. Output size was 18.9 MB for every Vite build and 9.7 MB for Sekhem
          (neither minifies the server code; the difference was not investigated).
        </li>
        <li>
          Newer Node was faster in this test. Medians on Node 24 and 26 were 12% and 14% lower than on Node 22 with Vite 6
          (the five-run ranges overlap slightly: 1.62 to 1.79 s on Node 22, 1.44 to 1.70 s on Node 24) and 7% and 10%
          lower with Sekhem (the ranges for Node 22 and Node 24 or 26 do not overlap). Memory differences between Node
          lines are within the spread.
        </li>
        <li>
          Dev server, small app, warm start until the page is interactive (median of five, includes the CLI's own start-up):
          Sekhem 168, 145 and 166 ms on Node 22, 24 and 26; Vite 6 373, 337 and 334 ms. A change to a component shows in the
          page after 32 to 33 ms with Sekhem and with Vite when its file watcher is tuned, and after about 160 ms with
          Vite's default settings. Where Sekhem is behind: idle CPU of its dev server was 1.0% on Node 22 and 0.8% on Node
          24 against 0.0 to 0.8% for Vite (0.1% on Node 26 for both), and in an earlier run on Node 22 a server-side edit
          in a 1000-module app took 17 ms against 14.7 ms for tuned Vite 8.
        </li>
        <li>
          Not measured here: the eight request scenarios per Node version, other machines, and Vite 7 and 8 on Node 20.
        </li>
      </ul>

      <h2 id="request-scenarios">Request scenarios, Devora.js with Vite and with Sekhem, Node 22</h2>
      <ul className="perf-intro">
        <li>
          Same API in every app (<code>benchmarks/backend/CONTRACT.md</code>), production builds, fresh server per round, five
          rounds of 10 s after a 5 s warm-up, 50 connections, autocannon on the same machine, medians. Rounds alternate between
          apps. Run on 9 November 2026. Raw JSON and the harness: <a href={`${REPRODUCE_URL}/results`}>benchmarks/results/</a>;
          reproduce with <code>node benchmarks/setup-devora-local.mjs</code> and <code>node benchmarks/run-backend.mjs</code>.
          The two Devora.js rows run this commit's CLI; they differ only in the build engine.
        </li>
        <li>
          Mac: Apple M5, 10 cores, 16 GB, macOS (Darwin 27.2), Node 22.23.4. The machine's one-minute load average was 5.25 when
          the run started, from earlier work, so treat small gaps with care.
        </li>
        <li>
          Oracle: Neoverse-N1 (arm64), 2 vCPU, 12 GB, Ubuntu 24.04, Node 22.23.4. An Ollama service was running (idle) and the
          load average was 0.68 at the start of the first part and about 1.7 during the second; the load generator shares the
          two CPUs with the server. Devora.js, Express, Fastify and Hono ran in one pass and the other six frameworks in a later
          one. The Mac and the Oracle numbers are not comparable with each other.
        </li>
      </ul>
      <div className="perf-table-wrap">
        <table className="perf-table">
          <caption>Mac (Apple M5), Node 22.23.4, median of 5 runs</caption>
          <thead><tr><th>Framework</th><th>JSON list req/s</th><th>Authenticated GET req/s</th><th>POST valid req/s</th><th>POST invalid req/s</th><th>One async step req/s</th><th>Build ms</th><th>Start ms</th><th>Idle MB</th></tr></thead>
          <tbody>
            <tr><td>Devora.js with Vite</td><td>27,208</td><td>41,098</td><td>39,251</td><td>39,705</td><td>16,194</td><td>646</td><td>278</td><td>136</td></tr>
            <tr><td>Devora.js with Sekhem</td><td>27,381</td><td>40,851</td><td>39,661</td><td>39,711</td><td>16,480</td><td>531</td><td>279</td><td>137</td></tr>
            <tr><td>Express 5</td><td>12,204</td><td>16,203</td><td>13,904</td><td>13,571</td><td>12,010</td><td>191</td><td>250</td><td>124</td></tr>
            <tr><td>Fastify 5</td><td>34,250</td><td>71,316</td><td>60,755</td><td>60,813</td><td>15,840</td><td>193</td><td>301</td><td>132</td></tr>
            <tr><td>Hono</td><td>33,399</td><td>70,217</td><td>55,114</td><td>56,452</td><td>15,469</td><td>190</td><td>222</td><td>126</td></tr>
            <tr><td>NestJS (Express platform)</td><td>11,400</td><td>14,470</td><td>12,859</td><td>11,879</td><td>12,069</td><td>1,012</td><td>463</td><td>161</td></tr>
            <tr><td>NestJS (Fastify platform)</td><td>31,929</td><td>58,963</td><td>52,278</td><td>42,230</td><td>15,450</td><td>1,122</td><td>463</td><td>166</td></tr>
            <tr><td>Next.js</td><td>5,095</td><td>5,581</td><td>4,925</td><td>4,903</td><td>5,457</td><td>2,676</td><td>465</td><td>160</td></tr>
            <tr><td>SvelteKit</td><td>16,661</td><td>22,610</td><td>17,431</td><td>17,812</td><td>15,707</td><td>2,230</td><td>251</td><td>128</td></tr>
            <tr><td>React Router</td><td>5,572</td><td>6,074</td><td>6,369</td><td>6,372</td><td>5,891</td><td>857</td><td>324</td><td>143</td></tr>
            <tr><td>Astro</td><td>9,780</td><td>11,538</td><td>9,165</td><td>9,195</td><td>11,224</td><td>1,148</td><td>334</td><td>152</td></tr>
          </tbody>
        </table>
      </div>
      <div className="perf-table-wrap">
        <table className="perf-table">
          <caption>Oracle (Neoverse-N1, 2 vCPU), Node 22.23.4, median of 5 runs</caption>
          <thead><tr><th>Framework</th><th>JSON list req/s</th><th>Authenticated GET req/s</th><th>POST valid req/s</th><th>POST invalid req/s</th><th>One async step req/s</th><th>Build ms</th><th>Start ms</th><th>Idle MB</th></tr></thead>
          <tbody>
            <tr><td>Devora.js with Vite</td><td>6,091</td><td>6,397</td><td>5,788</td><td>5,835</td><td>9,481</td><td>1,326</td><td>367</td><td>149</td></tr>
            <tr><td>Devora.js with Sekhem</td><td>6,135</td><td>6,325</td><td>5,809</td><td>5,916</td><td>9,469</td><td>888</td><td>392</td><td>148</td></tr>
            <tr><td>Express 5</td><td>3,232</td><td>3,713</td><td>3,028</td><td>3,039</td><td>4,091</td><td>214</td><td>333</td><td>129</td></tr>
            <tr><td>Fastify 5</td><td>8,771</td><td>12,456</td><td>8,792</td><td>9,141</td><td>11,941</td><td>214</td><td>411</td><td>136</td></tr>
            <tr><td>Hono</td><td>8,810</td><td>12,431</td><td>8,738</td><td>8,941</td><td>11,023</td><td>216</td><td>306</td><td>131</td></tr>
            <tr><td>NestJS (Express platform)</td><td>2,847</td><td>3,132</td><td>2,621</td><td>2,421</td><td>3,463</td><td>1,870</td><td>779</td><td>172</td></tr>
            <tr><td>NestJS (Fastify platform)</td><td>7,765</td><td>9,451</td><td>6,883</td><td>5,498</td><td>10,720</td><td>3,010</td><td>833</td><td>176</td></tr>
            <tr><td>Next.js</td><td>1,037</td><td>1,186</td><td>1,045</td><td>1,054</td><td>1,120</td><td>7,997</td><td>741</td><td>158</td></tr>
            <tr><td>SvelteKit</td><td>2,958</td><td>3,331</td><td>2,642</td><td>2,638</td><td>3,763</td><td>4,286</td><td>314</td><td>132</td></tr>
            <tr><td>React Router</td><td>1,266</td><td>1,372</td><td>1,385</td><td>1,391</td><td>1,400</td><td>1,705</td><td>492</td><td>152</td></tr>
            <tr><td>Astro</td><td>1,969</td><td>2,091</td><td>1,705</td><td>1,681</td><td>2,463</td><td>2,084</td><td>481</td><td>163</td></tr>
          </tbody>
        </table>
      </div>
      <ul className="perf-intro">
        <li>
          Sekhem and the Vite engine serve the same production code, so their request numbers match within the run-to-run spread on
          both machines; only the build differs (Mac 531 ms against 646 ms for this one API app, Oracle 888 ms against 1,326 ms).
        </li>
        <li>
          On the Mac with Node 22 Devora.js answered the JSON list at 27,208 requests a second against 12,204 for Express, 5,095
          for Next.js and 16,661 for SvelteKit, and is behind Fastify (34,250) and Hono (33,399), whose ranges lie above
          Devora.js's. On the authenticated GET Fastify and Hono were about 70,000 against 41,098. For the one async step the
          ranges of Devora.js, Fastify and Hono overlap, which is a tie. A likely reason, not isolated by a measurement: its request path
          does more work for each request (host check, security headers, session and CSRF handling, which are on by default). We
          did not measure it with those off in this round, so this is an explanation, not a result.
        </li>
        <li>
          Node matters for these ranks: on Node 24 (Mac, three rounds) Express reached 28,500 on the JSON list and 51,431 on the
          authenticated GET, which is level with or ahead of Devora.js (28,652 and 44,900) there, so the Node 22 gap to Express
          is not a property of Devora.js alone. Per-Node request tables are in the raw JSON; the table above is Node 22 only.
        </li>
        <li>
          Not measured: Nuxt (no Nuxt app of this API was written), Bun, Node 20, the SSR page, static file, streaming, ISR hit,
          CRUD and WebSocket scenarios, and install time per package manager.
        </li>
      </ul>

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
