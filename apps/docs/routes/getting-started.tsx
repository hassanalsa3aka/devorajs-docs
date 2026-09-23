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
        gives it its own separate sessions — its own cookie name and optionally its own secret, so
        a login to one app is never valid in the other (e.g. an admin panel with a different
        identity provider), and <Tag color="gray">none</Tag> disables sessions and CSRF for that
        app entirely (e.g. a marketing site with no login anywhere). A marketing-style app
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
├── devora.config.ts        # declares every app + the project-wide auth default
├── package.json            # dev / dev:host / build / start scripts
├── .env.example            # the session secrets production needs
├── packages/
│   └── backend/            # the shared backend — server functions + your DB client
│       └── db/index.ts     # stub: plug your own database in here
└── apps/
    ├── marketing/
    │   ├── routes/         # index.tsx, plus login/logout/account.tsx for an app with auth
    │   ├── app.config.ts
    │   ├── vite.config.ts
    │   ├── entry-server.tsx, island-client.tsx, csr-client.tsx
    │   └── vercel.json, netlify.toml
    ├── dashboard/          # same layout
    └── admin/              # same layout`}
        </pre>
      </div>
      <p>
        Each app scaffolded with <code>shared</code> or <code>isolated</code> auth also gets a{" "}
        <code>login.tsx</code>/<code>logout.tsx</code> route pair and a protected demo route (
        <code>account.tsx</code>), wired up to the sessions described in{" "}
        <a href="/security#sessions">Security model</a>. An app scaffolded with <code>none</code>{" "}
        gets only <code>index.tsx</code> — no login routes, no session dependency. The{" "}
        <code>assets/</code> folder (logo, favicon) and a few config files (
        <code>tsconfig.base.json</code>, <code>pnpm-workspace.yaml</code>,{" "}
        <code>.gitignore</code>, <code>.npmrc</code>) sit at the project root too.
      </p>

      <h2>Next steps: start the dev server</h2>
      <p>
        From inside the project, after the installer's dependency install has finished (or after
        you've run <code>npm install</code> yourself):
      </p>
      <div className="devora-card">
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
{`cd my-devora-app
npm run dev`}
        </pre>
      </div>
      <p>
        That starts every app in dev mode and prints each one's URL and route table. Ports start
        at <code>10000</code>, one per app in <code>devora.config.ts</code> order. To run a single
        app, pass the flag through npm: <code>npm run dev -- --app=dashboard</code>.
      </p>
      <p>
        <strong>Why not just <code>devora dev</code>?</strong> The CLI is installed into the
        project (<code>node_modules</code>), not onto your system <code>PATH</code> — so a bare{" "}
        <code>devora</code> command isn't found. That's normal: Next.js, Vite, and most framework
        CLIs work exactly the same way. It also means every project runs the exact CLI version it
        pins. Your options:
      </p>
      <table>
        <thead><tr><th>Command</th><th>Notes</th></tr></thead>
        <tbody>
          <tr>
            <td><code>npm run dev</code></td>
            <td><strong>Recommended.</strong> Runs the project's <code>dev</code> script, which calls its own pinned CLI. It's what the installer prints, and it can never pick up the wrong package. Other commands are scripts too: <code>npm run build</code>, <code>npm run start</code>, <code>npm run dev:host</code>.</td>
          </tr>
          <tr>
            <td><code>npx devora dev</code></td>
            <td>Also runs the project's own CLI, for any command without a script (e.g. <code>npx devora list</code>). <strong>Only inside the project, after <code>npm install</code></strong>: anywhere else, npx looks up the npm package literally named <code>devora</code>, which is an unrelated third-party tool — decline if npx offers to install it.</td>
          </tr>
          <tr>
            <td><code>npm install -g @devorajs/cli</code></td>
            <td>Makes a bare <code>devora</code> command available everywhere. A convenience tradeoff, not the recommended default: the global copy doesn't follow each project's pinned version, so it can drift out of sync with the CLI a given project was built and tested against.</td>
          </tr>
        </tbody>
      </table>
      <p>
        See the <a href="/cli-reference">CLI reference</a> for every command, or go straight to{" "}
        <a href="/first-feature">Build your first feature</a> for a complete worked example.
      </p>
      </DocsLayout>
    </PageShell>
  );
}
