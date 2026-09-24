import { PageShell } from "@devorajs/core";
import { DOCS_NAV } from "../nav.js";
import { SiteFooter } from "../site-footer.js";
import {
  CompareTable,
  COMPARE_TABLE_CSS,
  LOGO_ASTRO,
  LOGO_DEVORA,
  LOGO_EXPRESS,
  LOGO_FASTIFY,
  LOGO_NEST,
  LOGO_NEXTJS,
  LOGO_NX,
  LOGO_REACT_ROUTER,
  LOGO_SVELTE,
  LOGO_TURBOREPO,
} from "../compare-table.js";
import { JsonLd, pageMeta, OG_IMAGE, SITE_URL } from "../seo.js";

export const renderMode = "ssg";

export function meta() {
  return pageMeta("/compare", {
    title: "Devora.js vs. other frameworks",
    fullTitle: "Devora.js vs. Next.js, SvelteKit, Astro, NestJS & more",
    description:
      "An honest comparison with Next.js, React Router, SvelteKit, Astro, Turborepo/Nx, Express, Fastify, and NestJS — adoption numbers, focused feature tables, and where the others are ahead.",
  });
}

export async function loader() {
  return {};
}

// Every number and claim on this page was re-checked on the date below —
// npm's download API, State of JS 2025, each framework's own docs, and
// behavior tests against real installs (see the note under each table).
// Re-verify before changing any of it; don't carry numbers forward.
const VERIFIED_ON = "September 24, 2026";
const DEVORA_VERSION = "0.3.1";

// Neutral placeholder mark for the "Others" column (no single brand).
const LOGO_OTHERS = (
  <svg className="home-compare-logo logo-others" viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="5" cy="12" r="2.2" />
    <circle cx="12" cy="12" r="2.2" />
    <circle cx="19" cy="12" r="2.2" />
  </svg>
);

const DEVORA = { label: "Devora.js", logo: LOGO_DEVORA, highlight: true };

// npm weekly downloads, Aug 24–30, 2026 (see the caption under the table
// for why that week). Devora.js is a running total, not weekly.
const DOWNLOADS = [
  { pkg: "express", logo: LOGO_EXPRESS, count: 133_100_711, label: "133.1M" },
  { pkg: "next", logo: LOGO_NEXTJS, count: 55_492_260, label: "55.5M" },
  { pkg: "react-router", logo: LOGO_REACT_ROUTER, count: 53_249_097, label: "53.2M" },
  { pkg: "@nestjs/core", logo: LOGO_NEST, count: 14_361_203, label: "14.4M" },
  { pkg: "fastify", logo: LOGO_FASTIFY, count: 12_667_558, label: "12.7M" },
  { pkg: "astro", logo: LOGO_ASTRO, count: 5_137_684, label: "5.1M" },
  { pkg: "@sveltejs/kit", logo: LOGO_SVELTE, count: 2_689_466, label: "2.7M" },
];
const MAX_DOWNLOADS = DOWNLOADS[0].count;

function Note({ children }) {
  return (
    <p className="compare-note reveal">
      <strong>Honest note:</strong> {children}
    </p>
  );
}

