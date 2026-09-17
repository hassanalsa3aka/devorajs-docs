import { PageShell } from "@devorajs/core";
import { DOCS_NAV } from "../nav.js";
import { SiteFooter } from "../site-footer.js";
import { DocsLayout, Tag } from "../docs-layout.js";

export const renderMode = "ssg";

export function meta() {
  return {
    title: "Getting started",
    description: "Scaffold a new devora.js project with create-devora and understand what it generates.",
  };
}

export async function loader() {
  return {};
}

export default function GettingStarted() {
  return (
    <PageShell nav={DOCS_NAV} footer={<SiteFooter />}>
      <DocsLayout active="getting-started">
      <h1>Getting started</h1>
      <p>
        The fastest way to a working project is the <code>create-devora</code> installer. It works
        from an empty directory — you don't need a devora.config.ts or any framework files first.
      </p>
      <div className="devora-card">
        <p style={{ margin: 0 }}>
          <code>npx create-devora@latest</code>
        </p>
      </div>
      <p>Yarn and pnpm both work the same way: <code>yarn create devora</code> or <code>pnpm create devora</code>.</p>

      <h2>What it asks</h2>
      <p>Run with no flags in a real terminal, it prompts for three things in order:</p>
      <p>
        <strong>1. Project name.</strong> Defaults to <code>my-devora-app</code>. This becomes the
        directory the CLI creates — it refuses to run if that directory already exists.
      </p>
      <p>
        <strong>2. App names (comma-separated).</strong> Defaults to{" "}
        <code>marketing,dashboard,admin</code>. Each name becomes one app under{" "}
        <code>apps/</code> — this is where multi-app is decided. A single-app project just answers
        with one name; a project with a public site, a logged-in product, and an internal panel
        answers with three. You can add or remove apps later with <code>devora add</code>/
        <code>devora remove</code>, so this choice isn't permanent.
      </p>
      <p>
        <strong>3. Auth mode, once per app.</strong> For each app name, it asks: "Does &lt;app&gt;
        need auth/sessions? [shared/isolated/none] (default: shared)". This is the per-app choice
        described in <a href="/core-concepts">Core concepts</a> — <Tag color="blue">shared</Tag>{" "}
        puts the app on the project's common login/session, <Tag color="purple">isolated</Tag>{" "}
        gives it its own session cookie and secret (e.g. an admin panel with a different identity
        provider), and <Tag color="gray">none</Tag> disables the session/cookie/CSRF carrier for
        that app entirely (e.g. a marketing site with no login anywhere). A marketing-style app
        should answer <code>none</code> — it never generates a login route or expects a session
        secret.
      </p>
      <p>
        Every prompt has a non-interactive fallback: running in a script or CI (no real TTY) skips
        straight to the defaults above, and <code>--apps=</code>/<code>--auth=name:mode,...</code>{" "}
        flags let you skip the prompts entirely while scripting a scaffold.
      </p>

      <h2>Resulting project structure</h2>
      <p>For the default answers (project name, three apps, all shared auth), you get:</p>
      <div className="devora-card">
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
{`my-devora-app/
├── devora.config.ts       # declares all apps, project-level auth default
├── packages/
│   ├── core/               # shared logic: types, utils, data client
│   └── backend/            # the shared backend — server functions + DB client
│       ├── functions/
│       └── db/
└── apps/
    ├── marketing/
    │   ├── routes/
    │   ├── app.config.ts
    │   └── nav.ts
    ├── dashboard/
    │   ├── routes/
    │   ├── app.config.ts
    │   └── nav.ts
    └── admin/
        ├── routes/
        ├── app.config.ts
        └── nav.ts`}
        </pre>
      </div>
      <p>
        Each app scaffolded with <code>shared</code> or <code>isolated</code> auth also gets a
        <code> login.tsx</code>/<code>logout.tsx</code> route pair and a protected demo route,
        wired up to the session carrier described in <a href="/security">Security model</a>. An
        app scaffolded with <code>none</code> skips all of that — no login button, no session
        dependency.
      </p>

      <h2>Next steps</h2>
      <p>
        After scaffolding (or after the installer's own dependency install finishes), run{" "}
        <code>cd my-devora-app && devora dev</code> to start every app in dev mode, or{" "}
        <code>devora dev --app=dashboard</code> to run just one. See the{" "}
        <a href="/cli-reference">CLI reference</a> for every command.
      </p>
      </DocsLayout>
    </PageShell>
  );
}
