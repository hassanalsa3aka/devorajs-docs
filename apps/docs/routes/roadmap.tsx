import { PageShell } from "@devorajs/core";
import { DOCS_NAV } from "../nav.js";
import { SiteFooter } from "../site-footer.js";
import { DocsLayout, Callout } from "../docs-layout.js";
import { JsonLd, pageMeta, SITE_URL } from "../seo.js";
import items from "../data/roadmap-items.json";
import findings from "../data/roadmap-findings.json";

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

const BUILD_LOG = "https://github.com/hassanalsa3aka/devora.js/blob/main/docs/history/BUILD-LOG.md";
const CHANGELOG = "https://github.com/hassanalsa3aka/devora.js/blob/main/CHANGELOG.md";

interface Release {
  version: string;
  date?: string;
  tag?: string;
  note?: string;
  points: string[];
  anchor?: string;
  anchorLabel?: string;
  post?: string;
}

// Every block comes from CHANGELOG.md and the git tags (v0.3.2, v0.3.4 and v0.3.5
// are the only tags). A version with no CHANGELOG entry says so.
const RELEASES: Release[] = [
  {
    version: "0.4.1",
    date: "2026-11-10",
    tag: "v0.4.1",
    points: [
      "A security hardening release: CSRF is checked by default for cookie-authenticated writes, redirect() stays on the app's origin, responses that touch the session cookie are private, no-store, and the CLI requires Vite 8.3.7 or later. Each breaking change has a migration step.",
      "New settings: allowedHosts, server timeouts and a header size limit, form field and file limits, an opt-in per-route rateLimit; nosniff everywhere, a sandbox policy for .svg files, symlink-safe static files, and a dev server that restarts on config, env and route-file changes.",
      "New projects install and run on pnpm 11 and later and on Yarn 4's default settings. There has been no third-party audit.",
      "Packages: @devorajs/core 0.4.1, @devorajs/cli 0.4.1, @devorajs/adapter-node 0.3.0, @devorajs/adapter-vercel 0.3.0, @devorajs/adapter-netlify 0.3.0, create-devora 0.4.1, and the new @devorajs/sekhem 0.1.0. 0.4.0 of core, cli and create-devora was published from stale build output and is deprecated: use 0.4.1.", // version-ok
    ],
    anchor: "041--2026-11-10",
    post: "/blog/devora-0-4-0",
  },
  {
    version: "0.3.5",
    date: "2026-10-16",
    tag: "v0.3.5",
    points: [
      "Faster request handling in devora start: work that never changes per request is done once. Interleaved A/B on one machine: +15% JSON list, +32% authenticated GET, +21% POST, +41% pre-rendered page, +23% server-rendered page; form POST about 32,000 to 82,000 req/s. No security default weakened.",
      "A missing session store or secret stops devora start with one clear line; the header brand link's accessible name contains its visible text.",
      "Guides for Live updates (WebSockets) and Background jobs, a new examples/background-jobs, backend benchmark scenarios, and a restored roadmap.",
      "Packages: @devorajs/core 0.3.5, @devorajs/cli 0.3.5, create-devora 0.3.3; the adapters are unchanged.",
    ],
    anchor: "035--2026-10-16",
    post: "/blog/devora-0-3-5",
  },
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
    post: "/blog/devora-0-3-4",
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
  {
    version: "0.2.2 and 0.2.1",
    date: "2026-09-16",
    points: [
      "@devorajs/core 0.2.1 (footer structure in the branding component) and 0.2.2 (footer styles and a package exports restructure). The CHANGELOG notes for them were reconstructed from git history and npm publish times.",
    ],
    anchor: "package-notes-reconstructed-from-git-history-and-npm-publish-times",
    anchorLabel: "reconstructed notes",
  },
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
      "@devorajs/core 0.1.2 (2026-09-09): dynamic routes and the devora deploy fixes of that day; its CHANGELOG note was reconstructed from git history.",
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

  .rm-ol { padding-left: 1.2rem; } .rm-ol li { margin-bottom: 0.5rem; line-height: 1.6; }
  .rm-board { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; margin: 1rem 0 2rem; }
  .rm-board .rm-col { --c: var(--devora-fg-subtle); }
  .rm-b-done { --c: #16a34a; } .rm-b-prog { --c: #ca8a04; } .rm-b-gap { --c: #dc2626; } .rm-b-plan { --c: #2563eb; } .rm-b-out { --c: #64748b; } .rm-b-goal { --c: #8b5cf6; }
  .rm-tablewrap { overflow-x: auto; border: 1px solid var(--devora-border); border-radius: var(--devora-radius); margin: 1rem 0 2rem; }
  .rm-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; min-width: 640px; }
  .rm-table th, .rm-table td { text-align: left; padding: 0.55rem 0.7rem; border-bottom: 1px solid var(--devora-border); vertical-align: top; line-height: 1.5; }
  .rm-table th { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.04em; color: var(--devora-fg-muted); background: var(--devora-card); }
  .rm-table td { color: var(--devora-fg-muted); } .rm-table td:first-child { color: var(--devora-fg); font-weight: 600; white-space: nowrap; }
  .rm-st { display: inline-block; font-size: 0.72rem; font-weight: 700; padding: 0.1rem 0.5rem; border-radius: 999px; border: 1px solid var(--devora-border); white-space: nowrap; }
  .rm-st-Fixed { color: #15803d; } .rm-st-Partly { color: #a16207; } .rm-st-Open { color: #b91c1c; } .rm-st-Unconfirmed { color: #6d28d9; } .rm-st-NA { color: #475569; }
  :root[data-theme=dark] .rm-st-Fixed { color: #4ade80; } :root[data-theme=dark] .rm-st-Partly { color: #facc15; } :root[data-theme=dark] .rm-st-Open { color: #f87171; } :root[data-theme=dark] .rm-st-Unconfirmed { color: #c4b5fd; } :root[data-theme=dark] .rm-st-NA { color: #94a3b8; }
  @media (prefers-color-scheme: dark) { :root:not([data-theme=light]) .rm-st-Fixed { color: #4ade80; } :root:not([data-theme=light]) .rm-st-Partly { color: #facc15; } :root:not([data-theme=light]) .rm-st-Open { color: #f87171; } :root:not([data-theme=light]) .rm-st-Unconfirmed { color: #c4b5fd; } :root:not([data-theme=light]) .rm-st-NA { color: #94a3b8; } }
  .rm-counts { display: flex; flex-wrap: wrap; gap: 0.5rem; margin: 0.75rem 0; }
  .devora-page .rm-live { padding-left: 1.1rem; } .rm-live li { margin-bottom: 0.5rem; line-height: 1.6; }
`;

const stClass = (st: string) => "rm-st rm-st-" + (st === "Partly fixed" ? "Partly" : st === "N/A" ? "NA" : st);
const counts = (findings as { status: string }[]).reduce<Record<string, number>>((m, f) => {
  m[f.status] = (m[f.status] ?? 0) + 1;
  return m;
}, {});
const plain = (t: string) => t.replace(/`/g, "");

export default function Roadmap() {
  return (
    <PageShell nav={DOCS_NAV} footer={<SiteFooter />}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <DocsLayout active="roadmap">
        <h1>Roadmap</h1>
        <p className="devora-lead rm-lead">
          Devora.js is early and pre-1.0, built by one person. This page says what has shipped,
          version by version, and what is next. Every block below is taken from the{" "}
          <a href={CHANGELOG}>changelog</a> and the git tags (<code>v0.3.2</code>,{" "}
          <code>v0.3.4</code>, <code>v0.3.5</code> and <code>v0.4.1</code> are the only tags).
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
                  {r.post ? <><a href={r.post}>Release post</a> · </> : null}
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
              <li>Deploy this site with the numbers measured on the published 0.3.5 packages, and the release post.</li>
              <li>Verify 0.3.5 on a live multi-app Vercel and Netlify deployment, with sessions and API routes (finding N1; this documentation site, a pre-rendered single app, already runs on Vercel with 0.3.5).</li>
            </ul>
          </section>
          <section className="rm-col rm-col-later" aria-labelledby="rm-later">
            <h3 id="rm-later">Later</h3>
            <ul>
              <li>A third-party security audit and signed release provenance, once the API surface settles.</li>
            </ul>
          </section>
          <section className="rm-col rm-col-not" aria-labelledby="rm-not">
            <h3 id="rm-not">Not planned</h3>
            <ul>
              <li>A built-in ORM, auth provider or file storage (bring your own).</li>
              <li>A real-time sync engine (use a realtime server: <a href="/live-updates">Live updates (WebSockets)</a>).</li>
              <li>A custom RSC-style server/client serialization protocol.</li>
            </ul>
          </section>
        </div>


        <h2 id="next">Next: open findings, proposed order</h2>
        <p>
          A proposal for the maintainer to confirm or change, ranked by impact. Nothing here has a
          version or a date. Y1, Y6 and O2 stay Unconfirmed and are not ranked.
        </p>
        <div className="rm-tablewrap" tabIndex={0}>
          <table className="rm-table">
            <thead><tr><th>Order</th><th>Finding</th><th>Why it ranks here</th></tr></thead>
            <tbody>
              <tr><td>1</td><td>N1: 0.3.5 verified live only for this documentation site (a pre-rendered single app on Vercel); not for multi-app, sessions, API routes or Netlify</td><td>Every deploy claim depends on it</td></tr>
              <tr><td>2</td><td>B5: several Set-Cookie headers and SSE from API routes</td><td>A real capability gap testers hit</td></tr>
              <tr><td>3</td><td>O4: the scaffold writes @devorajs/backend into new projects</td><td>The name could collide with a future real package; harder to change later</td></tr>
              <tr><td>4</td><td>U13, U14: an official session-store pattern or package; a built-in health route</td><td>Every production app needs both</td></tr>
              <tr><td>5</td><td>P14: adb reverse docs for testing on a physical device</td><td>Small, docs only</td></tr>
              <tr><td>6</td><td>U4: apiRoute() catches errors itself, so an outer wrapper cannot see them</td><td>Surprising for logging and monitoring wrappers</td></tr>
              <tr><td>7</td><td>O5: signSession and verifySession still exported (deprecated)</td><td>A removal is a breaking change</td></tr>
              <tr><td>8</td><td>V6, Y2: one large function per app; backend duplicated per app</td><td>Never measured; measure first</td></tr>
              <tr><td>9</td><td>N3, X2: isr regeneration on a serverless filesystem</td><td>Verified only under adapter-node</td></tr>
              <tr><td>10</td><td>N2, N4, N5: container platforms, systemd unit, DB client under load</td><td>Need real hosts or load tests</td></tr>
              <tr><td>11</td><td>U9, X1: the CLI bundles core; dynamic ssg/isr needs getStaticParams()</td><td>By design; documented, not defects</td></tr>
            </tbody>
          </table>
        </div>

        <h2 id="vision">Vision (not started, no dates)</h2>
        <p>
          A desktop app and a native mobile app. If they happen, business logic, the backend client,
          validation and design tokens would be shared and the UI would be platform-specific. React
          was chosen partly to keep that door open. Mobile, and the Metro-class bundler and device
          tooling it would need, come later than desktop: nothing for them exists in the code.
        </p>

        <h2 id="experimental">Experimental, off by default</h2>
        <p>
          Shipped with 0.4, each behind an explicit opt-in:
        </p>
        <ul>
          <li>
            <strong>A desktop target</strong> (<code>devora desktop ... --experimental</code>, Tauri 2): the same
            app in a window, its server as a sidecar on 127.0.0.1 with a random port and a per-launch token, one
            allowed origin, no IPC command unless listed, no unsigned updates. On macOS an automated check
            (<code>pnpm run check:desktop-window</code>) builds the Rust shell, opens the real window and has the page report back;
            nobody has clicked through it by hand, and Windows and Linux are not tested. See the{" "}
            <a href="/cli-reference#desktop">CLI reference</a>.
          </li>
          <li>
            <strong>What a music-player-style desktop app needs</strong> (a Spotify-style app), and what Devora.js has of it today:
            audio playback (the web view's own audio element; nothing in the framework), media keys and the system now-playing
            panel (an operating-system integration per platform: not built), a tray icon and menu (Tauri has one; not wired up
            by <code>devora desktop</code>), offline listening (stored files and a service-worker or file cache with an
            expiry policy: not built, and a rights question before a technical one), and protected streams. Streams protected
            by DRM depend on what each platform's web view supports; this project has not tested any, so assume it will not work
            until a test on the target platform says it does. A shipped app also needs signing and an update channel.
          </li>
          <li>
            <strong>Sekhem, the engine of our own</strong> (<code>devora dev --engine=own</code> and <code>devora build --engine=own</code>):
            experimental, the separate package <code>@devorajs/sekhem</code> (install it with npm; <code>create-devora</code> adds it to a
            project that chooses it), and not the default (<code>devora dev</code> is Vite). It renders pages and API routes with the same handlers as the Vite
            path, with esbuild transforms, React Fast Refresh, CSS and assets, and hot updates over a WebSocket on
            127.0.0.1 with an Origin check and a per-launch token; files are served from listed folders only, with
            symlinks checked and no dotfiles, and it refuses production. It does not read <code>vite.config.ts</code>{" "}
            (no Vite plugins), and has no PostCSS or Sass, no <code>--host</code> and no HTTPS; tsconfig path aliases,
            CSS modules and <code>import.meta.glob</code> work. It needs Node 22.15 or later. Its production build writes the same layout as the Vite build (checked on the four example apps). Measurements are on the{" "}
            <a href="/performance">Performance page</a>. Vite stays the default dev server and build.
          </li>
        </ul>

        <h2 id="ideas">Ideas (open, not promised)</h2>
        <p>Nothing here is planned, scheduled or numbered.</p>
        <ul>
          <li><em>Example:</em> an idea goes here as one line, with no version and no date.</li>
        </ul>

        <h2 id="performance">Performance program</h2>
        <p>
          The aim is to close the gaps and publish measured results, including where Devora.js is
          behind. Numbers come from the <a href="/performance">benchmark harness</a> and are never
          edited by hand. After the first pass (published 0.3.5; a difference inside a framework's
          own run-to-run spread counts as a tie), Devora.js is ahead of the other four frameworks on
          the pre-rendered page, the server-rendered page and the form POST; on the JSON API
          scenarios it is behind Fastify, Hono and NestJS on Fastify, and level with four
          frameworks on the 2 ms async scenario (findings S1 to S4).
        </p>

        <h2 id="success">Definition of success</h2>
        <p>
          From <a href="https://github.com/hassanalsa3aka/devora.js/blob/main/docs/design/architecture-v1.md">architecture-v1 §14</a>:
          v1 is "done" when a solo or small team can build a real project with a marketing site, an
          app and an admin panel sharing auth and a core, deploy each independently, get good SEO
          out of the box, and not hit a single <code>window is not defined</code> crash from a client
          library, all without reading framework internals to understand why something cached or
          didn't. Five things must all be true at once:
        </p>
        <ol className="rm-ol">
          <li>Routes actually render (SSR, SSG, CSR, streaming, ISR per <code>renderMode</code>). SSR and SSG/CSR/ISR were done in v1; streaming was deferred from v1 and shipped in v2.</li>
          <li>Auth and session context is real, shared by default, isolable per app. Done.</li>
          <li>Client-only libraries (three.js, fabric.js) never crash on the server. Done; <code>clientOnly()</code> is verified with a real negative control.</li>
          <li>Each app deploys independently to at least one real target. Done: adapter-node, Vercel and Netlify were deployed live by the maintainer with releases before 0.3.2, by git integration and by <code>devora deploy</code>. 0.3.5 is verified live only for this documentation site (a single pre-rendered app on Vercel since 2026-10-16); the multi-app demos, sessions and API functions, and Netlify are not yet verified on it.</li>
          <li>SEO primitives work: OG tags and a per-app opt-in <code>sitemap.xml</code>, both verified.</li>
        </ol>

        <h2 id="status">Status board</h2>
        <div className="rm-board">
          <section className="rm-col rm-b-done"><h3>Done: built and verified</h3><ul>
            <li>SSR, SSG, CSR, ISR and streaming rendering</li>
            <li>Sessions, CSRF, per-app auth modes (shared, isolated, none)</li>
            <li>Security headers (CSP, HSTS, X-Frame-Options) on by default</li>
            <li>Islands and partial hydration, in dev and production</li>
            <li>SEO primitives: OG tags, opt-in <code>sitemap.xml</code></li>
            <li>Dynamic routes with <code>getStaticParams()</code>; catch-all routes (<code>[...slug]</code>, <code>[[...slug]]</code>) since 0.3.4</li>
            <li>v2 backend: modules, API routes, middleware, backend-only apps, repo-splitting</li>
            <li>0.3.2: request access, action results, error pages, head API, uploads, cookie and proxy settings, CORS, <code>.env</code> loading, <code>@devorajs/adapter-node</code></li>
            <li>0.3.4: catch-all routes, the static file cache, content types, sitemap URLs, the live-updates pattern</li>
            <li>0.3.5: faster request handling, one clear message for a missing session store, guides for live updates (WebSockets) and background jobs</li>
            <li>0.4.0: CSRF checked by default for cookie-authenticated writes, redirect() on the app's origin, no-store session responses, allowedHosts, server and form limits, a dev server that restarts itself, new projects that install on pnpm 11+ and Yarn 4</li>
            <li><code>clientOnly()</code>; the <code>devora</code> CLI under npm, Yarn and pnpm</li>
            <li>adapter-node, adapter-vercel, adapter-netlify: build output verified in isolation</li>
            <li>Live Vercel and Netlify deployment (all three apps) with releases before 0.3.2</li>
            <li><code>devora deploy</code>: a real authenticated deploy on both platforms before 0.3.2</li>
            <li>Docker, self-hosted VPS (nginx and Caddy; systemd unit template untested), GitHub Actions CI</li>
          </ul></section>
          <section className="rm-col rm-b-prog"><h3>In progress / partial</h3><ul>
            <li>0.3.5 on a live Vercel or Netlify deployment: verified only for this documentation site (a single pre-rendered app on Vercel); multi-app, sessions, API routes and Netlify are not yet verified</li>
            <li><code>isr</code> on Vercel and Netlify: the initial build serves correctly; ongoing regeneration on a non-persistent serverless filesystem is unverified</li>
            <li>Domain auto-binding for a <code>devora deploy</code>-managed app: not built, deliberately scoped out</li>
          </ul></section>
          <section className="rm-col rm-b-gap"><h3>Known gaps, not scheduled</h3><ul>
            <li>Several <code>Set-Cookie</code> headers and streamed (SSE) responses from API routes</li>
            <li>Moving the <code>esbuild</code> override out of <code>package.json</code>'s <code>"pnpm"</code> field (pnpm 11 ignores it)</li>
          </ul></section>
          <section className="rm-col rm-b-plan"><h3>Planned</h3><ul>
            <li>A formal third-party security audit and signed release provenance, once the API surface stabilizes</li>
          </ul></section>
          <section className="rm-col rm-b-out"><h3>Deliberately not planned</h3><ul>
            <li>A built-in ORM, auth provider or file storage</li>
            <li>A real-time sync engine</li>
            <li>A custom RSC-style serialization protocol</li>
          </ul></section>
          <section className="rm-col rm-b-goal"><h3>Planned goals, not started</h3><ul>
            <li>Desktop and native mobile apps. Nothing is published and there are no dates; mobile and its Metro-class tooling come after desktop. React was chosen partly to keep that door open.</li>
          </ul></section>
        </div>

        <h2 id="items">The 14 work items</h2>
        <p>Each is described in the <a href={BUILD_LOG}>build log</a> as it was when it landed.</p>
        <div className="rm-tablewrap" tabIndex={0}>
          <table className="rm-table">
            <thead><tr><th>#</th><th>Item</th><th>Status</th><th>Section</th></tr></thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.n}>
                  <td>{i.n}</td>
                  <td>{plain(i.title)}</td>
                  <td>{plain(i.status)}</td>
                  <td><a href={`${BUILD_LOG}#${i.anchor}`}>Build log #{i.n}</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 id="live">Live deployment history</h2>
        <ul className="rm-live">
          <li><strong>Vercel, git integration:</strong> all three demo apps live with releases before 0.3.2. Two bugs only a live deploy found were fixed: <code>Cannot find package 'react'</code> and <code>jsxDEV is not a function</code> (<code>NODE_ENV</code> unset in the build step).</li>
          <li><strong>Netlify, git integration:</strong> all three demo apps live, before 0.3.2. Found live and fixed: <code>Could not resolve entry module "index.html"</code> (a build-output-only <code>netlify.toml</code>), then <code>package.json</code> and <code>node_modules</code> in <code>included_files</code> (2026-09-16).</li>
          <li><strong><code>devora deploy</code>:</strong> a real authenticated deploy on both platforms, before 0.3.2. Domain auto-binding not built.</li>
          <li><strong>Docker:</strong> real build, run and compose; login, CSRF and tampered-cookie regression inside the container; all three apps concurrently. Container platforms (Cloud Run, App Runner, Azure Container Apps) not verified.</li>
          <li><strong>VPS:</strong> <code>devora generate:proxy</code> verified against a real local nginx and <code>caddy validate</code>. The systemd unit template is untested on a host.</li>
          <li><strong>CI:</strong> installs the workspace under npm, Yarn 1 and pnpm 9; under pnpm only, runs the tests, builds every app (and both adapter targets) and typechecks fresh scaffolds.</li>
          <li><strong>0.3.5 live:</strong> this documentation site, one app with every page pre-rendered, runs on Vercel with <code>@devorajs/core</code> and <code>@devorajs/cli</code> 0.3.5 (deployed 2026-10-16, built from the npm packages). That site has no session store, no API route and no serverless function in use, so the generated functions, sessions and the multi-app demos are not verified live on 0.3.5, and neither is Netlify. Those were run outside the monorepo only.</li>
        </ul>

        <h2 id="findings">Findings</h2>
        <p>
          {findings.length} findings from the pre-v3 hotfix list, hotfix round 3 and VERIFICATION.md.
          Fixed means a release plus a file, test or changelog line that proves it; Unconfirmed means
          never reproduced or checked, and is not guessed.
        </p>
        <div className="rm-counts">
          {Object.entries(counts).map(([k, v]) => (
            <span key={k} className={stClass(k)}>{k}: {v}</span>
          ))}
        </div>
        <div className="rm-tablewrap" tabIndex={0}>
          <table className="rm-table">
            <thead><tr><th>ID</th><th>Finding</th><th>Status</th><th>Version</th><th>Evidence</th><th>Described in</th></tr></thead>
            <tbody>
              {(findings as { id: string; finding: string; status: string; version: string; evidence: string; described: string }[]).map((f) => (
                <tr key={f.id}>
                  <td>{f.id}</td>
                  <td>{f.finding}</td>
                  <td><span className={stClass(f.status)}>{f.status}</span></td>
                  <td>{f.version || "-"}</td>
                  <td>{f.evidence}</td>
                  <td>{f.described}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
