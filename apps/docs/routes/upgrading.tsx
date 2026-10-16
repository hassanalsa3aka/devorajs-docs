import type { ReactNode } from "react";
import { PageShell } from "@devorajs/core";
import { DOCS_NAV } from "../nav.js";
import { SiteFooter } from "../site-footer.js";
import { DocsLayout, Callout } from "../docs-layout.js";
import { pageMeta } from "../seo.js";

export const renderMode = "ssg";

export function meta() {
  return pageMeta("/upgrading", {
    title: "Upgrading to 0.3.4",
    description:
      "Every behavior change from Devora.js 0.3.2 to 0.3.4 (and 0.3.1 to 0.3.2) and what an existing app has to do about it, plus the upgrade steps.",
  });
}

export async function loader() {
  return {};
}

// From the 0.3.4 section of devora.js/CHANGELOG.md ("Behavior changes").
// 0.3.3 was prepared but never published; its changes are in 0.3.4.
const CHANGES_034: { change: ReactNode; todo: ReactNode }[] = [
  {
    change: <>A file named <code>[...name].tsx</code> or <code>[[...name]].tsx</code> is now a <strong>catch-all route</strong>. Before, it was a single <code>[param]</code> whose name started with dots.</>,
    todo: <>If you have such a file, rename it, or expect it to match more URLs (<code>/docs/a/b/c</code>, not only <code>/docs/a</code>). Nothing else needs to change: <code>ctx.params</code> values are still strings.</>,
  },
  {
    change: <>A URL path containing a dot no longer ends at the static-file lookup. If no public file exists at that path, it goes on to route matching (so <code>/docs/v1.2/intro</code> can reach a catch-all).</>,
    todo: <>Nothing to do. A real file under the public folder still wins.</>,
  },
  {
    change: <><code>getStaticParams()</code> values are percent-encoded in the output path: a value with a space or non-ASCII characters is written under its encoded path, which is what <code>url.pathname</code> holds.</>,
    todo: <>Nothing to do unless you read <code>dist/static</code> by hand.</>,
  },
  {
    change: <><code>sitemap.xml</code> now lists the URLs of dynamic routes that export <code>getStaticParams()</code>.</>,
    todo: <>Nothing to do; check the file if you post-process it. A dynamic route without <code>getStaticParams()</code> is still left out.</>,
  },
  {
    change: <><code>devora start</code> answers any method other than GET and HEAD to a public file, a built asset or a pre-rendered (<code>ssg</code>) page with <strong>405</strong> and <code>Allow: GET, HEAD</code>. It used to return the file.</>,
    todo: <>A form that posts to a pre-rendered page never ran an action there; post to an <code>ssr</code> route instead.</>,
  },
  {
    change: <>Pre-rendered pages are sent with <code>Cache-Control: public, max-age=0, must-revalidate</code> and an <code>ETag</code> (a repeat visit gets a 304). Pages and files are held in memory — 64 MB in total, 2 MB per file, larger ones streamed — and re-checked against the disk once a second.</>,
    todo: <>Nothing to do. A rebuild into a running server shows up within a second; changed route code still needs a restart. See <a href="/deployment#static-files">Deployment</a>.</>,
  },
  {
    change: <>With <code>sitemap</code> off, a hand-written <code>public/sitemap.xml</code> is served. It used to 404 in production.</>,
    todo: <>Nothing to do. Turn <code>sitemap</code> on if you want the generated one (it takes precedence).</>,
  },
];

