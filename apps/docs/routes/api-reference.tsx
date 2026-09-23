import { PageShell } from "@devorajs/core";
import { DOCS_NAV } from "../nav.js";
import { SiteFooter } from "../site-footer.js";
import { DocsLayout, Tag, Callout } from "../docs-layout.js";

export const renderMode = "ssg";

export function meta() {
  return {
    title: "API reference",
    description:
      "Every function, type, and component exported from @devorajs/core — PageShell, defineApp, ctx, serverFn, apiRoute, modules, middleware, and islands.",
  };
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
        <a href="/backend">Backend (v2)</a> — those pages explain the ideas, this page is what to
        actually import.
      </p>

      <h2>Where things come from</h2>
      <p>Three entry points, not one — importing from the wrong one is the most common mistake:</p>
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

      <h2>Config</h2>
      <p>
        <code>defineApp(config)</code> — <code>apps/&lt;name&gt;/app.config.ts</code>'s default
        export. Identity wrapper for type inference; every field is optional.
      </p>
      <table>
        <thead><tr><th>Field</th><th>Type</th><th>Does</th></tr></thead>
        <tbody>
          <tr><td><code>defaultRenderMode</code></td><td><code>RenderMode</code></td><td>Applies to any route in this app with no <code>renderMode</code> export of its own</td></tr>
          <tr><td><code>security.csp</code></td><td><code>string</code></td><td>Overrides the default Content-Security-Policy for this app — see <a href="/security">Security</a></td></tr>
          <tr><td><code>security.hsts</code></td><td><code>boolean</code></td><td>Toggles the HSTS header</td></tr>
          <tr><td><code>security.frameOptions</code></td><td><code>"DENY" | "SAMEORIGIN"</code></td><td>Overrides <code>X-Frame-Options</code></td></tr>
          <tr><td><code>sitemap</code></td><td><code>boolean</code></td><td>Serves <code>/sitemap.xml</code> for this app. Opt-in, default <code>false</code></td></tr>
          <tr><td><code>backendOnly</code></td><td><code>boolean</code></td><td>Pure-API app — skips the client build and SSR entry entirely. See <a href="/backend">Backend (v2)</a></td></tr>
        </tbody>
      </table>
      <p>
        <code>defineProject(config)</code> — the project-root <code>devora.config.ts</code>'s
        default export: <code>{`{ apps: AppConfig[], shared: SharedConfig }`}</code>. Each{" "}
        <code>AppConfig</code> is <code>{`{ name, dir, domain, auth?, devPort? }`}</code>;{" "}
        <code>SharedConfig</code> is <code>{`{ core, backend, auth, sessions? }`}</code> (the
        project-wide default <code>auth</code>, overridable per app).{" "}
        <code>sessions</code> is <code>{`{ store?, activeSeconds?, idleSeconds? }`}</code> — where
        session records live (a module path or <code>"memory"</code>) and how long they last;
        required in production for any app with login, see{" "}
        <a href="/security#sessions">Security</a>. <code>AuthMode</code> is{" "}
        <Tag color="blue">shared</Tag> <Tag color="purple">isolated</Tag>{" "}
        <Tag color="gray">none</Tag> — see <a href="/core-concepts">Core concepts</a>.{" "}
        <code>RenderMode</code> is <code>"ssr" | "ssg" | "csr" | "isr" | "streaming"</code> — see{" "}
        <a href="/render-modes">Render modes</a>.
      </p>

      <h2>Route modules</h2>
      <p>What a file under <code>routes/</code> may export — nothing here is required:</p>
      <table>
        <thead><tr><th>Export</th><th>Signature</th><th>Does</th></tr></thead>
        <tbody>
          <tr><td><code>renderMode</code></td><td><code>RenderMode</code></td><td>How this route renders — see <a href="/render-modes">Render modes</a></td></tr>
          <tr><td><code>revalidate</code></td><td><code>{`{ seconds: number }`}</code></td><td><code>isr</code> only — how long a render stays fresh</td></tr>
          <tr><td><code>loader</code></td><td><code>(ctx) =&gt; Promise&lt;Data&gt; | Data</code></td><td>Server-side data for the page</td></tr>
          <tr><td><code>getStaticParams</code></td><td><code>() =&gt; Promise&lt;Record&lt;string,string&gt;[]&gt;</code></td><td>Required for <code>ssg</code>/<code>isr</code> on a dynamic route — one static file per entry returned</td></tr>
          <tr><td><code>action</code></td><td><code>(formData, ctx) =&gt; Promise&lt;unknown&gt;</code></td><td>Handles a form POST — may return <code>redirect(to)</code> instead of data</td></tr>
          <tr><td><code>meta</code></td><td><code>(data?) =&gt; {`{ title?, description? }`}</code></td><td>Page <code>&lt;title&gt;</code>/description</td></tr>
          <tr><td>default export</td><td><code>(props: {`{ data?, csrfToken? }`}) =&gt; JSX</code></td><td>The page's UI</td></tr>
        </tbody>
      </table>

      <h2>The request context (<code>ctx</code>)</h2>
      <p>
        Passed to every <code>loader</code>, <code>action</code>, <code>serverFn</code>, and API
        route handler. Sessions are opaque, server-side, and revocable, reached by an{" "}
        <code>HttpOnly</code> cookie or an <code>Authorization: Bearer</code> header through one
        lookup — see <a href="/security#sessions">Security model</a>. Checking <em>who</em>{" "}
        someone is stays your code's job.
      </p>
      <table>
        <thead><tr><th>Member</th><th>Signature</th><th>Does</th></tr></thead>
        <tbody>
          <tr><td><code>params</code></td><td><code>Record&lt;string, string&gt;</code></td><td>Values from any <code>[param]</code> segments in the matched route</td></tr>
          <tr><td><code>session</code></td><td><code>unknown | undefined</code></td><td>The current session's data, if any — from the cookie or a Bearer token alike</td></tr>
          <tr><td><code>sessionTransport</code></td><td><code>"cookie" | "bearer" | undefined</code></td><td>Which transport authenticated this request</td></tr>
          <tr><td><code>requireAuth()</code></td><td><code>() =&gt; void</code></td><td>Throws a <code>401</code> <code>HttpError</code> if there's no valid session on either transport</td></tr>
          <tr><td><code>setSession(data, options?)</code></td><td><code>(data: unknown, {`{ transport?: "cookie" | "bearer" }`}?) =&gt; Promise&lt;string&gt;</code></td><td>Starts a new server-side session holding <code>data</code> and resolves to its ID. <code>"cookie"</code> (the default for a request that isn't already Bearer-authenticated) sets the session cookie; <code>"bearer"</code> sets none — return the ID to the client. Always issues a fresh ID, revoking any session the request already had</td></tr>
          <tr><td><code>revokeSession(sessionId?)</code></td><td><code>(sessionId?: string) =&gt; Promise&lt;void&gt;</code></td><td>Deletes the current session server-side (and clears its cookie) — dead on both transports immediately. Pass another session's ID to revoke that one instead</td></tr>
          <tr><td><code>clearSession()</code></td><td><code>() =&gt; Promise&lt;void&gt;</code></td><td>Alias for <code>revokeSession()</code> with no argument</td></tr>
          <tr><td><code>verifyCsrf(submitted)</code></td><td><code>(FormData | string) =&gt; void</code></td><td>Throws a <code>403</code> <code>HttpError</code> if the token doesn't match this browser's CSRF cookie — form posts pass <code>FormData</code>, a same-origin API call passes the header value as a plain string. Passes without a token for a Bearer-authenticated request</td></tr>
        </tbody>
      </table>
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
{`import { redirect } from "@devorajs/core";

export async function action(formData, ctx) {
  ctx${""}.verifyCsrf(formData);
  const username = String(formData.get("username") ?? "");
  // Check the password against your own database here, before this line.
  await ctx${""}.setSession({ username }); // sets the HttpOnly session cookie
  return redirect("/dashboard"); // sends a real redirect, not a 200 re-render
}`}
        </pre>
      </div>
      <p>
        <code>redirect(to)</code> returns a <code>RedirectResult</code> — an <code>action</code>{" "}
        can return this instead of ordinary data to redirect the browser rather than re-rendering
        the page with a 200. <code>CsrfField({`{ token }`})</code> renders the hidden input a{" "}
        <code>&lt;form&gt;</code> needs; a page receives its own <code>csrfToken</code> as a prop
        on a GET render, no extra wiring.
      </p>

      <h2>Backend — serverFn, modules &amp; API routes</h2>
      <p>
        <code>serverFn(fn)</code> — the v1 backend primitive: a plain function reference a route
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
        <a href="/backend">Backend (v2)</a>. A <code>DevoraModule</code> exposes{" "}
        <code>.register(child)</code> (mounts a child's routes, namespaced under its name) and{" "}
        <code>.getRoutes()</code> (the flattened table an app's dispatcher reads).
      </p>
      <p>
        <code>apiRoute(handler)</code> — a plain request handler for{" "}
        <code>apps/&lt;name&gt;/api/**</code>, decoupled from page rendering. Optionally export a{" "}
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
{`// apps/web/api/orders/[id].ts
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
      <table>
        <thead><tr><th>Type</th><th>Shape</th></tr></thead>
        <tbody>
          <tr><td><code>ApiRequest</code></td><td><code>{`{ method, url, headers, params, body: Buffer }`}</code> — body is raw bytes, not pre-parsed, so a webhook can verify an HMAC against the exact bytes first</td></tr>
          <tr><td><code>ApiResponse</code></td><td><code>{`{ status, headers?, body? }`}</code></td></tr>
        </tbody>
      </table>

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
        recognized by the CLI's Vite plugin (no dynamic/computed specifiers). Written by hand with
        no plugin applied it still renders real content server-side, it just won't hydrate.{" "}
        <code>&lt;Island component props /&gt;</code> is what a route actually renders around one.
      </p>

      <h2>Dev reload safety</h2>
      <p>
        <code>registerDisposable(fileUrlOrPath, dispose)</code> — runs <code>dispose</code> right
        before Vite's dev server reloads the file at <code>fileUrlOrPath</code> (pass{" "}
        <code>import.meta.url</code>). Use it to close a stale native-addon DB connection cleanly
        instead of leaving it to a finalizer. Dev-only — nothing to dispose in a production
        process that never reloads modules. See <a href="/backend">Backend (v2)</a>.
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
