import { BlogPost, postMeta } from "../../blog-post.js";

export const renderMode = "ssg";
const SLUG = "devora-0-3-2";

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
        0.3.2 came out of two products being built on 0.3.1 —{" "}
        <a href="https://yalla-do-app.vercel.app">YallaDo</a> and{" "}
        <a href="https://khepra.vercel.app">Khepra</a> — and the list of things they had to work
        around. It's a big release for a patch number: <code>@devorajs/core</code> and{" "}
        <code>@devorajs/cli</code> 0.3.2, the adapters 0.2.3, <code>@devorajs/adapter-node</code>{" "}
        published for the first time (0.2.1), and <code>create-devora</code> 0.3.1. Upgrade core
        and the CLI together.
      </p>

      <h2>Pages can read the request and answer forms properly</h2>
      <p>
        Loaders and actions now get <code>ctx.url</code> (query string included),{" "}
        <code>ctx.headers</code> and <code>ctx.ip</code>. An action can return data for the page,
        or <code>fail()</code> with a status, instead of only redirecting:
      </p>
      <div className="devora-card">
        <pre style={{ margin: 0 }}>
{`export async function action(formData: FormData, ctx: RequestContext) {
  ctx${""}.verifyCsrf(formData);
  const text = String(formData.get("text") ?? "").trim();
  if (!text) return fail(400, { error: "Write something first." }); // re-render, status 400
  await addNote({ text }, ctx);
  return redirect("/notes");                                       // 303 See Other
}`}
        </pre>
      </div>
      <p>
        That's from the <a href="/examples">multi-app example</a>, where CI posts an empty note
        and checks for the 400. Thrown errors keep their status too — <code>requireAuth()</code>{" "}
        is a 401, <code>verifyCsrf()</code> a 403 — and render the app's <code>error.tsx</code>.
        Multipart uploads arrive as <code>File</code> objects, and there's a{" "}
        <code>&lt;head&gt;</code> API for stylesheets, fonts and meta tags. All of it is on{" "}
        <a href="/pages-forms-errors">Pages, forms and errors</a>.
      </p>

      <h2>Deploying stopped being the hard part</h2>
      <ul>
        <li>
          The Vercel function runtime was hardcoded to <code>nodejs20.x</code>, which Vercel now
          rejects. It's picked from your Node version and <code>engines</code> now, and printed.
        </li>
        <li>
          CommonJS dependencies like <code>pg</code> crashed the bundled function on its first
          request. They work now.
        </li>
        <li>
          A top-level <code>api/</code> folder collides with Vercel's own functions folder. New
          apps keep API routes in <code>endpoints/</code> (<code>apiDir</code>); URLs stay under{" "}
          <code>/api</code>.
        </li>
        <li>
          <code>devora build --adapter</code> runs preflight checks first (session secret and
          store, runtime, that folder), so a deploy that can't work fails in seconds.
        </li>
      </ul>

      <h2>Sessions behind proxies and across subdomains</h2>
      <p>
        Cookie <code>secure</code> (<code>true</code>, <code>"auto"</code>, <code>false</code>),{" "}
        <code>sameSite</code> and <code>domain</code> are configurable, with{" "}
        <code>trustProxy</code> for apps behind nginx, Caddy or a load balancer. A login served
        over plain HTTP used to fail silently because the cookie was always <code>Secure</code>;
        now the server warns. Bearer-only APIs can turn the CSRF cookie off with{" "}
        <code>csrf: false</code>, and API routes get CORS:
      </p>
      <div className="devora-card">
        <pre style={{ margin: 0 }}>
{`// apps/api/app.config.ts — from the api-bearer example
export default defineApp({
  backendOnly: true,
  apiDir: "endpoints",
  csrf: false,
  cors: { origins: ["http://localhost:5173"], allowHeaders: ["content-type", "authorization"] },
});`}
        </pre>
      </div>

      <h2>What an existing app has to do</h2>
      <p>Most of the release is new options. These can change how an existing app behaves:</p>
      <ul>
        <li>Redirects after a POST are 303 (were 302). Update tests that expect 302.</li>
        <li>Page errors keep their status instead of becoming 500s.</li>
        <li>
          The framework stylesheet is only added to pages that render <code>PageShell</code>. A page
          that relied on it without the shell needs <code>head: {"{ theme: true }"}</code>.
        </li>
        <li>
          <code>.env</code> files in the project root are loaded automatically, and{" "}
          <code>devora start</code> reads <code>PORT</code> and <code>HOST</code>.
        </li>
        <li>Request bodies are capped at 10 MB by default (<code>maxBodyBytes</code>).</li>
      </ul>
      <p>
        The full list, each with what to do, is on <a href="/upgrading">Upgrading to 0.3.2</a>.
        The terminal got a new look too: <code>devora dev</code> prints every app's URLs first,
        then its routes, and <code>--quiet</code> keeps only the URLs.
      </p>
    </BlogPost>
  );
}
