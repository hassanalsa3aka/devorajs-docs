import { PageShell } from "@devorajs/core";
import { DOCS_NAV } from "../nav.js";
import { SiteFooter } from "../site-footer.js";
import { DocsLayout, Tag, Callout } from "../docs-layout.js";
import { pageMeta } from "../seo.js";

export const renderMode = "ssg";

export function meta() {
  return pageMeta("/getting-started", {
    title: "Getting started",
    description:
      "Scaffold a new Devora.js project with create-devora, run it locally, and understand every file and folder it generates.",
  });
}

export async function loader() {
  return {};
}

type PmId = "npm" | "yarn" | "pnpm";
type PmCellData = { cmd: string; also?: { label: string; cmd: string } };
const PM_NAMES: Array<{ id: PmId; label: string }> = [
  { id: "npm", label: "npm" },
  { id: "yarn", label: "Yarn" },
  { id: "pnpm", label: "pnpm" },
];
// The commands as they were run (see "What differs" below for what each printed). @project/app-app is the name
// field of that app's package.json.
const PM_ROWS: Array<{ task: string } & Record<PmId, PmCellData>> = [
  { task: "Create a project", npm: { cmd: "npm create devora@latest" }, yarn: { cmd: "yarn create devora", also: { label: "Yarn 4", cmd: "yarn dlx create-devora" } }, pnpm: { cmd: "pnpm create devora", also: { label: "or", cmd: "pnpm dlx create-devora" } } },
  { task: "Install", npm: { cmd: "npm install" }, yarn: { cmd: "yarn install" }, pnpm: { cmd: "pnpm install" } },
  { task: "Dev servers", npm: { cmd: "npm run dev" }, yarn: { cmd: "yarn dev" }, pnpm: { cmd: "pnpm run dev" } },
  { task: "Build", npm: { cmd: "npm run build" }, yarn: { cmd: "yarn build" }, pnpm: { cmd: "pnpm run build" } },
  { task: "Serve the build", npm: { cmd: "npm run start" }, yarn: { cmd: "yarn start" }, pnpm: { cmd: "pnpm run start" } },
  { task: "Add a package to one app", npm: { cmd: "npm install dayjs -w apps/app" }, yarn: { cmd: "yarn workspace @project/app-app add dayjs" }, pnpm: { cmd: "pnpm --filter @project/app-app add dayjs" } },
  { task: "Add a package to the project root", npm: { cmd: "npm install dayjs" }, yarn: { cmd: "yarn add -W dayjs", also: { label: "Yarn 4", cmd: "yarn add dayjs" } }, pnpm: { cmd: "pnpm add -w dayjs" } },
  { task: "Run a package script", npm: { cmd: "npm run typecheck" }, yarn: { cmd: "yarn typecheck" }, pnpm: { cmd: "pnpm run typecheck" } },
  { task: "Run the project's CLI once", npm: { cmd: "npx devora list" }, yarn: { cmd: "yarn devora list" }, pnpm: { cmd: "pnpm exec devora list" } },
];

function PmCell({ cell }: { cell: PmCellData }) {
  return (
    <>
      <code>{cell.cmd}</code>
      {cell.also ? <> ({cell.also.label}: <code>{cell.also.cmd}</code>)</> : null}
    </>
  );
}

