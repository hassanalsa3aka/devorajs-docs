// "Choose how each route renders": five cards (one per render mode) and a
// small matrix against other frameworks. One shared block, used on the
// Render modes page and at the top of /compare's Rendering section.
//
// Maturity labels come from evidence in the framework repo (tests, the
// verification notes, the CHANGELOG), not from how long a mode has existed:
//   Stable      — covered by integration tests and verified end to end
//   Limited     — works, with a stated restriction
//   Not verified on serverless — works under a long-lived Node server;
//                 the serverless behaviour has not been checked
// The matrix cells for other frameworks were each checked against that
// framework's own documentation on RENDER_MODES_CHECKED (see the sources).

import { StatusChip, type Status } from "./compare-matrix.js";

export const RENDER_MODES_CHECKED = "October 16, 2026";

type Maturity = "stable" | "limited" | "unverified";

const MATURITY: Record<Maturity, { icon: string; text: string }> = {
  stable: { icon: "✓", text: "Stable" },
  limited: { icon: "!", text: "Limited" },
  unverified: { icon: "?", text: "Not verified on serverless" },
};

const MODES: Array<{
  mode: string;
  does: string;
  when: string;
  setting: string;
  maturity: Maturity;
  limit: string;
}> = [
  {
    mode: "ssr",
    does: "The loader runs on every request and the page is rendered fresh.",
    when: "Per-user or per-request data, anything behind a login.",
    setting: 'export const renderMode = "ssr";',
    maturity: "stable",
    limit: "The default for a route that exports nothing (unless the app sets another default).",
  },
  {
    mode: "ssg",
    does: "Rendered once during devora build and served as static HTML.",
    when: "Content that does not change per request: docs, marketing, blog posts.",
    setting: 'export const renderMode = "ssg";',
    maturity: "stable",
    limit: "A dynamic route needs getStaticParams(). In dev it renders live per request; it is pre-rendered only by a production build.",
  },
  {
    mode: "csr",
    does: "The server sends an empty shell; the component mounts in the browser.",
    when: "Pages that only make sense in a browser, behind your own client data layer.",
    setting: 'export const renderMode = "csr";',
    maturity: "limited",
    limit: "The loader never runs, and the page needs the client bundle to show anything. Import from @devorajs/core/client.",
  },
  {
    mode: "isr",
    does: "Like ssg, but regenerated once a revalidate window has passed.",
    when: "Mostly static content that should refresh on a schedule.",
    setting: 'export const renderMode = "isr"; export const revalidate = { seconds: 3600 };',
    maturity: "unverified",
    limit: "Reliable under a long-lived Node server. On Vercel/Netlify the function's filesystem is not guaranteed to persist, so ongoing regeneration there has not been verified.",
  },
  {
    mode: "streaming",
    does: "The shell is sent at once; island content streams in as it resolves.",
    when: "A page with one slow section you do not want the whole response to wait for.",
    setting: 'export const renderMode = "streaming";',
    maturity: "limited",
    limit: "GET only (no action). Delivered as one buffered response on Netlify; not verified on a live deployment elsewhere.",
  },
];

type Cell = { status: Status; note: string };

const FRAMEWORKS = ["Next.js", "React Router", "SvelteKit", "Astro", "Devora.js"];

