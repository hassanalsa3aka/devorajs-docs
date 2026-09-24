import { PageShell } from "@devorajs/core";
import { DOCS_NAV } from "../nav.js";
import { SiteFooter } from "../site-footer.js";
import { DocsLayout, Tag } from "../docs-layout.js";

export const renderMode = "ssg";

export function meta() {
  return {
    title: "CLI reference",
    description:
      "Every devora CLI command — dev, build, start, deploy, new, add, remove, list, split, sync, status, generate:proxy.",
  };
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
        <code>npm exec</code>, or <code>yarn</code>, whichever your project uses.
      </p>

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
        <strong>On boot it prints every app's URLs and route table</strong> — page routes and{" "}
        <code>api/**</code> routes, with each app's auth mode — so you can see what's actually
        being served without opening <code>routes/</code>:
      </p>
      <div className="devora-card">
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
{`  dashboard  (auth: shared, prod domain: dashboard.example.com)
    Local:    http://localhost:10001/
    Network:  use --host to expose
    API:      http://localhost:10001/api
    Routes:
      page /
      page /account
      page /login
      page /logout
      api  /api/orders/[id]`}
        </pre>
      </div>
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
        Vercel or Netlify deploy, not needed for self-hosting.
      </p>

      <h2 id="start"><code>devora start</code></h2>
      <p>
        Serves a production build with the plain Node adapter — run <code>devora build</code>{" "}
        first. Pass <code>--app &lt;name&gt;</code> to serve just one app, or{" "}
        <code>--port &lt;port&gt;</code> to set the starting port (each additional app increments
        from there automatically, so multiple apps never collide on the same host).
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
        used).
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
      </DocsLayout>
    </PageShell>
  );
}