export default function GettingStarted() {
  return (
    <PageShell nav={DOCS_NAV} footer={<SiteFooter />}>
      <DocsLayout active="getting-started">
      <h1>Getting started</h1>
      <Callout kind="info" title="React versions">
        Devora.js supports React 18.3 and React 19 (peer range <code>^18.3.0 || ^19.0.0</code>); new
        projects start on React 18. The{" "}
        <a href="/roadmap#findings">roadmap</a> records this as finding U11 (fixed in 0.3.2).
      </Callout>
      <p>
        The quickest way to a working project is the <code>create-devora</code> installer. It works
        from an empty directory — you don't need a devora.config.ts or any framework files first.
      </p>
      <div className="devora-card">
        <p style={{ margin: 0 }}>
          <code>npm create devora@latest</code>
        </p>
      </div>
      <p>
        Yarn and pnpm work the same way: <code>yarn create devora</code> or{" "}
        <code>pnpm create devora</code> (<code>npx create-devora@latest</code> does too). You need
        Node 20 or newer (checked on 20.20, 22.23, 24.22 and 26.13; the experimental Sekhem engine needs 22.15 or newer). New projects depend on <code>@devorajs/core</code> and{" "}
        <code>@devorajs/cli</code> <code>^0.3.5</code> and start on React 18.
      </p>
      <p>
        On a recent npm (11), the install can print a warning that esbuild's postinstall script is
        not yet covered by <code>allowScripts</code>; install, <code>devora dev</code> and{" "}
        <code>devora build</code> still work, and the warning comes from npm, not from Devora.js.
      </p>

      <h2 id="package-managers">npm, Yarn and pnpm</h2>
      <p>
        A project works with all three. These are the commands for each; run them from the project folder.
        In the workspace commands, <code>@project/app-app</code> stands for the <code>name</code> in that
        app's <code>package.json</code>.
      </p>
      <style dangerouslySetInnerHTML={{ __html: `
        .pm-wide table { table-layout: fixed; width: 100%; }
        .pm-wide code, .pm-stack code { overflow-wrap: anywhere; white-space: pre-wrap; }
        .pm-stack { display: none; }
        .pm-stack h3 { margin: 1.25rem 0 0.4rem; font-size: 1.05rem; }
        .pm-stack dl { margin: 0; border-top: 1px solid var(--devora-border); }
        .pm-stack dt { margin: 0; padding: 0.6rem 0 0.1rem; font-size: 0.85rem; color: var(--devora-fg-muted); }
        .pm-stack dd { margin: 0; padding: 0 0 0.6rem; border-bottom: 1px solid var(--devora-border); }
        @media (max-width: 700px) { .pm-wide { display: none; } .pm-stack { display: block; } }
      ` }} />
      <div className="docs-table-wrap pm-wide">
        <table>
          <thead><tr><th>Task</th>{PM_NAMES.map((n) => <th key={n.id}>{n.label}</th>)}</tr></thead>
          <tbody>
            {PM_ROWS.map((row) => (
              <tr key={row.task}>
                <td>{row.task}</td>
                {PM_NAMES.map((n) => <td key={n.id}><PmCell cell={row[n.id]} /></td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pm-stack">
        {PM_NAMES.map((n) => (
          <section key={n.id} aria-label={n.label}>
            <h3>{n.label}</h3>
            <dl>
              {PM_ROWS.map((row) => (
                <div key={row.task}>
                  <dt>{row.task}</dt>
                  <dd><PmCell cell={row[n.id]} /></dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
      <p>
        Inside a project, the one-off command runs the CLI that project pins. Outside one, <code>npx devora</code>{" "}
        looks up an unrelated package of that name, as described <a href="#why-not-just-devora-dev">below</a>.
      </p>
      <h3 style={{ fontSize: "1.05rem", margin: "1.75rem 0 0.5rem" }}>What differs</h3>
      <p>Only what was seen when these commands were run (see the last paragraph of this section):</p>
      <ul>
        <li>
          <strong>npm 11</strong> prints <code>Unknown project config "link-workspace-packages"</code> on every
          command, because the project's <code>.npmrc</code> carries a pnpm setting. It also prints the{" "}
          <code>allowScripts</code> warning for esbuild described above. npm 10 prints neither. Everything works.
        </li>
        <li>
          <strong>Yarn 1</strong> warns about an unmet peer dependency (<code>react</code>) on install. A plain{" "}
          <code>yarn add dayjs</code> at the project root stops with an error asking for <code>-W</code>.
        </li>
        <li>
          <strong>Yarn 4</strong> installs with Plug'n'Play by default, and the CLI does not run under it: it stops
          with <code>@devorajs/cli tried to access esbuild</code>. Before installing, put{" "}
          <code>nodeLinker: node-modules</code> in a <code>.yarnrc.yml</code> at the project root; then everything
          below works. Yarn 4 also prints peer-dependency warnings (<code>YN0002</code>) about <code>react</code>.
        </li>
        <li>
          <strong>pnpm 9 and 10</strong>: a plain <code>pnpm add dayjs</code> at the project root stops with{" "}
          <code>ERR_PNPM_ADDING_TO_ROOT</code> and asks for <code>-w</code>. pnpm 10 also prints{" "}
          <code>Ignored build scripts: esbuild</code> after the install; the project still installs, builds and runs.
        </li>
        <li>
          <strong>pnpm 11 and later</strong> (12.10 was tried) cannot install a fresh project: it ignores the{" "}
          <code>link-workspace-packages</code> setting in <code>.npmrc</code> and looks for the project's own{" "}
          <code>@devorajs/backend</code> on npm (<code>ERR_PNPM_FETCH_404</code>), and then fails on esbuild's
          ignored build script (<code>ERR_PNPM_IGNORED_BUILDS</code>). Use pnpm 9 or 10, or replace the contents of{" "}
          <code>pnpm-workspace.yaml</code> with the block below and install again. This is a known gap in the
          scaffold; it is tracked on the <a href="/roadmap">roadmap</a>.
        </li>
      </ul>
      <div className="devora-card">
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
{`# pnpm-workspace.yaml, for pnpm 11 and later
packages:
  - "packages/*"
  - "apps/*"
linkWorkspacePackages: true
allowBuilds:
  esbuild: true`}
        </pre>
      </div>
      <p>
        <strong>What is covered.</strong> On every push, CI installs the repository's own workspace with npm 10, Yarn 1
        and pnpm 9.9; the tests and every app build run under pnpm only. The commands in the table were run by hand
        on Node 20 against a new project: npm 10.8 and 11.17, Yarn 1.22 and 4.18 (through corepack), and pnpm 9.15,
        10.34 and 12.10. Bun and Deno were not tested, so they are not listed as supported.
      </p>

      <h2>What it asks</h2>
      <p>Run with no flags in a real terminal, it prompts for four things in order:</p>
      <p>
        <strong>1. Project name.</strong> Defaults to <code>my-devora-app</code>. This becomes the
        directory the CLI creates — it refuses to run if that directory already exists.
      </p>
      <p>
        <strong>2. What do you need?</strong> <Tag color="blue">full-stack</Tag> (the default)
        generates page apps plus one shared backend, <code>packages/backend</code>.{" "}
        <Tag color="purple">frontend</Tag> generates page apps only, with no{" "}
        <code>packages/backend</code> at all. <Tag color="emerald">backend</Tag> generates API-only
        apps — an <code>endpoints/</code> folder of routes, served under <code>/api</code>, with no
        pages and no React — plus the shared backend. Either way a project gets at most one shared backend; logic only one app needs can
        live inside that app instead (see{" "}
        <a href="/core-concepts#shared-backend">The shared backend pattern</a>).
      </p>
      <p>
        <strong>3. App names (comma-separated).</strong> Defaults to{" "}
        <code>marketing,dashboard,admin</code> (<code>api</code> for a backend-only project). Each name becomes one app under{" "}
        <code>apps/</code> — this is where multi-app is decided. A single-app project just answers
        with one name; a project with a public site, a logged-in product, and an internal panel
        answers with three. You can add or remove apps later with <code>devora add</code>/
        <code>devora remove</code>, so this choice isn't permanent.
      </p>
      <p>
        <strong>4. Auth mode, once per app.</strong> For each app name, it asks: "Does &lt;app&gt;
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
        straight to the defaults above, and{" "}
        <code>--scope=fullstack|frontend|backend</code>, <code>--apps=</code> and{" "}
        <code>--auth=name:mode,...</code> flags let you skip the prompts entirely while scripting a
        scaffold. <code>--pm=npm|pnpm|yarn</code> picks the package manager (otherwise it's the one
        you ran the installer with) and <code>--skip-install</code> only writes the files:
      </p>
      <div className="devora-card">
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
{`npm create devora@latest my-app -- --scope=fullstack --apps=site,app --auth=site:none,app:shared --pm=npm`}
        </pre>
      </div>

      <h2>Resulting project structure</h2>
      <p>For the default answers (full-stack, three apps, all shared auth), you get:</p>
      <div className="devora-card">
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
{`my-devora-app/
├── devora.config.ts        # declares every app + the project-wide auth default
├── package.json            # dev / dev:host / build / start / typecheck scripts
├── tsconfig.json, tsconfig.base.json
├── .env.example            # the session secrets production needs
├── packages/
│   └── backend/            # the shared backend — server functions + your DB client
│       └── db/index.ts     # stub: plug your own database in here
└── apps/
    ├── marketing/
    │   ├── routes/         # index.tsx, plus login/logout/account.tsx for an app with auth
    │   ├── error.tsx       # the app's 404 and error page
    │   ├── app.config.ts   # apiDir: "endpoints", sitemap, head
    │   ├── vite.config.ts
    │   ├── entry-server.tsx, island-client.tsx, csr-client.tsx
    │   ├── package.json, tsconfig.json
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
        <code>pnpm-workspace.yaml</code>, <code>.gitignore</code>, <code>.npmrc</code>, a{" "}
        <code>README.md</code>) sit at the project root too. API routes for a page app go in an{" "}
        <code>endpoints/</code> folder you create when you need one (<code>apiDir</code> in{" "}
        <code>app.config.ts</code>); they're served under <code>/api</code>. Not{" "}
        <code>api/</code>: on Vercel a top-level <code>api/</code> folder is Vercel's own
        functions folder (see <a href="/deployment">Deployment</a>).
      </p>
      <p>
        A <strong>frontend</strong> project is the same minus <code>packages/backend</code>. A{" "}
        <strong>backend</strong> project has <code>packages/backend</code> and API-only apps
        instead:
      </p>
      <div className="devora-card">
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
{`my-devora-app/
├── devora.config.ts
├── package.json
├── packages/
│   └── backend/
│       └── db/index.ts
└── apps/
    └── api/
        ├── endpoints/      # health.ts, plus session.ts (token login/logout) and me.ts for an app with auth
        ├── app.config.ts   # backendOnly: true, apiDir: "endpoints"
        ├── vite.config.ts
        ├── package.json, tsconfig.json
        └── vercel.json, netlify.toml`}
        </pre>
      </div>

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
        That starts every app in dev mode and prints a short header with the CLI version and how
        long startup took, every app's URLs, then each app's routes (pages always; API routes
        listed up to 10 per app, counted above that). Ports start at <code>10000</code>, one per
        app in <code>devora.config.ts</code> order. To run a single app, pass the flag through npm:{" "}
        <code>npm run dev -- --app=dashboard</code>. <code>--routes</code> lists every API route,{" "}
        <code>--quiet</code> prints only the URLs, warnings and errors, and{" "}
        <code>npm run dev:host</code> exposes the dev servers on your local network (with a
        warning). <code>.env</code> files in the project root are loaded automatically.
      </p>
      <p>
        <strong id="why-not-just-devora-dev">Why not just <code>devora dev</code>?</strong> The CLI is installed into the
        project (<code>node_modules</code>), not onto your system <code>PATH</code> — so a bare{" "}
        <code>devora</code> command isn't found. That's normal: Next.js, Vite, and most framework
        CLIs work exactly the same way. It also means every project runs the exact CLI version it
        pins. Your options:
      </p>
      <div className="docs-table-wrap">
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
      </div>
      <p>
        See the <a href="/cli-reference">CLI reference</a> for every command, or go straight to{" "}
        <a href="/first-feature">Build your first feature</a> for a complete worked example.
      </p>
      </DocsLayout>
    </PageShell>
  );
}
