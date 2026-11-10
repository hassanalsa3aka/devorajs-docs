// The engine and Node-version results on /performance: build time and memory per Node line, the request scenarios for Devora.js
// with Vite and with Sekhem next to the other frameworks, and the dev server. Every number comes from data/engines-bench.json,
// written by scripts/sync-engine-bench.mjs from the devora.js repository's benchmarks/results/. A difference inside the run-to-run
// spread is a tie (bench-compare.ts); "first" appears only where a table row shows it for that exact scenario.
import current from "./data/engines-bench.json";
import history from "./data/engines-bench-history.json";
import { join, judge, point } from "./bench-compare.js";

type Bench = typeof current;
type Spread = { median: number; min: number; max: number };
type Row = {
  key: string;
  name: string;
  scenarios: Record<string, { rps: Spread; p99: number } | null>;
  buildMs: number | null;
  startMs: number | null;
  idleMb: number | null;
};
type Machine = { machine: { cpu: string; cores: number; memoryGb: number; os: string; node: string; config: { loadRuns: number; loadSeconds: number; warmupSeconds: number; connections: number }; loadAvgAtStart?: number }; rows: Row[] };

const num = (n: number) => Math.round(n).toLocaleString("en-US");
const sec = (ms: number) => `${(ms / 1000).toFixed(2)} s`;
const SCENARIOS = [
  { id: "items", label: "JSON list" },
  { id: "me", label: "Authenticated GET" },
  { id: "postValid", label: "POST, valid body" },
  { id: "postInvalid", label: "POST, invalid body" },
  { id: "slow", label: "One async step" },
] as const;
const DEVORA_KEYS = ["devora-vite", "devora-sekhem"];
const LABEL: Record<string, string> = { vite6: "Vite 6", vite7: "Vite 7", vite8: "Vite 8", sekhem: "Sekhem" };
const shortName = (r: Row) => (r.key === "devora-vite" ? "Devora.js with Vite" : r.key === "devora-sekhem" ? "Devora.js with Sekhem" : r.name);

export const ENGINE_CSS = `
  .eb-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr)); gap: 1rem; margin: 1rem 0 1.5rem; }
  .eb-card { border: 1px solid var(--devora-border); border-radius: var(--devora-radius); background: var(--devora-card); padding: 1rem 1.1rem; }
  .eb-card h3 { margin: 0 0 0.25rem; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.04em; color: var(--devora-fg-muted); }
  .eb-big { font-size: 1.7rem; font-weight: 700; line-height: 1.15; font-variant-numeric: tabular-nums; }
  .eb-card p { margin: 0.4rem 0 0; font-size: 0.875rem; color: var(--devora-fg-muted); }
  .eb-note { border-left: 3px solid var(--devora-accent-from); padding: 0.1rem 0 0.1rem 0.9rem; margin: 1rem 0; max-width: 46rem; }
  .eb-note.eb-warn { border-left-color: #c2410c; }
  .eb-note strong:first-child { display: block; margin-bottom: 0.2rem; }
  .eb-cell { position: relative; white-space: nowrap; }
  .eb-bar { position: absolute; left: 0; bottom: 0; height: 3px; border-radius: 2px; background: color-mix(in srgb, var(--devora-accent-from) 55%, transparent); }
  .eb-best { font-weight: 700; }
  .eb-sub { display: block; font-size: 0.72rem; color: var(--devora-fg-muted); font-weight: 400; }
  .eb-machine summary { cursor: pointer; font-weight: 600; padding: 0.4rem 0; }
  .eb-method { max-width: 46rem; }
  .eb-method li { margin: 0.35rem 0; }
  @media (max-width: 640px) { .eb-big { font-size: 1.4rem; } }
`;

