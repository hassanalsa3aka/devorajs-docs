import { PageShell } from "@devorajs/core";
import { DOCS_NAV } from "../nav.js";
import { SiteFooter } from "../site-footer.js";
import { DocsLayout, Callout } from "../docs-layout.js";
import { JsonLd, pageMeta, SITE_URL } from "../seo.js";

export const renderMode = "ssg";

export function meta() {
  return pageMeta("/roadmap", {
    title: "Roadmap",
    description:
      "What Devora.js has shipped, version by version, and what is now, next, later and not planned. Taken from the changelog and the git tags.",
  });
}

export async function loader() {
  return {};
}

const CHANGELOG = "https://github.com/hassanalsa3aka/devora.js/blob/main/CHANGELOG.md";

interface Release {
  version: string;
  date?: string;
  tag?: string;
  note?: string;
  points: string[];
  anchor?: string;
  anchorLabel?: string;
}

// Every block comes from CHANGELOG.md and the git tags (v0.3.2 and v0.3.4 are
// the only tags). A version with no CHANGELOG entry says so.
const RELEASES: Release[] = [
  {
    version: "0.3.4",
    date: "2026-10-16",
    tag: "v0.3.4",
    points: [
      "Catch-all routes ([...slug], [[...slug]]) for pages and API routes; ctx.params stays a string, the array is ctx.catchAll.",
      "Faster pre-rendered pages (served from memory with ETag and compression), correct content types, sitemap URLs from getStaticParams().",
      "A documented live-updates pattern with a runnable example; publish scripts refuse to publish an empty dist/.",
    ],
    anchor: "034--2026-10-16",
  },
  {
    version: "0.3.3",
    note: "Never published",
    points: ["Prepared and rolled into 0.3.4."],
    anchor: "034--2026-10-16",
    anchorLabel: "0.3.4 (says so)",
  },
  {
    version: "0.3.2",
    date: "2026-10-12",
    tag: "v0.3.2",
    points: [
      "Request access in loaders and actions, action results (fail(), 303 redirects), error pages, the head API, uploads, CORS, .env loading.",
      "Cookie and proxy settings; the Vercel runtime is no longer hard-coded; the first published @devorajs/adapter-node.",
      "Adapters 0.2.0 and 0.2.2 had been published without their build output and were replaced by 0.2.1 and 0.2.3.",
    ],
    anchor: "032--2026-10-12",
  },
  {
    version: "0.3.1",
    date: "2026-09-24",
    points: [
      "create-devora scope: --scope=fullstack|frontend|backend; devora --version reports the real version.",
      "The Vercel and Netlify adapters no longer fail on a backend-only app.",
    ],
    anchor: "031--2026-09-24-scaffolder-scope-hotfix-12",
  },
  {
    version: "0.3.0",
    date: "2026-09-23",
    points: [
      "Breaking: unified session auth — opaque IDs in a SessionStore you provide, one lookup for cookie and Bearer, revocation.",
      "api/** always answers JSON; devora dev --host; dev ports start at 10000.",
    ],
    anchor: "030--2026-09-23-pre-v3-hotfixes",
  },
  { version: "0.2.2 and 0.2.1", note: "No CHANGELOG entry", points: [] },
  {
    version: "0.2.0",
    date: "2026-09-16",
    points: [
      "The v2 backend: defineModule(), API routes, middleware, backend-only apps, getStaticParams() for ssg/isr.",
      "Repo-splitting (devora split, sync, status) and the streaming render mode.",
      "A security audit pass: cross-app cookie binding, request-body caps, path-traversal fixes, a 405 for undeclared API methods.",
    ],
    anchor: "2026-09-16",
    anchorLabel: "2026-09-16",
  },
  {
    version: "0.1.x",
    points: [
      "0.1.1 and @devorajs/cli 0.1.2 (2026-09-08): the npm scope became @devorajs, the shared scaffold package, per-package READMEs.",
      "@devorajs/core 0.1.2: no CHANGELOG entry.",
      "0.1.0: the CHANGELOG records only the initial commit, 2026-09-07 (SSR/SSG/CSR/ISR, islands, sessions, security headers, SEO, the CLI, the three adapters), without a version number.",
      "2026-09-09 has an entry (a CI fix, docs) with no version bump.",
    ],
    anchor: "2026-09-08",
    anchorLabel: "2026-09-08",
  },
];

