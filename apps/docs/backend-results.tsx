// The API-route scenarios (D to G) on /performance. Every number comes from data/backend-benchmarks.json, a
// copy of the devora.js repo's benchmarks/results/backend-latest.json (scripts/sync-benchmarks.mjs). A
// difference inside the run-to-run spread is a tie (bench-compare.ts).
import backend from "./data/backend-benchmarks.json";
import { join, judge, point } from "./bench-compare.js";

type Fw = (typeof backend.frameworks)[keyof typeof backend.frameworks];
const FWS = Object.entries(backend.frameworks).map(([key, f]) => ({ key, ...(f as Fw) }));
const num = (n: number) => Math.round(n).toLocaleString("en-US");

const SCENARIOS = [
  { id: "items", label: "D. JSON list", what: "GET /api/items: a JSON list of 100 items" },
  { id: "me", label: "E. Authenticated GET", what: "GET /api/me with a Bearer token: a session lookup, then JSON" },
  { id: "postValid", label: "F1. POST, valid body", what: "POST /api/items with a valid JSON body (201)" },
  { id: "postInvalid", label: "F2. POST, invalid body", what: "POST /api/items with an invalid body (422)" },
  { id: "slow", label: "G. One async step", what: "GET /api/slow: one awaited 2 ms timer, then JSON" },
] as const;

type Load = { rps: { median: number; min: number; max: number }; p99: { median: number } };
const load = (f: Fw, id: string) => (f as unknown as { load: Record<string, Load> }).load[id]!;

export const BACKEND_CSS = `
  .be-wrap { overflow-x: auto; border: 1px solid var(--devora-border); border-radius: var(--devora-radius); margin: 0.5rem 0 1.25rem; }
  .be-table { width: 100%; min-width: 560px; border-collapse: collapse; font-size: 0.85rem; }
  .be-table th, .be-table td { text-align: left; padding: 0.45rem 0.7rem; border-bottom: 1px solid var(--devora-border); }
  .be-table th { font-size: 0.75rem; color: var(--devora-fg-muted); background: var(--devora-card); }
  .be-table td.num, .be-table th.num { text-align: right; font-variant-numeric: tabular-nums; }
  .be-table tr.be-devora td { background: color-mix(in srgb, var(--devora-accent-from) 8%, transparent); font-weight: 600; }
  .be-verdict { margin: 0 0 0.5rem; }
`;

export function BackendResults() {
  const devora = FWS.find((f) => f.key === "devora-api")!;
  return (
    <>
      {SCENARIOS.map((sc) => {
        const rows = FWS.map((f) => ({ f, l: load(f, sc.id) })).sort((a, b) => b.l.rps.median - a.l.rps.median);
        const d = load(devora, sc.id);
        const v = judge(
          point(d.rps.median, d.rps),
          FWS.filter((f) => f.key !== "devora-api").map((f) => ({ name: f.name, point: point(load(f, sc.id).rps.median, load(f, sc.id).rps) })),
          "higher"
        );
        const verdict =
          v.kind === "first"
            ? "Devora.js is ahead of every other framework here."
            : v.kind === "tie"
              ? `Devora.js is level, within the run-to-run spread, with ${join(v.with)}.`
              : `Devora.js is behind ${v.leader} and others beyond the spread.`;
        return (
          <section key={sc.id} aria-labelledby={`be-${sc.id}`}>
            <h3 id={`be-${sc.id}`}>{sc.label}</h3>
            <p className="be-verdict">
              {sc.what}. {verdict}
            </p>
            <div className="be-wrap" role="region" aria-label={`${sc.label} results`} tabIndex={0}>
              <table className="be-table">
                <thead>
                  <tr>
                    <th scope="col">Framework</th>
                    <th scope="col" className="num">Requests/s, median (min–max)</th>
                    <th scope="col" className="num">p99</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ f, l }) => (
                    <tr key={f.key} className={f.key === "devora-api" ? "be-devora" : undefined}>
                      <th scope="row">{f.name} <small>{f.version}</small></th>
                      <td className="num">{num(l.rps.median)} ({num(l.rps.min)}–{num(l.rps.max)})</td>
                      <td className="num">{l.p99.median} ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </>
  );
}