// Rows: modes. Columns: FRAMEWORKS (same order).
const MATRIX: Array<{ mode: string; cells: Cell[] }> = [
  {
    mode: "ssr",
    cells: [
      { status: "built", note: "Dynamic rendering of a route." },
      { status: "built", note: "ssr: true; an app-wide setting." },
      { status: "built", note: "The default; export const ssr per page." },
      { status: "built", note: "prerender = false per page, or output: 'server'." },
      { status: "built", note: "renderMode = \"ssr\" in the route file." },
    ],
  },
  {
    mode: "ssg",
    cells: [
      { status: "built", note: "Prerendered; generateStaticParams for dynamic routes." },
      { status: "built", note: "prerender() in config lists the URLs." },
      { status: "built", note: "export const prerender = true per page or layout." },
      { status: "built", note: "The default; prerender = true per page." },
      { status: "built", note: "renderMode = \"ssg\" and getStaticParams()." },
    ],
  },
  {
    mode: "csr",
    cells: [
      { status: "partial", note: "Client Components, or a single-page-app setup; not a per-route mode." },
      { status: "built", note: "ssr: false (SPA mode, app-wide); clientLoader per route." },
      { status: "built", note: "export const ssr = false per page or layout." },
      { status: "unverified", note: "Client islands exist; a whole-page client mode was not checked." },
      { status: "built", note: "renderMode = \"csr\"; the loader never runs." },
    ],
  },
  {
    mode: "isr",
    cells: [
      { status: "built", note: "export const revalidate = 60; per-instance cache unless you add a shared handler." },
      { status: "no", note: "Not described on the pages checked." },
      { status: "partial", note: "Only through adapter-vercel's isr option." },
      { status: "partial", note: "Only through the Vercel adapter's isr option." },
      { status: "built", note: "revalidate = { seconds }; not verified on serverless." },
    ],
  },
  {
    mode: "streaming",
    cells: [
      { status: "built", note: "Suspense and loading.js." },
      { status: "built", note: "Return promises from loaders; Await in Suspense." },
      { status: "built", note: "Promises from a server load; buffered where the platform cannot stream." },
      { status: "built", note: "HTML streaming in on-demand rendering." },
      { status: "built", note: "renderMode = \"streaming\"; GET only; buffered on Netlify." },
    ],
  },
];

const SOURCES: Array<[string, string]> = [
  ["Next.js: Incremental Static Regeneration", "https://nextjs.org/docs/app/guides/incremental-static-regeneration"],
  ["Next.js: Streaming", "https://nextjs.org/docs/app/guides/streaming"],
  ["React Router: Rendering strategies", "https://reactrouter.com/start/framework/rendering"],
  ["React Router: Streaming with Suspense", "https://reactrouter.com/how-to/suspense"],
  ["SvelteKit: Page options", "https://svelte.dev/docs/kit/page-options"],
  ["SvelteKit: Loading data (streaming)", "https://svelte.dev/docs/kit/load"],
  ["SvelteKit: adapter-vercel (ISR)", "https://svelte.dev/docs/kit/adapter-vercel"],
  ["Astro: On-demand rendering", "https://docs.astro.build/en/guides/on-demand-rendering/"],
  ["Astro: Vercel adapter (ISR)", "https://docs.astro.build/en/guides/integrations-guide/vercel/"],
];

export const RENDER_MODES_CSS = `
  .devora-page .rm-cards { padding: 0; margin-left: 0; margin-right: 0; }
  .rm-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin: 1.25rem 0 1.75rem; padding: 0; list-style: none; }
  .rm-card { min-width: 0; padding: 1.1rem 1.15rem; border: 1px solid var(--devora-border); border-radius: var(--devora-radius); background: var(--devora-card); display: flex; flex-direction: column; gap: 0.6rem; }
  .rm-card h3 { margin: 0; font-size: 1.05rem; }
  .rm-card p { margin: 0; font-size: 0.9rem; line-height: 1.55; color: var(--devora-fg-muted); }
  .rm-card pre { margin: 0; padding: 0.55rem 0.65rem; font-size: 0.78rem; line-height: 1.5; white-space: pre-wrap; overflow-wrap: anywhere; border: 1px solid var(--devora-border); border-radius: 8px; background: var(--devora-bg); }
  .rm-chip { align-self: flex-start; display: inline-flex; align-items: center; gap: 0.35rem; font-size: 0.75rem; font-weight: 600; padding: 0.15rem 0.55rem; border-radius: 999px; border: 1px solid var(--devora-border); color: var(--devora-fg); }
  .rm-chip-icon { font-weight: 700; }
  .rm-limits { margin-top: auto; font-size: 0.85rem; }
  .rm-limits summary { cursor: pointer; font-weight: 600; }
  .rm-limits summary:focus-visible { outline: 2px solid var(--devora-accent-from); outline-offset: 2px; border-radius: 4px; }
  .rm-limits p { margin-top: 0.4rem; }
  .rm-honest { margin: 0 0 1.25rem; font-size: 0.95rem; line-height: 1.65; color: var(--devora-fg-muted); }
  .rm-table-wrap { margin: 0 0 0.75rem; overflow-x: auto; }
  .rm-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
  .rm-table th, .rm-table td { text-align: left; vertical-align: top; padding: 0.6rem 0.65rem; border: 1px solid var(--devora-border); }
  .rm-table thead th { background: var(--devora-bg-elevated); font-weight: 700; }
  .rm-table .rm-us { background: color-mix(in srgb, var(--devora-accent-from) 7%, transparent); }
    .rm-note { display: block; color: var(--devora-fg-muted); margin-top: 0.15rem; line-height: 1.45; }
  .rm-sources { font-size: 0.8rem; color: var(--devora-fg-muted); line-height: 1.7; }
  .rm-sources a { color: var(--devora-fg-muted); text-decoration: underline; text-underline-offset: 2px; }
  @media (max-width: 1100px) {
    .rm-table thead { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
    .rm-table, .rm-table tbody, .rm-table tr, .rm-table th, .rm-table td { display: block; }
    .rm-table tr { margin-bottom: 0.9rem; border: 1px solid var(--devora-border); border-radius: var(--devora-radius); overflow: hidden; }
    .rm-table th, .rm-table td { border: 0; border-bottom: 1px solid var(--devora-border); }
    .rm-table tr > :last-child { border-bottom: 0; }
    .rm-table td::before { content: attr(data-label); display: block; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: var(--devora-fg-muted); margin-bottom: 0.15rem; }
  }
`;