// From the 0.3.2 section of devora.js/CHANGELOG.md ("Behavior changes"),
// plus one change found upgrading this site (the theme variable).
const CHANGES: { change: ReactNode; todo: ReactNode }[] = [
  {
    change: <>Redirects after a POST are <strong>303 See Other</strong> (were 302); loader redirects stay 302.</>,
    todo: <>Browsers behave the same. Tests or clients that assert 302 after a form post: update them, or pass <code>redirect(to, 302)</code>.</>,
  },
  {
    change: <>Page errors keep their status: a thrown <code>HttpError</code> (or anything with a 4xx/5xx <code>status</code>) is that status, not a 500 — <code>requireAuth()</code> is 401, <code>verifyCsrf()</code> 403. Errors and unmatched URLs render <code>error.tsx</code> or a built-in page, in dev too.</>,
    todo: <>Anything that treated every page failure as a 500 should check the status. Add an <code>error.tsx</code> for your own error page.</>,
  },
  {
    change: <>The framework stylesheet and favicon are only added to pages that render <code>PageShell</code> or <code>AppHeader</code> (and CSR shells).</>,
    todo: <>A page that relied on the theme without the shell needs <code>head: {"{ theme: true }"}</code> in <code>app.config.ts</code> or its <code>meta().head</code>.</>,
  },
  {
    change: <><code>PageShell</code> wraps its content in <code>&lt;div class="devora-shell"&gt;</code>; the theme no longer sets <code>body {"{ display: flex }"}</code>.</>,
    todo: <>Adjust custom CSS that depended on <code>body</code> being the flex container, or on <code>main</code> being a direct child of <code>#root</code>. Props are unchanged.</>,
  },
  {
    change: <>The theme no longer defines <code>--devora-bg-elevated</code> (it has <code>--devora-surface</code> and more tokens). Not in the CHANGELOG; found upgrading this site.</>,
    todo: <>If your CSS uses it, replace it with <code>var(--devora-surface)</code> or define it yourself: <code>:root {"{ --devora-bg-elevated: var(--devora-surface); }"}</code>. A manual light/dark switch that overrides tokens should override the new ones too.</>,
  },
  {
    change: <>A backend-only app answers <code>GET /</code> with 200 (JSON for API clients, a small HTML page for browsers). It was a 404.</>,
    todo: <>Monitors that expected 404 there are fine to keep using <code>/api/health</code>.</>,
  },
  {
    change: <>Request bodies are limited to 10 MB by default (<code>maxBodyBytes</code>, forms and API routes); larger ones get a 413. Malformed multipart is a 400.</>,
    todo: <>Apps that accept larger uploads set <code>maxBodyBytes</code> in <code>app.config.ts</code>.</>,
  },
  {
    change: <><code>.env</code> files in the project root are loaded by <code>dev</code>, <code>build</code>, <code>start</code> and <code>deploy</code>; variables already in the environment win.</>,
    todo: <>Check the project root for stale <code>.env</code> files, and drop <code>node --env-file</code> wrappers.</>,
  },
  {
    change: <><code>devora start</code> reads <code>PORT</code> and <code>HOST</code> (<code>--port</code>/<code>--host</code> still win).</>,
    todo: <>A <code>PORT</code> left in the environment now moves the server; unset it or pass <code>--port</code>.</>,
  },
  {
    change: <><code>devora build --adapter=</code> anything other than <code>vercel</code>/<code>netlify</code> fails, instead of building without the requested output.</>,
    todo: <>Scripts using <code>--adapter=node</code> drop the flag: <code>devora build</code>, then <code>devora start</code>.</>,
  },
  {
    change: <>The Vercel runtime is no longer <code>nodejs20.x</code> (Vercel rejects it): <code>vercel.runtime</code>, else the running Node major, else <code>engines.node</code>, else <code>nodejs24.x</code>.</>,
    todo: <>Nothing, unless you need a specific runtime. An <code>engines.node</code> no supported runtime satisfies fails the build.</>,
  },
  {
    change: <><code>adapter-vercel</code> empties <code>.vercel/output</code> before writing it.</>,
    todo: <>Don't keep files of your own in that directory.</>,
  },
  {
    change: <>The generated Vercel and Netlify functions trust the platform's proxy headers (<code>trustProxy: true</code> unless the app sets <code>false</code>).</>,
    todo: <>Nothing, unless the function can be reached without going through the platform's edge.</>,
  },
  {
    change: <><code>devora build</code> only imports <code>ssg</code>/<code>isr</code> routes (and routes whose render mode isn't a string literal).</>,
    todo: <>Nothing, unless a build relied on a request-time route running at build time.</>,
  },
  {
    change: <>Unsupported <code>island()</code> calls (<code>island(loader)</code>, a computed path, a path that doesn't resolve) fail the build and dev server with the file and line.</>,
    todo: <>Fix the reported call to <code>island(() =&gt; import("./path"))</code>.</>,
  },
  {
    change: <>Session config that used to be ignored is an error: session settings on an <code>auth: "none"</code> app, a <code>cookie.domain</code> that doesn't cover the app, per-app lifetimes on a shared app.</>,
    todo: <>Fix or remove the setting the error names.</>,
  },
  {
    change: <><code>devora dev</code>'s boot output has a new layout: every app's URLs first, then routes per app; more than 10 API routes per app are counted.</>,
    todo: <>Anything that parsed the old output should use <code>--routes</code> and match the new lines.</>,
  },
];

export default function Upgrading() {
  return (
    <PageShell nav={DOCS_NAV} footer={<SiteFooter />}>
      <DocsLayout active="upgrading">
      <h1>Upgrading to 0.3.4</h1>
      <p>
        0.3.4 adds catch-all routes (<code>[...slug]</code>), a faster static-file path, and a
        documented pattern for live updates. 0.3.3 was prepared but never published, so its
        changes are part of 0.3.4. If you are on 0.3.1 or older, the 0.3.2 changes are listed
        below too, since 0.3.2 was a large release.
      </p>

      <h2 id="steps">Steps</h2>
      <ol>
        <li>
          Upgrade <code>@devorajs/core</code> and <code>@devorajs/cli</code> together, in the root{" "}
          <code>package.json</code> and every app's: <code>"^0.3.4"</code>. API routes run on the
          CLI's bundled copy of core and pages on the app's installed one, so mixing versions gives
          one project two behaviors.
        </li>
        <li>
          If you import an adapter directly, use <code>@devorajs/adapter-node</code> 0.2.1,{" "}
          <code>@devorajs/adapter-vercel</code> 0.2.3 or <code>@devorajs/adapter-netlify</code>{" "}
          0.2.4 (<code>devora</code> bundles the adapters, so most projects don't depend on them at
          all). Earlier adapter-node 0.2.0 and the 0.2.2 adapters were published without their
          build output and are deprecated.
        </li>
        <li>Install, then run <code>npm run typecheck</code>, <code>npm run dev</code> and <code>npm run build</code>.</li>
        <li>Go through the tables below and change what applies to your app.</li>
      </ol>
      <p>
        TypeScript: <code>ctx.params</code> keeps its type (<code>Record&lt;string, string&gt;</code>),
        so existing code compiles unchanged. A catch-all's segments are joined with <code>/</code>{" "}
        there, and <code>ctx.catchAll.slug</code> (or <code>req.catchAll.slug</code> in an API
        route) is the <code>string[]</code>.
      </p>

      <h2 id="changes-034">From 0.3.2 to 0.3.4</h2>
      <div className="docs-table-wrap">
        <table>
          <thead><tr><th>What changed</th><th>What to do</th></tr></thead>
          <tbody>
            {CHANGES_034.map((c, i) => (
              <tr key={i}>
                <td>{c.change}</td>
                <td>{c.todo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 id="changes">From 0.3.1 to 0.3.2</h2>
      <p>
        0.3.2 was a large release for a patch number: request access in loaders, actions that
        return data, error pages, a <code>&lt;head&gt;</code> API, uploads, cookie and proxy
        settings, CORS, <code>.env</code> loading and a fixed Vercel runtime. Most of it is new
        options; this is what can change how an existing app behaves.
      </p>
      <div className="docs-table-wrap">
        <table>
          <thead><tr><th>What changed</th><th>What to do</th></tr></thead>
          <tbody>
            {CHANGES.map((c, i) => (
              <tr key={i}>
                <td>{c.change}</td>
                <td>{c.todo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        Before deploying to Vercel, check the preflight output of{" "}
        <code>devora build --adapter=vercel</code> (runtime, a top-level <code>api/</code> folder,
        session secret and store), and see <a href="/deployment">Deployment</a>.
      </p>

      <Callout kind="tip" title="Worth adopting while you're here">
        <p>
          Move API routes out of a top-level <code>api/</code> folder if you deploy to Vercel (
          <code>apiDir: "endpoints"</code>), set <code>trustProxy</code> behind nginx/Caddy, and
          replace hand-rolled query-string parsing with <code>ctx.url</code>. See{" "}
          <a href="/pages-forms-errors">Pages, forms and errors</a> and{" "}
          <a href="/backend">Backend</a>.
        </p>
      </Callout>
      <p>
        The complete list per package is in the{" "}
        <a href="https://github.com/hassanalsa3aka/devora.js/blob/main/CHANGELOG.md">CHANGELOG</a>.
      </p>
      </DocsLayout>
    </PageShell>
  );
}
