import { PageShell } from "@devorajs/core";
import { DOCS_NAV } from "../nav.js";
import { SiteFooter } from "../site-footer.js";
import { DocsLayout } from "../docs-layout.js";

export const renderMode = "ssg";

export function meta() {
  return {
    title: "Core concepts",
    description: "Multi-app architecture, shared/isolated/none auth, the shared backend pattern, and file-based routing.",
  };
}

export async function loader() {
  return {};
}

export default function CoreConcepts() {
  return (
    <PageShell nav={DOCS_NAV} footer={<SiteFooter />}>
      <DocsLayout active="core-concepts">
      <h1>Core concepts</h1>

      <h2>Multi-app architecture</h2>
      <p>
        A devora.js project can declare more than one app — a marketing site, a dashboard, an
        admin panel — as siblings under <code>apps/</code>, all registered in one{" "}
        <code>devora.config.ts</code> at the project root. This isn't a monorepo tool bolted on
        after the fact; it's the framework's headline feature. Each app has its own{" "}
        <code>routes/</code> directory and its own <code>app.config.ts</code>, but they share one{" "}
        <code>packages/core</code> for common logic and, by default, one{" "}
        <code>packages/backend</code> for server functions and the DB client. Each app can be built
        and deployed independently (<code>devora build --app=admin</code>) or all together (
        <code>devora build</code>), and each is served from its own domain.
      </p>

      <h2>Auth: shared, isolated, or none</h2>
      <p>Auth is a per-app setting, not a single project-wide switch. Three modes:</p>
      <p>
        <strong><code>shared</code></strong> — the default. All apps set to <code>shared</code>{" "}
        use one project-wide session cookie, so a user logs in once and that session is valid
        across marketing, dashboard, and admin alike.
      </p>
      <p>
        <strong><code>isolated</code></strong> — this app gets its own session cookie name and can
        be given its own secret (<code>DEVORA_SESSION_SECRET_&lt;APPNAME&gt;</code>). Useful when
        one app genuinely needs a separate identity provider or session boundary — an admin panel
        is the typical case.
      </p>
      <p>
        <strong><code>none</code></strong> — disables the session/cookie/CSRF carrier entirely for
        that app. This isn't the same as inheriting the project default; it's a real third state,
        set explicitly. It exists because an app with no login route anywhere (a marketing site)
        shouldn't need to configure a session secret it will never use. Calling a session method
        (<code>setSession()</code>, <code>requireAuth()</code>, etc., on the request context) inside a <code>none</code>{" "}
        app throws a clear error rather than silently doing nothing — and the build step checks for
        this upfront, so a misconfigured route fails at <code>devora build</code> time, not when a
        real request hits it.
      </p>
      <p>
        Leaving <code>auth</code> unset on an app means "inherit the project's <code>shared.auth</code>{" "}
        default" — set it to <code>"none"</code> explicitly if that's genuinely what you want, so
        it's unambiguous from the config file alone which apps have sessions enabled at all.
      </p>

      <h2>The shared backend pattern</h2>
      <p>
        By default, every app calls into one shared backend (<code>packages/backend</code>) for
        server functions and the DB layer — a single source of truth for business logic, callable
        directly from any app's routes with no hand-written <code>fetch</code> + API route
        boilerplate:
      </p>
      <div className="devora-card">
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
{`// packages/backend/functions/settings.ts
export const updateSettings = serverFn(async (input, ctx) => {
  // ctx exposes requireAuth() to gate this on a valid session
  return db.settings.update(input);
});

// apps/dashboard/routes/settings.tsx
import { updateSettings } from "@devorajs/backend/settings";
// call it directly — same function, same DB, same logic every app uses`}
        </pre>
      </div>
      <p>
        An app can still define a function locally, inside its own <code>routes/</code>, when
        something is genuinely app-specific — an admin-only bulk-import function nobody else
        needs, for example. This is an opt-out per function, not a project-wide switch: most
        projects use the shared backend for almost everything and only reach for an app-local
        function occasionally.
      </p>

      <h2>File-based routing</h2>
      <p>
        Each app routes itself from its own <code>routes/</code> directory — a file's path under{" "}
        <code>routes/</code> becomes its URL path, and <code>routes/index.tsx</code> is that app's
        home page. A route file exports whatever it needs explicitly: <code>loader</code> for
        server-side data, a default-exported <code>component</code> for the UI, and an optional{" "}
        <code>action</code> for mutations (form posts). Nothing is inferred beyond the path itself
        — there's no special meaning attached to a filename beyond where it sits in the tree.
      </p>
      <p>
        A dynamic segment — <code>routes/users/[id].tsx</code> matches <code>/users/123</code>,
        with the value available as <code>ctx.params.id</code> in <code>loader</code>/
        <code>action</code> — is supported for <code>ssr</code> and <code>csr</code> routes. A
        static route at the same depth always wins over a dynamic one (
        <code>routes/users/new.tsx</code> beats <code>routes/users/[id].tsx</code> for{" "}
        <code>/users/new</code>). <code>ssr</code>/<code>csr</code> support dynamic routes with no
        extra work — a live request already carries its own params.
      </p>
      <p>
        <code>ssg</code>/<code>isr</code> on a dynamic route need a <code>getStaticParams()</code>{" "}
        export (v2, not yet in the published <code>^0.1.0</code> package) telling the build step
        which concrete values to pre-render — one static file per entry returned. See{" "}
        <a href="/backend">Backend (v2)</a> for the full shape.
      </p>
      </DocsLayout>
    </PageShell>
  );
}
