import { PageShell } from "@devorajs/core";
import { DOCS_NAV } from "../nav.js";
import { SiteFooter } from "../site-footer.js";
import {
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
import { RENDER_MODES_CSS, RenderModesBlock } from "../render-modes-block.js";
import { BarChart, COMPARE_MATRIX_CSS, Matrix, type Framework, type MatrixGroup } from "../compare-matrix.js";
import { JsonLd, pageMeta, OG_IMAGE, SITE_URL } from "../seo.js";
import { getCoreVersion } from "../version.js";
import downloads from "../data/npm-downloads.json";

export const renderMode = "ssg";

export function meta() {
  return pageMeta("/compare", {
    title: "Devora.js vs. other frameworks",
    fullTitle: "Devora.js vs. Next.js, SvelteKit, Astro, NestJS & more",
    description:
      "An honest comparison with Next.js, React Router, SvelteKit, Astro, Express, Fastify, and NestJS — focused feature tables, adoption numbers, and where the others are ahead.",
  });
}

export async function loader() {
  return { version: getCoreVersion() };
}

// When each part of this page was last checked. Devora.js rows: against the
// installed @devorajs/core source. Other frameworks: their docs and, for the
// API-behavior rows, real installs in production mode. Re-check before
// changing a row; don't carry claims forward.
const DEVORA_CHECKED = "October 16, 2026";
const OTHERS_CHECKED = "October 16, 2026";
const CHECKED_ISO = "2026-10-16";

const DEVORA: Framework = { key: "devora", label: "Devora.js", logo: LOGO_DEVORA, highlight: true };

// Version numbers are the current stable releases on npm on OTHERS_CHECKED.
const FULLSTACK: Framework[] = [
  DEVORA,
  { key: "next", label: "Next.js 16", logo: LOGO_NEXTJS },
  { key: "rr", label: "React Router v8", logo: LOGO_REACT_ROUTER },
  { key: "svelte", label: "SvelteKit 3", logo: LOGO_SVELTE },
  { key: "astro", label: "Astro 7", logo: LOGO_ASTRO },
];

const MULTI_APP: Framework[] = [
  DEVORA,
  { key: "next", label: "Next.js (Multi-Zones)", logo: LOGO_NEXTJS },
  { key: "mono", label: "Turborepo / Nx", logo: <>{LOGO_TURBOREPO}{LOGO_NX}</> },
  { key: "others", label: "Others" },
];

const SESSION_FW: Framework[] = FULLSTACK;

const BACKEND: Framework[] = [
  DEVORA,
  { key: "express", label: "Express 5", logo: LOGO_EXPRESS },
  { key: "fastify", label: "Fastify 5", logo: LOGO_FASTIFY },
  { key: "nest", label: "NestJS 12", logo: LOGO_NEST },
];

const RENDERING_GROUPS: MatrixGroup[] = [
  {
    topic: "Per-route rendering",
    rows: [
      {
        label: "Render mode chosen per route",
        cells: {
          devora: { s: "built", note: <><code>ssr</code> <code>ssg</code> <code>csr</code> <code>isr</code> <code>streaming</code>, one export in the route file</> },
          next: { s: "built", note: "Static by default, dynamic when a route uses request data; revalidate and Suspense per route" },
          rr: { s: "partial", note: <>SSR and SPA mode are app-wide (<code>ssr</code> in config); pre-rendering lists URLs</> },
          svelte: { s: "built", note: <><code>prerender</code>, <code>ssr</code>, <code>csr</code> exports per page or layout</> },
          astro: { s: "built", note: <><code>prerender</code> per page; <code>output</code> sets the default</> },
        },
      },
      {
        label: <>Catch-all routes (<code>[...slug]</code>)</>,
        cells: {
          devora: { s: "built", note: <>Pages and API routes; <code>ctx.catchAll.slug</code> is the array (0.3.4)</> },
          next: { s: "built" },
          rr: { s: "built", note: <>Splat routes: <code>"*"</code>; the rest is <code>params["*"]</code></> },
          svelte: { s: "built", note: <>Rest parameters, <code>[...path]</code></> },
          astro: { s: "built", note: <>Rest parameters, <code>[...path]</code></> },
        },
      },
      {
        label: "Query string and headers in data loading",
        cells: {
          devora: { s: "built", note: <><code>ctx.url</code>, <code>ctx.headers</code>, <code>ctx.ip</code></> },
          next: { s: "built" },
          rr: { s: "built" },
          svelte: { s: "built" },
          astro: { s: "built" },
        },
      },
      {
        label: "Pre-rendered pages: validators and compression",
        cells: {
          devora: {
            note: <>Served from memory with an <code>ETag</code> (304 on a repeat visit) and brotli/gzip under <code>devora start</code>; 64 MB total, 2 MB per file, checked against the disk once a second</>,
          },
        },
      },
    ],
  },
];

const MULTI_APP_GROUPS: MatrixGroup[] = [
  {
    topic: "Several apps in one project",
    rows: [
      {
        label: "Multiple apps, one repo",
        cells: {
          devora: { s: "built", note: <>One <code>devora.config.ts</code>; each app deploys separately, on its own domain</> },
          next: { s: "partial", note: "Separately deployed apps served under one domain, routed by rewrites" },
          mono: { s: "built", note: "This is their core purpose" },
          others: { s: "no", note: "Not a first-class concept" },
        },
      },
      {
        label: "Navigating between apps",
        cells: {
          devora: { note: "Full page load (separate apps)" },
          next: { note: "Hard navigation between zones, soft within one" },
          mono: { s: "na", note: "Not a routing tool" },
          others: { s: "na" },
        },
      },
      {
        label: "One backend shared by every app",
        cells: {
          devora: { s: "built", note: <>One <code>packages/backend</code> by default</> },
          next: { s: "partial", note: "Each zone has its own Route Handlers; share code as a package" },
          mono: { s: "no", note: "You wire the backend yourself" },
          others: { s: "na" },
        },
      },
      {
        label: "One login across apps",
        cells: {
          devora: { s: "built", note: <>Every <code>shared</code> app accepts the same session; <code>cookie.domain</code> shares the browser login across subdomains</> },
          next: { s: "partial", note: "No sessions built in, but zones share one domain, so a cookie-based auth library carries across" },
          mono: { s: "no", note: "You build it yourself" },
          others: { s: "na" },
        },
      },
      {
        label: "Build caching and task orchestration",
        cells: {
          devora: { s: "no", note: "Not Devora.js's job" },
          next: { s: "na" },
          mono: { s: "built", note: "Their real strength" },
          others: { s: "na" },
        },
      },
    ],
  },
];

const SESSION_GROUPS: MatrixGroup[] = [
  {
    topic: "Sessions",
    rows: [
      {
        label: "Server-side sessions built in",
        cells: {
          devora: { s: "built", note: "Opaque IDs in a store you provide, revocable" },
          next: { s: "no", note: "A cookies API; the docs recommend an auth or session library" },
          rr: { s: "built", note: <><code>createCookieSessionStorage</code>, <code>createSessionStorage</code>, per route in loaders and actions</> },
          svelte: { s: "no", note: "Cookies in the handle hook; sessions are your code or a library" },
          astro: { s: "built", note: "Sessions API since Astro 5.7; needs a storage driver" },
        },
      },
      {
        label: "One session as cookie and Bearer token",
        cells: {
          devora: { s: "built", note: "One primitive, revoked on both at once" },
          next: { s: "no" },
          rr: { s: "no" },
          svelte: { s: "no" },
          astro: { s: "no" },
        },
      },
      {
        label: "CSRF protection on by default",
        cells: {
          devora: { s: "built", note: <>For cookie sessions; <code>ctx{"."}verifyCsrf()</code> per action</> },
          next: { s: "partial", note: "Server Actions check Origin; allowed origins are configurable" },
          rr: { s: "unverified" },
          svelte: { s: "partial", note: "Origin check on form posts" },
          astro: { s: "partial", note: "Origin check on form posts" },
        },
      },
    ],
  },
];

const API_ERROR_GROUPS: MatrixGroup[] = [
  {
    topic: "API behavior, defaults only",
    rows: [
      {
        label: "Uncaught errors become JSON",
        cells: {
          devora: { s: "built", note: "Real message hidden in production" },
          express: { s: "no", note: "HTML error page, message hidden in production" },
          fastify: { s: "partial", note: "JSON, but the raw error message is sent even in production" },
          nest: { s: "built", note: "JSON, message hidden" },
        },
      },
      {
        label: "Unmatched route is a JSON 404",
        cells: {
          devora: { s: "built", note: <>Under <code>/api</code></> },
          express: { s: "no", note: <>HTML <code>Cannot GET …</code> page</> },
          fastify: { s: "built" },
          nest: { s: "built" },
        },
      },
      {
        label: "Wrong HTTP method is a 405",
        cells: {
          devora: { s: "built", note: <>When the route exports <code>methods</code></> },
          express: { s: "no", note: "404" },
          fastify: { s: "no", note: "404" },
          nest: { s: "no", note: "404" },
        },
      },
    ],
  },
];

const BYO_GROUPS: MatrixGroup[] = [
  {
    topic: "Built in, or bring your own",
    rows: [
      {
        label: "CORS",
        cells: {
          devora: { s: "built", note: <><code>cors</code> in <code>app.config.ts</code></> },
          express: { s: "library", note: <><code>cors</code> package</> },
          fastify: { s: "library", note: <>Official plugin (<code>@fastify/cors</code>)</> },
          nest: { s: "built", note: <><code>app.enableCors()</code></> },
        },
      },
      {
        label: "File uploads (multipart)",
        cells: {
          devora: { s: "partial", note: <>Page forms: <code>File</code> objects in <code>action</code>; API routes parse the body themselves</> },
          express: { s: "library", note: <><code>multer</code></> },
          fastify: { s: "library", note: <>Official plugin (<code>@fastify/multipart</code>)</> },
          nest: { s: "built", note: <><code>FileInterceptor</code> (Multer, in <code>@nestjs/platform-express</code>)</> },
        },
      },
      {
        label: "Validation",
        cells: {
          devora: { s: "library", note: <a href="/backend-capabilities#validation">Documented Zod pattern</a> },
          express: { s: "library" },
          fastify: { s: "built", note: "JSON Schema (Ajv) per route" },
          nest: { s: "built", note: <><code>ValidationPipe</code> (class-validator)</> },
        },
      },
      {
        label: "Rate limiting",
        cells: {
          devora: { s: "library", note: <a href="/backend-capabilities#rate-limiting">Documented pattern</a> },
          express: { s: "library" },
          fastify: { s: "library", note: <>Official plugin (<code>@fastify/rate-limit</code>)</> },
          nest: { s: "library", note: <>Official module (<code>@nestjs/throttler</code>)</> },
        },
      },
      {
        label: "WebSockets",
        cells: {
          devora: {
            s: "library",
            note: (
              <>
                A separate realtime server (Socket.IO) works; <code>ws</code> works through a small wrapper
                around <code>createNodeServer</code>; server-sent events from an API route do not work yet:{" "}
                <a href="/live-updates">Live updates</a>
              </>
            ),
          },
          express: { s: "library" },
          fastify: { s: "library", note: <>Official plugin (<code>@fastify/websocket</code>)</> },
          nest: { s: "built", note: <>Gateways in <code>@nestjs/websockets</code> (socket.io or ws)</> },
        },
      },
      {
        label: "Background jobs",
        cells: {
          devora: {
            s: "library",
            note: (
              <>
                BullMQ with Redis and a worker, a SQLite queue with a worker, and node-cron were tested on one Node
                server; not verified on Vercel or Netlify: <a href="/background-jobs">Background jobs</a>
              </>
            ),
          },
          express: { s: "library" },
          fastify: { s: "library" },
          nest: { s: "library", note: <>Official modules (<code>@nestjs/bullmq</code>, needs Redis; <code>@nestjs/schedule</code>)</> },
        },
      },
      {
        label: "Dependency injection",
        cells: {
          devora: { s: "no", note: "By design" },
          express: { s: "no" },
          fastify: { s: "no" },
          nest: { s: "built", note: "Core feature" },
        },
      },
    ],
  },
];

const PKG_LOGO: Record<string, unknown> = {
  express: LOGO_EXPRESS,
  next: LOGO_NEXTJS,
  "react-router": LOGO_REACT_ROUTER,
  "@nestjs/core": LOGO_NEST,
  fastify: LOGO_FASTIFY,
  astro: LOGO_ASTRO,
  "@sveltejs/kit": LOGO_SVELTE,
  "@devorajs/core": LOGO_DEVORA,
};

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function formatDay(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

export default function Compare({ data }) {
  const version = data?.version ?? "unknown";
  return (
    <PageShell nav={DOCS_NAV} footer={<SiteFooter />}>
      <style dangerouslySetInnerHTML={{ __html: `
        .devora-page { max-width: 1180px; }
        ${COMPARE_MATRIX_CSS}
        ${RENDER_MODES_CSS}
        .compare-hero { text-align: center; max-width: 46rem; margin: 0 auto 2rem; }
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
        .devora-page .compare-hero p { color: var(--devora-fg-muted); font-size: 1.05rem; line-height: 1.7; margin: 0 auto; }
        .devora-page .compare-hero .compare-stamp {
          display: inline-flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.25rem 0.75rem;
          margin-top: 1.25rem;
          font-size: 0.78rem;
          line-height: 1.5;
          border: 1px solid var(--devora-border);
          border-radius: var(--devora-radius);
          padding: 0.45rem 0.9rem;
        }
        .compare-stamp strong { color: var(--devora-fg); }
        .compare-jump { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.5rem; margin-top: 1.25rem; }
        .compare-jump a {
          font-size: 0.85rem;
          color: var(--devora-fg);
          text-decoration: none;
          border: 1px solid var(--devora-border);
          border-radius: 999px;
          padding: 0.35rem 0.85rem;
        }
        .compare-jump a:hover { border-color: var(--devora-accent-from); }

        .compare-summary {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          max-width: 62rem;
          margin: 0 auto 1rem;
        }
        .compare-summary-card {
          padding: 1.25rem 1.4rem;
          border: 1px solid var(--devora-border);
          border-radius: var(--devora-radius-lg);
          background: var(--devora-card);
        }
        .compare-summary-card.is-devora { border-color: var(--devora-accent-from); box-shadow: inset 0 3px 0 var(--devora-accent-from); }
        .devora-page .compare-summary-card h2 {
          margin: 0 0 0.6rem;
          padding: 0;
          font-size: 1.05rem;
        }
        .devora-page .compare-summary-card h2::before { content: none; }
        .devora-page .compare-summary-card ul { margin: 0; padding-left: 1.1rem; }
        .compare-summary-card li { margin: 0.35rem 0; line-height: 1.55; }
        .compare-summary-card li strong { color: var(--devora-fg); }
        @media (max-width: 720px) { .compare-summary { grid-template-columns: 1fr; } }

        .devora-page .compare-section {
          max-width: 62rem;
          margin-left: auto;
          margin-right: auto;
        }
        .devora-page .compare-section h2 { margin-top: 3rem; }
        .devora-page .compare-section p { line-height: 1.7; }
        .devora-page .compare-caption { font-size: 0.8rem; line-height: 1.6; }
        .devora-page .compare-legend { font-size: 0.8rem; }
        .devora-page .compare-note {
          margin: 1rem 0;
          padding: 0.85rem 1.1rem;
          border-left: 3px solid var(--devora-accent-from);
          border-radius: 0 var(--devora-radius) var(--devora-radius) 0;
          background: var(--devora-surface);
          font-size: 0.9rem;
          line-height: 1.65;
        }
        .compare-note strong { color: var(--devora-fg); }
        .devora-page .compare-list { padding-left: 1.2rem; line-height: 1.7; }
        .compare-list li { margin-bottom: 0.4rem; }
        .devora-page .compare-section h3 { margin-top: 2.25rem; }
        .compare-choose { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.75rem; margin-top: 1rem; }
        @media (max-width: 1080px) { .compare-choose { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (max-width: 560px) { .compare-choose { grid-template-columns: 1fr; } }
        .compare-choose-card {
          --cc: var(--devora-fg-subtle);
          min-width: 0;
          padding: 0.8rem 0.9rem 0.9rem;
          border: 1px solid var(--devora-border);
          border-top: 3px solid var(--cc);
          border-radius: var(--devora-radius);
          background: var(--devora-card);
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
        }
        .compare-choose-card.cc-next { --cc: #64748b; }
        .compare-choose-card.cc-astro { --cc: #f97316; }
        .compare-choose-card.cc-backend { --cc: #e11d48; }
        .compare-choose-card.is-devora { --cc: var(--devora-accent-from); background: color-mix(in srgb, var(--devora-accent-from) 6%, var(--devora-card)); }
        .devora-page .compare-choose-card h3 { margin: 0; font-size: 0.95rem; display: flex; align-items: center; gap: 0.45rem; flex-wrap: wrap; }
        .compare-choose-card h3 svg, .compare-choose-card h3 img { width: 18px; height: 18px; flex-shrink: 0; }
        .cc-row { display: grid; grid-template-columns: 1.15rem minmax(0, 1fr); gap: 0.45rem; font-size: 0.82rem; line-height: 1.5; }
        .devora-page .cc-row p { margin: 0; font-size: 0.82rem; line-height: 1.5; color: var(--devora-fg-muted); }
        .cc-row strong { color: var(--devora-fg); }
        .cc-mark { width: 1.15rem; height: 1.15rem; border-radius: 50%; display: grid; place-items: center; font-size: 0.7rem; font-weight: 800; line-height: 1; margin-top: 0.12rem; }
        .cc-yes .cc-mark { background: color-mix(in srgb, #16a34a 18%, transparent); color: #15803d; }
        .cc-no .cc-mark { background: color-mix(in srgb, #dc2626 14%, transparent); color: #b91c1c; }
        :root[data-theme=dark] .cc-yes .cc-mark { color: #4ade80; } :root[data-theme=dark] .cc-no .cc-mark { color: #f87171; }
        @media (prefers-color-scheme: dark) { :root:not([data-theme=light]) .cc-yes .cc-mark { color: #4ade80; } :root:not([data-theme=light]) .cc-no .cc-mark { color: #f87171; } }
      ` }} />

      <section className="compare-hero">
        <h1>
          Devora.js vs. <span className="compare-hero-gradient">other frameworks</span>
        </h1>
        <p>
          Where Devora.js stands next to the tools you're probably weighing it against — including
          where they're ahead. Speed numbers live on <a href="/performance">Performance</a>.
        </p>
        <p className="compare-stamp">
          <span>
            Devora.js rows: <strong>@devorajs/core {version}</strong>, checked {DEVORA_CHECKED}
          </span>
          <span>Other frameworks: checked {OTHERS_CHECKED}</span>
        </p>
        <nav className="compare-jump" aria-label="On this page">
          <a href="#rendering">Rendering</a>
          <a href="#multi-app">Multi-app</a>
          <a href="#sessions">Sessions</a>
          <a href="#backend">Backend</a>
          <a href="#scale">Scale</a>
          <a href="#limitations">Limitations</a>
          <a href="#choosing">When to choose</a>
          <a href="/performance">Performance</a>
        </nav>
      </section>

      <div className="compare-summary">
        <section className="compare-summary-card is-devora" aria-labelledby="choose-devora">
          <h2 id="choose-devora">Choose Devora.js if…</h2>
          <ul>
            <li>
              you're building <strong>several apps</strong> (marketing site, dashboard, admin) that
              should share <strong>one backend and one login</strong>, and deploy separately;
            </li>
            <li>you want render modes, caching and security settings written in the code, not inferred;</li>
            <li>
              one session for both browsers (cookie) and mobile clients (Bearer token) saves you a
              second auth system;
            </li>
            <li>you're comfortable on a pre-1.0 framework with a small community.</li>
          </ul>
        </section>
        <section className="compare-summary-card" aria-labelledby="choose-else">
          <h2 id="choose-else">Choose something else if…</h2>
          <ul>
            <li>
              you want the <strong>largest ecosystem</strong> and the most answers online, or have
              one app: <strong>Next.js</strong>;
            </li>
            <li>you're building a content-heavy site and value satisfaction scores: <strong>Astro</strong>;</li>
            <li>
              you need a mature, full-featured backend today — dependency injection, validation,
              WebSockets, jobs: <strong>NestJS</strong> or <strong>Fastify</strong>;
            </li>
            <li>you need WebSockets or background jobs built in, or a long track record right now.</li>
          </ul>
        </section>
      </div>

      <section className="compare-section" aria-labelledby="fullstack">
        <h2 id="fullstack">Full-stack and frontend frameworks</h2>
        <p>
          Next.js, React Router v8 (framework mode — formerly Remix), SvelteKit and Astro. Each
          topic below has its own table; pick which frameworks to show, and on a phone each feature
          becomes a card.
        </p>

        <h3 id="rendering">Rendering model</h3>
        <RenderModesBlock headingId="choose-render-mode" level={3} />
        <Matrix id="cmx-rendering" title="Rendering: Devora.js compared with full-stack frameworks" frameworks={FULLSTACK} groups={RENDERING_GROUPS} />
        <p className="compare-note">
          <strong>Honest note:</strong> explicit render-mode selection isn't unique to Devora.js —
          SvelteKit and Astro do it per route, and Next.js 16 closed most of the gap. Incremental
          regeneration is built in on Next.js and only a platform option elsewhere; Devora.js's
          version is the least battle-tested on serverless hosts.
        </p>

        <h3 id="multi-app">Multi-app architecture</h3>
        <p>
          The reason Devora.js exists. Turborepo and Nx are monorepo task runners rather than
          frameworks, so a "—" or "Not its job" cell is not a knock against them.
        </p>
        <Matrix id="cmx-multiapp" title="Several apps in one project" frameworks={MULTI_APP} groups={MULTI_APP_GROUPS} />
        <p className="compare-note">
          <strong>Honest note:</strong> Turborepo and Nx solve "build this repo full of apps fast";
          Devora.js solves "these apps share a backend and a session system out of the box". You
          could use Turborepo <em>and</em> Devora.js together. Multi-Zones' one-domain model gets
          browser cookie sharing for free; Devora.js shares the login across subdomains only when{" "}
          <code>shared.sessions.cookie.domain</code> is set.
        </p>

        <h3 id="sessions">Sessions and auth</h3>
        <Matrix id="cmx-sessions" title="Sessions: Devora.js compared with full-stack frameworks" frameworks={SESSION_FW} groups={SESSION_GROUPS} />
        <p className="compare-note">
          <strong>Honest note:</strong> built-in sessions aren't unique (React Router, Astro). The
          narrow claim: one session that works as an HttpOnly cookie and as a Bearer token, revoked
          on both at once, shared by every app in a project. Checking <em>who someone is</em> stays
          your code: Devora.js ships no auth provider, and none of the others is a replacement for
          one either.
        </p>
      </section>

      <section className="compare-section" aria-labelledby="backend">
        <h2 id="backend">Backend frameworks</h2>
        <p>Express, Fastify and NestJS, compared on what an API needs.</p>

        <h3 id="api-errors">API error handling</h3>
        <Matrix id="cmx-api-errors" title="API error behavior: Devora.js compared with backend frameworks" frameworks={BACKEND} groups={API_ERROR_GROUPS} />
        <p className="compare-caption">
          Tested directly in production mode with defaults only (October 16, 2026): Express 5.3.0,
          Fastify 5.12.7, NestJS 12.1.3 and Devora.js {version}.
        </p>

        <h3 id="byo">Built in, or bring your own</h3>
        <Matrix id="cmx-byo" title="What is built in: Devora.js compared with backend frameworks" frameworks={BACKEND} groups={BYO_GROUPS} />
        <p className="compare-caption">
          Each row was checked against the framework's documentation on {OTHERS_CHECKED}. "Use a
          library" includes the official packages each project maintains.
        </p>
        <p className="compare-note">
          <strong>Honest note:</strong> NestJS and Fastify are more complete "batteries included"
          backend frameworks today. Devora.js's backend is closer to Express's minimalism, with a
          JSON error contract, method checks and CORS that Express doesn't give you by default. For
          live updates and background jobs it documents tested patterns, not built-ins:{" "}
          <a href="/live-updates">Live updates</a>, <a href="/background-jobs">Background jobs</a>.
        </p>
      </section>

      <section className="compare-section" aria-labelledby="scale">
        <h2 id="scale">Scale, honestly</h2>
        <p>
          Devora.js is new and small. npm downloads for one full week, {formatDay(downloads.weekStart)}{" "}
          – {formatDay(downloads.weekEnd)}:
        </p>
        <BarChart
          title={`npm downloads, ${downloads.weekStart} to ${downloads.weekEnd}`}
          unit="Downloads"
          bars={downloads.packages.map((p) => ({
            label: (
              <>
                {PKG_LOGO[p.pkg] as any}
                <code>{p.pkg}</code>
              </>
            ),
            value: p.downloads,
            display: formatCount(p.downloads),
            highlight: p.pkg === "@devorajs/core",
          }))}
          caption={
            <>
              Source: npm's public downloads API (
              <a href="https://github.com/npm/registry/blob/main/docs/download-counts.md">api.npmjs.org</a>
              ), fetched {formatDay(downloads.fetchedOn)} by <code>scripts/fetch-npm-downloads.mjs</code>.
              The most recent week with no missing days was used (the week after it is missing a
              day for every package). <code>react-router</code> counts every React Router user, not
              only framework mode. All counts include CI runs and transitive installs, which inflate{" "}
              <code>express</code> the most.
            </>
          }
        />
        <p>
          Per <a href="https://2025.stateofjs.com/en-US/libraries/meta-frameworks/">State of JS 2025</a>{" "}
          (the most recent edition): Next.js leads meta-framework usage but is losing satisfaction;
          Astro ranks highest on satisfaction, 39 points ahead of Next.js. On the{" "}
          <a href="https://2025.stateofjs.com/en-US/libraries/back-end-frameworks/">backend side</a>,
          Express leads usage with NestJS growing; Hono tops satisfaction (outside this page's
          scope, but worth knowing). Pick Devora.js for what it does differently, not for maturity.
        </p>
      </section>

      <section className="compare-section" aria-labelledby="limitations">
        <h2 id="limitations">Known limitations</h2>
        <p>
          As of <code>@devorajs/core@{version}</code>, checked in its source:
        </p>
        <ul className="compare-list">
          <li>
            An API route's response headers are a plain object, so one response can send only one{" "}
            <code>Set-Cookie</code>; responses are sent in one piece, so there are no server-sent
            events.
          </li>
          <li>
            No built-in validation or rate limiting. WebSockets and background jobs are not built in
            either, but both have tested setups: <a href="/live-updates">Live updates</a> and{" "}
            <a href="/background-jobs">Background jobs</a>. Server-sent events from an API route do not
            work yet.
          </li>
          <li>
            <code>streaming</code> is GET-only, and on Netlify it arrives as one buffered response.
          </li>
          <li>
            <code>isr</code> regeneration on Vercel/Netlify's serverless filesystem hasn't been
            verified; it is reliable under a long-lived Node server.
          </li>
          <li>
            Pre-rendered pages and built files are held in memory (64 MB total, 2 MB per file) and
            checked against the disk once a second; <code>devora start</code> needs a restart for
            changed route code.
          </li>
          <li>
            Desktop and native mobile apps are planned goals, not started.
          </li>
          <li>Pre-1.0: behavior changes can land in any release; the CHANGELOG lists them first.</li>
        </ul>
        <p>
          Build time, requests/second, memory and JavaScript sent, measured against Next.js, Astro,
          SvelteKit and React Router on the same pages: see <a href="/performance">Performance</a>.
        </p>
      </section>

      <section className="compare-section" aria-labelledby="choosing">
        <h2 id="choosing">When to choose which</h2>
        <div className="compare-choose">
          <article className="compare-choose-card cc-next">
            <h3>{LOGO_NEXTJS} Next.js</h3>
            <div className="cc-row cc-yes"><span className="cc-mark" aria-hidden="true">✓</span><p><strong>Choose it if</strong> you want the largest ecosystem, or one app on the most-used React framework.</p></div>
            <div className="cc-row cc-no"><span className="cc-mark" aria-hidden="true">✕</span><p><strong>Not if</strong> several deployed apps should share one backend and one login without wiring it yourself.</p></div>
          </article>
          <article className="compare-choose-card cc-astro">
            <h3>{LOGO_ASTRO} Astro</h3>
            <div className="cc-row cc-yes"><span className="cc-mark" aria-hidden="true">✓</span><p><strong>Choose it if</strong> you build a content-heavy site with little client JavaScript by default.</p></div>
            <div className="cc-row cc-no"><span className="cc-mark" aria-hidden="true">✕</span><p><strong>Not if</strong> you need a shared login and backend across several apps.</p></div>
          </article>
          <article className="compare-choose-card cc-backend">
            <h3>{LOGO_NEST} NestJS / {LOGO_FASTIFY} Fastify</h3>
            <div className="cc-row cc-yes"><span className="cc-mark" aria-hidden="true">✓</span><p><strong>Choose it if</strong> you need a mature backend today: DI, validation, WebSockets, jobs.</p></div>
            <div className="cc-row cc-no"><span className="cc-mark" aria-hidden="true">✕</span><p><strong>Not if</strong> you also want server-rendered React pages in the same project.</p></div>
          </article>
          <article className="compare-choose-card is-devora">
            <h3>{LOGO_DEVORA} Devora.js</h3>
            <div className="cc-row cc-yes"><span className="cc-mark" aria-hidden="true">✓</span><p><strong>Choose it if</strong> several apps should share one backend and one login and deploy separately, and a pre-1.0 framework is fine.</p></div>
            <div className="cc-row cc-no"><span className="cc-mark" aria-hidden="true">✕</span><p><strong>Not if</strong> you need the largest ecosystem, a long track record, or built-in WebSockets and jobs.</p></div>
          </article>
        </div>
      </section>

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
            dateModified: CHECKED_ISO,
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
