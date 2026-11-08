import { PageShell } from "@devorajs/core";
import { DOCS_NAV } from "../nav.js";
import { SiteFooter } from "../site-footer.js";
import { DocsLayout, Tag, Callout } from "../docs-layout.js";
import { pageMeta } from "../seo.js";
import { RELEASE_VERSION } from "../version.js";

export const renderMode = "ssg";

export function meta() {
  return pageMeta("/cli-reference", {
    title: "CLI reference",
    description:
      "Every Devora.js CLI command — dev, build, start, deploy, new, add, remove, list, split, sync, status, and generate:proxy — and the flags each one takes.",
  });
}

export async function loader() {
  return {};
}

export default function CliReference() {
  return (
    <PageShell nav={DOCS_NAV} footer={<SiteFooter />}>
      <DocsLayout active="cli-reference">
      <h1>CLI reference</h1>
      <p>
        Every command below runs as <code>devora &lt;command&gt;</code> — via <code>pnpm exec</code>,{" "}
        <code>npm exec</code>/<code>npx</code>, or <code>yarn</code>, whichever your project uses
        (or a <code>package.json</code> script). This page describes <code>@devorajs/cli</code>{" "}
        0.3.5; <code>npx devora --version</code> prints yours.
      </p>
      <p>
        <code>dev</code>, <code>build</code>, <code>start</code> and <code>deploy</code> load the
        project root's <code>.env</code> files first (<code>.env</code>, <code>.env.local</code>,{" "}
        <code>.env.&lt;mode&gt;</code>, <code>.env.&lt;mode&gt;.local</code>, with Vite's
        precedence; mode is <code>development</code> for <code>dev</code>,{" "}
        <code>production</code> otherwise). A variable already set in the environment always
        wins, and only file names are printed, never values.
      </p>

      <div className="docs-table-wrap">
          <table>
          <thead>
            <tr>
              <th>Command</th>
              <th>Does</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr><td><a href="#dev"><code>dev</code></a></td><td>Run every app (or one) in dev mode</td><td></td></tr>
            <tr><td><a href="#build"><code>build</code></a></td><td>Build for production, optionally for an adapter</td><td></td></tr>
            <tr><td><a href="#start"><code>start</code></a></td><td>Serve a production build (self-hosted)</td><td></td></tr>
            <tr><td><a href="#deploy"><code>deploy</code></a></td><td>Build and push straight to Vercel/Netlify</td><td></td></tr>
            <tr><td><a href="#new"><code>new</code></a></td><td>Scaffold a new app in the project</td><td></td></tr>
            <tr><td><a href="#add"><code>add</code></a></td><td>Alias of <code>new</code></td><td></td></tr>
            <tr><td><a href="#remove"><code>remove</code></a></td><td>Delete an app (alias: <code>rm</code>)</td><td></td></tr>
            <tr><td><a href="#list"><code>list</code></a></td><td>List every registered app (alias: <code>ls</code>)</td><td></td></tr>
            <tr><td><a href="#split"><code>split</code></a></td><td>Split an app/backend into its own repo</td><td><Tag color="gray">0.2+</Tag></td></tr>
            <tr><td><a href="#sync"><code>sync</code></a></td><td>Pull/push a split-off piece's remote</td><td><Tag color="gray">0.2+</Tag></td></tr>
            <tr><td><a href="#status"><code>status</code></a></td><td>Sync state across every split-off piece</td><td><Tag color="gray">0.2+</Tag></td></tr>
            <tr><td><a href="#generate-proxy"><code>generate:proxy</code></a></td><td>Write an nginx/Caddy reverse-proxy config</td><td></td></tr>
          </tbody>
        </table>
      </div>

      <h2 id="dev"><code>devora dev</code></h2>
      <p>
        Runs every app in the project in dev mode at once, each on its own Vite dev server. Pass{" "}
        <code>--app &lt;name&gt;</code> to run just one app instead — the common case once a
        project has more than one app and you're only working on one of them.
      </p>
      <p>
        <strong>Ports start at 10000</strong>, one per app in <code>devora.config.ts</code> order
        (10000, 10001, 10002, …). Set <code>devPort</code> on an app's entry in{" "}
        <code>devora.config.ts</code> to pin a different one. If a port is taken, that app moves to
        the next free port and the CLI says so, rather than failing. These are dev-only;{" "}
        <code>devora start</code> uses its own ports (from 4173).
      </p>
      <p>
        <strong>On boot it prints a short header, then every app's URLs, then the routes per
        app</strong> — so you can see what's actually being served without opening{" "}
        <code>routes/</code>. Pages are always listed; an app's API routes are listed when it has
        10 or fewer and counted above that. This is real output from a fresh three-app project
        (<code>NO_COLOR=1</code>; in a color terminal the mark is drawn in the logo's gradient):
      </p>
      <div className="devora-card">
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
{`         ▄█
    ▄▄▄▄▄██  ▄     devora.js 0.3.5
  ▄█▀▀▀▀▀██  ▀█▄   dev · 3 apps · ready in 312 ms
  ██     ██   ▄█▀
   ▀███████  █▀

  marketing  auth: none · marketing.example.com
    Local:    http://localhost:10000/
    Network:  use --host to expose

  dashboard  auth: shared · dashboard.example.com
    Local:    http://localhost:10001/
    Network:  use --host to expose
    API:      http://localhost:10001/api

  admin  auth: isolated · admin.example.com
    Local:    http://localhost:10002/
    Network:  use --host to expose

  Routes
    marketing
      page  /
    dashboard
      page  /
      page  /account
      page  /login
      page  /logout
      api   /api/hello
    admin
      page  /
      page  /account
      page  /login
      page  /logout`}
        </pre>
      </div>
      <div className="docs-table-wrap">
        <table>
          <thead><tr><th>Flag</th><th>Does</th></tr></thead>
          <tbody>
            <tr><td><code>--app &lt;name&gt;</code></td><td>Run only this app</td></tr>
            <tr><td><code>--host</code></td><td>Listen on every network interface and print LAN URLs (with a warning)</td></tr>
            <tr><td><code>--routes</code></td><td>List every API route, however many (same as <code>DEVORA_ROUTES=all</code>)</td></tr>
            <tr><td><code>--quiet</code></td><td>Only warnings, errors and one URL line per app; Vite logs at <code>warn</code></td></tr>
          </tbody>
        </table>
      </div>
      <p>
        <strong>Terminal output</strong> follows the usual conventions: color in a terminal, plain
        text when piped or in CI (<code>CI</code> set), <code>NO_COLOR=1</code> turns color off and{" "}
        <code>FORCE_COLOR</code> (<code>0</code> off, <code>1</code>/<code>2</code>/<code>3</code>{" "}
        for 16/256/truecolor) overrides both. Terminals narrower than 43 columns get a one-line
        header. Nothing animates.
      </p>
      <p>
        <strong><code>--host</code></strong> (off by default) listens on all network interfaces
        instead of just <code>localhost</code>, and adds each app's LAN address to that output (
        <code>Network: http://192.168.x.x:10000/</code>) — for testing on a phone or another device
        on the same network. It prints a warning when enabled, since anyone on that network can
        then reach your dev server. Scaffolded projects include it as a script:{" "}
        <code>npm run dev:host</code>.
      </p>

      <h2 id="build"><code>devora build</code></h2>
      <p>
        Builds every app for production (or one, with <code>--app &lt;name&gt;</code>). Add{" "}
        <code>--adapter &lt;target&gt;</code> (<code>vercel</code> or <code>netlify</code>) to also
        write that platform's build output format alongside the standard build — needed before a
        Vercel or Netlify deploy, not needed for self-hosting. Any other <code>--adapter</code>{" "}
        value is an error.
      </p>
      <ul>
        <li>
          Always builds with <code>NODE_ENV=production</code>, and says so if it overrides a value
          you set.
        </li>
        <li>
          Runs the app's <code>prebuild</code> commands (<code>app.config.ts</code>) first, in the
          app folder, with <code>node_modules/.bin</code> on <code>PATH</code>; a failing command
          stops the build.
        </li>
        <li>
          With <code>--adapter</code>, runs preflight checks before any build work: session secret
          and store for the app's auth mode (both platforms); a supported function runtime and no
          top-level <code>api/</code> folder in the Vercel project (Vercel); the API folder listed
          in <code>netlify.toml</code>'s <code>included_files</code> (Netlify).
        </li>
        <li>
          <code>--out &lt;dir&gt;</code> (with <code>--adapter=vercel --app=&lt;name&gt;</code>)
          writes the Build Output directory somewhere other than{" "}
          <code>apps/&lt;name&gt;/.vercel/output</code> — e.g. <code>--out=.vercel/output</code>{" "}
          when the Vercel project's Root Directory is the repo root.
        </li>
        <li><code>--quiet</code> keeps only warnings and errors.</li>
      </ul>

      <h2 id="start"><code>devora start</code></h2>
      <p>
        Serves a production build with the plain Node adapter — run <code>devora build</code>{" "}
        first. Pass <code>--app &lt;name&gt;</code> to serve just one app. The port is{" "}
        <code>--port</code>, else the <code>PORT</code> environment variable, else 4173; each
        additional app gets the next port, so multiple apps never collide on the same host. The
        interface is <code>--host</code>, else <code>HOST</code>, else every interface (use{" "}
        <code>HOST=127.0.0.1</code> behind a reverse proxy). Values taken from the environment are
        printed. It always runs with <code>NODE_ENV=production</code>. The same server is
        available as <code>createNodeServer()</code> from{" "}
        <a href="https://www.npmjs.com/package/@devorajs/adapter-node">
          <code>@devorajs/adapter-node</code>
        </a>{" "}
        if you need your own entry point.
      </p>

      <h2 id="deploy"><code>devora deploy</code></h2>
      <p>
        Builds and deploys straight to Vercel or Netlify via <code>--adapter &lt;target&gt;</code>{" "}
        (required), for all apps or one with <code>--app &lt;name&gt;</code>, deploying to
        production instead of a preview with <code>--prod</code>. Each app must already be linked
        to its own platform project/site (<code>vercel link</code> / <code>netlify link</code>, run
        once per app directory) — an unlinked app is skipped with an instruction rather than
        failing the whole run, and one app's deploy failure doesn't stop the rest. This is a
        convenience on top of the git-integration deploy flow described in{" "}
        <a href="/deployment">Deployment</a>, not a replacement for it.
      </p>

      <h2 id="new"><code>devora new &lt;app-name&gt;</code></h2>
      <p>
        Scaffolds a new app inside an existing project — creates <code>apps/&lt;name&gt;</code> and
        registers it in <code>devora.config.ts</code>. Prompts whether the app needs auth/sessions
        unless you pass <code>--auth shared|isolated|none</code>, and <code>--domain
        &lt;domain&gt;</code> sets the domain recorded in the config (otherwise a placeholder is
        used). <code>--kind pages|api</code> picks a page app or a backend-only API app; without
        it, a project whose apps are all backend-only gets an API app, otherwise a page app. New
        apps keep API routes in <code>endpoints/</code> (<code>apiDir: "endpoints"</code>).
      </p>

      <h2 id="add"><code>devora add &lt;app-name&gt;</code></h2>
      <p>
        Identical to <code>devora new</code> — a friendlier alias for the same scaffolding action,
        same flags.
      </p>

      <h2 id="remove"><code>devora remove &lt;app-name&gt;</code> <Tag color="gray">alias: rm</Tag></h2>
      <p>
        Undoes <code>new</code>/<code>add</code>: deletes <code>apps/&lt;name&gt;</code> and its
        entry in <code>devora.config.ts</code>. No flags.
      </p>

      <h2 id="list"><code>devora list</code> <Tag color="gray">alias: ls</Tag></h2>
      <p>
        Lists every app currently registered in <code>devora.config.ts</code> — name, directory,
        domain, and effective auth mode. Useful for checking a project's shape without opening the
        config file.
      </p>

      <h2 id="split"><code>devora split &lt;app-name|backend&gt;</code> <Tag color="gray">since 0.2.0</Tag></h2>
      <p>
        See <a href="/repo-splitting">Repo-splitting</a> for the full explanation. Converts{" "}
        <code>apps/&lt;name&gt;</code> (or the literal <code>backend</code>, for{" "}
        <code>packages/backend</code>) into a real git submodule pointing at{" "}
        <code>--repo &lt;url&gt;</code> — an empty remote you create yourself first. Prompts for
        confirmation before doing anything (skip with <code>--yes</code> for scripted use).
      </p>

      <h2 id="sync"><code>devora sync [names...]</code> <Tag color="gray">since 0.2.0</Tag></h2>
      <p>
        Pulls or pushes a split-off app/backend against its own remote — exactly one of{" "}
        <code>--from-main</code> (merge the remote's latest into your local checkout) or{" "}
        <code>--to-main</code> (push local commits made inside that checkout) is required. Name
        one or more targets, or pass <code>--all</code> for every split-off piece. Shows the real
        commits it's about to pull/push and asks for confirmation first (<code>--yes</code> skips
        it).
      </p>

      <h2 id="status"><code>devora status</code> <Tag color="gray">since 0.2.0</Tag></h2>
      <p>
        One view across every split-off app/backend: up to date, local commits not pushed, remote
        commits not pulled, or diverged.
      </p>

      <h2 id="generate-proxy"><code>devora generate:proxy</code></h2>
      <p>
        Reads every app's domain out of <code>devora.config.ts</code> and writes a working reverse
        proxy config for self-hosting. <code>--target &lt;target&gt;</code> (required) is{" "}
        <code>nginx</code> or <code>caddy</code>; <code>--out &lt;path&gt;</code> sets where the
        file is written instead of the default location.
      </p>

      <h2 id="desktop"><code>devora desktop dev|build|serve</code> <Tag color="gray">experimental</Tag></h2>
      <Callout kind="warning" title="Experimental, off by default, not published yet">
        <p>
          This command is in the framework repository for the release after {RELEASE_VERSION} and is not on npm.
          It does nothing unless you pass <code>--experimental</code>, and its shape may change.
        </p>
      </Callout>
      <p>
        Runs one app in a desktop window with Tauri 2. The app's own server starts as a sidecar on{" "}
        <code>127.0.0.1</code>, on a random port, and answers only requests that carry a token created for that
        launch; any other host gets a 400 and any request without the token a 403. The window loads only that
        origin, the generated configuration allows no IPC command unless <code>apps/&lt;app&gt;/desktop.json</code>{" "}
        lists it, the CSP is the app's own, nothing remote is loaded, and updates are configured only when they are
        signed. <code>--app &lt;name&gt;</code> picks the app.
      </p>
      <ul>
        <li><code>dev</code>: builds the app and serves it behind those rules, and prints a launch URL to check it in a browser on the same machine.</li>
        <li><code>build</code>: builds the app and writes its Tauri project to <code>apps/&lt;app&gt;/desktop/src-tauri</code>. Building the window itself needs Rust and the Tauri CLI on your machine.</li>
        <li><code>serve</code>: the sidecar the window starts (token in <code>DEVORA_DESKTOP_TOKEN</code>, port in <code>PORT</code>).</li>
      </ul>
      <p>Mobile, and Metro-class bundling and device tooling, come later; nothing in the code is about them.</p>
      </DocsLayout>
    </PageShell>
  );
}
