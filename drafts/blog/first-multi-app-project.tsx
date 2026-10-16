import { BlogPost, Code, Note, postMeta } from "../../blog-post.js";

export const renderMode = "ssg";
const SLUG = "first-multi-app-project";

export function meta() {
  return postMeta(SLUG);
}

export async function loader() {
  return {};
}

export default function Post() {
  return (
    <BlogPost slug={SLUG}>
      <p>
        This is the shortest honest path through Devora.js's main idea: one project, several apps, one backend and
        one login. You scaffold a project, run it, build it and serve the build, then add a second app and call the
        same function from both. It is the repository's 15-minute tester guide (<code>TESTING.md</code>) written
        out, and every command and file below was run on a fresh project from the published packages
        (<code>@devorajs/core</code> and <code>@devorajs/cli</code> 0.3.5) on macOS with Node 24 and npm 11. I have
        not timed a first-time reader; the "15 minutes" is the guide's estimate.
      </p>

      <h2>1. Create the project</h2>
      <Code label="Scaffold">{`npm create devora@latest first-app
cd first-app`}</Code>
      <p>
        Choose the full-stack scope if it asks. You get three apps (<code>marketing</code>, <code>dashboard</code>,{" "}
        <code>admin</code>) and one shared backend in <code>packages/backend</code>, and dependencies are installed.
        New projects pin <code>^0.3.5</code> for both packages.
      </p>
      <Note title="Two npm warnings you may see">
        <p>
          A fresh project can print <code>npm warn Unknown project config "link-workspace-packages"</code> on every
          npm command: the scaffold writes a <code>.npmrc</code> with a pnpm-only setting, and npm 11 does not know
          it. On a recent npm, install can also warn that esbuild's postinstall script is not covered by{" "}
          <code>allowScripts</code>. Neither stops install, <code>dev</code> or <code>build</code>. Both are open
          findings on the <a href="/roadmap">roadmap</a>.
        </p>
      </Note>

      <h2>2. Run it</h2>
      <Code label="Dev server">{`npm run dev`}</Code>
      <p>
        You should see the version in the header and each app's URL and routes. Dev ports start at 10000 and move up
        when one is taken, so read the URLs it prints:
      </p>
      <Code label="Dev server output, abridged">{`devora.js 0.3.5  dev · 3 apps · ready in 118 ms

  marketing  auth: shared · marketing.example.com
    Local:    http://localhost:10000/
  dashboard  auth: shared · dashboard.example.com
    Local:    http://localhost:10001/
  admin      auth: shared · admin.example.com
    Local:    http://localhost:10002/`}</Code>
      <p>
        Open any of them and try <code>/login</code>: any username works, because the login is a demo with no
        password check. Stop the server with Ctrl+C.
      </p>

      <h2>3. Build, and serve the build</h2>
      <Code label="Build">{`npm run build`}</Code>
      <p>The last line is <code>built 3 apps in …</code> with no errors. Now start the production server:</p>
      <Code label="Start without a session store">{`npm start`}</Code>
      <p>
        It refuses to start, with one line and exit status 1, until you say where login sessions are stored. That
        is deliberate, not a crash:
      </p>
      <Code label="The message">{`[devora] no session store configured: add sessions: { store: "memory" } under shared in
devora.config.ts (one long-running server only; for serverless or several instances use a path
to a module that default-exports a SessionStore backed by your database), and set
DEVORA_SESSION_SECRET (openssl rand -base64 32). See packages/backend/AUTH.md`}</Code>
      <p>
        Open <code>devora.config.ts</code> and add one line inside <code>shared</code>. <code>"memory"</code> keeps
        sessions in the server's memory, so it suits one long-running server on your machine, not serverless or
        several instances:
      </p>
      <Code label="devora.config.ts, inside shared">{`sessions: { store: "memory" },`}</Code>
      <p>Rebuild (the store choice is part of the build), set a secret, and start:</p>
      <Code label="Build and start with a secret">{`npm run build
export DEVORA_SESSION_SECRET="$(openssl rand -base64 32)"
npm start`}</Code>
      <Code label="Expected output">{`[adapter-node] "marketing" → http://localhost:4173 ...
[adapter-node] "dashboard" → http://localhost:4174 ...
[adapter-node] "admin" → http://localhost:4175 ...`}</Code>
      <p>
        <code>curl -i localhost:4173/</code> answers <code>200</code>, and the response carries{" "}
        <code>Content-Security-Policy: default-src 'self'; style-src 'self' 'unsafe-inline'; object-src 'none'; base-uri 'self'</code>{" "}
        and <code>X-Frame-Options: DENY</code>: those security headers are on by default.
      </p>

      <h2>4. Add a second app and share a function</h2>
      <Code label="Add an app">{`npx devora add reports --auth shared
npm install`}</Code>
      <p>
        That prints <code>registered "reports" in devora.config.ts</code> and <code>created apps/reports</code>. Now
        write a function once in the shared backend. <code>packages/backend/greeting.ts</code>:
      </p>
      <Code label="packages/backend/greeting.ts">{`import { serverFn } from "@devorajs/core";

export const greet = serverFn(async (input: { name: string }) => \`Hello, \${input.name}!\`);`}</Code>
      <p>
        Expose it by adding <code>"./greeting": "./greeting.ts"</code> to <code>exports</code> in{" "}
        <code>packages/backend/package.json</code>. Then create the same page in two apps,{" "}
        <code>apps/marketing/routes/hello.tsx</code> and <code>apps/reports/routes/hello.tsx</code>, changing the
        name in each (this is the version that passes <code>npm run typecheck</code>):
      </p>
      <Code label="apps/marketing/routes/hello.tsx">{`import type { RequestContext } from "@devorajs/core";
import { PageShell } from "@devorajs/core";
import { greet } from "@devorajs/backend/greeting";

export const renderMode = "ssr";

export async function loader(ctx: RequestContext) {
  return { message: await greet({ name: "marketing" }, ctx) };
}

export default function Hello({ data }: { data?: { message: string } }) {
  return (
    <PageShell appName="marketing">
      <h1>{data?.message}</h1>
    </PageShell>
  );
}`}</Code>
      <p>
        Run <code>npm run dev</code> again and open <code>/hello</code> on both apps. Each prints its own greeting,
        from the one function in <code>packages/backend</code>: <code>Hello, marketing!</code> on the marketing app
        and <code>Hello, reports!</code> on the reports app.
      </p>

      <h2>5. One login across the apps</h2>
      <p>
        The apps are <code>auth: "shared"</code>, so one session works in all of them. With the production servers
        running (build again first, since you added an app), log in on the dashboard and use the cookie on the
        others:
      </p>
      <Code label="Shared login, with curl">{`J=/tmp/jar; T=$(curl -s -c $J localhost:4174/login | grep -o 'name="_csrf" value="[^"]*' | sed 's/.*value="//')
curl -s -b $J -c $J -o /dev/null -w "login %{http_code}\\n" -d "_csrf=$T&username=ann" localhost:4174/login
for p in 4173 4174 4175; do curl -s -b $J -o /dev/null -w "account :$p %{http_code}\\n" localhost:$p/account; done
curl -s -o /dev/null -w "no cookie %{http_code}\\n" localhost:4173/account`}</Code>
      <Code label="What it printed">{`login 303
account :4173 200
account :4174 200
account :4175 200
no cookie 401`}</Code>
      <p>
        The form's CSRF token is required: the same login without it is a 403. On localhost the three ports share
        one cookie; on real domains, sharing a login across subdomains needs{" "}
        <code>shared.sessions.cookie.domain</code> (see <a href="/security">Security model</a>).
      </p>

      <Note title="What was not verified">
        <ul>
          <li>This was run locally. Nothing here was deployed to Vercel or Netlify; <a href="/deployment">Deployment</a> says what has and has not been checked there.</li>
          <li><code>"memory"</code> sessions are for one long-running server; a database-backed store is needed to deploy beyond that.</li>
          <li>The earlier 15-minute guide's step-4 snippet did not pass <code>npm run typecheck</code> (untyped <code>ctx</code> and <code>data</code>); the typed version above does.</li>
        </ul>
      </Note>

      <h2>Where to go next</h2>
      <p>
        <a href="/multi-app-tutorial">Build a multi-app project</a> goes further (the API app, the shared database
        client), <a href="/render-modes">Render modes</a> explains the choice per route, and{" "}
        <a href="/deployment">Deployment</a> covers one Vercel or Netlify project per app.
      </p>
    </BlogPost>
  );
}
