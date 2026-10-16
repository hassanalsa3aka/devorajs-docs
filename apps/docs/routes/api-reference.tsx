import { PageShell } from "@devorajs/core";
import { DOCS_NAV } from "../nav.js";
import { SiteFooter } from "../site-footer.js";
import { DocsLayout, Tag, Callout } from "../docs-layout.js";
import { pageMeta } from "../seo.js";

export const renderMode = "ssg";

export function meta() {
  return pageMeta("/api-reference", {
    title: "API reference",
    description:
      "Every function, type, and component exported from @devorajs/core — PageShell, defineApp, ctx, serverFn, apiRoute, modules, middleware, and islands.",
  });
}

export async function loader() {
  return {};
}

export default function ApiReference() {
  return (
    <PageShell nav={DOCS_NAV} footer={<SiteFooter />}>
      <DocsLayout active="api-reference">
      <h1>API reference</h1>
      <p>
        Every public export from <code>@devorajs/core</code>, grouped by what it's for. This is
        the code-level companion to <a href="/core-concepts">Core concepts</a> and{" "}
        <a href="/backend">Backend</a> — those pages explain the ideas, this page is what to
        actually import.
      </p>

      <h2>Where things come from</h2>
      <p>Three entry points, not one — importing from the wrong one is the most common mistake:</p>
      <div className="docs-table-wrap">
          <table>
          <thead>
            <tr><th>Import path</th><th>Use it from</th><th>Has</th></tr>
          </thead>
          <tbody>
            <tr>
              <td><code>@devorajs/core</code></td>
              <td>Any <code>ssr</code>/<code>ssg</code>/<code>isr</code>/<code>streaming</code> route or server file</td>
              <td>Everything below except the client-only row</td>
            </tr>
            <tr>
              <td><code>@devorajs/core/client</code></td>
              <td>A <code>csr</code> route, or any island component</td>
              <td><code>PageShell</code>, <code>AppHeader</code>, theme — browser-safe subset only</td>
            </tr>
            <tr>
              <td><code>@devorajs/core/config</code></td>
              <td><code>devora.config.ts</code> / <code>app.config.ts</code></td>
              <td><code>defineProject</code>, <code>defineApp</code></td>
            </tr>
          </tbody>
        </table>
      </div>
      <Callout kind="warning" title="Why the split exists">
        <p>
          The main entry's export chain reaches real Node builtins (
          <code>node:crypto</code> in session/CSRF code, <code>node:fs</code> in the router) —
          fine for a server file, but a <code>renderMode: "csr"</code> route is <em>also</em> built
          for the browser. Importing <code>PageShell</code> from the main barrel inside a{" "}
          <code>csr</code> route breaks that client build outright. Use{" "}
          <code>@devorajs/core/client</code> there instead — see the{" "}
          <a href="/render-modes">csr example</a>.
        </p>
      </Callout>

      <h2>Page &amp; navigation</h2>
      <p>
        <code>PageShell</code> — wraps a route's content with the shared header + content
        container every app uses, so a page looks the same whether it's marketing, dashboard, or
        admin.
      </p>
      <div className="devora-card">
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
{`function PageShell(props: {
  appName?: string;   // shown as a badge in the header — omit for e.g. marketing
  nav?: NavLink[];     // this app's own link set (see apps/*/nav.ts)
  footer?: ReactNode;  // renders inside the shared <footer>, above "Built with devora.js"
  footerLinks?: NavLink[]; // plain links in the footer's bottom row (0.3.2)
  children: ReactNode;
}): JSX.Element`}
        </pre>
      </div>
      <p>
        <code>NavLink</code> — the shape <code>nav</code> expects: <code>{`{ label: string; href: string }`}</code>.{" "}
        <code>AppHeader</code> is the header alone (what <code>PageShell</code> renders
        internally) — reach for it directly only if you're composing your own page chrome instead
        of using <code>PageShell</code>.
      </p>
      <p>
        Since 0.3.2 the framework's stylesheet and favicon are only added to pages that render{" "}
        <code>PageShell</code> or <code>AppHeader</code>; <code>head.theme</code> overrides that.
        The shell's markup is a <code>.devora-shell</code> column (header, <code>main.devora-page</code>,
        footer), so the footer stays at the bottom of short pages. Its CSS custom properties (
        <code>--devora-bg</code>, <code>--devora-surface</code>, <code>--devora-fg</code>,{" "}
        <code>--devora-accent-from</code>, ...) can be reused in your own CSS.
      </p>

      <h2>Config</h2>
      <p>
        <code>defineApp(config)</code> — <code>apps/&lt;name&gt;/app.config.ts</code>'s default
        export. Identity wrapper for type inference; every field is optional.
      </p>
      <div className="docs-table-wrap">
          <table>
          <thead><tr><th>Field</th><th>Type</th><th>Does</th></tr></thead>
          <tbody>
            <tr><td><code>defaultRenderMode</code></td><td><code>RenderMode</code></td><td>Applies to any route in this app with no <code>renderMode</code> export of its own</td></tr>
            <tr><td><code>security.csp</code></td><td><code>string</code></td><td>Overrides the default Content-Security-Policy for this app — see <a href="/security">Security</a></td></tr>
            <tr><td><code>security.hsts</code></td><td><code>boolean</code></td><td>Toggles the HSTS header</td></tr>
            <tr><td><code>security.frameOptions</code></td><td><code>"DENY" | "SAMEORIGIN"</code></td><td>Overrides <code>X-Frame-Options</code></td></tr>
            <tr><td><code>security.noindex</code></td><td><code>boolean</code></td><td>Sends <code>X-Robots-Tag: noindex</code> on every response (an admin panel, an internal tool)</td></tr>
            <tr><td><code>sitemap</code></td><td><code>boolean</code></td><td>Serves <code>/sitemap.xml</code> for this app. Opt-in, default <code>false</code></td></tr>
            <tr><td><code>backendOnly</code></td><td><code>boolean</code></td><td>Pure-API app — skips the client build and SSR entry entirely. See <a href="/backend">Backend</a></td></tr>
            <tr><td><code>apiDir</code></td><td><code>string</code></td><td>Folder for API route files, served under <code>/api</code>. Default <code>"api"</code>; new apps use <code>"endpoints"</code></td></tr>
            <tr><td><code>head</code></td><td><code>HeadConfig</code></td><td><code>{`{ lang?, stylesheets?, links?, meta?, scripts?, theme? }`}</code> for every page — see <a href="/pages-forms-errors">Pages, forms and errors</a></td></tr>
            <tr><td><code>maxBodyBytes</code></td><td><code>number</code></td><td>Largest request body for forms and API routes; larger gets a 413. Default 10 MB</td></tr>
            <tr><td><code>cors</code></td><td><code>CorsConfig</code></td><td><code>{`{ origins, credentials?, methods?, allowHeaders?, exposeHeaders?, maxAge? }`}</code> for API routes. Off by default — see <a href="/backend">Backend</a></td></tr>
            <tr><td><code>trustProxy</code></td><td><code>boolean | number</code></td><td>Trust <code>X-Forwarded-*</code> from that many proxies, for <code>ctx.url</code>, <code>ctx.ip</code> and <code>secure: "auto"</code>. Default <code>false</code> for <code>devora start</code>, <code>true</code> in the Vercel/Netlify functions</td></tr>
            <tr><td><code>csrf</code></td><td><code>boolean</code></td><td><code>false</code>: never issue the CSRF cookie (Bearer-only APIs); <code>verifyCsrf()</code> then passes only for Bearer-authenticated requests</td></tr>
            <tr><td><code>sessions</code></td><td><code>AppSessionsConfig</code></td><td>Per-app cookie overrides; <code>activeSeconds</code>/<code>idleSeconds</code> for <code>auth: "isolated"</code> apps</td></tr>
            <tr><td><code>prebuild</code></td><td><code>string | string[]</code></td><td>Shell commands <code>devora build</code>/<code>deploy</code> run in the app folder first (codegen, a CSS build); a non-zero exit stops the build</td></tr>
            <tr><td><code>vercel.runtime</code></td><td><code>string</code></td><td>Vercel function runtime, e.g. <code>"nodejs22.x"</code>; picked from Node/<code>engines</code> when unset</td></tr>
          </tbody>
        </table>
      </div>
      <p>
        <code>defineProject(config)</code> — the project-root <code>devora.config.ts</code>'s
        default export: <code>{`{ apps: AppConfig[], shared: SharedConfig }`}</code>. Each{" "}
        <code>AppConfig</code> is <code>{`{ name, dir, domain, auth?, devPort? }`}</code>;{" "}
        <code>SharedConfig</code> is <code>{`{ core, backend?, auth, sessions? }`}</code> (the
        project-wide default <code>auth</code>, overridable per app; no <code>backend</code> in a
        frontend-only project). <code>sessions</code> is{" "}
        <code>{`{ store?, activeSeconds?, idleSeconds?, cookie? }`}</code> — where session records
        live (a module path or <code>"memory"</code>), how long they last, and the cookie's{" "}
        <code>{`{ secure?: true | "auto" | false, sameSite?: "lax" | "strict" | "none", domain? }`}</code>;
        a store is required in production for any app with login, see{" "}
        <a href="/security#sessions">Security</a>. <code>AuthMode</code> is{" "}
        <Tag color="blue">shared</Tag> <Tag color="purple">isolated</Tag>{" "}
        <Tag color="gray">none</Tag> — see <a href="/core-concepts">Core concepts</a>.{" "}
        <code>RenderMode</code> is <code>"ssr" | "ssg" | "csr" | "isr" | "streaming"</code> — see{" "}
        <a href="/render-modes">Render modes</a>.
      </p>

      <h2>Route modules</h2>
      <p>What a file under <code>routes/</code> may export — nothing here is required:</p>
      <div className="docs-table-wrap">
          <table>
          <thead><tr><th>Export</th><th>Signature</th><th>Does</th></tr></thead>
          <tbody>
            <tr><td><code>renderMode</code></td><td><code>RenderMode</code></td><td>How this route renders — see <a href="/render-modes">Render modes</a></td></tr>
            <tr><td><code>revalidate</code></td><td><code>{`{ seconds: number }`}</code></td><td><code>isr</code> only — how long a render stays fresh</td></tr>
            <tr><td><code>loader</code></td><td><code>(ctx) =&gt; Promise&lt;Data&gt; | Data</code></td><td>Server-side data for the page</td></tr>
            <tr><td><code>getStaticParams</code></td><td><code>() =&gt; Promise&lt;Record&lt;string,string&gt;[]&gt;</code></td><td>Required for <code>ssg</code>/<code>isr</code> on a dynamic route — one static file per entry returned</td></tr>
            <tr><td><code>action</code></td><td><code>(formData, ctx) =&gt; Promise&lt;unknown&gt;</code></td><td>Handles a form POST — returns <code>redirect(to)</code> (303), <code>fail(status, data)</code>, or data for the page as <code>actionData</code>. File fields arrive as <code>File</code> objects</td></tr>
            <tr><td><code>meta</code></td><td><code>(data?) =&gt; {`{ title?, description?, og?, head? }`}</code></td><td>Page <code>&lt;title&gt;</code>, description, Open Graph, and route-level <code>&lt;head&gt;</code> tags</td></tr>
            <tr><td>default export</td><td><code>(props: RouteComponentProps) =&gt; JSX</code></td><td>The page's UI; props are <code>{`{ data?, csrfToken?, actionData? }`}</code></td></tr>
          </tbody>
        </table>
      </div>

      <h2>The request context (<code>ctx</code>)</h2>
      <p>
        Passed to every <code>loader</code>, <code>action</code>, <code>serverFn</code>, and API
        route handler. Sessions are opaque, server-side, and revocable, reached by an{" "}
        <code>HttpOnly</code> cookie or an <code>Authorization: Bearer</code> header through one
        lookup — see <a href="/security#sessions">Security model</a>. Checking <em>who</em>{" "}
        someone is stays your code's job.
      </p>
      <div className="docs-table-wrap">
          <table>
          <thead><tr><th>Member</th><th>Signature</th><th>Does</th></tr></thead>
          <tbody>
            <tr><td><code>params</code></td><td><code>Record&lt;string, string&gt;</code></td><td>Values from any <code>[param]</code> segments in the matched route. A <code>[...slug]</code> catch-all is in here too, its segments joined with <code>/</code> (<code>"a/b"</code>)</td></tr>
            <tr><td><code>catchAll</code></td><td><code>Record&lt;string, string[]&gt;</code></td><td>The segments a <code>[...slug]</code> or <code>[[...slug]]</code> matched, as arrays (<code>ctx.catchAll.slug</code>); empty for a route with none (0.3.4)</td></tr>
            <tr><td><code>url</code></td><td><code>URL</code></td><td>The request URL, query string included (<code>ctx.url.searchParams.get("q")</code>); scheme and host follow <code>trustProxy</code></td></tr>
            <tr><td><code>headers</code></td><td><code>Headers</code></td><td>Request headers (empty at build time for <code>ssg</code>)</td></tr>
            <tr><td><code>method</code></td><td><code>string</code></td><td>The HTTP method</td></tr>
            <tr><td><code>ip</code></td><td><code>string | undefined</code></td><td>Client IP: the TCP peer, or from the right of <code>X-Forwarded-For</code> when <code>trustProxy</code> is set</td></tr>
            <tr><td><code>request</code></td><td><code>Request</code></td><td>A standard <code>Request</code> without a body (the body goes to <code>action</code>)</td></tr>
            <tr><td><code>session</code></td><td><code>SessionData | undefined</code></td><td>The current session's data, if any — from the cookie or a Bearer token alike. Typed once with <code>declare module "@devorajs/core" {"{ interface Register { session: { userId: string } } }"}</code>; <code>unknown</code> otherwise</td></tr>
            <tr><td><code>sessionTransport</code></td><td><code>"cookie" | "bearer" | undefined</code></td><td>Which transport authenticated this request</td></tr>
            <tr><td><code>requireAuth()</code></td><td><code>() =&gt; void</code></td><td>Throws a <code>401</code> <code>HttpError</code> if there's no valid session on either transport</td></tr>
            <tr><td><code>setSession(data, options?)</code></td><td><code>(data: unknown, {`{ transport?: "cookie" | "bearer" }`}?) =&gt; Promise&lt;string&gt;</code></td><td>Starts a new server-side session holding <code>data</code> and resolves to its ID. <code>"cookie"</code> (the default for a request that isn't already Bearer-authenticated) sets the session cookie; <code>"bearer"</code> sets none — return the ID to the client. Always issues a fresh ID, revoking any session the request already had</td></tr>
            <tr><td><code>revokeSession(sessionId?)</code></td><td><code>(sessionId?: string) =&gt; Promise&lt;void&gt;</code></td><td>Deletes the current session server-side (and clears its cookie) — dead on both transports immediately. Pass another session's ID to revoke that one instead</td></tr>
            <tr><td><code>clearSession()</code></td><td><code>() =&gt; Promise&lt;void&gt;</code></td><td>Alias for <code>revokeSession()</code> with no argument</td></tr>
            <tr><td><code>verifyCsrf(submitted)</code></td><td><code>(FormData | string) =&gt; void</code></td><td>Throws a <code>403</code> <code>HttpError</code> if the token doesn't match this browser's CSRF cookie — form posts pass <code>FormData</code>, a same-origin API call passes the header value as a plain string. Passes without a token for a Bearer-authenticated request</td></tr>
          </tbody>
        </table>
      </div>
      <p>
        The framework waits for <code>setSession</code>/<code>revokeSession</code>'s store write
        before sending the response even if you don't <code>await</code> it — but awaiting is
        clearer, and required if you need the ID. On an app with <code>auth: "none"</code>, all
        five session methods above throw a clear error instead of silently no-opping if called — see{" "}
        <a href="/core-concepts">Core concepts</a>.
      </p>

      <h2>Actions, redirects &amp; CSRF</h2>
      <div className="devora-card">
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
{`import { fail, redirect, type RequestContext } from "@devorajs/core";

export async function action(formData: FormData, ctx: RequestContext) {
  ctx${""}.verifyCsrf(formData);
  const username = String(formData.get("username") ?? "");
  if (!username) return fail(400, { error: "Enter a username" }); // re-render with 400, error in actionData
  // Check the password against your own database here, before this line.
  await ctx${""}.setSession({ username }); // sets the HttpOnly session cookie
  return redirect("/dashboard"); // 303 See Other, so a refresh doesn't resubmit
}`}
        </pre>
      </div>
      <div className="docs-table-wrap">
        <table>
          <thead><tr><th>Export</th><th>Does</th></tr></thead>
          <tbody>
            <tr><td><code>redirect(to, status?)</code></td><td>303 after a POST, 302 from a loader; pass <code>301 | 302 | 303 | 307 | 308</code> to choose. A loader may also <code>throw redirect(...)</code></td></tr>
            <tr><td><code>fail(status, data)</code></td><td>Re-render the page with a 4xx/5xx status and <code>data</code> as the <code>actionData</code> prop</td></tr>
            <tr><td><code>CsrfField({`{ token }`})</code></td><td>The hidden input a <code>&lt;form&gt;</code> needs; a page receives its own <code>csrfToken</code> as a prop</td></tr>
            <tr><td><code>HttpError(status, message)</code></td><td>Throw it from a loader, action or API route: the response keeps that status. On a page it renders the app's <code>error.tsx</code></td></tr>
            <tr><td><code>ErrorPageProps</code></td><td><code>{`{ status, message }`}</code>, the props of <code>apps/&lt;name&gt;/error.tsx</code> (also used for 404s). <code>message</code> is safe to show</td></tr>
          </tbody>
        </table>
      </div>

      <h2>Backend — serverFn, modules &amp; API routes</h2>
      <p>
        <code>serverFn(fn)</code> — the original backend primitive: a plain function reference a route
        imports and calls directly, never dispatched dynamically by name. <code>clientOnly(loader)</code>{" "}
        guarantees a component never runs server-side (touches <code>window</code> at module
        scope, say).
      </p>
      <div className="devora-card">
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
{`import { serverFn } from "@devorajs/core";

export const updateSettings = serverFn(async (input, ctx) => {
  ctx${""}.requireAuth();
  return db.settings.update(input);
});`}
        </pre>
      </div>
      <p>
        <code>defineModule(def, setup?)</code> — organizes backend logic into scoped units, see{" "}
        <a href="/backend">Backend</a>. A <code>DevoraModule</code> exposes{" "}
        <code>.register(child)</code> (mounts a child's routes, namespaced under its name) and{" "}
        <code>.getRoutes()</code> (the flattened table an app's dispatcher reads).
      </p>
      <p>
        <code>apiRoute(handler)</code> — a plain request handler for a file in the app's API folder
        (<code>apiDir</code>: <code>endpoints/</code> in new apps, <code>api/</code> by default),
        served under <code>/api</code>, decoupled from page rendering. Optionally export a{" "}
        <code>methods</code> array alongside <code>handler</code> to reject unlisted HTTP methods
        with a real <code>405</code> before the handler runs.
      </p>
      <p>
        <strong>API routes always answer in JSON</strong> <Tag color="gray">since 0.3.0</Tag>.{" "}
        <code>apiRoute()</code> wraps your handler (before 0.3.0 it returned it unchanged): an
        uncaught error becomes a <code>{`{ "message": "..." }`}</code> JSON response instead of
        the dev server's HTML error page. Throw <code>new HttpError(status, message)</code> for a
        deliberate failure — its status and message are sent as-is. Any other error with a numeric{" "}
        <code>status</code> (or <code>statusCode</code>) from 400–599 is treated the same way, so an
        existing error class of your own keeps working. Anything else is a <code>500</code>; its
        real message is shown in dev and replaced with <code>"Internal Server Error"</code> in
        production (the error is logged server-side either way). The dispatcher applies the same
        rule around every <code>api/**</code> request, so a handler exported without{" "}
        <code>apiRoute()</code>, or middleware wrapped outside it, doesn't produce HTML either.
      </p>
      <div className="devora-card">
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
{`// apps/web/endpoints/orders/[id].ts
import { apiRoute, HttpError } from "@devorajs/core";

const orders = new Map([
  ["1", { id: "1", total: 42 }],
  ["2", { id: "2", total: 5000 }],
]);

export const methods = ["GET"];
export const handler = apiRoute((req) => {
  const order = orders.get(req.params.id!);
  if (!order) throw new HttpError(404, "Order not found"); // → 404 {"message":"Order not found"}
  if (order.total > 1000) throw new Error("fraud check unavailable"); // → 500, message hidden in production
  return { status: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify(order) };
});`}
        </pre>
      </div>
      <p>
        A request under <code>/api</code> that matches no route file — including bare{" "}
        <code>/api</code> — gets a JSON <code>404</code>, <code>{`{ "message": "Not found" }`}</code>,
        never an HTML page. Page routes are unaffected: their errors and 404s stay HTML.
      </p>
      <div className="docs-table-wrap">
          <table>
          <thead><tr><th>Type</th><th>Shape</th></tr></thead>
          <tbody>
            <tr><td><code>ApiRequest</code></td><td><code>{`{ method, url, headers, params, catchAll, body: Buffer }`}</code> — <code>params</code> are strings, with a catch-all joined by <code>/</code>; <code>catchAll</code> has the arrays. body is raw bytes, not pre-parsed, so a webhook can verify an HMAC against the exact bytes first</td></tr>
            <tr><td><code>ApiResponse</code></td><td><code>{`{ status, headers?, body? }`}</code></td></tr>
          </tbody>
        </table>
      </div>

      <h2>Sessions — the store</h2>
      <p>
        <code>defineSessionStore(store)</code> — type helper for the default export of the module{" "}
        <code>shared.sessions.store</code> points at. A <code>SessionStore</code> is{" "}
        <code>{`{ get(key), set(key, record), delete(key) }`}</code> (each may be sync or return a
        promise); a <code>SessionRecord</code> is{" "}
        <code>{`{ data, activeExpiresAt, expiresAt }`}</code> (epoch milliseconds). The{" "}
        <code>key</code> is an HMAC of the session ID, never the ID itself.{" "}
        <code>createMemorySessionStore()</code> returns the in-process store <code>"memory"</code>{" "}
        uses — handy in tests. <code>getSessionState(record)</code> returns{" "}
        <code>"active" | "idle" | "dead"</code>. See <a href="/security#sessions">Security</a>{" "}
        for a working SQLite-backed store.
      </p>
      <p>
        <code>signSession</code>/<code>verifySession</code> are still exported but deprecated —
        the framework no longer uses them, and a token signed with them can't be revoked. Replace a
        hand-rolled Bearer scheme built on them with{" "}
        <code>setSession(data, {`{ transport: "bearer" }`})</code>.
      </p>

      <h2>Middleware</h2>
      <p>
        <code>withMiddleware(handler, ...middlewares)</code> — composes plain functions, left to
        right; the call site's argument order is the execution order. <code>defineMiddleware(mw)</code>{" "}
        exists only for type inference.
      </p>
      <div className="devora-card">
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
{`import { withMiddleware, apiRoute } from "@devorajs/core";

const logging = (next) => async (req, ctx) => {
  console.log(req.method, req.url);
  return next(req, ctx);
};

export const handler = withMiddleware(rawHandler, logging, requireAuthMw);`}
        </pre>
      </div>
      <p>
        <code>fromExpressMiddleware(mw)</code> adapts an Express/Connect{" "}
        <code>(req, res, next)</code> middleware — supports reading{" "}
        <code>req.method</code>/<code>url</code>/<code>headers</code> and calling{" "}
        <code>res.setHeader</code>/<code>getHeader</code>/<code>end</code>/<code>next()</code>,
        not a full Node stream body or Express-specific extensions.{" "}
        <code>fromFastifyPlugin(name, plugin)</code> adapts a real Fastify plugin's route
        registrations into a <code>DevoraModule</code> — throws immediately if the plugin calls an
        unsupported method like <code>addHook</code>/<code>decorate</code>, rather than silently
        ignoring it.
      </p>

      <h2>Islands &amp; client-only</h2>
      <div className="devora-card">
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
{`import { island, Island } from "@devorajs/core";
// or "@devorajs/core/client" inside a csr route/island component itself

const ThreeScene = island(() => import("./ThreeScene"));

export default function Page() {
  return <Island component={ThreeScene} props={{ spin: true }} />;
}`}
        </pre>
      </div>
      <p>
        <code>island(() =&gt; import("specifier"))</code> — only this literal call shape is
        accepted (no dynamic/computed specifiers). The build finds islands in any module the app
        imports, not only route files, and since 0.3.2 any other shape, or a path that doesn't
        resolve, fails <code>devora dev</code>/<code>devora build</code> with the file and line.{" "}
        <code>&lt;Island component props /&gt;</code> is what a route actually renders around one.
      </p>

      <h2>Dev reload safety</h2>
      <p>
        <code>registerDisposable(fileUrlOrPath, dispose)</code> — runs <code>dispose</code> right
        before Vite's dev server reloads the file at <code>fileUrlOrPath</code> (pass{" "}
        <code>import.meta.url</code>). Use it to close a stale native-addon DB connection cleanly
        instead of leaving it to a finalizer. Dev-only — nothing to dispose in a production
        process that never reloads modules. See <a href="/backend">Backend</a>.
      </p>

      <h2>ISR revalidation</h2>
      <p>
        <code>revalidatePath(staticOutDir, routePath)</code> — forces an <code>isr</code> route's
        cached render to regenerate on its next request, ahead of its own{" "}
        <code>revalidate</code> window. See <a href="/render-modes">Render modes</a>.
      </p>
      </DocsLayout>
    </PageShell>
  );
}
