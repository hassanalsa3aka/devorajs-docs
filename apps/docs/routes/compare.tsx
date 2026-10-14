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
  LOGO_REACT_ROUTER,
  LOGO_SVELTE,
} from "../compare-table.js";
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
const DEVORA_CHECKED = "October 14, 2026";
const OTHERS_CHECKED = "September 24, 2026";
const CHECKED_ISO = "2026-10-14";

const DEVORA: Framework = { key: "devora", label: "Devora.js", logo: LOGO_DEVORA, highlight: true };

const FULLSTACK: Framework[] = [
  DEVORA,
  { key: "next", label: "Next.js 16", logo: LOGO_NEXTJS },
  { key: "rr", label: "React Router v8", logo: LOGO_REACT_ROUTER },
  { key: "svelte", label: "SvelteKit", logo: LOGO_SVELTE },
  { key: "astro", label: "Astro", logo: LOGO_ASTRO },
];

const BACKEND: Framework[] = [
  DEVORA,
  { key: "express", label: "Express", logo: LOGO_EXPRESS },
  { key: "fastify", label: "Fastify", logo: LOGO_FASTIFY },
  { key: "nest", label: "NestJS", logo: LOGO_NEST },
];

const FULLSTACK_GROUPS: MatrixGroup[] = [
  {
    topic: "Rendering",
    rows: [
      {
        label: "Render mode chosen per route",
        cells: {
          devora: { s: "built", note: <><code>ssr</code> <code>ssg</code> <code>csr</code> <code>isr</code> <code>streaming</code></> },
          next: { s: "built", note: <>Opt-in caching with Cache Components (<code>"use cache"</code>); implicit caching defaults on 15 and earlier</> },
          rr: { s: "built", note: "Loader-based, explicit" },
          svelte: { s: "built", note: "Explicit, per route" },
          astro: { s: "built", note: "Explicit, per route" },
        },
      },
      {
        label: <>Catch-all routes (<code>[...slug]</code>)</>,
        cells: {
          devora: { s: "notyet", note: <><code>[param]</code> matches one segment</> },
          next: { s: "built" },
          rr: { s: "built" },
          svelte: { s: "built" },
          astro: { s: "built" },
        },
      },
      {
        label: "Query string and headers in data loading",
        cells: {
          devora: { s: "built", note: <><code>ctx.url</code>, <code>ctx.headers</code>, <code>ctx.ip</code> (0.3.2)</> },
          next: { s: "built" },
          rr: { s: "built" },
          svelte: { s: "built" },
          astro: { s: "built" },
        },
      },
    ],
  },
  {
    topic: "Several apps in one project",
    rows: [
      {
        label: "Multiple apps, one repo",
        cells: {
          devora: { s: "built", note: <>One <code>devora.config.ts</code>; each app deploys separately, on its own domain</> },
          next: { s: "partial", note: "Multi-Zones: separately deployed apps served under one domain" },
          rr: { s: "no", note: "Not a first-class concept" },
          svelte: { s: "no", note: "Not a first-class concept" },
          astro: { s: "no", note: "Not a first-class concept" },
        },
      },
      {
        label: "Navigating between apps",
        cells: {
          devora: { note: "Full page load (separate apps)" },
          next: { note: "Full page load (same as Devora.js)" },
        },
      },
      {
        label: "One backend shared by every app",
        cells: {
          devora: { s: "built", note: <>One <code>packages/backend</code> by default</> },
          next: { s: "partial", note: "Each zone has its own Route Handlers; share code as a package" },
        },
      },
      {
        label: "One login across apps",
        cells: {
          devora: { s: "built", note: <>Every <code>shared</code> app accepts the same session; <code>cookie.domain</code> shares it across subdomains (0.3.2)</> },
          next: { s: "partial", note: "No sessions built in, but zones share one domain, so a cookie-based auth library carries across" },
        },
      },
    ],
  },
  {
    topic: "Sessions",
    rows: [
      {
        label: "Server-side sessions built in",
        cells: {
          devora: { s: "built", note: "Opaque IDs in a store you provide, revocable" },
          next: { s: "no" },
          rr: { s: "built", note: <>Inherited from Remix (<code>createSessionStorage</code> and friends)</> },
          svelte: { s: "no", note: "A cookies API; sessions are your code or a library" },
          astro: { s: "built", note: "Since Astro 5.7 (2025)" },
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
    ],
  },
];

const BACKEND_GROUPS: MatrixGroup[] = [
  {
    topic: "API behavior, defaults only",
    rows: [
      {
        label: "Uncaught errors become JSON",
        cells: {
          devora: { s: "built", note: "Real message hidden in production" },
          express: { s: "no", note: "HTML error page unless you add error middleware" },
          fastify: { s: "partial", note: "JSON, but the raw error message is sent even in production" },
          nest: { s: "built", note: "Exception filters, message hidden" },
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
  {
    topic: "Built in, or bring your own",
    rows: [
      {
        label: "CORS",
        cells: {
          devora: { s: "built", note: <><code>cors</code> in <code>app.config.ts</code> (0.3.2)</> },
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
          fastify: { s: "built", note: "JSON Schema" },
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
          devora: { s: "notyet" },
          express: { s: "library" },
          fastify: { s: "library", note: <>Official plugin (<code>@fastify/websocket</code>)</> },
          nest: { s: "built", note: "Built-in module" },
        },
      },
      {
        label: "Background jobs",
        cells: {
          devora: { s: "notyet" },
          express: { s: "library" },
          fastify: { s: "library" },
          nest: { s: "library", note: <>Official modules (<code>@nestjs/bullmq</code>, <code>@nestjs/schedule</code>)</> },
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
      ` }} />

      <section className="compare-hero">
        <h1>
          Devora.js vs. <span className="compare-hero-gradient">other frameworks</span>
        </h1>
        <p>
          Where Devora.js stands next to the tools you're probably weighing it against — including
          where they're ahead.
        </p>
        <p className="compare-stamp">
          <span>
            Devora.js rows: <strong>@devorajs/core {version}</strong>, checked {DEVORA_CHECKED}
          </span>
          <span>Other frameworks: checked {OTHERS_CHECKED}</span>
        </p>
        <nav className="compare-jump" aria-label="On this page">
          <a href="#fullstack">Full-stack frameworks</a>
          <a href="#backend">Backend frameworks</a>
          <a href="#scale">Scale</a>
          <a href="#limitations">Limitations</a>
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
            <li>you need catch-all routes, WebSockets, or a long track record right now.</li>
          </ul>
        </section>
      </div>

      <section className="compare-section" aria-labelledby="fullstack">
        <h2 id="fullstack">Full-stack and frontend frameworks</h2>
        <p>
          Next.js, React Router v8 (framework mode — formerly Remix), SvelteKit and Astro. Pick
          which ones to show; on a phone each feature becomes a card.
        </p>
        <Matrix id="cmx-fullstack" title="Devora.js compared with full-stack frameworks" frameworks={FULLSTACK} groups={FULLSTACK_GROUPS} />
        <p className="compare-legend">
          A blank cell means the row doesn't apply to that framework (it has no multi-app concept).
        </p>
        <p className="compare-note">
          <strong>Honest note:</strong> explicit render-mode selection isn't unique to Devora.js —
          SvelteKit and Astro already do it, and Next.js 16 closed most of the gap. Built-in sessions
          aren't unique either (React Router, Astro). The narrow, still-true claims: several apps
          in one project sharing one backend and one login, and one session that works as a cookie
          or a Bearer token and is revoked on both at once. Turborepo and Nx aren't in this table:
          they're monorepo task runners, not frameworks, and can sit alongside Devora.js.
        </p>
      </section>

      <section className="compare-section" aria-labelledby="backend">
        <h2 id="backend">Backend frameworks</h2>
        <p>Express, Fastify and NestJS, compared on what an API needs.</p>
        <Matrix id="cmx-backend" title="Devora.js compared with backend frameworks" frameworks={BACKEND} groups={BACKEND_GROUPS} />
        <p className="compare-caption">
          The three API-behavior rows were tested directly, in production mode, with defaults only:
          Express 5.2.1, Fastify 5.12.5, NestJS 12.1.0 and Devora.js 0.3.1 (unchanged in {version}).
          The CORS and upload rows come from each project's documentation and published packages.
        </p>
        <p className="compare-note">
          <strong>Honest note:</strong> NestJS and Fastify are more complete "batteries included"
          backend frameworks today. Devora.js's backend is closer to Express's minimalism, with a
          JSON error contract, method checks and CORS that Express doesn't give you by default.
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
          <li>No catch-all routes (<code>[...slug]</code>).</li>
          <li>
            An API route's response headers are a plain object, so one response can send only one{" "}
            <code>Set-Cookie</code>; responses are sent in one piece (no server-sent events).
          </li>
          <li>No built-in WebSockets, background jobs, validation or rate limiting.</li>
          <li>
            <code>streaming</code> is GET-only, and on Netlify it arrives as one buffered response.
          </li>
          <li>
            <code>isr</code> regeneration on Vercel/Netlify's serverless filesystem hasn't been
            verified.
          </li>
          <li>Pre-1.0: behavior changes can land in any release; the CHANGELOG lists them first.</li>
        </ul>
        <p>
          No performance section: there are no published benchmarks for Devora.js yet, and this
          page won't show numbers that haven't been measured.
        </p>
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
