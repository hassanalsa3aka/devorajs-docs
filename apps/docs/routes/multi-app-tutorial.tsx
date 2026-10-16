import { PageShell } from "@devorajs/core";
import { DOCS_NAV } from "../nav.js";
import { SiteFooter } from "../site-footer.js";
import { DocsLayout, Callout } from "../docs-layout.js";
import { pageMeta } from "../seo.js";

export const renderMode = "ssg";

export function meta() {
  return pageMeta("/multi-app-tutorial", {
    title: "Build a multi-app project",
    description:
      "A tested walk-through: a marketing site, a logged-in dashboard and a JSON API in one Devora.js project, sharing one backend and one login.",
  });
}

export async function loader() {
  return {};
}

function Code({ children }: { children: string }) {
  return (
    <div className="devora-card">
      <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{children}</pre>
    </div>
  );
}

export default function MultiAppTutorial() {
  return (
    <PageShell nav={DOCS_NAV} footer={<SiteFooter />}>
      <DocsLayout active="multi-app-tutorial">
      <h1>Build a multi-app project</h1>
      <p>
        Three apps in one project: a public site with no login, a dashboard people log in to, and
        a JSON API for a mobile client. Both the dashboard and the API read and write the same
        notes through one shared backend function, and one login works in both. Every command and
        file below was run as written on a fresh project with the published{" "}
        <code>@devorajs/core</code> and <code>@devorajs/cli</code> (the version it was last run on was 0.3.2, with Node 24, npm and macOS; it has not been re-run for 0.3.5),
        in <code>devora dev</code> and in a production build.
      </p>

      <h2 id="create">1. Create the project</h2>
      <Code>{`npm create devora@latest acme -- --scope=fullstack --apps=site,app --auth=site:none,app:shared --pm=npm
cd acme`}</Code>
      <p>
        That gives two apps: <code>site</code> (<code>auth: "none"</code> — no sessions, no secret
        needed) and <code>app</code> (<code>auth: "shared"</code>, with <code>login</code> and{" "}
        <code>logout</code> routes already there), plus the shared backend in{" "}
        <code>packages/backend</code>. Now add the API as a third, backend-only app on the same
        shared login:
      </p>
      <Code>{`npx devora add api --kind=api --auth=shared
npm install`}</Code>
      <p>
        <code>apps/api</code> has no pages and no React — only <code>endpoints/</code> (served
        under <code>/api</code>): <code>health.ts</code>, <code>session.ts</code> (Bearer login
        and logout) and <code>me.ts</code>.
      </p>

      <h2 id="backend">2. One function both apps call</h2>
      <p>
        Logic more than one app needs goes in <code>packages/backend</code>. A JSON file stands in
        for the database here, because each app loads backend modules separately — a plain
        variable would give the dashboard and the API two different lists.
      </p>
      <Code>{`// packages/backend/notes.ts
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { serverFn } from "@devorajs/core";

export interface Note {
  author: string;
  text: string;
}

// A JSON file in the project root stands in for your database. Each app
// loads this module separately (a variable here would NOT be shared between
// apps), but they all read and write the same file. Use a real database
// before deploying: serverless platforms can't write to their filesystem.
const FILE = join(process.cwd(), "notes.json");

function readAll(): Note[] {
  return existsSync(FILE) ? JSON.parse(readFileSync(FILE, "utf-8")) : [];
}

export const listNotes = serverFn(async () => readAll());

export const addNote = serverFn(async (input: { text: string }, ctx) => {
  ctx${""}.requireAuth();
  const author = (ctx.session as { username: string }).username;
  const note = { author, text: input.text };
  writeFileSync(FILE, JSON.stringify([...readAll(), note], null, 2));
  return note;
});`}</Code>
      <p>
        Make it importable as <code>@devorajs/backend/notes</code> by adding it to{" "}
        <code>exports</code> in <code>packages/backend/package.json</code>:
      </p>
      <Code>{`"exports": {
  "./db": "./db/index.ts",
  "./notes": "./notes.ts"
}`}</Code>

      <h2 id="dashboard">3. The dashboard page</h2>
      <p>
        A logged-out visitor is sent to <code>/login</code>; an empty note re-renders the form
        with a 400 and a message; a saved note redirects back (303, so a refresh doesn't post it
        twice).
      </p>
      <Code>{`// apps/app/routes/notes.tsx
import { CsrfField, PageShell, fail, redirect, type RequestContext, type RouteComponentProps } from "@devorajs/core";
import { addNote, listNotes, type Note } from "@devorajs/backend/notes";

export const renderMode = "ssr";

export function meta() {
  return { title: "Notes" };
}

export async function loader(ctx: RequestContext) {
  if (!ctx.session) throw redirect("/login");
  return { notes: await listNotes(undefined, ctx) };
}

export async function action(formData: FormData, ctx: RequestContext) {
  ctx${""}.verifyCsrf(formData);
  const text = String(formData.get("text") ?? "").trim();
  if (!text) return fail(400, { error: "Write something first." });
  await addNote({ text }, ctx);
  return redirect("/notes");
}

export default function Notes({ data, csrfToken, actionData }: RouteComponentProps<{ notes: Note[] }, { error?: string }>) {
  return (
    <PageShell appName="app">
      <h1>Notes</h1>
      <ul>
        {data?.notes.map((n, i) => (
          <li key={i}>
            <strong>{n.author}</strong>: {n.text}
          </li>
        ))}
      </ul>
      <form method="post">
        <CsrfField token={csrfToken} />
        {actionData?.error ? <p role="alert">{actionData.error}</p> : null}
        <label htmlFor="text">New note</label>
        <input id="text" name="text" />
        <button type="submit">Add</button>
      </form>
    </PageShell>
  );
}`}</Code>

      <h2 id="api">4. The same notes over JSON</h2>
      <Code>{`// apps/api/endpoints/notes.ts
import { apiRoute, HttpError } from "@devorajs/core";
import { addNote, listNotes } from "@devorajs/backend/notes";

// GET  /api/notes                       -> every note
// POST /api/notes  { "text": "..." }    -> adds one (Authorization: Bearer <token>)
export const methods = ["GET", "POST"];

export const handler = apiRoute(async (req, ctx) => {
  if (req.method === "GET") {
    return json(200, { notes: await listNotes(undefined, ctx) });
  }
  let text: unknown;
  try {
    text = JSON.parse(req.body.toString("utf-8") || "{}").text;
  } catch {
    throw new HttpError(400, "Request body must be valid JSON");
  }
  if (typeof text !== "string" || !text.trim()) throw new HttpError(400, "text required");
  return json(201, { note: await addNote({ text: text.trim() }, ctx) });
});

function json(status: number, body: unknown) {
  return { status, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) };
}`}</Code>
      <p>
        <code>addNote</code>'s <code>requireAuth()</code> turns a request without a valid session
        into a JSON 401; a wrong method gets a 405 because of <code>methods</code>.
      </p>

      <h2 id="site">5. Link the public site to the dashboard</h2>
      <p>In <code>apps/site/routes/index.tsx</code>, replace the heading:</p>
      <Code>{`<h1>Acme</h1>
<p className="devora-lead">
  Notes for your team. <a href="http://localhost:10001/notes">Open the app</a>.
</p>`}</Code>
      <p>
        In production that link points at the app's own domain — each app is deployed and served
        separately, so moving between them is a full page load.
      </p>

      <h2 id="run">6. Run it</h2>
      <Code>{`npm run dev`}</Code>
      <p>
        The site is on <code>http://localhost:10000</code>, the dashboard on <code>10001</code>,
        the API on <code>10002</code>, and the boot output lists every route. Open{" "}
        <code>http://localhost:10001/notes</code>: you're sent to the login page (the demo login
        accepts any name), then can add notes. From another terminal, log in to the API and add a
        note as a mobile client would:
      </p>
      <Code>{`TOKEN=$(curl -s -X POST -H 'content-type: application/json' \\
  -d '{"username":"bob"}' http://localhost:10002/api/session | node -pe 'JSON.parse(require("fs").readFileSync(0)).token')

curl -s -X POST -H "Authorization: Bearer $TOKEN" -H 'content-type: application/json' \\
  -d '{"text":"Hello from the API"}' http://localhost:10002/api/notes
# {"note":{"author":"bob","text":"Hello from the API"}}

curl -s http://localhost:10002/api/notes
# {"notes":[{"author":"alice","text":"Hello from the app"},{"author":"bob","text":"Hello from the API"}]}`}</Code>
      <p>
        Reload the dashboard and bob's note is there. <strong>One login:</strong> the token the API
        issued is a session in the same shared scope, so the dashboard accepts it too —{" "}
        <code>curl -H "Authorization: Bearer $TOKEN" http://localhost:10001/notes</code> returns the
        page (200) instead of a redirect to <code>/login</code>. A browser that logged in on the
        dashboard and a phone holding a token are two sessions of the same kind; revoking either (
        <code>DELETE /api/session</code>, or <code>/logout</code>) ends it in every app.
      </p>
      <Callout kind="info" title="Browsers and several domains">
        <p>
          In dev every app is on <code>localhost</code>, so the browser sends one session cookie to
          all of them. On separate subdomains in production, set{" "}
          <code>shared.sessions.cookie.domain</code> to your domain so the cookie reaches every app
          (see <a href="/security#cookies">Security model</a>). Bearer tokens aren't affected.
        </p>
      </Callout>

      <h2 id="production">7. Try the production build locally</h2>
      <p>
        A production server refuses to start without a session store. For one local process,
        replace the commented <code>// sessions: {"{ store: ... }"}</code> line in{" "}
        <code>devora.config.ts</code> with:
      </p>
      <Code>{`    sessions: { store: "memory" },`}</Code>
      <p>then build and start all three apps:</p>
      <Code>{`npm run build
DEVORA_SESSION_SECRET=$(openssl rand -base64 32) npm start`}</Code>
      <p>
        <code>npm start</code> serves the apps on <code>4173</code>, <code>4174</code> and{" "}
        <code>4175</code>, in <code>devora.config.ts</code> order. The same steps work there:
        login on <code>4174/login</code>, the token from <code>4175/api/session</code> accepted by
        the dashboard.
      </p>

      <h2 id="deploy">8. Before deploying</h2>
      <ul>
        <li>
          Replace <code>notes.json</code> with your database, and <code>"memory"</code> with a{" "}
          session store backed by it (<a href="/security#sessions">Security model → Sessions</a>).
          Serverless functions can't write files, and each instance would have its own memory.
        </li>
        <li>
          Each app is its own Vercel project or Netlify site, with that app's folder as the root;
          the committed <code>vercel.json</code>/<code>netlify.toml</code> already build it. See{" "}
          <a href="/deployment">Deployment</a>.
        </li>
        <li>
          <code>site</code> needs no secret. <code>app</code> and <code>api</code> both need the
          same <code>DEVORA_SESSION_SECRET</code>, since they share one session scope.
        </li>
        <li>
          Point the site's link at the dashboard's real domain, and set the real domains in{" "}
          <code>devora.config.ts</code>.
        </li>
      </ul>
      <p>
        Next: <a href="/pages-forms-errors">Pages, forms and errors</a> for everything a route can
        do, and <a href="/backend">Backend</a> for API routes, CORS and middleware.
      </p>
      </DocsLayout>
    </PageShell>
  );
}
