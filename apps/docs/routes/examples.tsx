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
      "Three runnable Devora.js projects checked in CI — multi-app, a Bearer-token API, a content site — and the example apps deployed by the maintainer.",
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
    title: "Marketing site + dashboard + shared API",
    shows: "The multi-app default: a public site, a logged-in dashboard and a JSON API sharing one backend function and one login. A token from the API is accepted by the dashboard.",
    apps: ["site · auth none", "app · shared", "api · shared, backend-only"],
    tutorial: "/multi-app-tutorial",
  },
  {
    slug: "api-bearer",
    title: "Backend-only API with Bearer login",
    shows: "An API for a mobile client: token login and revocation, a todos endpoint, csrf: false, and CORS for one browser origin. No pages, no React.",
    apps: ["api · shared, backend-only"],
  },
  {
    slug: "content-site",
    title: "Content site with ssg and islands",
    shows: "Pre-rendered pages, a dynamic route with getStaticParams(), one interactive island, route CSS and a sitemap.",
    apps: ["blog · auth none"],
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
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
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
          <article className="ex-card" key={ex.slug}>
            <h3>{ex.title}</h3>
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
              <a href={`${REPO}/${ex.slug}`}>Code and README ↗</a>
              {ex.tutorial ? <a href={ex.tutorial}>Step-by-step tutorial</a> : null}
            </p>
          </article>
        ))}
      </div>

      <h2 id="live-demos">Live demos</h2>
      <p className="ex-intro">
        The three example apps from the devora.js repo — one project, three apps, three auth modes
        — deployed by the maintainer. Source:{" "}
        <a href="https://github.com/hassanalsa3aka/devora.js/tree/main/apps">
          <code>apps/</code> on GitHub
        </a>
        . Checked {SHOWCASE_CHECKED}.
      </p>
      {platforms.map((platform) => (
        <section key={platform} aria-labelledby={`demos-${platform}`}>
          <h3 id={`demos-${platform}`}>{platform}</h3>
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
