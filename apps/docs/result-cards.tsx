// "All results" on /performance, as one small card per measurement instead of one wide table.
// Each card ranks every framework for that measurement, best first, with a bar scaled to the best value, so a reader sees
// the order at a glance on a phone as well as on a desktop. Devora.js rows are tinted and labelled by name, never by colour
// alone; the first row of every card is the best result and carries rank 1. The plain table is kept under a disclosure
// for anyone who wants to read or copy every number. Nothing here is typed by hand: the rows come from the benchmark data.
import type { ReactNode } from "react";

export interface CardRow {
  label: string;
  better: "lower" | "higher";
}
export interface CardFramework {
  key: string;
  name: string;
  version: string;
}
export interface Standing {
  kind: "first" | "tie" | "behind";
  text: string;
}

export const RESULT_CARDS_CSS = `
  .rc-groups { display: grid; gap: 2rem; margin: 1rem 0 1.5rem; }
  .rc-group h3 { margin: 0 0 0.2rem; font-size: 1rem; }
  .rc-group > p { margin: 0 0 0.8rem; font-size: 0.85rem; color: var(--devora-fg-muted); max-width: 46rem; }
  .rc-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 21rem), 1fr)); gap: 1rem; }
  .rc-card { border: 1px solid var(--devora-border); border-radius: var(--devora-radius); background: var(--devora-card); padding: 0.9rem 1rem 0.7rem; min-width: 0; }
  .rc-head { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 0.3rem 0.75rem; margin: 0 0 0.15rem; }
  .rc-title { margin: 0; font-size: 0.95rem; font-weight: 650; }
  .rc-dir { font-size: 0.72rem; color: var(--devora-fg-muted); white-space: nowrap; }
  .rc-pill { display: inline-block; margin: 0.15rem 0 0.6rem; padding: 0.1rem 0.55rem; border-radius: 999px; font-size: 0.72rem; font-weight: 600; border: 1px solid var(--devora-border); color: var(--devora-fg-muted); }
  .rc-pill.rc-first { color: #15803d; border-color: color-mix(in srgb, #16a34a 45%, transparent); background: color-mix(in srgb, #16a34a 9%, transparent); }
  .rc-pill.rc-tie { color: #a16207; border-color: color-mix(in srgb, #ca8a04 45%, transparent); background: color-mix(in srgb, #ca8a04 9%, transparent); }
  .rc-pill.rc-behind { color: #b91c1c; border-color: color-mix(in srgb, #dc2626 40%, transparent); background: color-mix(in srgb, #dc2626 7%, transparent); }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme=light]) .rc-pill.rc-first { color: #4ade80; }
    :root:not([data-theme=light]) .rc-pill.rc-tie { color: #facc15; }
    :root:not([data-theme=light]) .rc-pill.rc-behind { color: #f87171; }
  }
  :root[data-theme=dark] .rc-pill.rc-first { color: #4ade80; }
  :root[data-theme=dark] .rc-pill.rc-tie { color: #facc15; }
  :root[data-theme=dark] .rc-pill.rc-behind { color: #f87171; }
  .rc-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; table-layout: fixed; }
  .rc-table caption { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
  .rc-table th, .rc-table td { padding: 0.32rem 0; border: 0; vertical-align: middle; text-align: left; }
  .rc-col-rank { width: 1.9rem; }
  .rc-col-name { width: 8.2rem; }
  .rc-col-val { width: 5.8rem; }
  .rc-table .rc-rank { color: var(--devora-fg-muted); font-variant-numeric: tabular-nums; font-size: 0.75rem; }
  .rc-table .rc-name { font-weight: 500; padding-right: 0.5rem; overflow-wrap: anywhere; }
  .rc-table .rc-name small { display: block; font-weight: 400; font-size: 0.7rem; color: var(--devora-fg-muted); }
  .rc-table .rc-barcell { padding-right: 0.6rem; }
  .rc-table .rc-val { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; font-weight: 600; }
  .rc-table .rc-val small { display: block; font-weight: 400; font-size: 0.7rem; color: var(--devora-fg-muted); }
  .rc-track { display: block; height: 0.5rem; border-radius: 999px; background: color-mix(in srgb, var(--devora-fg-muted) 14%, transparent); overflow: hidden; }
  .rc-bar { display: block; height: 100%; border-radius: 999px; background: color-mix(in srgb, var(--devora-fg-muted) 55%, transparent); }
  .rc-table tr.rc-devora .rc-bar { background: linear-gradient(90deg, var(--devora-accent-from), var(--devora-accent-to, var(--devora-accent-from))); }
  .rc-table tr.rc-devora th, .rc-table tr.rc-devora td { background: color-mix(in srgb, var(--devora-accent-from) 8%, transparent); }
  .rc-table tr.rc-devora .rc-rank { padding-left: 0.35rem; }
  .rc-table tr.rc-devora .rc-val { padding-right: 0.35rem; }
  .rc-table tr.rc-devora td:first-child, .rc-table tr.rc-devora th:first-child { border-top-left-radius: 6px; border-bottom-left-radius: 6px; }
  .rc-table tr.rc-devora td:last-child { border-top-right-radius: 6px; border-bottom-right-radius: 6px; }
  .rc-table tr.rc-best .rc-main::after { content: " ★"; font-size: 0.7rem; color: var(--devora-fg-muted); }
  .rc-plain { margin-top: 1.25rem; }
  .rc-plain summary { cursor: pointer; font-weight: 600; font-size: 0.9rem; padding: 0.4rem 0; }
  @media (max-width: 420px) {
    .rc-col-name { width: 6.6rem; }
    .rc-col-val { width: 5.2rem; }
  }
`;