export default function Compare() {
  return (
    <PageShell nav={DOCS_NAV} footer={<SiteFooter />}>
      <style>{`
        .devora-page { max-width: 1180px; }
        ${COMPARE_TABLE_CSS}
        /* Row labels here are longer than the landing page's, so let them wrap. */
        .compare-table tbody th { white-space: normal; min-width: 8.5rem; }
        /* Equal-width columns, so no framework's column gets squeezed just
           because its cells happen to be short. */
        .compare-table:not(.scale-table) { table-layout: fixed; }
        .compare-table:not(.scale-table) thead th:first-child { width: 10rem; }
        .compare-table thead th { white-space: normal; }
        .compare-table .logo-others { fill: var(--devora-fg-muted); }

        .compare-hero { text-align: center; max-width: 46rem; margin: 0 auto 2.5rem; }
        .compare-hero h1 {
          font-size: clamp(2rem, 4.5vw, 2.9rem);
          line-height: 1.12;
          letter-spacing: -0.02em;
          margin: 0 0 1rem;
        }
        .compare-hero-gradient {
          background: linear-gradient(90deg, var(--devora-accent-from), var(--devora-accent-to));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .compare-hero p { color: var(--devora-fg-muted); font-size: 1.05rem; line-height: 1.7; margin: 0; }
        .compare-verified {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          margin-top: 1.25rem;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--devora-fg-muted);
          border: 1px solid var(--devora-border);
          border-radius: 999px;
          padding: 0.35rem 0.85rem;
        }
        .compare-verified-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: linear-gradient(90deg, var(--devora-accent-from), var(--devora-accent-to));
        }
        .compare-jump { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.5rem; margin-top: 1.5rem; }
        .compare-jump a {
          font-size: 0.85rem;
          color: var(--devora-fg);
          text-decoration: none;
          border: 1px solid var(--devora-border);
          border-radius: 999px;
          padding: 0.35rem 0.85rem;
        }
        .compare-jump a:hover { border-color: var(--devora-accent-from); }

        .compare-section-title { text-align: center; font-size: 1.7rem; margin: 3.5rem 0 0.5rem; padding-left: 0; }
        .compare-section-title::before { content: none; }
        .compare-section-title::after {
          content: var(--pseudo-content);
          display: block;
          width: 48px;
          height: 3px;
          margin: 0.75rem auto 0;
          border-radius: 2px;
          background: linear-gradient(90deg, var(--devora-accent-from), var(--devora-accent-to));
        }
        .compare-section-subtitle { text-align: center; color: var(--devora-fg-muted); margin: 0 0 1.5rem; }
        .compare-sub { max-width: 62rem; margin: 2.25rem auto 0; font-size: 1.1rem; }
        .compare-prose { max-width: 62rem; margin-left: auto; margin-right: auto; line-height: 1.7; }
        .compare-caption {
          max-width: 62rem;
          margin: 0 auto 1rem;
          font-size: 0.82rem;
          line-height: 1.6;
          color: var(--devora-fg-muted);
        }
        .compare-note {
          max-width: 62rem;
          margin: 0 auto 1rem;
          padding: 0.8rem 1.1rem;
          font-size: 0.9rem;
          border: 1px solid var(--devora-border);
          border-left: 3px solid var(--devora-accent-from);
          border-radius: var(--devora-radius);
          background: var(--devora-bg-elevated);
          color: var(--devora-fg-muted);
          line-height: 1.65;
        }
        .compare-note strong { color: var(--devora-fg); }

        /* Scale table: bars are linear on purpose — Devora.js's bar is
           invisible at this scale, and that's the honest picture. */
        /* No min-width: on narrow screens the bars shrink instead of pushing
           the numbers off-screen. */
        .compare-table.scale-table { min-width: 0; }
        .scale-table tbody td { text-align: left; vertical-align: middle; }
        .scale-table tbody th { min-width: 0; white-space: nowrap; vertical-align: middle; }
        @media (max-width: 640px) {
          .scale-table th, .scale-table td { padding-left: 0.75rem; padding-right: 0.75rem; }
        }
        .scale-table tbody th .home-compare-logo { width: 20px; height: 20px; vertical-align: -5px; margin-right: 0.55rem; }
        .scale-num { text-align: right !important; white-space: nowrap; font-variant-numeric: tabular-nums; color: var(--devora-fg) !important; font-weight: 600; width: 1%; }
        .scale-bar-cell { width: 55%; }
        .scale-bar { height: 8px; border-radius: 999px; background: var(--devora-border); overflow: hidden; }
        .scale-bar span {
          display: block;
          height: 100%;
          min-width: 2px;
          border-radius: 999px;
          background: var(--devora-fg-muted);
        }
        .scale-row-devora th, .scale-row-devora td {
          background: color-mix(in srgb, var(--devora-accent-from) 10%, transparent) !important;
        }
        .scale-row-devora th { border-left: 2px solid var(--devora-accent-from); }

        .compare-list { max-width: 62rem; margin: 0 auto; padding-left: 1.2rem; line-height: 1.7; }
        .compare-list li { margin-bottom: 0.5rem; color: var(--devora-fg-muted); }
        .compare-list li strong { color: var(--devora-fg); }
        .compare-choose {
          max-width: 62rem;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1rem;
        }
        .compare-choose-card {
          padding: 1.25rem 1.35rem;
          border: 1px solid var(--devora-border);
          border-radius: var(--devora-radius);
          background: var(--devora-card);
          color: var(--devora-fg-muted);
          line-height: 1.6;
        }
        .compare-choose-card h3 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0 0 0.5rem;
          font-size: 1rem;
          color: var(--devora-fg);
        }
        .compare-choose-card h3 .home-compare-logo { width: 22px; height: 22px; fill: var(--devora-fg-muted); }
        .compare-choose-card h3 .home-compare-logo-devora { width: 24px; height: 24px; }
        .compare-choose-card h3 .home-compare-logo-group { display: inline-flex; gap: 0.2rem; }
        .compare-choose-card { transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease; }
        .compare-choose-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--devora-shadow);
          border-color: var(--devora-accent-from);
        }
        .compare-choose-card h3 .home-compare-logo,
        .compare-choose-card h3 .home-compare-logo-group { transition: transform 0.2s ease; }
        .compare-choose-card:hover h3 .home-compare-logo,
        .compare-choose-card:hover h3 .home-compare-logo-group { transform: scale(1.12) rotate(-6deg); }
        .compare-choose-devora { border-color: var(--devora-accent-from); box-shadow: var(--devora-shadow); }
        .compare-jump a { transition: border-color 0.15s ease, transform 0.15s ease; }
        .compare-jump a:hover { transform: translateY(-1px); }

        /* Motion — same approach as the landing page (see its comments in
           routes/index.tsx): hero fades up once on load; everything else
           uses a pure-CSS scroll timeline, so content is fully visible by
           default and only animates where the browser supports it. All of
           it is skipped under prefers-reduced-motion. */
        @media (prefers-reduced-motion: no-preference) {
          @keyframes compare-fade-up {
            from { opacity: 0; transform: translateY(14px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .compare-hero > * { animation: compare-fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }
          .compare-hero h1 { animation-delay: 0.04s; }
          .compare-hero p { animation-delay: 0.12s; }
          .compare-hero .compare-verified { animation-delay: 0.2s; }
          .compare-hero .compare-jump { animation-delay: 0.28s; }
          @keyframes compare-gradient-pan {
            0%, 100% { background-position: 0% center; }
            50% { background-position: 100% center; }
          }
          .compare-hero-gradient {
            background-image: linear-gradient(90deg, var(--devora-accent-from), var(--devora-accent-to), var(--devora-accent-from));
            background-size: 200% auto;
            animation: compare-gradient-pan 6s ease-in-out infinite;
          }
        }
        .reveal { opacity: 1; }
        @supports (animation-timeline: view()) {
          @media (prefers-reduced-motion: no-preference) {
            .reveal {
              opacity: 0;
              animation: compare-reveal-in linear both;
              animation-timeline: view();
              animation-range: entry 0% cover 25%;
            }
            @keyframes compare-reveal-in {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
            /* Download bars grow from zero as the chart scrolls in. */
            .scale-bar span {
              transform-origin: left center;
              animation: compare-bar-grow linear both;
              animation-timeline: view();
              animation-range: entry 20% cover 45%;
            }
            @keyframes compare-bar-grow {
              from { transform: scaleX(0); }
              to { transform: scaleX(1); }
            }
          }
        }
      `}</style>

      <section className="compare-hero">
        <h1>
          Devora.js vs. <span className="compare-hero-gradient">other frameworks</span>
        </h1>
        <p>
          Where Devora.js stands next to the tools you're probably already weighing it against —
          including where they're ahead.
        </p>
        <span className="compare-verified">
          <span className="compare-verified-dot" />
          Verified {VERIFIED_ON} · @devorajs/core {DEVORA_VERSION}
        </span>
        <nav className="compare-jump" aria-label="On this page">
          <a href="#scale">Scale</a>
          <a href="#frontend">Frontend</a>
          <a href="#backend">Backend</a>
          <a href="#limitations">Limitations</a>
          <a href="#choosing">Which to choose</a>
        </nav>
      </section>

      <h2 className="compare-section-title reveal" style={{ "--pseudo-content": '""' }} id="scale">Scale, honestly</h2>
      <p className="compare-section-subtitle reveal">
        Devora.js is new and small — npm weekly downloads, week of August 24–30, 2026.
      </p>
      <div className="compare-table-wrap reveal">
        <table className="compare-table scale-table">
          <tbody>
            {DOWNLOADS.map((d) => (
              <tr key={d.pkg}>
                <th scope="row">{d.logo}<code>{d.pkg}</code></th>
                <td className="scale-bar-cell">
                  <div className="scale-bar"><span style={{ width: `${(d.count / MAX_DOWNLOADS) * 100}%` }} /></div>
                </td>
                <td className="scale-num">{d.label}</td>
              </tr>
            ))}
            <tr className="scale-row-devora">
              <th scope="row">{LOGO_DEVORA}<code>@devorajs/core</code></th>
              <td className="scale-bar-cell">
                <div className="scale-bar"><span style={{ width: 0 }} /></div>
              </td>
              <td className="scale-num">759 in total</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="compare-caption reveal">
        <strong>Why that week:</strong> npm's download API is currently missing data for several
        September days (it reports zero for every package on Sep 3, 7–8, 15 and 17), so September
        "weekly" totals undercount — the Sep 15–21 total, for example, is missing two of its seven
        days. August 24–30 is the most recent full week with complete data for every package here.{" "}
        <code>@devorajs/core</code> was first published on September 8, so its figure is a running
        total of every recorded download through Sep 21 — not weekly — most of it on two release
        days; outside those, it's about ten a day. <code>react-router</code> counts every React
        Router user, not just framework mode. All of these include CI runs and transitive installs,
        which inflate <code>express</code> the most.
      </p>
      <p className="compare-prose reveal">
        Per{" "}
        <a href="https://2025.stateofjs.com/en-US/libraries/meta-frameworks/">State of JS 2025</a>{" "}
        (the most recent edition): Next.js leads meta-framework usage but is losing satisfaction;
        Astro ranks highest on satisfaction, 39 points ahead of Next.js. On the{" "}
        <a href="https://2025.stateofjs.com/en-US/libraries/back-end-frameworks/">backend side</a>,
        Express leads usage with NestJS growing; Hono tops satisfaction (outside our comparison
        scope below, but worth knowing it exists).
      </p>
      <p className="compare-note reveal">
        <strong>Pick Devora.js for what it does differently, not for maturity.</strong> That's the
        honest framing for everything below.
      </p>

      <h2 className="compare-section-title reveal" style={{ "--pseudo-content": '""' }} id="frontend">vs. frontend frameworks</h2>
      <p className="compare-section-subtitle reveal">
        Next.js, React Router v8 (framework mode — formerly Remix), SvelteKit, and Astro.
      </p>

      <h3 className="compare-sub reveal">Rendering model</h3>
      <CompareTable
        className="reveal"
        minWidth={760}
        columns={[
          { label: "Next.js 16", logo: LOGO_NEXTJS },
          { label: "React Router v8", logo: LOGO_REACT_ROUTER },
          { label: "SvelteKit", logo: LOGO_SVELTE },
          { label: "Astro", logo: LOGO_ASTRO },
          DEVORA,
        ]}
        rows={[
          {
            label: "Render mode selection",
            cells: [
              <>Opt-in caching via <code>"use cache"</code> with Cache Components (<code>cacheComponents: true</code>); implicit caching defaults on 15 and earlier</>,
              "Loader-based, explicit",
              "Explicit, per route",
              "Explicit, per route (Astro's whole pitch too)",
              <>Explicit, per route: <code>ssr</code> <code>ssg</code> <code>csr</code> <code>isr</code> <code>streaming</code></>,
            ],
          },
          {
            label: <>Catch-all routes (<code>[...slug]</code>)</>,
            cells: ["Yes", "Yes", "Yes", "Yes", "Not supported yet"],
          },
          {
            label: "Query string in data loading",
            cells: ["Yes", "Yes", "Yes", "Yes", <>Not available in <code>loader</code> yet</>],
          },
        ]}
      />
      <Note>
        explicit render-mode selection is <em>not</em> unique to Devora.js — SvelteKit and Astro
        already do this, and Next.js 16 closed most of the gap that made this a strong
        differentiator against Next.js specifically. This is now a "we do it too, cleanly" point,
        not an "only we do this" point.
      </Note>

      <h3 className="compare-sub reveal" id="multi-app">Multi-app architecture</h3>
      <CompareTable
        className="reveal"
        minWidth={720}
        columns={[
          { label: "Next.js (Multi-Zones)", logo: LOGO_NEXTJS },
          { label: "Turborepo / Nx", logo: [LOGO_TURBOREPO, LOGO_NX] },
          { label: "Others", logo: LOGO_OTHERS },
          DEVORA,
        ]}
        rows={[
          {
            label: "Multiple apps, one repo",
            cells: [
              "Supported, same pattern — separately deployed apps, served under one domain",
              "Yes — this is their core purpose",
              "Not a first-class concept",
              <>Native — one <code>devora.config.ts</code>; each app deploys separately, on its own domain</>,
            ],
          },
          {
            label: "Navigation between apps",
            cells: [
              "Full page load (same limitation)",
              "N/A — not a routing tool",
              "N/A",
              "Full page load (separate apps)",
            ],
          },
          {
            label: "Shared backend across apps",
            cells: [
              "Not built in — each zone has its own Route Handlers; share code as a package",
              "Not built in — you still hand-wire this yourself (e.g. with Express)",
              "N/A",
              <>Yes — one shared <code>packages/backend</code> by default</>,
            ],
          },
          {
            label: "Shared login across apps",
            cells: [
              "No session system built in — but zones share one domain, so any cookie-based auth library configured the same way in each zone carries across",
              "Not built in — you build this yourself",
              "N/A",
              <>
                Server-side, yes — every <code>shared</code> app accepts the same session, as a
                cookie or a Bearer token. Browser caveat: the cookie is host-only in{" "}
                {DEVORA_VERSION}, so apps on separate subdomains don't share a browser login yet
              </>,
            ],
          },
          {
            label: "Build caching / task orchestration",
            cells: ["N/A", "Yes — this is their real strength", "N/A", "Not Devora.js's job"],
          },
        ]}
      />
      <Note>
        Turborepo and Nx aren't really the same category of tool — they're monorepo build/task
        orchestrators, not application frameworks. A fairer way to put it: Turborepo/Nx solve
        "build this repo full of apps fast," while Devora.js solves "these apps share a backend
        and a session system out of the box." You could reasonably use Turborepo <em>and</em>{" "}
        Devora.js together — they're not mutually exclusive, and pretending otherwise would be a
        strawman. And on shared login specifically, Multi-Zones' one-domain model gets browser
        cookie sharing for free, which Devora.js's one-domain-per-app model doesn't yet.
      </Note>

      <h3 className="compare-sub reveal" id="sessions">Sessions &amp; auth</h3>
      <CompareTable
        className="reveal"
        minWidth={600}
        columns={[
          { label: "React Router v8", logo: LOGO_REACT_ROUTER },
          { label: "Astro", logo: LOGO_ASTRO },
          DEVORA,
        ]}
        rows={[
          {
            label: "Built-in server-side sessions",
            cells: [
              <>Yes — inherited from Remix (<code>createSessionStorage</code> and friends)</>,
              "Yes — since Astro 5.7 (2025)",
              "Yes",
            ],
          },
          {
            label: "Same session works as cookie AND Bearer token",
            cells: ["Not built in", "Not built in", "Yes — one primitive, revocable everywhere with one call"],
          },
        ]}
      />
      <Note>
        built-in sessions themselves aren't unique — React Router and Astro both have them. The
        narrow, still-true claim: <strong>one session object that works identically as a browser
        cookie or a mobile Bearer token, revocable instantly across both, with no separate systems
        to maintain.</strong> See <a href="/security#sessions">Security model → Sessions</a>.
      </Note>

      <h2 className="compare-section-title reveal" style={{ "--pseudo-content": '""' }} id="backend">vs. backend frameworks</h2>
      <p className="compare-section-subtitle reveal">Express, Fastify, and NestJS.</p>

      <h3 className="compare-sub reveal">API error handling</h3>
      <CompareTable
        className="reveal"
        minWidth={720}
        columns={[
          { label: "Express", logo: LOGO_EXPRESS },
          { label: "Fastify", logo: LOGO_FASTIFY },
          { label: "NestJS", logo: LOGO_NEST },
          DEVORA,
        ]}
        rows={[
          {
            label: "Uncaught errors → JSON by default",
            cells: [
              "No — HTML error page unless you add error middleware",
              "Yes, built in — but the raw error message is sent, even in production",
              "Yes — built-in exception filters, message hidden",
              "Yes (since 0.3.0) — real message hidden in production",
            ],
          },
          {
            label: "Unmatched routes → JSON 404",
            cells: [<>No — HTML <code>Cannot GET …</code> page</>, "Yes", "Yes", <>Yes, under <code>/api</code></>],
          },
          {
            label: "Wrong HTTP method → 405",
            cells: ["No — 404", "No — 404", "No — 404", <>Yes, when the route exports <code>methods</code></>],
          },
        ]}
      />
      <p className="compare-caption reveal">
        Behavior tested directly, in production mode, on Express 5.2.1, Fastify 5.12.5, NestJS
        12.1.0, and Devora.js {DEVORA_VERSION} — defaults only, no extra config. All four declare
        methods per route; the difference is only what a request with the wrong method gets back.
      </p>

      <h3 className="compare-sub reveal">What's built in vs. bring-your-own</h3>
      <CompareTable
        className="reveal"
        minWidth={720}
        columns={[
          { label: "Express", logo: LOGO_EXPRESS },
          { label: "Fastify", logo: LOGO_FASTIFY },
          { label: "NestJS", logo: LOGO_NEST },
          DEVORA,
        ]}
        rows={[
          {
            label: "Validation",
            cells: [
              "Bring your own",
              "Built in (JSON Schema)",
              <>Built-in <code>ValidationPipe</code> (uses class-validator)</>,
              <>Bring your own (<a href="/backend-capabilities#validation">documented Zod pattern</a>)</>,
            ],
          },
          {
            label: "WebSockets",
            cells: ["Bring your own", <>Official plugin (<code>@fastify/websocket</code>)</>, "Built-in module", "Not built in"],
          },
          {
            label: "Background jobs",
            cells: [
              "Bring your own",
              "Bring your own",
              <>Official modules (<code>@nestjs/bullmq</code>, <code>@nestjs/schedule</code>)</>,
              "Not built in",
            ],
          },
          {
            label: "Rate limiting",
            cells: [
              "Bring your own",
              <>Official plugin (<code>@fastify/rate-limit</code>)</>,
              <>Official module (<code>@nestjs/throttler</code>)</>,
              <>Not built in (<a href="/backend-capabilities#rate-limiting">documented pattern</a>)</>,
            ],
          },
          {
            label: "Dependency injection",
            cells: ["No", "No", "Yes, core feature", "No"],
          },
        ]}
      />
      <Note>
        NestJS and Fastify are simply more complete "batteries included" backend frameworks today.
        Devora.js's backend story is closer to Express's minimalism, but with the JSON-error
        contract and route-matching guarantees Express doesn't give you by default.
      </Note>

      <h2 className="compare-section-title reveal" style={{ "--pseudo-content": '""' }} id="limitations">Known limitations</h2>
      <p className="compare-section-subtitle reveal">
        As of <code>@devorajs/core@{DEVORA_VERSION}</code> — checked directly in its source, not
        assumed.
      </p>
      <ul className="compare-list reveal">
        <li>React 18 only — the peer dependency (<code>react@^18.3.0</code>) excludes React 19</li>
        <li>No catch-all routes (<code>[...slug]</code>)</li>
        <li>An <code>action</code>'s return value is discarded unless it's a redirect</li>
        <li><code>loader</code>s don't receive the query string</li>
        <li><code>meta()</code> covers only <code>title</code> and <code>description</code></li>
        <li>No built-in WebSockets, background jobs, or validation</li>
        <li>
          The session cookie is host-only, so apps on separate subdomains don't share a browser
          login (the server-side session and Bearer tokens do work across apps)
        </li>
        <li>Breaking changes still happen between minor versions (pre-1.0)</li>
      </ul>
      <p className="compare-prose reveal" style={{ color: "var(--devora-fg-muted)" }}>
        No performance section — there are no benchmarks in either repo, and we're not going to
        publish numbers we haven't measured.
      </p>

      <h2 className="compare-section-title reveal" style={{ "--pseudo-content": '""' }} id="choosing">When to choose which</h2>
      <p className="compare-section-subtitle reveal">Different tools for overlapping problems.</p>
      <div className="compare-choose">
        <div className="compare-choose-card reveal">
          <h3>{LOGO_NEXTJS} Choose Next.js</h3>
          if you want the largest ecosystem, the most Stack Overflow answers, and don't need
          multiple apps sharing one backend.
        </div>
        <div className="compare-choose-card reveal">
          <h3>{LOGO_ASTRO} Choose Astro</h3>
          if content-heavy, performance-first sites are your priority and you value the framework
          with the highest reported satisfaction.
        </div>
        <div className="compare-choose-card reveal">
          <h3>
            <span className="home-compare-logo-group">{LOGO_NEST}{LOGO_FASTIFY}</span> Choose NestJS or
            Fastify
          </h3>
          if you want a mature, fully-featured backend today — dependency injection, built-in
          validation, a large plugin ecosystem.
        </div>
        <div className="compare-choose-card compare-choose-devora reveal">
          <h3>{LOGO_DEVORA} Choose Devora.js</h3>
          if you're specifically building a product with multiple apps (marketing site + dashboard
          + admin) that need to share a backend and one session system, and you're comfortable
          being an early adopter of a pre-1.0 framework in exchange for that architecture being
          handled natively instead of hand-rolled.
        </div>
      </div>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Devora.js docs", item: `${SITE_URL}/` },
              { "@type": "ListItem", position: 2, name: "Compare", item: `${SITE_URL}/compare` },
            ],
          },
          {
            "@context": "https://schema.org",
            "@type": "TechArticle",
            headline: "Devora.js vs. other frameworks",
            url: `${SITE_URL}/compare`,
            image: OG_IMAGE,
            inLanguage: "en",
            dateModified: "2026-09-24",
            about: [
              { "@type": "SoftwareSourceCode", name: "Devora.js" },
              { "@type": "SoftwareSourceCode", name: "Next.js" },
              { "@type": "SoftwareSourceCode", name: "React Router" },
              { "@type": "SoftwareSourceCode", name: "SvelteKit" },
              { "@type": "SoftwareSourceCode", name: "Astro" },
              { "@type": "SoftwareSourceCode", name: "Express" },
              { "@type": "SoftwareSourceCode", name: "Fastify" },
              { "@type": "SoftwareSourceCode", name: "NestJS" },
            ],
          },
        ]}
      />
    </PageShell>
  );
}
