import { BlogPost, postMeta } from "../../blog-post.js";

export const renderMode = "ssg";
const SLUG = "deploying-multi-app-to-vercel";

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
        A Devora.js project with three apps is three Vercel projects that import the same
        repository. That's not a Devora.js convention; it's how Vercel projects work — one build
        and one set of domains each. The framework's own example apps run this way (
        <a href="/examples#live-demos">live demos</a>, deployed by the maintainer).
      </p>

      <h2>The settings, per app</h2>
      <ol>
        <li>
          <strong>Add New → Project</strong>, import the repo, and set{" "}
          <strong>Root Directory</strong> to <code>apps/&lt;name&gt;</code>.
        </li>
        <li>
          Leave the build settings alone. Every app has a committed <code>vercel.json</code>:
          <div className="devora-card">
            <pre style={{ margin: 0 }}>
{`{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "cd ../.. && ./node_modules/.bin/devora build --app=app --adapter=vercel",
  "framework": null
}`}
            </pre>
          </div>
          <code>"framework": null</code> stops Vercel from running a plain <code>vite build</code>,
          and the command goes to the repo root, where <code>devora.config.ts</code> and the shared
          packages are. Keep "Include files outside the Root Directory" on.
        </li>
        <li>
          Environment variables: <code>DEVORA_SESSION_SECRET</code> for apps with{" "}
          <code>auth: "shared"</code> (the same value in every shared app),{" "}
          <code>DEVORA_SESSION_SECRET_&lt;APP&gt;</code> for an <code>isolated</code> one, nothing
          for <code>auth: "none"</code>. Redeploy after changing them.
        </li>
      </ol>

      <h2>Two things that break on serverless</h2>
      <p>
        <strong>The session store.</strong> A Vercel function runs as many short-lived instances.{" "}
        <code>sessions: {"{ store: \"memory\" }"}</code> gives each its own empty store, so logins
        don't stick. Point <code>shared.sessions.store</code> at a module backed by your database
        or Redis. The build tells you:
      </p>
      <div className="devora-card">
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
{`$ ./node_modules/.bin/devora build --app=app --adapter=vercel
[devora] "app" Vercel runtime: nodejs24.x (from the running Node 24 (satisfies engines.node ">=20"))
[devora] "app" preflight warning: shared.sessions.store is "memory" — on serverless each function
instance has its own empty store, so logins won't stick. Use a DB-backed store before relying on
sessions in production.`}
        </pre>
      </div>
      <p>
        <strong>A top-level <code>api/</code> folder.</strong> In a Vercel project,{" "}
        <code>api/</code> is Vercel's own functions folder: every file in{" "}
        <code>apps/&lt;name&gt;/api/</code> becomes a separate function next to the one Devora
        builds (and counts against the Hobby plan's limit). Apps created since 0.3.2 use{" "}
        <code>endpoints/</code> (<code>apiDir</code> in <code>app.config.ts</code>); URLs stay
        under <code>/api</code>. The preflight check warns when it finds an <code>api/</code>{" "}
        folder.
      </p>

      <h2>The alternative: Root Directory = the repo root</h2>
      <p>
        If you can't move an <code>api/</code> folder yet, leave Root Directory empty and write
        the build output where Vercel looks for it, per project:
      </p>
      <div className="devora-card">
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
{`./node_modules/.bin/devora build --app=app --adapter=vercel --out=.vercel/output`}
        </pre>
      </div>
      <p>
        Set that as the build command in each project's dashboard (one repo-root{" "}
        <code>vercel.json</code> can't hold several commands), with Framework Preset "Other".
      </p>

      <h2>One login across the apps</h2>
      <p>
        On separate subdomains, browsers keep a separate cookie per host. To share one login
        between <code>app.example.com</code> and <code>admin.example.com</code>, set{" "}
        <code>shared.sessions.cookie.domain: "example.com"</code>; the build checks every shared
        app is under it. Bearer tokens aren't affected.
      </p>
      <p>
        The full guide, including Netlify, Docker and a plain VPS, is on{" "}
        <a href="/deployment">Deployment</a>.
      </p>
    </BlogPost>
  );
}
