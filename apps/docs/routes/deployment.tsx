import { PageShell } from "@devorajs/core";
import { DOCS_NAV } from "../nav.js";
import { SiteFooter } from "../site-footer.js";
import { DocsLayout, Callout, Tag } from "../docs-layout.js";
import { pageMeta } from "../seo.js";

export const renderMode = "ssg";

export function meta() {
  return pageMeta("/deployment", {
    title: "Deployment",
    description:
      "Deploy a Devora.js project step by step: push to GitHub, configure the session store, then ship each app to Vercel, Netlify, Docker, or a VPS.",
  });
}

export async function loader() {
  return {};
}

export default function Deployment() {
  return (
    <PageShell nav={DOCS_NAV} footer={<SiteFooter />}>
      <DocsLayout active="deployment">
      <style dangerouslySetInnerHTML={{ __html: `
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
      ` }} />
      <h1>Deployment</h1>
      <p>
        A multi-app project doesn't deploy as one unit — each app in{" "}
        <code>devora.config.ts</code> maps to its own platform project (Vercel), site (Netlify),
        or process (self-hosted/Docker). This is inherent to how those platforms work, not a
        devora.js convention: a marketing site, dashboard, and admin panel are three independently
        deployable things, each repeating the same steps below.
      </p>
      <Callout kind="info" title="What's verified for 0.3.2">
        <p>
          For 0.3.2, the Vercel and Netlify functions <code>devora build --adapter</code> generates
          were run outside the framework's monorepo (real pages, login, CSRF, a CommonJS
          dependency), <code>devora start</code> and the Docker image were run locally, and the
          maintainer has deployed 0.3.2 apps to both Vercel and Netlify. Container platforms
          (Cloud Run, App Runner, Container Apps) haven't been tested.
        </p>
      </Callout>

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
        Scaffolded projects don't include a CI workflow. Worth adding one that runs{" "}
        <code>npm ci</code>, <code>npm run typecheck</code> and{" "}
        <code>npx devora build --adapter=vercel</code> (or <code>netlify</code>) for each app: the
        adapter build runs the same preflight checks as the platform, so a missing session store
        or a misplaced <code>api/</code> folder fails in CI instead of on the platform.
      </p>

      <h2 id="session-store">2. Configure a session store (apps with login)</h2>
      <Callout kind="danger" title="A session secret alone is not enough">
        <p>
          Since @devorajs/core 0.3.0, a production server for any app with{" "}
          <code>auth: "shared"</code> or <code>"isolated"</code> refuses to start until{" "}
          <code>shared.sessions.store</code> is set in <code>devora.config.ts</code> — even with{" "}
          <code>DEVORA_SESSION_SECRET</code> set. It fails at boot, not on the first login:
        </p>
        <pre style={{ margin: "0.6rem 0 0", whiteSpace: "pre-wrap" }}>
{`Error: [devora] no session store configured. Set shared.sessions.store in devora.config.ts — a path to a module whose default export is a SessionStore backed by your database (...), or "memory" to explicitly accept in-process sessions (single long-lived server only — not serverless).`}
        </pre>
      </Callout>
      <p>
        <code>devora dev</code> never shows this error: it falls back to an in-memory store
        instead, so a project can work locally and still fail on its first deploy. Freshly
        scaffolded projects ship with the setting commented out. Pick a value based on where the
        app runs:
      </p>
      <div className="docs-table-wrap">
          <table>
          <thead><tr><th>Target</th><th><code>shared.sessions.store</code></th></tr></thead>
          <tbody>
            <tr>
              <td>Vercel, Netlify (serverless)</td>
              <td>
                A path to your own store module, backed by a database every function instance can
                reach (Postgres, Redis, …). <strong>Not <code>"memory"</code></strong>, and not a
                SQLite file on the function's own disk — each instance would have its own copy, and
                users would be logged out at random.
              </td>
            </tr>
            <tr>
              <td>Docker / VPS, one <code>devora start</code> process</td>
              <td>
                <code>"memory"</code> works, but every restart or redeploy signs everyone out. Use a
                store module to keep sessions across restarts or to run more than one instance.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="devora-card">
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
{`// devora.config.ts
shared: {
  core: "packages/core",
  backend: "packages/backend",
  auth: "shared",
  sessions: { store: "packages/backend/sessionStore.ts" }, // or "memory"
},`}
        </pre>
      </div>
      <p>
        The store is three methods (<code>get</code>/<code>set</code>/<code>delete</code>) over your
        own database — <a href="/security#sessions">Security model → Sessions</a> has a complete
        working example. It's read at build time and bundled into each app's server output (the
        Vercel and Netlify functions included), so it's committed code, not a dashboard setting;
        whatever connection string the store reads (e.g. <code>DATABASE_URL</code>) does need to
        be set in each platform's environment variables. Apps with <code>auth: "none"</code> skip
        this step entirely.
      </p>

      <h2>3. Deploying to Vercel <Tag color="gray">Vercel</Tag></h2>
      <Callout kind="warning" title="Keep API routes out of a top-level api/ folder">
        <p>
          <code>api/</code> at the root of a Vercel project is Vercel's own functions folder. With
          the Root Directory set to <code>apps/&lt;name&gt;</code>, Vercel turns every file in{" "}
          <code>apps/&lt;name&gt;/api/</code> into a separate function on top of the one Devora
          builds (and can hit the Hobby plan's function limit), or type-checks it with its own
          settings. Apps created by <code>create-devora</code>/<code>devora add</code> already use{" "}
          <code>apiDir: "endpoints"</code>. For an older app, move the folder and set{" "}
          <code>apiDir</code> in <code>app.config.ts</code>; URLs stay under <code>/api</code>. The
          preflight check warns when it finds an <code>api/</code> folder there.
        </p>
      </Callout>
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
          random value (<code>openssl rand -base64 32</code> works well). Also add whatever your
          session store module needs to reach its database — and make sure{" "}
          <code>shared.sessions.store</code> is set and committed (
          <a href="#session-store">step 2</a>); without it the function fails on every request. An
          app with <code>auth: "none"</code> needs none of this.
        </li>
        <li className="deploy-step">Deploy. Changing an env var afterward needs a redeploy to take effect.</li>
        <li className="deploy-step">Repeat as a separate Vercel project, once per app.</li>
      </ol>
      <p>What the build does on Vercel, so its log makes sense:</p>
      <ul>
        <li>
          <strong>Runtime.</strong> The function runtime isn't hardcoded (it used to be{" "}
          <code>nodejs20.x</code>, which Vercel now rejects). It's{" "}
          <code>vercel: {"{ runtime: \"nodejs22.x\" }"}</code> from <code>app.config.ts</code> if
          set, else the Node major running the build, else the newest one{" "}
          <code>engines.node</code> allows, else <code>nodejs24.x</code>. The build prints which one
          and why; an <code>engines.node</code> no supported runtime satisfies fails the build.
        </li>
        <li>
          <strong>Preflight.</strong> Before building it checks the session secret and store for
          the app's auth mode (a missing secret is an error when building on Vercel), the runtime,
          and the <code>api/</code> folder above.
        </li>
        <li>
          <strong>CommonJS dependencies</strong> such as <code>pg</code> work inside the bundled
          function (they used to fail with <code>Dynamic require of "events" is not supported</code>).
          Packages with native addons haven't been verified in the function.
        </li>
        <li>
          <strong>Proxy headers.</strong> Inside the function <code>trustProxy</code> defaults to{" "}
          <code>true</code> (only Vercel's edge can reach it), so <code>ctx.ip</code>,{" "}
          <code>ctx.url</code> and <code>secure: "auto"</code> cookies see the real client.
        </li>
        <li>
          <strong>Codegen.</strong> A clean checkout doesn't have generated files (a Prisma client,
          compiled CSS). List those commands in <code>prebuild</code> in <code>app.config.ts</code>;
          they run before every <code>devora build</code>/<code>deploy</code>.
        </li>
      </ul>
      <p>
        <strong>Root Directory = the repo root instead</strong> (if you can't move an{" "}
        <code>api/</code> folder yet): leave Root Directory empty, set the Framework Preset to
        Other and the build command to{" "}
        <code>./node_modules/.bin/devora build --app=&lt;name&gt; --adapter=vercel --out=.vercel/output</code>{" "}
        per project. The repo root itself then must not have an <code>api/</code> folder.
      </p>

      <h2>4. Deploying to Netlify <Tag color="emerald">Netlify</Tag></h2>
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
          configuring.
          <Callout kind="danger" title="Dashboard settings silently override netlify.toml">
            <p>
              Netlify's own dashboard Build settings take precedence over <code>netlify.toml</code>{" "}
              when both are set. If the site was ever auto-detected before{" "}
              <code>netlify.toml</code> existed (or a "Package directory" got set at any point),
              that stored setting silently overrides the committed file on every future build —
              confirmed directly: a site with a stray <code>Package directory</code> value produced
              a build log reading{" "}
              <code>No config file was defined: using default values</code> instead of{" "}
              <code>Config file: .../netlify.toml</code>, and the deployed function 404'd on every
              route as a result. Fix once, per site: <strong>Project configuration → Build &amp;
              deploy → Build settings → Configure</strong>, and clear{" "}
              <strong>Package directory</strong> entirely (leave it blank) — also clear Build
              command/Publish directory, or set them to match <code>netlify.toml</code> exactly, if
              either was set:
            </p>
            <pre style={{ margin: "0.6rem 0 0", whiteSpace: "pre-wrap" }}>
{`Build command:      cd ../.. && ./node_modules/.bin/devora build --app=<name> --adapter=netlify
Publish directory:   dist/client
Package directory:   (leave blank)`}
            </pre>
          </Callout>
        </li>
        <li className="deploy-step">
          Environment variables — same shared/isolated/none rule as Vercel above, under{" "}
          <strong>Environment variables</strong> in this site's own settings, including your
          session store's database connection. Same requirement too: a database-backed{" "}
          <code>shared.sessions.store</code> (<a href="#session-store">step 2</a>), never{" "}
          <code>"memory"</code> on Netlify's functions.
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
          <code>included_files</code> lists <code>routes/**</code>, the app's API folder (
          <code>endpoints/**</code> in new apps — it must match <code>apiDir</code>; the preflight
          check warns if it doesn't), <code>dist/**</code>, <code>package.json</code>, and{" "}
          <code>node_modules/**</code>) — this
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

      <h2>5. Docker <Tag color="blue">Docker</Tag></h2>
      <p>
        Scaffolded projects don't include a Dockerfile; the framework repo has a working one
        (<a href="https://github.com/hassanalsa3aka/devora.js/blob/main/Dockerfile">Dockerfile</a>,{" "}
        <a href="https://github.com/hassanalsa3aka/devora.js/blob/main/docker-compose.yml">docker-compose.yml</a>)
        to copy and adapt — it runs <code>devora start --app=$APP_NAME</code> and listens on{" "}
        <code>PORT</code> (4173 unless you set it). Each app builds and runs as its own container
        image, one app per image via a build arg:
      </p>
      <div className="devora-card">
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
{`docker build --build-arg APP_NAME=marketing -t devora-marketing .
docker run -p 4173:4173 devora-marketing

# shared/isolated apps need their session secret passed in, AND
# shared.sessions.store set in devora.config.ts before the image is built
docker run -p 4173:4173 -e DEVORA_SESSION_SECRET=... devora-dashboard

# all apps together, via docker compose
cp .env.example .env
docker compose up --build`}
        </pre>
      </div>
      <p>
        Under the hood this runs the same self-hosted Node adapter described below — Docker isn't
        a separate deployment target with its own adapter, just a way to package and run it. The
        session store is baked in at build time (<a href="#session-store">step 2</a>):{" "}
        <code>"memory"</code> is acceptable for a single container, but every container restart
        signs everyone out, and two replicas won't see each other's sessions.
      </p>

      <h2 id="containers">Container platforms <Tag color="gray">untested</Tag></h2>
      <p>
        Cloud Run, AWS App Runner/Fargate and Azure Container Apps run the same image. None of them
        has been tested; this is what the framework needs from them:
      </p>
      <ul>
        <li>
          <strong>Port.</strong> The platform sets or lets you choose <code>PORT</code>;{" "}
          <code>devora start</code> reads it. Leave <code>HOST</code> unset so the platform's
          router can reach the process.
        </li>
        <li>
          <strong>HTTPS at the load balancer.</strong> TLS ends in front of the container. Session
          cookies are <code>Secure</code> by default, which is right for an HTTPS public URL; set{" "}
          <code>trustProxy: true</code> in <code>app.config.ts</code> so <code>ctx.url</code>,{" "}
          <code>ctx.ip</code> and <code>secure: "auto"</code> see the real scheme and client.
        </li>
        <li>
          <strong>A shared session store.</strong> Several instances, replaced at will:{" "}
          <code>"memory"</code> doesn't work. Point <code>shared.sessions.store</code> at your
          database or Redis.
        </li>
        <li>
          <strong>Secrets</strong> in the platform's secret settings, not in the image.
        </li>
        <li>
          <strong><code>isr</code></strong> caches on each instance's own disk.
        </li>
      </ul>
      <p>An Oracle Cloud VM, or any VM, is the VPS setup below.</p>

      <h2>6. Self-hosted VPS <Tag color="purple">VPS</Tag></h2>
      <p>
        For a bare server, build each app you want to run, start them, then generate a reverse
        proxy config from the domains already declared in <code>devora.config.ts</code> — no
        hand-written nginx/Caddy config needed:
      </p>
      <div className="devora-card">
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
{`npm run build                              # builds every app (or: npm run build -- --app=dashboard)
npm run start                              # serves all built apps, sequential ports from 4173
npx devora generate:proxy --target=nginx   # or --target=caddy
# install the generated config for your distro, then reload nginx/caddy`}
        </pre>
      </div>
      <p>
        Run these from the project root after <code>npm install</code> — the <code>devora</code>{" "}
        binary lives in the project's <code>node_modules</code>, not on your <code>PATH</code>.{" "}
        <code>generate:proxy</code> has no npm script, so it goes through <code>npx</code>, which
        is only safe inside the project (see{" "}
        <a href="/getting-started">Getting started</a>). As with Docker, any app with login needs{" "}
        <code>shared.sessions.store</code> set before building (<a href="#session-store">step
        2</a>) — <code>npm run start</code> exits with the error above otherwise.
      </p>
      <p>
        Bind each app to loopback so only the proxy reaches it:{" "}
        <code>HOST=127.0.0.1 npm run start</code> (<code>PORT</code> sets the first app's port).
        Session cookies are <code>Secure</code> by default in production, so{" "}
        <strong>logins over plain HTTP won't stick</strong> until the proxy serves HTTPS — the
        server logs a warning when it sends a <code>Secure</code> cookie over what looks like plain
        HTTP. For a mixed setup set <code>shared.sessions.cookie.secure: "auto"</code> in{" "}
        <code>devora.config.ts</code> and <code>trustProxy: true</code> in each app (the generated
        configs send <code>X-Forwarded-Proto</code>); <code>false</code> is for a deliberately
        plain-HTTP deployment. See <a href="/security">Security</a>.
      </p>
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