const GROUPS: { title: string; note: string; labels: string[] }[] = [
  { title: "Build and start", note: "Cold: output and caches deleted first. Warm: a second build right after.", labels: ["Build, cold", "Build, warm", "Server start"] },
  { title: "Requests per second", note: "50 connections, 10 s runs. The 99th percentile latency (p99) is under each value.", labels: ["Static page, req/s", "SSR page, req/s", "Form POST, req/s"] },
  { title: "Memory and the browser", note: "Idle memory is read 2 s after start. JavaScript is what the page loads, gzip.", labels: ["Idle memory", "JS, SSR page (gzip)", "JS, static page (gzip)", "Counter responds after"] },
];

function splitValue(shown: string): { main: string; sub?: string } {
  const m = shown.match(/^(.*?)\s*\((p99 [^)]*)\)$/);
  return m ? { main: m[1]!, sub: m[2] } : { main: shown };
}

export function ResultCards<R extends CardRow, F extends CardFramework>({
  rows,
  frameworks,
  value,
  show,
  standing,
  plainTable,
}: {
  rows: R[];
  frameworks: F[];
  value: (row: R, f: F) => number;
  show: (row: R, f: F) => string;
  standing: (row: R) => Standing;
  plainTable: ReactNode;
}) {
  const byLabel = new Map(rows.map((r) => [r.label, r]));
  return (
    <>
      <div className="rc-groups">
        {GROUPS.map((group) => (
          <section className="rc-group" key={group.title} aria-label={group.title}>
            <h3>{group.title}</h3>
            <p>{group.note}</p>
            <div className="rc-grid">
              {group.labels
                .map((l) => byLabel.get(l))
                .filter((r): r is R => r !== undefined)
                .map((row) => {
                  const ranked = frameworks
                    .map((f) => ({ f, v: value(row, f) }))
                    .sort((a, b) => (row.better === "lower" ? a.v - b.v : b.v - a.v));
                  const best = ranked[0]!.v;
                  const worstScale = Math.max(...ranked.map((r) => r.v));
                  const st = standing(row);
                  return (
                    <article className="rc-card" key={row.label}>
                      <div className="rc-head">
                        <h4 className="rc-title">{row.label.replace(/, req\/s$/, "").replace(" (gzip)", "")}</h4>
                        <span className="rc-dir">{row.better === "lower" ? "↓ lower is better" : "↑ higher is better"}</span>
                      </div>
                      <span className={`rc-pill rc-${st.kind}`}>{st.text}</span>
                      <table className="rc-table">
                        <caption>{row.label}: {row.better} is better, best first</caption>
                        <colgroup>
                          <col className="rc-col-rank" />
                          <col className="rc-col-name" />
                          <col />
                          <col className="rc-col-val" />
                        </colgroup>
                        <thead className="bw-sr">
                          <tr><th scope="col">Rank</th><th scope="col">Framework</th><th scope="col">Bar</th><th scope="col">Result</th></tr>
                        </thead>
                        <tbody>
                          {ranked.map(({ f, v }, i) => {
                            const width = row.better === "lower" ? (best === 0 ? 100 : (best / (v || best)) * 100) : (v / (worstScale || 1)) * 100;
                            const { main, sub } = splitValue(show(row, f));
                            const devora = f.key.startsWith("devora");
                            return (
                              <tr key={f.key} className={`${devora ? "rc-devora" : ""} ${i === 0 ? "rc-best" : ""}`.trim() || undefined}>
                                <td className="rc-rank">{i + 1}</td>
                                <th scope="row" className="rc-name">
                                  {f.name.replace(/ \((Vite 8|Sekhem)\)$/, "")}
                                  {devora ? <small>{f.name.includes("Sekhem") ? "Sekhem engine" : "Vite 8 engine"}</small> : <small>{f.version}</small>}
                                </th>
                                <td className="rc-barcell">
                                  <span className="rc-track" aria-hidden="true">
                                    <span className="rc-bar" style={{ width: `${Math.max(2, Math.min(100, width))}%` }} />
                                  </span>
                                </td>
                                <td className="rc-val">
                                  <span className="rc-main">{main}</span>
                                  {sub ? <small>{sub}</small> : null}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </article>
                  );
                })}
            </div>
          </section>
        ))}
      </div>
      <details className="rc-plain">
        <summary>Show every number in one plain table</summary>
        {plainTable}
      </details>
    </>
  );
}