const CSS = `
  .rm-lead { max-width: 46rem; }
  .devora-page .rm-timeline { list-style: none; margin: 1.5rem 0 2rem; padding: 0 0 0 1.4rem; border-left: 2px solid var(--devora-border); }
  .rm-release { position: relative; margin: 0 0 1.1rem; padding: 0.9rem 1.1rem 1rem; border: 1px solid var(--devora-border); border-radius: var(--devora-radius); background: var(--devora-card); }
  .rm-release::before { content: ""; position: absolute; left: -1.95rem; top: 1.15rem; width: 12px; height: 12px; border-radius: 50%; background: var(--devora-accent-from); border: 2px solid var(--devora-bg); }
  .rm-release-head { display: flex; flex-wrap: wrap; align-items: baseline; gap: 0.3rem 0.75rem; }
  .devora-page .rm-release h3 { margin: 0; font-size: 1.05rem; }
  .rm-date { font-size: 0.82rem; color: var(--devora-fg-muted); }
  .rm-chip { font-size: 0.72rem; font-weight: 700; padding: 0.1rem 0.5rem; border-radius: 999px; border: 1px solid var(--devora-border); color: var(--devora-fg-muted); }
  .rm-chip-tag { color: #15803d; border-color: color-mix(in srgb, #16a34a 45%, transparent); }
  .rm-chip-no { color: #a16207; border-color: color-mix(in srgb, #ca8a04 50%, transparent); }
  :root[data-theme=dark] .rm-chip-tag { color: #4ade80; } :root[data-theme=dark] .rm-chip-no { color: #facc15; }
  @media (prefers-color-scheme: dark) { :root:not([data-theme=light]) .rm-chip-tag { color: #4ade80; } :root:not([data-theme=light]) .rm-chip-no { color: #facc15; } }
  .devora-page .rm-release ul { margin: 0.5rem 0 0; padding-left: 1.1rem; }
  .rm-release li { font-size: 0.9rem; line-height: 1.55; margin-bottom: 0.25rem; color: var(--devora-fg-muted); }
  .devora-page .rm-release p { margin: 0.55rem 0 0; font-size: 0.85rem; }
  .rm-cols { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; margin: 1rem 0 2rem; }
  .rm-col { --c: var(--devora-fg-subtle); padding: 1rem 1.1rem; border: 1px solid var(--devora-border); border-top: 3px solid var(--c); border-radius: var(--devora-radius); background: var(--devora-card); }
  .rm-col-now { --c: #16a34a; } .rm-col-next { --c: #2563eb; } .rm-col-later { --c: #8b5cf6; } .rm-col-not { --c: #64748b; }
  .devora-page .rm-col h3 { margin: 0 0 0.5rem; font-size: 1rem; }
  .devora-page .rm-col ul { margin: 0; padding-left: 1.1rem; }
  .rm-col li { font-size: 0.88rem; line-height: 1.55; margin-bottom: 0.4rem; color: var(--devora-fg-muted); }
`;

export default function Roadmap() {
  return (
    <PageShell nav={DOCS_NAV} footer={<SiteFooter />}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <DocsLayout active="roadmap">
        <h1>Roadmap</h1>
        <p className="devora-lead rm-lead">
          Devora.js is early and pre-1.0, built by one person. This page says what has shipped,
          version by version, and what is next. Every block below is taken from the{" "}
          <a href={CHANGELOG}>changelog</a> and the git tags (<code>v0.3.2</code> and{" "}
          <code>v0.3.4</code> are the only tags).
        </p>
        <p>
          The same content lives in{" "}
          <a href="https://github.com/hassanalsa3aka/devora.js/blob/main/ROADMAP.md">ROADMAP.md</a>{" "}
          on GitHub; the long, dated account of how each piece was built is the{" "}
          <a href="https://github.com/hassanalsa3aka/devora.js/blob/main/docs/history/BUILD-LOG.md">build log</a>.
        </p>

        <h2 id="done">Done, by version</h2>
        <ol className="rm-timeline" aria-label="Releases, newest first">
          {RELEASES.map((r) => (
            <li className="rm-release" key={r.version}>
              <div className="rm-release-head">
                <h3>{r.version}</h3>
                {r.date ? <span className="rm-date">{r.date}</span> : null}
                {r.tag ? <span className="rm-chip rm-chip-tag">tag {r.tag}</span> : null}
                {r.note ? <span className="rm-chip rm-chip-no">{r.note}</span> : null}
              </div>
              {r.points.length ? (
                <ul>
                  {r.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              ) : null}
              {r.anchor ? (
                <p>
                  <a href={`${CHANGELOG}#${r.anchor}`}>CHANGELOG: {r.anchorLabel ?? r.version}</a>
                </p>
              ) : null}
            </li>
          ))}
        </ol>

        <h2 id="ahead">What is ahead</h2>
        <div className="rm-cols">
          <section className="rm-col rm-col-now" aria-labelledby="rm-now">
            <h3 id="rm-now">Now</h3>
            <ul>
              <li>Outside testers: <a href="https://github.com/hassanalsa3aka/devora.js/blob/main/TESTING.md">the 15-minute guide</a>; what they hit shapes the next releases.</li>
              <li>Ship the clear "no session store configured" message (CHANGELOG, Unreleased).</li>
              <li>Verify 0.3.4 on a live Vercel and Netlify deployment.</li>
            </ul>
          </section>
          <section className="rm-col rm-col-next" aria-labelledby="rm-next">
            <h3 id="rm-next">Next</h3>
            <ul>
              <li><code>isr</code> regeneration on a serverless filesystem: verify it, or document the supported setup.</li>
              <li>Several <code>Set-Cookie</code> headers and streamed responses (server-sent events) from API routes.</li>
              <li>Move the <code>esbuild</code> override out of <code>package.json</code>'s <code>"pnpm"</code> field.</li>
            </ul>
          </section>
          <section className="rm-col rm-col-later" aria-labelledby="rm-later">
            <h3 id="rm-later">Later</h3>
            <ul>
              <li>A third-party security audit and signed release provenance, once the API surface settles.</li>
              <li>Desktop and native mobile apps: <strong>planned goals, not started, no dates.</strong> Business logic, backend client, validation and design tokens would be shared; the UI would be platform-specific.</li>
            </ul>
          </section>
          <section className="rm-col rm-col-not" aria-labelledby="rm-not">
            <h3 id="rm-not">Not planned</h3>
            <ul>
              <li>A built-in ORM, auth provider or file storage (bring your own).</li>
              <li>A real-time sync engine (use a realtime server: <a href="/live-updates">Live updates</a>).</li>
              <li>A custom RSC-style server/client serialization protocol.</li>
            </ul>
          </section>
        </div>

        <Callout kind="info" title="Where the dates come from">
          <p>
            Dates are the changelog's and the tags' dates. Versions without a changelog entry are
            listed as such rather than filled in.
          </p>
        </Callout>
      </DocsLayout>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Devora.js docs", item: `${SITE_URL}/` },
            { "@type": "ListItem", position: 2, name: "Roadmap", item: `${SITE_URL}/roadmap` },
          ],
        }}
      />
    </PageShell>
  );
}
