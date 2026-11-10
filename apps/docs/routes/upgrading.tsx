import type { ReactNode } from "react";
import { PageShell } from "@devorajs/core";
import { DOCS_NAV } from "../nav.js";
import { SiteFooter } from "../site-footer.js";
import { DocsLayout, Callout } from "../docs-layout.js";
import { pageMeta } from "../seo.js";

export const renderMode = "ssg";

export function meta() {
  return pageMeta("/upgrading", {
    title: "Upgrading to 0.4.1",
    description:
      "Every breaking change from Devora.js 0.3.5 to 0.4.0 and what an app has to do about it, the earlier behavior changes back to 0.3.1, and the steps.",
  });
}

export async function loader() {
  return {};
}

// From the 0.4.0 section of devora.js/CHANGELOG.md ("Breaking changes" and "Another change to check").
const CHANGES_040: { change: ReactNode; todo: ReactNode }[] = [
  {
    change: <><code>redirect()</code> refuses a target that leaves the app's origin: <code>https://evil.com</code>, <code>//evil.com</code>, <code>/\evil.com</code>, <code>javascript:</code> targets and their percent-encoded forms are a <strong>400</strong> (the error page renders; no <code>Location</code> is sent). A loader that returns a plain <code>{"{ redirect }"}</code> object is covered too.</>,
    todo: <>Search your routes for <code>redirect(</code> with a full URL. For a site you trust, list its origin: <code>redirect(url, {"{ allowedOrigins: [\"https://checkout.example.com\"] }"})</code>. A path such as <code>redirect("/account")</code> works as before, and a redirect built from user input needs no change.</>,
  },
  {
    change: <>A response that reads or sets the session cookie is sent with <strong><code>Cache-Control: private, no-store</code></strong>, replacing any <code>Cache-Control</code> the handler set. It covers pages, streaming pages, redirects, error pages and API routes. Bearer requests and requests without the session cookie are unchanged.</>,
    todo: <>If an API route sets <code>Cache-Control: public</code> or <code>s-maxage</code> on responses to logged-in browsers, that header is dropped for them. Put the cacheable version on a route that does not read the session. Otherwise nothing to do.</>,
  },
  {
    change: <>CSRF is checked by default for a write (any method but <code>GET</code>, <code>HEAD</code> and <code>OPTIONS</code>) that arrives with a live session in the session cookie. The token must be in the <code>_csrf</code> form field or the <code>x-devora-csrf</code> header, or the response is a <strong>403</strong>. Bearer requests, requests with no session cookie and reads are not checked by this default. For a signed-in browser the token is tied to the session, so a token from another session is refused.</>,
    todo: <>(1) Every page form with an <code>action</code> renders <code>{"<CsrfField token={csrfToken} />"}</code>. (2) A browser <code>fetch()</code> that writes to an API route sends the page's <code>csrfToken</code> in the <code>x-devora-csrf</code> header. (3) A webhook or other cross-site caller that sends the session cookie exports <code>export const csrf = false</code> from its route and verifies its caller itself. (4) A script that logs in and then posts a form must load the page again after login: a token read before login is not valid for the new session. (5) An app with <code>csrf: false</code> in <code>app.config.ts</code> has no CSRF cookie: its cookie-authenticated writes get a 403 unless the route opts out. Keep calling <code>ctx{"."}verifyCsrf()</code> yourself on anonymous writes such as a login form.</>,
  },
  {
    change: <><code>@devorajs/cli</code> requires <strong>vite <code>^8.3.7</code></strong> (it accepted <code>^5.4.0 || ^6.0.0</code>), so a new install resolves the current Vite; older releases have known vulnerabilities. <code>@vitejs/plugin-react</code> moves to <code>^6.3.0</code>, which supports Vite 8 only.</>,
    todo: <>Set <code>"vite": "^8.3.7"</code> and <code>"@vitejs/plugin-react": "^6.3.0"</code> in each app's <code>package.json</code> and reinstall. A lockfile pinning Vite 5, 6 or 7 must move, and a <code>vite.config.ts</code> that uses plugins or build options needs a look at the Vite 8 migration notes.</>,
  },
  {
    change: <><code>devora start</code> sets its own server limits, and a page form is limited: the whole request must arrive within <strong>60 seconds</strong> (Node's default was 5 minutes), the headers within 15 seconds; a form may carry <strong>1000</strong> non-file fields and <strong>20</strong> files.</>,
    todo: <>An app that accepts big uploads over slow links sets <code>server: {"{ requestTimeoutMs: 300000 }"}</code> in <code>app.config.ts</code>; one that really posts more than 20 files raises <code>maxFormFiles</code>. Behind a load balancer, set <code>server.keepAliveTimeoutMs</code> above its idle timeout.</>,
  },
  {
    change: <>When a cookie name is sent twice, the <strong>first</strong> value is used (it was the last). Browsers send an app's own cookie first, so a cookie set later from a sibling subdomain no longer replaces it. A cookie with a malformed percent-escape is kept as sent instead of failing the request.</>,
    todo: <>Nothing, unless your app relied on a duplicated cookie name: give the cookies distinct names.</>,
  },
  {
    change: <><code>rateLimit</code> counts an IPv6 client by its <strong>/64 prefix</strong> (the first four groups), so every address in one /64 shares a count. IPv4 clients are unchanged.</>,
    todo: <>Nothing, unless many real users share one /64 and one limit: raise <code>max</code> on that route.</>,
  },
  {
    change: <><code>create-devora</code> and <code>devora new</code> accept an app name only of lowercase letters, digits, <code>-</code> and <code>_</code> (at most 50 characters), and a domain only as a host name.</>,
    todo: <>Nothing for existing projects. Pick a lowercase name for new apps.</>,
  },
];
// From the 0.3.5 section of devora.js/CHANGELOG.md ("Behavior changes").
const CHANGES_035: { change: ReactNode; todo: ReactNode }[] = [
  {
    change: <>A missing session store, or (in production) a missing <code>DEVORA_SESSION_SECRET</code>, stops <code>devora start</code> with <strong>one clear line and exit status 1</strong> instead of a stack trace. It refused to start before and still does.</>,
    todo: <>Nothing to do. Add <code>sessions: {"{ store: \"memory\" }"}</code> under <code>shared</code> in <code>devora.config.ts</code> (one long-running server) or a store backed by your database, and set the secret.</>,
  },
  {
    change: <><code>ctx.url</code> and <code>ctx.headers</code> are built the first time a handler reads them. Reading them is unchanged (the same <code>URL</code> and <code>Headers</code> objects every time). They are now getters, so assigning to them throws in strict mode.</>,
    todo: <>Nothing to do unless your code assigns <code>ctx.url</code> or <code>ctx.headers</code>; the types never marked them read-only and nothing in the framework assigns them.</>,
  },
  {
    change: <>A rebuilt island or client-route manifest is picked up within a second, instead of on the next request.</>,
    todo: <>Nothing to do, as built static files already work this way.</>,
  },
  {
    change: <>The header's brand link has the accessible name <code>devora.js home</code> (it was <code>Home</code>, which did not contain its visible text).</>,
    todo: <>A test that selects it by <code>aria-label="Home"</code> needs the new name.</>,
  },
];

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
      <h1>Upgrading to 0.4.1</h1>
      <p>
        <strong>Use 0.4.1, not 0.4.0.</strong> The 0.4.0 packages of <code>@devorajs/core</code>, <code>@devorajs/cli</code> and <code>create-devora</code> were
        published from build output older than the source, so they lack some of the changes described here; 0.4.0 of those three is deprecated.
        0.4.1 is the same release built correctly. Everything below applies to 0.4.1.
      </p>
      <p>
        0.4.0 is a security hardening release. Three changes can make an existing app's requests fail until you act
        (<code>redirect()</code> to another origin, CSRF on cookie-authenticated writes, and a <code>Cache-Control</code>
        you relied on for logged-in responses), and the CLI now requires Vite 8.3.7 or later. Everything else is
        additive or only tightens a default. The <a href="/blog/devora-0-4-0">release post</a> has the short version,
        and <a href="/security">Security model</a> says what the defaults do and what they leave to you. If you are on
        0.3.4 or older, the 0.3.5, 0.3.4 and 0.3.2 changes are listed below too.
      </p>

      <h2 id="steps">Steps</h2>
      <ol>
        <li>
          Upgrade <code>@devorajs/core</code> and <code>@devorajs/cli</code> together, in the root{" "}
          <code>package.json</code> and every app's: <code>"^0.4.0"</code>, and set <code>vite</code> to{" "}
          <code>"^8.3.7"</code> (and <code>@vitejs/plugin-react</code> to <code>"^6.3.0"</code>). API routes run on the CLI's bundled copy of core and pages on the app's installed
          one, so mixing versions gives one project two behaviors.
        </li>
        <li>
          If you import an adapter directly, use <code>@devorajs/adapter-node</code>, <code>@devorajs/adapter-vercel</code>{" "}
          or <code>@devorajs/adapter-netlify</code> <code>0.3.0</code>: they depend on <code>@devorajs/core</code>{" "} {/* version-ok */}
          <code>^0.4.0</code> (<code>devora</code> bundles the adapters, so most projects don't depend on them at all).
        </li>
        <li>Install, then run <code>npm run typecheck</code>, <code>npm run dev</code> and <code>npm run build</code>.</li>
        <li>
          Go through the table below. The quickest test is to run <code>devora dev</code>, sign in, submit each form and
          call each write route from the browser once: a missing CSRF token shows up as a 403 right away.
        </li>
        <li>
          Optional, and worth doing: set <code>allowedHosts</code> in <code>app.config.ts</code>, add a{" "}
          <code>rateLimit</code> to login routes, and read the <a href="/security#new-in-0-4-0">new defaults</a>.
        </li>
      </ol>
      <p>
        A project made by <code>create-devora</code> 0.3.x keeps working. To use pnpm 11 or later, or Yarn 4, with it,
        add the files described on <a href="/getting-started#package-managers">Getting started</a>.
      </p>

      <h2 id="changes-040">From 0.3.5 to 0.4.0</h2>
      <div className="docs-table-wrap">
        <table>
          <thead><tr><th>What changed</th><th>What to do</th></tr></thead>
          <tbody>
            {CHANGES_040.map((c, i) => (
              <tr key={i}>
                <td>{c.change}</td>
                <td>{c.todo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p>
        TypeScript (0.3.4 and later): <code>ctx.params</code> keeps its type (<code>Record&lt;string, string&gt;</code>), {/* version-ok */}
        so existing code compiles unchanged. A catch-all's segments are joined with <code>/</code>{" "}
        there, and <code>ctx.catchAll.slug</code> (or <code>req.catchAll.slug</code> in an API
        route) is the <code>string[]</code>.
      </p>

      <h2 id="changes-035">From 0.3.4 to 0.3.5</h2>
      <div className="docs-table-wrap">
        <table>
          <thead><tr><th>What changed</th><th>What to do</th></tr></thead>
          <tbody>
            {CHANGES_035.map((c, i) => (
              <tr key={i}>
                <td>{c.change}</td>
                <td>{c.todo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
