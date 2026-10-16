import { PageShell } from "@devorajs/core";
import { DOCS_NAV } from "../nav.js";
import { SiteFooter } from "../site-footer.js";
import { DocsLayout, Callout, Tag } from "../docs-layout.js";
import { pageMeta } from "../seo.js";

export const renderMode = "ssg";

export function meta() {
  return pageMeta("/pages-forms-errors", {
    title: "Pages, forms and errors",
    description:
      "What a Devora.js page route can do: read the request, return data or errors from a form action, accept uploads, show an error page, and add <head> tags and CSS.",
  });
}

export async function loader() {
  return {};
}

export default function PagesFormsErrors() {
  return (
    <PageShell nav={DOCS_NAV} footer={<SiteFooter />}>
      <DocsLayout active="pages-forms-errors">
      <h1>Pages, forms and errors</h1>
      <p>
        What a file under <code>apps/&lt;name&gt;/routes/</code> can do, as of{" "}
        <code>@devorajs/core</code> 0.3.2. Sessions and cookies are on{" "}
        <a href="/security">Security model</a>; API routes on <a href="/backend">Backend</a>.
      </p>

      <h2 id="request">The request: <code>ctx.url</code>, <code>ctx.headers</code>, <code>ctx.ip</code></h2>
      <p>
        <code>loader(ctx)</code> and <code>action(formData, ctx)</code> get the request <Tag color="blue">0.3.2</Tag>:
      </p>
      <div className="devora-card">
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
{`import type { RequestContext } from "@devorajs/core";

export function loader(ctx: RequestContext) {
  const q = ctx.url.searchParams.get("q") ?? "";      // query string
  const lang = ctx.headers.get("accept-language");    // a standard Headers
  return { q, lang, ip: ctx.ip, method: ctx.method };
}`}
        </pre>
      </div>
      <ul>
        <li>
          <code>ctx.url</code> is a <code>URL</code> of the request as the client sent it. Scheme
          and host come from the request, and from <code>X-Forwarded-Proto</code>/
          <code>-Host</code> when the app sets <code>trustProxy</code> in{" "}
          <code>app.config.ts</code>. Like any Host-derived URL, check the host against your own
          domain before using it in links you email out.
        </li>
        <li>
          <code>ctx.ip</code> is the socket's peer address. With <code>trustProxy: true</code> it's
          the address your proxy saw, read from the right of <code>X-Forwarded-For</code>;{" "}
          <code>trustProxy: 2</code> trusts two proxies (a CDN in front of nginx). On
          Vercel/Netlify it's the platform's client IP.
        </li>
        <li><code>ctx.request</code> is a standard <code>Request</code> (no body) for libraries that want one.</li>
        <li>
          At build time (<code>ssg</code>/<code>isr</code>), <code>ctx.url</code> is the page's own
          URL on the app's domain, <code>headers</code> is empty and <code>ip</code> is undefined.
        </li>
      </ul>
      <p>To type <code>ctx.session</code> once instead of casting in every route:</p>
      <div className="devora-card">
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
{`// apps/<name>/session.d.ts (any .d.ts the app's tsconfig includes)
import "@devorajs/core";
declare module "@devorajs/core" {
  interface Register {
    session: { userId: string; role: "admin" | "user" };
  }
}`}
        </pre>
      </div>

      <h2 id="forms">Forms: what an action can return</h2>
      <div className="devora-card">
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
{`import { CsrfField, fail, redirect, type RequestContext, type RouteComponentProps } from "@devorajs/core";

export async function action(formData: FormData, ctx: RequestContext) {
  ctx${""}.verifyCsrf(formData);
  const code = String(formData.get("code") ?? "");
  if (!(await isValid(code))) return fail(400, { error: "Wrong code", code });
  return redirect("/welcome"); // 303 See Other
}

export default function Verify({ csrfToken, actionData }: RouteComponentProps<unknown, { error?: string }>) {
  return (
    <form method="post">
      <CsrfField token={csrfToken} />
      {actionData?.error ? <p role="alert">{actionData.error}</p> : null}
      <label htmlFor="code">Code</label>
      <input id="code" name="code" />
      <button type="submit">Verify</button>
    </form>
  );
}`}
        </pre>
      </div>
      <div className="docs-table-wrap">
        <table>
          <thead><tr><th>Return</th><th>Response</th></tr></thead>
          <tbody>
            <tr>
              <td><code>redirect(to)</code></td>
              <td>303 after a POST (so a refresh doesn't resubmit), 302 from a loader; <code>redirect(to, 301 | 302 | 307 | 308)</code> to choose</td>
            </tr>
            <tr>
              <td><code>fail(status, data)</code></td>
              <td>The page re-rendered with that 4xx/5xx status; <code>data</code> is the <code>actionData</code> prop</td>
            </tr>
            <tr><td>anything else</td><td>The page re-rendered (200) with it as <code>actionData</code></td></tr>
          </tbody>
        </table>
      </div>
      <p>
        A loader can also <code>return redirect(...)</code> or <code>throw redirect(...)</code>{" "}
        (for example, "not logged in → <code>/login</code>").
      </p>

      <h3 id="uploads">Uploads</h3>
      <p>
        <code>&lt;form method="post" encType="multipart/form-data"&gt;</code> works with no setup:
        file fields arrive in <code>formData</code> as <code>File</code> objects (
        <code>file.name</code>, <code>file.size</code>, <code>await file.arrayBuffer()</code>). The
        body limit for forms and API routes is <code>maxBodyBytes</code> in{" "}
        <code>app.config.ts</code> (default 10 MB); a larger body gets a 413 the browser actually
        receives. Malformed multipart is a 400. On serverless platforms the platform's own body
        limit is lower (Vercel's is 4.5 MB), so large files belong in direct-to-storage uploads (
        <a href="/backend-capabilities#file-uploads">Backend capabilities</a>).
      </p>

      <h2 id="errors">Errors and the error page</h2>
      <p>
        A thrown <code>HttpError</code> keeps its status on page routes too <Tag color="blue">0.3.2</Tag>:{" "}
        <code>requireAuth()</code> gives 401, <code>verifyCsrf()</code> 403, and your own{" "}
        <code>throw new HttpError(404, "No such order")</code> 404. Anything else is a 500 whose
        message is shown in dev and replaced by "Internal Server Error" in production; the real
        error is logged server-side.
      </p>
      <p>
        These responses, and unmatched URLs (404), render the app's error page,{" "}
        <code>apps/&lt;name&gt;/error.tsx</code>. New apps get one; without it a small built-in
        page is used. <code>message</code> is always safe to show.
      </p>
      <div className="devora-card">
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
{`import { PageShell, type ErrorPageProps } from "@devorajs/core";

export function meta({ status }: ErrorPageProps) {
  return { title: status === 404 ? "Not found" : \`Error \${status}\` };
}

export default function ErrorPage({ status, message }: ErrorPageProps) {
  return (
    <PageShell>
      <h1>{status}</h1>
      <p>{message}</p>
    </PageShell>
  );
}`}
        </pre>
      </div>

      <h2 id="head"><code>&lt;head&gt;</code>: stylesheets, fonts, manifest, meta, scripts</h2>
      <p>App-wide, in <code>app.config.ts</code>:</p>
      <div className="devora-card">
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
{`export default defineApp({
  head: {
    lang: "en",
    stylesheets: ["/styles.css"],
    links: [
      { rel: "icon", href: "/favicon.png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
    ],
    meta: [{ name: "theme-color", content: "#0a0a12" }],
    scripts: [{ src: "/analytics.js", defer: true }],
  },
});`}
        </pre>
      </div>
      <p>Per route, through <code>meta()</code>:</p>
      <div className="devora-card">
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
{`export function meta(data) {
  return {
    title: data.title,
    head: { links: [{ rel: "canonical", href: \`https://example.com/p/\${data.slug}\` }] },
  };
}`}
        </pre>
      </div>
      <ul>
        <li>Files in the app's public folder (<code>/styles.css</code>, <code>/favicon.png</code>) are served as-is.</li>
        <li>Scripts are external <code>src</code> only: the default CSP blocks inline scripts.</li>
        <li>Fonts or styles from another origin need your <code>security.csp</code> to allow that origin.</li>
      </ul>
      <Callout kind="warning" title="The framework's own stylesheet is opt-in (0.3.2)">
        <p>
          The theme CSS and the default Devora favicon are only added to pages that render{" "}
          <code>PageShell</code>/<code>AppHeader</code>. CSR pages get them by default, because the
          server can't see what they render. <code>head: {"{ theme: false }"}</code> turns them off
          everywhere; <code>theme: true</code> adds them to every page. A <code>links</code> entry
          with <code>rel: "icon"</code> replaces the default favicon.
        </p>
      </Callout>

      <h2 id="css">CSS imported by a route</h2>
      <p>
        <code>import "./page.css"</code> (or a component's own <code>import "./card.css"</code>) is
        linked in the page's <code>&lt;head&gt;</code> automatically — in dev, in the production
        build, and in <code>ssg</code>/<code>isr</code> HTML. In production the files are emitted to{" "}
        <code>/assets/</code> with hashed names. <code>?inline</code>/<code>?raw</code>/
        <code>?url</code> imports are values, not stylesheets, and are left alone.
      </p>

      <h2 id="build-time">What runs at build time</h2>
      <p>
        <code>devora build</code> only imports (and so runs) routes that are <code>ssg</code> or{" "}
        <code>isr</code>, and what they import. It reads each route's mode from its source (
        <code>export const renderMode = "ssr"</code>), so a module that needs secrets at import time
        (a database or storage client) doesn't crash a build that doesn't have them. Two cases
        still run at build: <code>ssg</code>/<code>isr</code> routes and everything they import,
        and a route whose <code>renderMode</code> isn't a plain string literal. For those, create
        clients lazily, on first use.
      </p>

      <h2 id="shell">The shell: <code>PageShell</code> and its classes</h2>
      <p>
        <code>PageShell</code> renders a sticky header, a centred content column and a footer that
        stays at the bottom of short pages. Props: <code>appName</code> (the badge next to the
        logo), <code>nav</code> (header links, which wrap onto their own row on narrow screens),{" "}
        <code>footerLinks</code> (links next to the footer logo) and <code>footer</code> (any
        footer content).
      </p>
      <div className="docs-table-wrap">
        <table>
          <thead><tr><th>Class</th><th>For</th></tr></thead>
          <tbody>
            <tr><td><code>devora-lead</code></td><td>A larger intro paragraph</td></tr>
            <tr><td><code>devora-card</code></td><td>A bordered card</td></tr>
            <tr><td><code>devora-grid</code></td><td>A responsive grid of <code>devora-card</code>s</td></tr>
            <tr><td><code>devora-button</code></td><td>A link styled as the primary button (<code>&lt;button&gt;</code>s already are)</td></tr>
            <tr><td><code>devora-error</code> / <code>devora-status</code></td><td>The centred error / status layout</td></tr>
            <tr><td><code>devora-gradient-text</code>, <code>devora-pill</code></td><td>The brand gradient on text; a small status pill</td></tr>
          </tbody>
        </table>
      </div>
      <p>
        Forms inside the page are styled as cards, with full-width fields and labels above them.
        Everything is CSS custom properties (<code>--devora-*</code>), dark by default with a light
        variant from <code>prefers-color-scheme</code>; override any token in your own stylesheet.
      </p>
      </DocsLayout>
    </PageShell>
  );
}
