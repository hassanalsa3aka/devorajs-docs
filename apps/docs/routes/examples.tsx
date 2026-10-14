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
      "Runnable Devora.js example projects, and the framework's example apps deployed by the maintainer on Vercel.",
    image: "/og/examples.png",
  });
}

export async function loader() {
  return {};
}

const PLANNED = [
  {
    title: "Marketing site + dashboard + shared API",
    body: "The multi-app default: a public site, a logged-in dashboard and a JSON API sharing one backend and one login.",
  },
  {
    title: "Backend-only API with Bearer login",
    body: "An API for a mobile client: token login and logout, revocation, CORS, no pages and no React.",
  },
  {
    title: "Content site with ssg and islands",
    body: "Pre-rendered pages, getStaticParams() for dynamic routes, and one interactive island.",
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
        .ex-planned {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr));
          gap: 1rem;
          margin: 1.25rem 0 0;
        }
        .devora-page .ex-planned .devora-card { margin: 0; border-top-width: 1px; }
        .devora-page .ex-planned h3 { margin: 0 0 0.4rem; font-size: 1rem; }
        .devora-page .ex-planned p { margin: 0; font-size: 0.9rem; }
        .ex-badge {
          display: inline-block;
          margin-bottom: 0.6rem;
          padding: 0.1rem 0.5rem;
          border-radius: 999px;
          border: 1px solid var(--devora-border);
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--devora-fg-muted);
        }
      ` }} />
      <h1>Examples and live demos</h1>
      <p className="devora-lead ex-intro">
        Small, runnable projects that each show one thing Devora.js does, and the framework's own
        example apps running on a real host.
      </p>

      <h2 id="examples">Runnable examples</h2>
      <p className="ex-intro">
        These are being written in the framework repo's <code>examples/</code> folder. Each one will
        run from a fresh checkout with the commands on its card, and be built in CI so it can't go
        stale.
      </p>
      <div className="ex-planned">
        {PLANNED.map((p) => (
          <div className="devora-card" key={p.title}>
            <span className="ex-badge">In progress</span>
            <h3>{p.title}</h3>
            <p>{p.body}</p>
          </div>
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