function BuildTable({ bench, machine, label }: { bench: Bench; machine: "mac" | "oracle"; label: string }) {
  const lines = Object.entries(bench.build[machine] as Record<string, { runs: number; variants: Record<string, { ms: number; min: number; max: number; rssMb: number; outputKb: number }> }>).sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }));
  const keys = ["vite6", "vite7", "vite8", "sekhem"].filter((k) => lines.some(([, l]) => l.variants[k]) || k === "sekhem");
  return (
    <>
      <h3>{label}</h3>
      <div className="be-wrap" role="region" aria-label={`Build time on ${label}`} tabIndex={0}>
        <table className="be-table">
          <thead>
            <tr>
              <th scope="col">Node</th>
              {keys.map((k) => (
                <th key={k} scope="col" className="num">{LABEL[k]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lines.map(([node, { variants }]) => {
              const best = Math.min(...keys.filter((k) => variants[k]).map((k) => variants[k]!.ms));
              const worst = Math.max(...keys.filter((k) => variants[k]).map((k) => variants[k]!.ms));
              return (
                <tr key={node}>
                  <th scope="row">{node}</th>
                  {keys.map((k) => {
                    const v = variants[k];
                    if (!v) return <td key={k} className="num">{k === "sekhem" ? "refuses (needs 22.15)" : "not run"}</td>;
                    return (
                      <td key={k} className={`num eb-cell${k === "sekhem" ? " " : ""}`}>
                        <span className={v.ms === best ? "eb-best" : undefined}>{sec(v.ms)}</span>
                        <span className="eb-sub">{num(v.rssMb)} MB peak</span>
                        <span className="eb-bar" style={{ width: `${Math.max(6, (v.ms / worst) * 100)}%` }} aria-hidden="true" />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

function RequestTable({ id, title, data }: { id: string; title: string; data: Machine }) {
  const rows = data.rows;
  const best = Object.fromEntries(SCENARIOS.map((s) => [s.id, Math.max(...rows.map((r) => r.scenarios[s.id]?.rps.median ?? 0))]));
  const m = data.machine;
  const ordered = [...rows].sort((a, b) => (b.scenarios.items?.rps.median ?? 0) - (a.scenarios.items?.rps.median ?? 0));
  return (
    <details className="eb-machine" open={id === "mac"}>
      <summary>{title}</summary>
      <p className="perf-intro">
        {m.cpu}, {m.cores} cores, {m.memoryGb} GB, {m.os}, Node {m.node}. {m.config.connections} connections, {m.config.warmupSeconds} s warm-up, {m.config.loadRuns} runs of {m.config.loadSeconds} s,
        medians. One-minute load average when the run started: {m.loadAvgAtStart?.toFixed(2) ?? "not recorded"}.
      </p>
      <div className="be-wrap" role="region" aria-label={`Request scenarios on ${title}`} tabIndex={0}>
        <table className="be-table">
          <thead>
            <tr>
              <th scope="col">Framework</th>
              {SCENARIOS.map((s) => (
                <th key={s.id} scope="col" className="num">{s.label}<span className="eb-sub">req/s</span></th>
              ))}
              <th scope="col" className="num">Build</th>
              <th scope="col" className="num">Start</th>
              <th scope="col" className="num">Idle memory</th>
            </tr>
          </thead>
          <tbody>
            {ordered.map((r) => (
              <tr key={r.key} className={DEVORA_KEYS.includes(r.key) ? "be-devora" : undefined}>
                <th scope="row">{shortName(r)}</th>
                {SCENARIOS.map((s) => {
                  const v = r.scenarios[s.id];
                  return (
                    <td key={s.id} className="num eb-cell">
                      {v ? <span className={v.rps.median === best[s.id] ? "eb-best" : undefined}>{num(v.rps.median)}</span> : "-"}
                      {v ? <span className="eb-bar" style={{ width: `${Math.max(3, (v.rps.median / (best[s.id] as number)) * 100)}%` }} aria-hidden="true" /> : null}
                    </td>
                  );
                })}
                <td className="num">{r.buildMs !== null ? `${num(r.buildMs)} ms` : "-"}</td>
                <td className="num">{r.startMs !== null ? `${num(r.startMs)} ms` : "-"}</td>
                <td className="num">{r.idleMb !== null ? `${num(r.idleMb)} MB` : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

/** Where Devora.js (Sekhem row) is ahead of, level with or behind the others, by the spread rule. */
function Verdicts({ data, id, title }: { data: Machine; id: string; title: string }) {
  const dev = data.rows.find((r) => r.key === "devora-sekhem");
  if (!dev) return null;
  const others = data.rows.filter((r) => !DEVORA_KEYS.includes(r.key));
  const lines: { label: string; kind: "first" | "tie" | "behind"; text: string }[] = [];
  for (const s of SCENARIOS) {
    const d = dev.scenarios[s.id];
    if (!d) continue;
    const v = judge(point(d.rps.median, d.rps), others.filter((o) => o.scenarios[s.id]).map((o) => ({ name: o.name, point: point(o.scenarios[s.id]!.rps.median, o.scenarios[s.id]!.rps) })), "higher");
    lines.push({
      label: s.label,
      kind: v.kind as "first" | "tie" | "behind",
      text: v.kind === "first" ? "ahead of every other framework in this table" : v.kind === "tie" ? `level, within the run-to-run spread, with ${join(v.with)}` : `behind ${v.leader} and others beyond the spread`,
    });
  }
  const build = judge(point(dev.buildMs ?? 0), others.filter((o) => o.buildMs !== null).map((o) => ({ name: o.name, point: point(o.buildMs as number) })), "lower");
  const idle = judge(point(dev.idleMb ?? 0), others.filter((o) => o.idleMb !== null).map((o) => ({ name: o.name, point: point(o.idleMb as number) })), "lower");
  return (
    <div className="eb-note eb-warn" id={`not-first-${id}`}>
      <strong>Where Devora.js (with Sekhem) is not first: {title}</strong>
      <ul>
        {lines.map((l) => (
          <li key={l.label}>
            <strong>{l.label}</strong>: {l.text}.
          </li>
        ))}
        <li>
          <strong>Build time</strong>: {build.kind === "first" ? "lowest in this table" : `${num(dev.buildMs ?? 0)} ms, not the lowest: ${build.kind === "tie" ? `level with ${join(build.with)}` : `${build.leader} and others are lower`}. The lower rows are apps with no build step or a trivial one (a plain Node server, Fastify, Hono), so they have little to compile`}.
        </li>
        <li>
          <strong>Idle memory</strong>: {idle.kind === "first" ? "lowest in this table" : `${num(dev.idleMb ?? 0)} MB, not the lowest: ${idle.kind === "tie" ? `level with ${join(idle.with)}` : `${idle.leader} and others use less`}`}.
        </li>
      </ul>
    </div>
  );
}

function RunSection({ bench, idp, heading, lead, history: isHistory }: { bench: Bench; idp: string; heading: string; lead: string; history?: boolean }) {
  const mac = bench.requests.mac as unknown as Machine;
  const oracle = bench.requests.oracle as unknown as Machine;
  const macBuild = (bench.build.mac as Record<string, { variants: Record<string, { ms: number; rssMb: number; outputKb: number }> }>)[bench.requestsNode];
  const sek = macBuild?.variants.sekhem;
  const vv = isHistory ? macBuild?.variants.vite6 : macBuild?.variants.vite8;
  const vvName = isHistory ? "Vite 6" : "Vite 8";
  const devMac = (bench.dev as Record<string, Record<string, { warmInteractiveMs: number; hmrMs: number; serverEditMs: number; rssMb: number; readyMs: number }>>)[bench.requestsNode];
  const devSek = devMac?.own;
  const devVite = devMac?.vite;
  const sekRow = mac.rows.find((r) => r.key === "devora-sekhem");
  const items = sekRow?.scenarios.items;
  return (
    <>
      <h2 id={`${idp}engines`}>{heading}</h2>
      <p className="devora-lead perf-intro">{lead}</p>
      <div className="eb-cards">
        {sek && vv ? (
          <div className="eb-card">
            <h3>Build time, four apps</h3>
            <div className="eb-big">{sec(sek.ms)}</div>
            <p>
              Sekhem on Node {bench.requestsNode}, Mac. {vvName}: {sec(vv.ms)}. {sek.ms < vv.ms ? "Lower than" : "Not lower than"} {vvName} in this table.
            </p>
          </div>
        ) : null}
        {sek && vv ? (
          <div className="eb-card">
            <h3>Peak build memory</h3>
            <div className="eb-big">{num(sek.rssMb)} MB</div>
            <p>
              Sekhem, whole process tree. {vvName}: {num(vv.rssMb)} MB. Build output: {(sek.outputKb / 1024).toFixed(1)} MB against {(vv.outputKb / 1024).toFixed(1)} MB.
            </p>
          </div>
        ) : null}
        {devSek && devVite ? (
          <div className="eb-card">
            <h3>Dev server, first interactive page</h3>
            <div className="eb-big">{num(devSek.warmInteractiveMs)} ms</div>
            <p>
              Sekhem, small app, warm. {isHistory ? "Vite 6" : "Vite 8"}: {num(devVite.warmInteractiveMs)} ms. A component edit shows after {devSek.hmrMs} ms with Sekhem, {devVite.hmrMs} ms with Vite's default settings.
            </p>
          </div>
        ) : null}
        {items ? (
          <div className="eb-card">
            <h3>JSON list, Mac</h3>
            <div className="eb-big">{num(items.rps.median)} req/s</div>
            <p>Devora.js with Sekhem. See below where it is and is not first; the Vite engine row is within the spread of this one.</p>
          </div>
        ) : null}
      </div>

      <h2 id={`${idp}build-by-node`}>Build time and memory by Node line</h2>
      <p className="perf-intro">
        The four apps of the repository, built from a clean output folder, median of five runs, peak memory of the whole process tree. A bar
        under a number is that build against the slowest in its row.
      </p>
      <BuildTable bench={bench} machine="mac" label="Mac (Apple M5)" />
      <BuildTable bench={bench} machine="oracle" label="Oracle (Neoverse-N1, 2 vCPU)" />
      {isHistory ? (
      <div className="eb-note">
          <strong>What a newer Node changes</strong>
          On the Mac, Node 24 and 26 built 12% and 14% faster than Node 22 with Vite 6 (the five-run ranges overlap slightly) and 7% and 10% faster with
          Sekhem (the ranges do not overlap). Memory differences between Node lines are within the spread. Output size was 18.9 MB for every Vite build and 9.7 MB for Sekhem; why
          was not investigated.
        </div>
      ) : null}

      <h2 id={`${idp}request-scenarios`}>Request scenarios, Node {bench.requestsNode}</h2>
      <p className="perf-intro">
        One API implemented in every app (<code>benchmarks/backend/CONTRACT.md</code>), production builds, a fresh server per round, rounds alternating between apps. The two
        Devora.js rows run this commit's CLI and differ only in the build engine. The Mac and Oracle tables are separate and not comparable with each other. The longest bar in a
        column is the best result in it.
      </p>
      <RequestTable id={isHistory ? "h-mac" : "mac"} title="Mac (Apple M5)" data={mac} />
      <Verdicts data={mac} id={`${idp}mac`} title="Mac" />
      <RequestTable id="oracle" title="Oracle (Neoverse-N1, 2 vCPU, Ubuntu 24.04)" data={oracle} />
      <Verdicts data={oracle} id={`${idp}oracle`} title="Oracle" />
      {isHistory ? (
      <div className="eb-note">
          <strong>Why Devora.js is behind the lightest servers</strong>
          A likely reason, not isolated by a measurement: its request path does more work for each request (host check, security headers, session and CSRF handling, all on by
          default). We did not measure it with those off, so this is an explanation, not a result. On the Mac with Node 24 (three rounds) Express reached 28,500 on the JSON list and
          51,431 on the authenticated GET, level with or ahead of Devora.js (28,652 and 44,900), so the Node 22 gap to Express is not a property of Devora.js alone.
        </div>
      ) : null}

      {devSek && devVite ? (
        <>
          <h2 id={`${idp}dev-server`}>Dev server, small app (Mac, Node {bench.requestsNode})</h2>
          <div className="be-wrap" role="region" aria-label="Dev server results" tabIndex={0}>
            <table className="be-table">
              <thead>
                <tr>
                  <th scope="col">Engine</th>
                  <th scope="col" className="num">Ready</th>
                  <th scope="col" className="num">First page</th>
                  <th scope="col" className="num">Interactive</th>
                  <th scope="col" className="num">Component edit</th>
                  <th scope="col" className="num">Server edit</th>
                  <th scope="col" className="num">Memory</th>
                </tr>
              </thead>
              <tbody>
                {(
                  [
                    ["Sekhem", devMac!.own, true],
                    [isHistory ? "Vite 6, default settings" : "Vite 8, default settings", devMac!.vite, false],
                    [isHistory ? "Vite 6, tuned file watching" : "Vite 8, tuned file watching", devMac!["vite-tuned"], false],
                  ] as const
                ).map(([name, d, isDev]) => (
                  <tr key={name} className={isDev ? "be-devora" : undefined}>
                    <th scope="row">{name}</th>
                    <td className="num">{num(d!.readyMs)} ms</td>
                    <td className="num">{num((d as unknown as { warmHtmlMs: number }).warmHtmlMs)} ms</td>
                    <td className="num">{num(d!.warmInteractiveMs)} ms</td>
                    <td className="num">{num(d!.hmrMs)} ms</td>
                    <td className="num">{d!.serverEditMs.toFixed(0)} ms</td>
                    <td className="num">{num(d!.rssMb)} MB</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="perf-intro">
            Warm start, median of five, includes the CLI's own start-up.{isHistory ? " Idle CPU was a measurement artefact in the first run (the window opened right after the last edit); settled, Sekhem and Vite both idle at 0.1%. At 1000 modules a server-side edit took 17 ms with Sekhem and 17 ms with tuned Vite 8, a tie." : ""}
          </p>
        </>
      ) : null}

      <details className="eb-machine">
        <summary>How this was measured, and what it does not show</summary>
        <ul className="eb-method">
          <li>Run on 9 November 2026. Raw JSON and the harness: <code>benchmarks/results/</code> in the repository; reproduce with <code>node benchmarks/setup-devora-local.mjs</code> and <code>node benchmarks/run-backend.mjs</code>; builds with <code>pnpm run measure:build</code> (Vite 7 and 8 through <code>DEVORA_VITE7_DIR</code> and <code>DEVORA_VITE8_DIR</code>).</li>
          <li>Mac: one-minute load average was {mac.machine.loadAvgAtStart?.toFixed(2)} when the Node {bench.requestsNode} run started, from earlier work.</li>
          <li>Oracle: an Ollama service was running and idle; the load generator shares the two CPUs with the server; the frameworks ran in two passes (Next.js kept its port after being stopped, so the harness now ends a server that has not let go after three seconds).</li>
          <li>Localhost has no network latency. The pages are small on purpose. Idle memory includes the <code>npm start</code> wrapper for every framework.</li>
          <li>Not measured: Nuxt (no app of this API was written), Bun, Node 20 for the request scenarios, the SSR page, static file, streaming, ISR hit, CRUD and WebSocket scenarios, install times.</li>
        </ul>
      </details>
    </>
  );
}

export function EngineResults() {
  const node = current.requestsNode;
  return (
    <>
      <RunSection
        bench={current}
        idp=""
        heading={`Devora.js with Vite 8 and with Sekhem on Node ${node}, against ten other frameworks`}
        lead="Devora.js builds with Vite 8 by default; Sekhem is the experimental engine of our own. Every framework ran on the same Node version. This section measures both engines on two machines and says where each result is not first."
      />
      <details className="eb-machine">
        <summary>Earlier measurements: Node 20, 22, 24 and 26 with Vite 6, 7 and 8, before the move to Vite 8 as the declared Vite</summary>
        <RunSection
          bench={history as unknown as Bench}
          idp="h-"
          heading={`Earlier run on Node ${history.requestsNode}`}
          lead="The first run of this suite (Vite 6.4.5 as the Vite engine, other Vite majors through a loader override). Kept so the change between the two runs is visible."
          history
        />
      </details>
    </>
  );
}
