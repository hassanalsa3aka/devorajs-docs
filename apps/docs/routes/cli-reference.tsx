import { PageShell } from "@devorajs/core";
import { DOCS_NAV } from "../nav.js";

export const renderMode = "ssg";

export function meta() {
  return {
    title: "CLI reference",
    description: "Every devora CLI command — dev, build, start, deploy, new, add, remove, list, generate:proxy.",
  };
}

export async function loader() {
  return {};
}

export default function CliReference() {
  return (
    <PageShell nav={DOCS_NAV}>
      <h1>CLI reference</h1>
      <p>
        Every command below runs as <code>devora &lt;command&gt;</code> — via <code>pnpm exec</code>,{" "}
        <code>npm exec</code>, or <code>yarn</code>, whichever your project uses.
      </p>

      <h2><code>devora dev</code></h2>
      <p>
        Runs every app in the project in dev mode at once, each on its own Vite dev server. Pass{" "}
        <code>--app &lt;name&gt;</code> to run just one app instead — the common case once a
        project has more than one app and you're only working on one of them.
      </p>

      <h2><code>devora build</code></h2>
      <p>
        Builds every app for production (or one, with <code>--app &lt;name&gt;</code>). Add{" "}
        <code>--adapter &lt;target&gt;</code> (<code>vercel</code> or <code>netlify</code>) to also
        write that platform's build output format alongside the standard build — needed before a
        Vercel or Netlify deploy, not needed for self-hosting.
      </p>

      <h2><code>devora start</code></h2>
      <p>
        Serves a production build with the plain Node adapter — run <code>devora build</code>{" "}
        first. Pass <code>--app &lt;name&gt;</code> to serve just one app, or{" "}
        <code>--port &lt;port&gt;</code> to set the starting port (each additional app increments
        from there automatically, so multiple apps never collide on the same host).
      </p>

      <h2><code>devora deploy</code></h2>
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

      <h2><code>devora new &lt;app-name&gt;</code></h2>
      <p>
        Scaffolds a new app inside an existing project — creates <code>apps/&lt;name&gt;</code> and
        registers it in <code>devora.config.ts</code>. Prompts whether the app needs auth/sessions
        unless you pass <code>--auth shared|isolated|none</code>, and <code>--domain
        &lt;domain&gt;</code> sets the domain recorded in the config (otherwise a placeholder is
        used).
      </p>

      <h2><code>devora add &lt;app-name&gt;</code></h2>
      <p>
        Identical to <code>devora new</code> — a friendlier alias for the same scaffolding action,
        same flags.
      </p>

      <h2><code>devora remove &lt;app-name&gt;</code> <span style={{ opacity: 0.6 }}>(alias: <code>rm</code>)</span></h2>
      <p>
        Undoes <code>new</code>/<code>add</code>: deletes <code>apps/&lt;name&gt;</code> and its
        entry in <code>devora.config.ts</code>. No flags.
      </p>

      <h2><code>devora list</code> <span style={{ opacity: 0.6 }}>(alias: <code>ls</code>)</span></h2>
      <p>
        Lists every app currently registered in <code>devora.config.ts</code> — name, directory,
        domain, and effective auth mode. Useful for checking a project's shape without opening the
        config file.
      </p>

      <h2><code>devora generate:proxy</code></h2>
      <p>
        Reads every app's domain out of <code>devora.config.ts</code> and writes a working reverse
        proxy config for self-hosting. <code>--target &lt;target&gt;</code> (required) is{" "}
        <code>nginx</code> or <code>caddy</code>; <code>--out &lt;path&gt;</code> sets where the
        file is written instead of the default location.
      </p>
    </PageShell>
  );
}
