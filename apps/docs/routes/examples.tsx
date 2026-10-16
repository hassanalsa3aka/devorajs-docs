import type { CSSProperties } from "react";
import { PageShell } from "@devorajs/core";
import { DOCS_NAV } from "../nav.js";
import { SiteFooter } from "../site-footer.js";
import { JsonLd, pageMeta, SITE_URL } from "../seo.js";
import { DemoCard, LIVE_DEMOS, SHOWCASE_CHECKED, SHOWCASE_CSS } from "../showcase.js";

export const renderMode = "ssg";

export function meta() {
  return pageMeta("/examples", {
    title: "Examples and live demos",
    description:
      "Four runnable Devora.js projects checked in CI — multi-app, a Bearer-token API, a content site, live updates — and the example apps deployed by the maintainer.",
    image: "/og/examples.png",
  });
}

export async function loader() {
  return {};
}

const REPO = "https://github.com/hassanalsa3aka/devora.js/tree/main/examples";

// Each folder in devora.js/examples is a standalone project on the
// published packages; CI runs npm ci, typecheck, build and real requests
// against every one (examples/check.mjs).
const EXAMPLES = [
  {
    slug: "multi-app",
    accent: "#3b82f6",
    strong: "#1d4ed8",
    icon: <><rect x="3.5" y="4" width="7" height="7" rx="1.5" /><rect x="13.5" y="4" width="7" height="7" rx="1.5" /><rect x="3.5" y="13" width="17" height="7" rx="1.5" /></>,
    title: "Marketing site + dashboard + shared API",
    shows: "The multi-app default: a public site, a logged-in dashboard and a JSON API sharing one backend function and one login. A token from the API is accepted by the dashboard.",
    apps: ["site · auth none", "app · shared", "api · shared, backend-only"],
    tutorial: "/multi-app-tutorial",
  },
  {
    slug: "api-bearer",
    accent: "#8b5cf6",
    strong: "#6d28d9",
    icon: <><path d="M8 7 3 12l5 5" /><path d="M16 7l5 5-5 5" /><path d="M14 5l-4 14" /></>,
    title: "Backend-only API with Bearer login",
    shows: "An API for a mobile client: token login and revocation, a todos endpoint, csrf: false, and CORS for one browser origin. No pages, no React.",
    apps: ["api · shared, backend-only"],
  },
  {
    slug: "content-site",
    accent: "#10b981",
    strong: "#047857",
    icon: <><path d="M6 3h9l4 4v14H6z" /><path d="M14 3v5h5" /><path d="M9 13h7M9 17h7" /></>,
    title: "Content site with ssg and islands",
    shows: "Pre-rendered pages, a dynamic route with getStaticParams(), one interactive island, route CSS and a sitemap.",
    apps: ["blog · auth none"],
  },
  {
    slug: "realtime",
    accent: "#f59e0b",
    strong: "#b45309",
    icon: <><path d="M3 12h4l2-6 4 12 2-6h6" /></>,
    title: "Live updates with a separate realtime server",
    shows: "A dashboard that updates without a reload: a login-protected token route, a small Socket.IO server with one room per user, a publish call from the app, a polling fallback, and the CSP setting that lets the browser connect.",
    apps: ["app · shared", "realtime/ · plain Node (Socket.IO)"],
    tutorial: "/live-updates",
    tutorialLabel: "The Live updates guide",
  },
];

