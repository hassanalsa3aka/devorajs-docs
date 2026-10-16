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

import { Matrix, type Framework, type MatrixGroup, type Status } from "./compare-matrix.js";
import { LOGO_ASTRO, LOGO_DEVORA, LOGO_NEXTJS, LOGO_REACT_ROUTER, LOGO_SVELTE } from "./compare-table.js";

export const RENDER_MODES_CHECKED = "October 16, 2026";

type Maturity = "stable" | "limited" | "unverified";

const MATURITY: Record<Maturity, { icon: string; text: string }> = {
  stable: { icon: "✓", text: "Stable" },
  limited: { icon: "!", text: "Limited" },
  unverified: { icon: "?", text: "Not verified on serverless" },
};

const ACCENT: Record<string, { c: string; strong: string }> = {
  ssr: { c: "#3b82f6", strong: "#1d4ed8" },
  ssg: { c: "#8b5cf6", strong: "#6d28d9" },
  csr: { c: "#10b981", strong: "#047857" },
  isr: { c: "#f59e0b", strong: "#b45309" },
  streaming: { c: "#f43f5e", strong: "#be123c" },
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

const FW_KEYS = ["next", "rr", "svelte", "astro", "devora"] as const;

const FW_LIST: Framework[] = [
  { key: "devora", label: "Devora.js", logo: LOGO_DEVORA, highlight: true },
  { key: "next", label: "Next.js", logo: LOGO_NEXTJS },
  { key: "rr", label: "React Router", logo: LOGO_REACT_ROUTER },
  { key: "svelte", label: "SvelteKit", logo: LOGO_SVELTE },
  { key: "astro", label: "Astro", logo: LOGO_ASTRO },
];

// Rows: modes. Cells follow FW_KEYS order.
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

const GROUPS: MatrixGroup[] = [
  {
    topic: "Render mode per route",
    rows: MATRIX.map((row) => ({
      label: <code>{row.mode}</code>,
      cells: Object.fromEntries(FW_KEYS.map((k, i) => [k, { s: row.cells[i]!.status, note: row.cells[i]!.note }])),
    })),
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
  .devora-page .rm-cards { padding: 0; margin: 1.25rem 0 1.75rem; list-style: none; }
  .rm-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(165px, 1fr)); gap: 1rem; }
  .rm-card {
    --rm: var(--devora-accent-from);
    --rm-strong: var(--devora-accent-from);
    min-width: 0;
    padding: 1rem 1.05rem 1.05rem;
    border: 1px solid var(--devora-border);
    border-top: 4px solid var(--rm);
    border-radius: var(--devora-radius);
    background: linear-gradient(180deg, color-mix(in srgb, var(--rm) 10%, var(--devora-card)), var(--devora-card) 8rem);
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
  }
  .rm-card:hover { transform: translateY(-2px); box-shadow: var(--devora-shadow); border-color: var(--rm); }
  .rm-card-ssr { --rm: #3b82f6; --rm-strong: #1d4ed8; }
  .rm-card-ssg { --rm: #8b5cf6; --rm-strong: #6d28d9; }
  .rm-card-csr { --rm: #10b981; --rm-strong: #047857; }
  .rm-card-isr { --rm: #f59e0b; --rm-strong: #b45309; }
  .rm-card-streaming { --rm: #f43f5e; --rm-strong: #be123c; }
  .rm-top { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; flex-wrap: wrap; }
  .rm-name { margin: 0; }
  .devora-page .rm-name code {
    font-size: 1rem;
    font-weight: 700;
    padding: 0.2rem 0.6rem;
    border-radius: 8px;
    color: var(--rm-strong);
    background: color-mix(in srgb, var(--rm) 16%, transparent);
    border: 1px solid color-mix(in srgb, var(--rm) 40%, transparent);
  }
  :root[data-theme=dark] .rm-name code { color: var(--rm); }
  @media (prefers-color-scheme: dark) { :root:not([data-theme=light]) .rm-name code { color: var(--rm); } }
  .rm-card p { margin: 0; font-size: 0.88rem; line-height: 1.55; color: var(--devora-fg-muted); }
  .rm-card p strong { color: var(--devora-fg); }
  .rm-card pre { margin: 0; padding: 0.55rem 0.65rem; font-size: 0.76rem; line-height: 1.5; white-space: pre-wrap; overflow-wrap: anywhere; border: 1px solid #1f2937; border-left: 3px solid var(--rm); border-radius: 8px; background: #0d1117; color: #e6edf3; }
  .devora-page .rm-card pre code { background: none; border: 0; padding: 0; color: #e6edf3; font-size: inherit; }
  .rm-chip { display: inline-flex; align-items: center; gap: 0.3rem; font-size: 0.72rem; font-weight: 700; padding: 0.12rem 0.55rem; border-radius: 999px; border: 1px solid; white-space: nowrap; }
  .rm-m-stable { color: #15803d; border-color: color-mix(in srgb, #16a34a 45%, transparent); background: color-mix(in srgb, #16a34a 10%, var(--devora-surface)); }
  .rm-m-limited { color: #a16207; border-color: color-mix(in srgb, #ca8a04 50%, transparent); background: color-mix(in srgb, #ca8a04 10%, var(--devora-surface)); }
  .rm-m-unverified { color: #1d4ed8; border-color: color-mix(in srgb, #2563eb 45%, transparent); background: color-mix(in srgb, #2563eb 8%, var(--devora-surface)); }
  :root[data-theme=dark] .rm-m-stable { color: #4ade80; } :root[data-theme=dark] .rm-m-limited { color: #facc15; } :root[data-theme=dark] .rm-m-unverified { color: #93b8ff; }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme=light]) .rm-m-stable { color: #4ade80; }
    :root:not([data-theme=light]) .rm-m-limited { color: #facc15; }
    :root:not([data-theme=light]) .rm-m-unverified { color: #93b8ff; }
  }
  .rm-limits { margin-top: auto; font-size: 0.85rem; }
  .rm-limits summary { cursor: pointer; font-weight: 600; color: var(--rm-strong); }
  :root[data-theme=dark] .rm-limits summary { color: var(--rm); }
  @media (prefers-color-scheme: dark) { :root:not([data-theme=light]) .rm-limits summary { color: var(--rm); } }
  .rm-limits summary:focus-visible { outline: 2px solid var(--devora-ring); outline-offset: 2px; border-radius: 4px; }
  .rm-limits p { margin-top: 0.4rem; }
  .rm-honest { margin: 0 0 1.25rem; font-size: 0.95rem; line-height: 1.65; color: var(--devora-fg-muted); }
  .rm-sources { font-size: 0.8rem; color: var(--devora-fg-muted); line-height: 1.7; }
  .rm-sources a { color: var(--devora-fg-muted); text-decoration: underline; text-underline-offset: 2px; }
`;

/** The cards and the matrix. */
export function RenderModesBlock({ headingId = "choose-render-mode", level = 2 }: { headingId?: string; level?: 2 | 3 }) {
  const H = level === 2 ? "h2" : "h3";
  const S = level === 2 ? "h3" : "h4";
  return (
    <section aria-labelledby={headingId}>
      <H id={headingId}>Choose how each route renders</H>
      <p className="rm-honest">
        Every route says how it renders, in its own file. Choosing a mode per route is not unique
        to Devora.js — the table below shows who else does it. The narrow claim here is only that
        the choice is one explicit line in the route file.
      </p>
      <ul className="rm-cards">
        {MODES.map((m) => {
          const lab = MATURITY[m.maturity];
          return (
            <li className={`rm-card rm-card-${m.mode}`} key={m.mode}>
              <div className="rm-top">
                <S className="rm-name"><code>{m.mode}</code></S>
                <span className={`rm-chip rm-m-${m.maturity}`}><span aria-hidden="true">{lab.icon}</span>{lab.text}</span>
              </div>
              <p>{m.does}</p>
              <p><strong>Use it for:</strong> {m.when}</p>
              <pre className="rm-pre"><code>{m.setting}</code></pre>
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
      <Matrix id="cmx-render-modes" title="Render modes: Devora.js compared with full-stack frameworks" frameworks={FW_LIST} groups={GROUPS} />
      <p className="rm-sources">
        Checked against each framework's own documentation on {RENDER_MODES_CHECKED}; a cell says
        "Not verified" where that page was not checked. Sources:{" "}
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
