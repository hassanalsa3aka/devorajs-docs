import { PageShell } from "@devorajs/core";
import { DOCS_NAV } from "../nav.js";

export const renderMode = "ssg";

export function meta() {
  return {
    title: "Backend (v2)",
    description:
      "Explicit domain modules, generic API routes, native + Express/Fastify middleware, and backend-only apps.",
  };
}

export async function loader() {
  return {};
}

export default function Backend() {
  return (
    <PageShell nav={DOCS_NAV}>
      <h1>Backend (v2)</h1>
      <p>
        <strong>Not yet in the published <code>^0.1.0</code> package.</strong> This page documents
        v2's real backend expansion ahead of release — the same way this site already documented{" "}
        <code>streaming</code> as "deferred to v2" before it existed. Built, tested, and verified in
        the framework repo; not installable from npm yet.
      </p>

      <h2>Explicit domain modules</h2>
      <p>
        <code>defineModule()</code> organizes shared backend logic (<code>packages/backend</code>)
        into scoped units — composing them is a plain function call, never reflection or metadata
        scanning (no dependency-injection container, ever — a locked decision for this framework).
      </p>
      <div className="devora-card">
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
{`const usersModule = defineModule({ name: "users", functions: { getUserProfile }, routes: {
  "/[id]": apiRoute(async (req, ctx) => { ... }),
}});

const app = defineModule({ name: "app" }, (root) => {
  root.register(usersModule);
});`}
        </pre>
      </div>
      <p>
        A module's own <code>functions</code>/<code>routes</code> stay private to it —{" "}
        <code>register()</code> merges a child's routes into the parent's flattened route table,
        namespaced under the child's own name (<code>usersModule</code>'s <code>"/[id]"</code>{" "}
        becomes <code>"/users/[id]"</code> once registered into <code>app</code>). Nothing flows
        the other way: a child never gets implicit access to its parent or siblings — if one
        module's logic needs another's, it imports it directly, the same as any other TypeScript
        code. This is a deliberate simplification of true Fastify-style scope inheritance (which
        would need passing a live context object into a child's setup callback — too close to the
        dependency-injection shape this framework rules out).
      </p>

      <h2>Generic API routes</h2>
      <p>
        The real gap this closes: a server function was previously only reachable via a page
        route's <code>loader</code>/<code>action</code>, so nothing like a payment-provider webhook
        had anywhere to live. <code>apiRoute()</code> is a plain request handler, decoupled from
        page rendering entirely — file-based under <code>apps/&lt;name&gt;/api/**</code>, matched
        by the exact same router as <code>routes/</code> (dynamic segments included:{" "}
        <code>api/users/[id].ts</code> serves <code>/api/users/123</code>).
      </p>
      <div className="devora-card">
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
{`// apps/dashboard/api/hello.ts
import { apiRoute } from "@devorajs/core";

export const handler = apiRoute((req, ctx) => {
  ctx${""}.requireAuth();
  return { status: 200, body: JSON.stringify({ message: "hello" }) };
});`}
        </pre>
      </div>
      <p>
        <strong>Ownership rule</strong>: shared backend logic goes in <code>packages/backend</code>,
        exactly like <code>serverFn</code> already works — an app-local <code>api/</code> file is
        the exception, for something genuinely app-specific (a webhook only that app receives).
      </p>
      <p>
        <strong>Security, worth getting right</strong>: <code>ctx</code><code>.requireAuth()</code>/
        <code>ctx.session</code> carry over cleanly from page routes. <code>ctx</code><code>.verifyCsrf()</code>{" "}
        does <em>not</em> — its token is embedded server-side into a rendered <code>&lt;form&gt;</code>
        , and a third-party webhook was never handed one. It now also accepts a plain string (not
        just <code>FormData</code>) for a same-origin JSON call — read the token your own page
        already received as a <code>csrfToken</code> prop, send it back on a header, verify with{" "}
        <code>ctx</code><code>.verifyCsrf(headerValue)</code>. A webhook needs its own signature/HMAC check
        against a provider-issued secret instead — bring your own, same boundary as DB/auth.
        Security headers (CSP/HSTS/X-Frame-Options) apply to API routes too, by default.
      </p>
      <p>
        <strong>Method allowlist</strong>: export an optional <code>methods</code> array alongside{" "}
        <code>handler</code> to have unlisted HTTP methods rejected with a real{" "}
        <code>405</code>, before the handler runs at all — closes a real footgun where a single{" "}
        <code>if (req.method === "POST") &#123; ... &#125; else &#123; ... &#125;</code> handler
        quietly let a{" "}
        <code>PUT</code>/<code>PATCH</code>/<code>DELETE</code> fall into the branch written for{" "}
        <code>GET</code>. Fully opt-in — a route with no <code>methods</code> field behaves exactly
        as before.
      </p>
      <div className="devora-card">
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
{`export const methods = ["GET", "POST"];
export const handler = apiRoute((req, ctx) => { ... });`}
        </pre>
      </div>

      <h2>Middleware</h2>
      <p>
        Two layers. <strong>Native, first-class:</strong> <code>withMiddleware(handler, ...mw)</code>{" "}
        composes plain functions, left to right — the call site's own argument order is the
        execution order, no hidden registration list to scan.
      </p>
      <div className="devora-card">
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
{`const logging = (next) => async (req, ctx) => { console.log(req.method); return next(req, ctx); };
export const handler = withMiddleware(rawHandler, logging, requireAuthMw);`}
        </pre>
      </div>
      <p>
        <strong>Optional ecosystem adapters:</strong> <code>fromExpressMiddleware(mw)</code> wraps
        an Express/Connect <code>(req, res, next)</code> middleware — verified against the real
        published <code>cors</code> package, including a real OPTIONS preflight. Not full Express
        compatibility: it supports reading <code>req.method</code>/<code>headers</code> and calling{" "}
        <code>res.setHeader</code>/<code>res.end</code>/<code>next()</code>, not a real Node stream
        body or Express-specific extensions. <code>fromFastifyPlugin(name, plugin)</code> adapts a
        real Fastify plugin's route registrations (<code>instance.get/post/...</code>,{" "}
        <code>instance.register()</code>) into a <code>DevoraModule</code> — it throws immediately,
        rather than silently ignoring it, if a plugin calls an unsupported method like{" "}
        <code>addHook</code> or <code>decorate</code>.
      </p>
      <p>
        <strong>Governance rule:</strong> every use of either adapter — any point a third-party npm
        package starts running inside the request pipeline — is registered in one place,{" "}
        <code>packages/backend/middleware.ts</code>. A route opts in explicitly by importing from
        there; nothing runs implicitly for every route.
      </p>

      <h2>Backend-only apps</h2>
      <p>
        An app that's pure API needs no pages, no client build, no <code>PageShell</code>/theme
        wiring at all — set <code>backendOnly: true</code> in that app's <code>app.config.ts</code>.{" "}
        <code>devora build</code>/<code>devora dev</code> skip the Vite client build and the{" "}
        <code>entry-server.tsx</code> SSR entry entirely; the app can have zero{" "}
        <code>routes/</code> directory and no <code>react</code>/<code>react-dom</code> dependency
        at all.
      </p>

      <h2>Static params for dynamic routes</h2>
      <p>
        Closes the real gap noted on the <a href="/core-concepts">Core concepts</a> page:{" "}
        <code>ssg</code>/<code>isr</code> on a dynamic route (<code>[slug].tsx</code>) now pre-render
        one static file per entry a <code>getStaticParams()</code> export returns.
      </p>
      <div className="devora-card">
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
{`// routes/posts/[slug].tsx
export const renderMode = "ssg";

export async function getStaticParams() {
  return [{ slug: "hello-world" }, { slug: "why-multi-app" }];
}`}
        </pre>
      </div>
      <p>
        <code>ssr</code>/<code>csr</code> on a dynamic route are unaffected — they already had real
        params from the live request and never needed this.
      </p>

      <h2>DB reload-safety: a real dispose hook</h2>
      <p>
        The framework's own dev server can crash a native-addon DB driver (<code>better-sqlite3</code>
        , confirmed) if a stale connection is abandoned across a Vite SSR module reload — the fix is
        a <code>globalThis</code> singleton, documented in <code>packages/backend/DATABASE.md</code>.
        v2 adds a real, generic complement: <code>registerDisposable(import.meta.url, dispose)</code>{" "}
        runs <code>dispose</code> right before Vite reloads that file, via a real Vite plugin hook
        (<code>handleHotUpdate</code>) — confirmed against a real dev server, not assumed. Use it to
        close the old connection cleanly instead of leaving it to a native finalizer; the{" "}
        <code>globalThis</code> singleton is still what prevents creating a redundant one in the
        meantime. Dev-only by construction — nothing to dispose in a production process that never
        reloads modules.
      </p>
    </PageShell>
  );
}
