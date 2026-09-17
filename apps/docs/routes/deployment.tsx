import { PageShell } from "@devorajs/core";
import { DOCS_NAV } from "../nav.js";
import { SiteFooter } from "../site-footer.js";
import { DocsLayout } from "../docs-layout.js";

export const renderMode = "ssg";

export function meta() {
  return {
    title: "Deployment",
    description:
      "Step-by-step: pushing to GitHub, then deploying to Vercel, Netlify, or Docker.",
  };
}

export async function loader() {
  return {};
}

export default function Deployment() {
  return (
    <PageShell nav={DOCS_NAV} footer={<SiteFooter />}>
      <DocsLayout active="deployment">
      <style>{`
        .deploy-steps {
          list-style: none;
          counter-reset: deploy-step;
          margin: 1.1rem 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }
        .deploy-step {
          counter-increment: deploy-step;
          position: relative;
          margin: 0;
          padding: 1rem 1.15rem 1rem 3rem;
          background: var(--devora-card);
          border: 1px solid var(--devora-border);
          border-radius: var(--devora-radius);
          line-height: 1.65;
          color: var(--devora-fg-muted);
        }
        .deploy-step::before {
          content: counter(deploy-step);
          position: absolute;
          left: 0.95rem;
          top: 1rem;
          width: 1.5rem;
          height: 1.5rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.78rem;
          font-weight: 700;
          color: white;
          background: linear-gradient(135deg, var(--devora-accent-from), var(--devora-accent-to));
        }
        .deploy-step strong { color: var(--devora-fg); }
        .deploy-step .devora-card { margin-top: 0.75rem; margin-bottom: 0; }
      `}</style>
      <h1>Deployment</h1>
      <p>
        A multi-app project doesn't deploy as one unit — each app in{" "}
        <code>devora.config.ts</code> maps to its own platform project (Vercel), site (Netlify),
        or process (self-hosted/Docker). This is inherent to how those platforms work, not a
        devora.js convention: a marketing site, dashboard, and admin panel are three independently
        deployable things, each repeating the same steps below.
      </p>

      <h2>1. Push the project to GitHub</h2>
      <p>Both Vercel and Netlify deploy by connecting to a git repository — do this once, first:</p>
      <div className="devora-card">
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
{`git init                                            # skip if already a git repo
git add -A && git commit -m "initial commit"
gh repo create <your-repo> --private --source=. --push
# or, without the GitHub CLI:
#   create the repo on github.com first, then:
git remote add origin https://github.com/<you>/<your-repo>.git
git push -u origin main`}
        </pre>
      </div>
      <p>
        A committed <code>.github/workflows/ci.yml</code> ships with every project scaffolded by
        this framework — it runs a real <code>devora build</code> for every app (plain, plus both{" "}
        <code>--adapter</code> targets) on every push and pull request to <code>main</code>, across
        all three supported package managers, plus the real test suite. No setup needed beyond
        pushing the code; it's the gate that catches a broken build before it ever reaches Vercel
        or Netlify.
      </p>

      <h2>2. Deploying to Vercel</h2>
      <ol className="deploy-steps">
        <li className="deploy-step">
          In the Vercel dashboard: <strong>Add New… → Project</strong>, import the repo you just
          pushed.
        </li>
        <li className="deploy-step">
          Set <strong>Root Directory</strong> to <code>apps/&lt;name&gt;</code> for the app you're
          deploying.
        </li>
        <li className="deploy-step">
          Leave <strong>Build and Output Settings</strong> alone — each app already ships a
          committed <code>vercel.json</code> with <code>"framework": null</code> (disables
          Vercel's zero-config Vite detection, which would otherwise run a plain{" "}
          <code>vite build</code> and fail) and a <code>buildCommand</code> that runs{" "}
          <code>devora build --adapter=vercel</code> for that app. Nothing in the dashboard needs
          changing.
        </li>
        <li className="deploy-step">
          If the app's <code>auth</code> mode (<code>devora.config.ts</code>) is{" "}
          <code>"shared"</code> or <code>"isolated"</code>: under{" "}
          <strong>Settings → Environment Variables</strong>, add{" "}
          <code>DEVORA_SESSION_SECRET</code> (shared) or{" "}
          <code>DEVORA_SESSION_SECRET_&lt;APPNAME&gt;</code> (isolated — uppercase app name), a
          random value (<code>openssl rand -base64 32</code> works well). An app with{" "}
          <code>auth: "none"</code> needs none of this.
        </li>
        <li className="deploy-step">Deploy. Changing an env var afterward needs a redeploy to take effect.</li>
        <li className="deploy-step">Repeat as a separate Vercel project, once per app.</li>
      </ol>

      <h2>3. Deploying to Netlify</h2>
      <p>Same shape as Vercel, with a few platform-specific gotchas worth knowing up front:</p>
      <ol className="deploy-steps">
        <li className="deploy-step">
          In the Netlify dashboard: <strong>Add new project → Import an existing project</strong>,
          pick the repo.
        </li>
        <li className="deploy-step">
          Set <strong>Base directory</strong> to <code>apps/&lt;name&gt;</code>.
        </li>
        <li className="deploy-step">
          Each app ships a committed <code>netlify.toml</code> with the real build command,
          publish directory, and an SSR redirect already set — in principle nothing else needs
          configuring. In practice, <strong>Netlify's own dashboard Build settings take
          precedence over <code>netlify.toml</code> when both are set</strong>. If the site was
          ever auto-detected before <code>netlify.toml</code> existed (or a "Package directory"
          got set at any point), that stored setting silently overrides the committed file on
          every future build — confirmed directly: a site with a stray{" "}
          <code>Package directory</code> value produced a build log reading{" "}
          <code>No config file was defined: using default values</code> instead of{" "}
          <code>Config file: .../netlify.toml</code>, and the deployed function 404'd on every
          route as a result. Fix once, per site: <strong>Project configuration → Build &amp;
          deploy → Build settings → Configure</strong>, and clear <strong>Package
          directory</strong> entirely (leave it blank) — also clear Build command/Publish
          directory, or set them to match <code>netlify.toml</code> exactly, if either was set:
          <div className="devora-card" style={{ marginTop: "0.6rem" }}>
            <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
{`Build command:      cd ../.. && node packages/cli/dist/index.js build --app=<name> --adapter=netlify
Publish directory:   dist/client
Package directory:   (leave blank)`}
            </pre>
          </div>
        </li>
        <li className="deploy-step">
          Environment variables — same shared/isolated/none rule as Vercel above, under{" "}
          <strong>Environment variables</strong> in this site's own settings.
        </li>
        <li className="deploy-step">
          Deploy, then check the build log. It should read{" "}
          <code>build.command from netlify.toml</code>, not{" "}
          <code>Build command from Netlify app</code> — the latter means the dashboard override
          from step 3 is still active.
        </li>
        <li className="deploy-step">
          If the site builds and deploys but the live URL returns a runtime error rather than your
          page, check <strong>Cloud compute → Functions → ssr</strong> for the actual error (the
          browser only ever shows a generic 500). Netlify's function packager only bundles what it
          can statically trace from the function's own imports, plus whatever{" "}
          <code>netlify.toml</code>'s <code>included_files</code> explicitly lists — several real,
          previously-undiscovered gaps here were found this way against a real live deploy:
          <ul>
            <li>
              <code>SyntaxError: Cannot use import statement outside a module</code> — the
              function's own <code>package.json</code> (<code>{`{"type":"module"}`}</code>,
              written by the adapter so Node treats the built output as real ESM) wasn't reaching
              the deployed bundle.
            </li>
            <li>
              <code>Error: Cannot find package 'react'</code> — the adapter vendors real, resolved{" "}
              <code>react</code>/<code>react-dom</code> package trees into the function's own{" "}
              <code>node_modules</code>; same tracer blind spot.
            </li>
          </ul>
          Both are already fixed in every scaffolded app's committed <code>netlify.toml</code> (
          <code>included_files</code> lists <code>routes/**</code>, <code>api/**</code>,{" "}
          <code>dist/**</code>, <code>package.json</code>, and <code>node_modules/**</code>) — this
          is documented here in case a future platform change reintroduces the same class of gap:
          anything the function reads from disk at runtime, rather than statically imports, has to
          be named in that list explicitly, or it silently never reaches the deployed function.
        </li>
        <li className="deploy-step">Repeat as a separate Netlify site, once per app.</li>
      </ol>
      <p>
        For both platforms, <code>devora deploy --adapter=vercel|netlify</code> (see the{" "}
        <a href="/cli-reference">CLI reference</a>) is an optional convenience for pushing from the
        CLI once an app is linked with the platform's own <code>vercel link</code>/
        <code>netlify link</code> — it's not required if you're already deploying on every git
        push through the dashboard integration described above.
      </p>

      <h2>4. Docker</h2>
      <p>Each app builds and runs as its own container image, one app per image via a build arg:</p>
      <div className="devora-card">
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
{`docker build --build-arg APP_NAME=marketing -t devora-marketing .
docker run -p 4173:4173 devora-marketing

# shared/isolated apps need their session secret passed in
docker run -p 4173:4173 -e DEVORA_SESSION_SECRET=... devora-dashboard

# all apps together, via docker compose
cp .env.example .env
docker compose up --build`}
        </pre>
      </div>
      <p>
        Under the hood this runs the same self-hosted Node adapter described below — Docker isn't
        a separate deployment target with its own adapter, just a way to package and run it.
      </p>

      <h2>5. Self-hosted VPS</h2>
      <p>
        For a bare server, build each app you want to run, start them, then generate a reverse
        proxy config from the domains already declared in <code>devora.config.ts</code> — no
        hand-written nginx/Caddy config needed:
      </p>
      <div className="devora-card">
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
{`devora build --app=marketing && devora build --app=dashboard && devora build --app=admin
devora start                          # serves all built apps, sequential ports
devora generate:proxy --target=nginx  # or --target=caddy
# install the generated config for your distro, then reload nginx/caddy`}
        </pre>
      </div>
      <p>
        The generated nginx config listens on plain HTTP only — issuing a real TLS certificate
        needs a real, DNS-resolving domain, so the documented next step there is{" "}
        <code>certbot --nginx -d &lt;domain&gt;</code>. Caddy needs no such step: automatic HTTPS
        via ACME is its default behavior for any domain it can prove ownership of. To keep{" "}
        <code>devora start</code> running across reboots/crashes, a systemd unit template is
        available as a starting point to adapt to your own host, rather than a drop-in guarantee.
      </p>
      </DocsLayout>
    </PageShell>
  );
}
