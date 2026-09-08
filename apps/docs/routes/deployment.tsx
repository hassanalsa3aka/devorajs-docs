import { PageShell } from "@devorajs/core";
import { DOCS_NAV } from "../nav.js";

export const renderMode = "ssg";

export function meta() {
  return {
    title: "Deployment",
    description: "Deploying a devora.js project to Vercel, Netlify, Docker, or a self-hosted VPS.",
  };
}

export async function loader() {
  return {};
}

export default function Deployment() {
  return (
    <PageShell nav={DOCS_NAV}>
      <h1>Deployment</h1>
      <p>
        A multi-app project doesn't deploy as one unit — each app in{" "}
        <code>devora.config.ts</code> maps to its own platform project (Vercel), site (Netlify),
        or process (self-hosted). This is inherent to how those platforms work, not a devora.js
        convention: a marketing site, dashboard, and admin panel are three independently
        deployable things.
      </p>

      <h2>Vercel</h2>
      <p>
        In the Vercel dashboard, add a new project per app, importing the same repo each time and
        setting <strong>Root Directory</strong> to <code>apps/&lt;name&gt;</code>. Each app already
        ships a committed <code>vercel.json</code> that points the build command at{" "}
        <code>devora build --adapter=vercel</code> for that app — nothing else needs configuring in
        the dashboard. If an app's auth mode is <code>shared</code> or <code>isolated</code>, set
        its session secret as an environment variable (<code>DEVORA_SESSION_SECRET</code>, or{" "}
        <code>DEVORA_SESSION_SECRET_&lt;APPNAME&gt;</code> for an isolated app) before deploying —
        an app with <code>auth: "none"</code> needs none of this. Changing an env var requires a
        redeploy to take effect.
      </p>

      <h2>Netlify</h2>
      <p>
        Same shape as Vercel: import the repo once per app, setting <strong>Base
        directory</strong> to <code>apps/&lt;name&gt;</code>. Each app ships a committed{" "}
        <code>netlify.toml</code> with the right build command and publish directory. One gotcha
        worth knowing up front: if Netlify auto-detected build settings on first import, its
        dashboard settings take precedence over <code>netlify.toml</code> and can silently break
        the build — clear the dashboard's Build command/Publish directory fields (or set them to
        match <code>netlify.toml</code> explicitly) if that happens. Environment variables follow
        the identical shared/isolated/none rule described above for Vercel.
      </p>
      <p>
        For both platforms, <code>devora deploy --adapter=vercel|netlify</code> (see the{" "}
        <a href="/cli-reference">CLI reference</a>) is an optional convenience for pushing from the
        CLI once an app is linked with the platform's own <code>vercel link</code>/
        <code>netlify link</code> — it's not required if you're already deploying on every git
        push through the dashboard integration.
      </p>

      <h2>Docker</h2>
      <p>
        Each app builds and runs as its own container image, one app per image via a build arg:
      </p>
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

      <h2>Self-hosted VPS</h2>
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
    </PageShell>
  );
}