/** The cards and the matrix. `limitsHref(mode)` links each "Limits" to the long explanation. */
export function RenderModesBlock({ headingId = "choose-render-mode", level = 2 }: { headingId?: string; level?: 2 | 3 }) {
  const H = level === 2 ? "h2" : "h3";
  const S = level === 2 ? "h3" : "h4";
  return (
    <section aria-labelledby={headingId}>
      <H id={headingId}>Choose how each route renders</H>
      <p className="rm-honest">
        Every route says how it renders, in its own file. Choosing a mode per route is not unique
        to Devora.js — the matrix below shows who else does it. The narrow claim here is only that
        the choice is one explicit line in the route file.
      </p>
      <ul className="rm-cards">
        {MODES.map((m) => {
          const lab = MATURITY[m.maturity];
          return (
            <li className="rm-card" key={m.mode}>
              <S><code>{m.mode}</code></S>
              <span className="rm-chip"><span className="rm-chip-icon" aria-hidden="true">{lab.icon}</span>{lab.text}</span>
              <p>{m.does}</p>
              <p><strong>Use it for:</strong> {m.when}</p>
              <pre><code>{m.setting}</code></pre>
              <details className="rm-limits">
                <summary>Limits</summary>
                <p>{m.limit}</p>
                <p><a href={`/render-modes#${m.mode}`}>Full explanation</a></p>
              </details>
            </li>
          );
        })}
      </ul>

      <S>Who else has it</S>
      <div className="rm-table-wrap">
        <table className="rm-table">
          <caption className="rm-sources" style={{ textAlign: "left", captionSide: "bottom", paddingTop: "0.5rem" }}>
            Checked against each framework's own documentation on {RENDER_MODES_CHECKED}; a cell says
            "Not verified" where that page was not checked.
          </caption>
          <thead>
            <tr>
              <th scope="col">Mode</th>
              {FRAMEWORKS.map((f) => (
                <th scope="col" key={f} className={f === "Devora.js" ? "rm-us" : undefined}>{f}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MATRIX.map((row) => (
              <tr key={row.mode}>
                <th scope="row"><code>{row.mode}</code></th>
                {row.cells.map((c, i) => (
                  <td key={FRAMEWORKS[i]} data-label={FRAMEWORKS[i]} className={FRAMEWORKS[i] === "Devora.js" ? "rm-us" : undefined}>
                    <StatusChip status={c.status} />
                    <span className="rm-note">{c.note}</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="rm-sources">
        Sources:{" "}
        {SOURCES.map(([label, href], i) => (
          <span key={href}>
            <a href={href} target="_blank" rel="noopener noreferrer">{label}</a>
            {i < SOURCES.length - 1 ? " · " : ""}
          </span>
        ))}
        . Next.js's ssr, ssg and csr cells are read from the two Next.js pages above and the
        Next.js docs they link to.
      </p>
    </section>
  );
}