export default function Examples() {
  const platforms = [...new Set(LIVE_DEMOS.map((d) => d.platform))];
  return (
    <PageShell nav={DOCS_NAV} footer={<SiteFooter />}>
      <style dangerouslySetInnerHTML={{ __html: `
        .devora-page { max-width: 1180px; }
        ${SHOWCASE_CSS}
        .ex-intro { max-width: 46rem; }
        .ex-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 420px), 1fr));
          gap: 1.25rem;
          margin: 1.25rem 0 0;
        }
        .ex-card {
          display: flex;
          flex-direction: column;
          gap: 0.7rem;
          min-width: 0;
          padding: 1.25rem;
          border: 1px solid var(--devora-border);
          border-radius: var(--devora-radius-lg);
          background: var(--devora-card);
        }
        .ex-card {
          border-top: 4px solid var(--ex);
          background: linear-gradient(180deg, color-mix(in srgb, var(--ex) 9%, var(--devora-card)), var(--devora-card) 9rem);
          transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
        }
        .ex-card:hover { transform: translateY(-2px); box-shadow: var(--devora-shadow); border-color: var(--ex); }
        .ex-head { display: flex; align-items: center; gap: 0.75rem; }
        .ex-icon {
          flex-shrink: 0;
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border-radius: 11px;
          color: var(--ex-strong);
          background: color-mix(in srgb, var(--ex) 18%, transparent);
          border: 1px solid color-mix(in srgb, var(--ex) 35%, transparent);
        }
        :root[data-theme=dark] .ex-icon { color: var(--ex); }
        @media (prefers-color-scheme: dark) { :root:not([data-theme=light]) .ex-icon { color: var(--ex); } }
        .devora-page .ex-card .sc-tags li {
          border-color: color-mix(in srgb, var(--ex) 45%, var(--devora-border));
          background: color-mix(in srgb, var(--ex) 11%, var(--devora-surface));
          color: var(--devora-fg);
        }
        .devora-page .ex-card .ex-cmd {
          padding: 0.8rem 0.95rem;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
          border-radius: 10px;
          border: 1px solid #1f2937;
          border-left: 3px solid var(--ex);
          background: #0d1117;
          color: #e6edf3;
        }
        .ex-links a { font-size: 0.85rem; font-weight: 600; text-decoration: none; border-radius: 999px; padding: 0.4rem 0.85rem; }
        .ex-links a.ex-primary { background: var(--ex-strong); color: #fff; }
        .ex-links a.ex-secondary { border: 1px solid color-mix(in srgb, var(--ex) 55%, var(--devora-border)); color: var(--devora-fg); }
        .ex-links a:hover { filter: brightness(1.1); }
        .ex-links a:focus-visible { outline: 2px solid var(--devora-ring); outline-offset: 2px; }
        .ex-platform { display: flex; align-items: center; gap: 0.6rem; }
        .ex-platform-dot { width: 10px; height: 10px; border-radius: 50%; }
        .devora-page .ex-card h3 { margin: 0; font-size: 1.05rem; }
        .devora-page .ex-card p { margin: 0; font-size: 0.9rem; line-height: 1.55; }
        .devora-page .ex-card .ex-cmd {
          margin: 0.2rem 0 0;
          font-size: 0.78rem;
          white-space: pre;
          overflow-x: auto;
        }
        .devora-page .ex-links { display: flex; flex-wrap: wrap; gap: 0.4rem 1rem; margin-top: auto; }
      ` }} />
      <h1>Examples and live demos</h1>
      <p className="devora-lead ex-intro">
        Small, runnable projects that each show one thing Devora.js does, and the framework's own
        example apps running on a real host.
      </p>

      <h2 id="examples">Runnable examples</h2>
      <p className="ex-intro">
        Each one is a standalone project in the framework repo's{" "}
        <a href={REPO}><code>examples/</code></a> folder that installs the published packages
        from npm. CI installs, typechecks, builds and sends real requests to every one, so they
        don't go stale. Node 20 or newer.
      </p>
      <div className="ex-grid">
        {EXAMPLES.map((ex) => (
          <article className="ex-card" key={ex.slug} style={{ "--ex": ex.accent, "--ex-strong": ex.strong } as CSSProperties}>
            <div className="ex-head">
              <span className="ex-icon" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  {ex.icon}
                </svg>
              </span>
              <h3>{ex.title}</h3>
            </div>
            <p>{ex.shows}</p>
            <ul className="sc-tags" aria-label="Apps in this example">
              {ex.apps.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
            <pre className="ex-cmd" tabIndex={0} aria-label={`Commands to run ${ex.slug}`}>
{`git clone https://github.com/hassanalsa3aka/devora.js.git
cd devora.js/examples/${ex.slug}
npm ci && npm run dev`}
            </pre>
            <p className="ex-links">
              <a className="ex-primary" href={`${REPO}/${ex.slug}`}>Code and README ↗</a>
              {ex.tutorial ? <a className="ex-secondary" href={ex.tutorial}>{ex.tutorialLabel ?? "Step-by-step tutorial"}</a> : null}
            </p>
          </article>
        ))}
      </div>

      <h2 id="live-demos">Live demos</h2>
      <p className="ex-intro">
        The three example apps from the devora.js repo — one project, three apps, three auth modes
        — deployed by the maintainer on Vercel and on Netlify. Source:{" "}
        <a href="https://github.com/hassanalsa3aka/devora.js/tree/main/apps">
          <code>apps/</code> on GitHub
        </a>
        . The Vercel deployments were checked {SHOWCASE_CHECKED}. The Netlify deployments are the
        same apps and were added by the maintainer; they did not respond when the automated check
        last ran, so open them to see their current state.
      </p>
      {platforms.map((platform) => (
        <section key={platform} aria-labelledby={`demos-${platform}`}>
          <h3 id={`demos-${platform}`} className="ex-platform">
            <span className="ex-platform-dot" aria-hidden="true" style={{ background: platform === "Vercel" ? "var(--devora-fg)" : "#0e7c86" }} />
            {platform}
          </h3>
          <div className="sc-grid">
            {LIVE_DEMOS.filter((d) => d.platform === platform).map((demo) => (
              <DemoCard demo={demo} key={demo.url} />
            ))}
          </div>
        </section>
      ))}

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Devora.js docs", item: `${SITE_URL}/` },
            { "@type": "ListItem", position: 2, name: "Examples", item: `${SITE_URL}/examples` },
          ],
        }}
      />
    </PageShell>
  );
}
