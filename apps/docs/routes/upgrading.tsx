import type { ReactNode } from "react";
import { PageShell } from "@devorajs/core";
import { DOCS_NAV } from "../nav.js";
import { SiteFooter } from "../site-footer.js";
import { DocsLayout, Callout } from "../docs-layout.js";
import { pageMeta } from "../seo.js";

export const renderMode = "ssg";

export function meta() {
  return pageMeta("/upgrading", {
    title: "Upgrading to 0.3.2",
    description:
      "Every behavior change in Devora.js 0.3.2 and what an existing app has to do about it, plus the upgrade steps.",
  });
}

export async function loader() {
  return {};
}

// From the 0.3.2 section of devora.js/CHANGELOG.md ("Behavior changes"),
// plus one change found upgrading this site (the theme variable).
const CHANGES: { change: ReactNode; todo: ReactNode }[] = [
  {
    change: <>Redirects after a POST are <strong>303 See Other</strong> (were 302); loader redirects stay 302.</>,
    todo: <>Browsers behave the same. Tests or clients that assert 302 after a form post: update them, or pass <code>redirect(to, 302)</code>.</>,
  },
  {
    change: <>Page errors keep their status: a thrown <code>HttpError</code> (or anything with a 4xx/5xx <code>status</code>) is that status, not a 500 — <code>requireAuth()</code> is 401, <code>verifyCsrf()</code> 403. Errors and unmatched URLs render <code>error.tsx</code> or a built-in page, in dev too.</>,
    todo: <>Anything that treated every page failure as a 500 should check the status. Add an <code>error.tsx</code> for your own error page.</>,
  },
  {
    change: <>The framework stylesheet and favicon are only added to pages that render <code>PageShell</code> or <code>AppHeader</code> (and CSR shells).</>,
    todo: <>A page that relied on the theme without the shell needs <code>head: {"{ theme: true }"}</code> in <code>app.config.ts</code> or its <code>meta().head</code>.</>,
  },
  {
    change: <><code>PageShell</code> wraps its content in <code>&lt;div class="devora-shell"&gt;</code>; the theme no longer sets <code>body {"{ display: flex }"}</code>.</>,
    todo: <>Adjust custom CSS that depended on <code>body</code> being the flex container, or on <code>main</code> being a direct child of <code>#root</code>. Props are unchanged.</>,
  },
  {
    change: <>The theme no longer defines <code>--devora-bg-elevated</code> (it has <code>--devora-surface</code> and more tokens). Not in the CHANGELOG; found upgrading this site.</>,
    todo: <>If your CSS uses it, replace it with <code>var(--devora-surface)</code> or define it yourself: <code>:root {"{ --devora-bg-elevated: var(--devora-surface); }"}</code>. A manual light/dark switch that overrides tokens should override the new ones too.</>,
  },
  {
    change: <>A backend-only app answers <code>GET /</code> with 200 (JSON for API clients, a small HTML page for browsers). It was a 404.</>,
    todo: <>Monitors that expected 404 there are fine to keep using <code>/api/health</code>.</>,
  },
  {
    change: <>Request bodies are limited to 10 MB by default (<code>maxBodyBytes</code>, forms and API routes); larger ones get a 413. Malformed multipart is a 400.</>,
    todo: <>Apps that accept larger uploads set <code>maxBodyBytes</code> in <code>app.config.ts</code>.</>,
  },
  {
    change: <><code>.env</code> files in the project root are loaded by <code>dev</code>, <code>build</code>, <code>start</code> and <code>deploy</code>; variables already in the environment win.</>,
    todo: <>Check the project root for stale <code>.env</code> files, and drop <code>node --env-file</code> wrappers.</>,
  },
  {
    change: <><code>devora start</code> reads <code>PORT</code> and <code>HOST</code> (<code>--port</code>/<code>--host</code> still win).</>,
    todo: <>A <code>PORT</code> left in the environment now moves the server; unset it or pass <code>--port</code>.</>,
  },
  {
    change: <><code>devora build --adapter=</code> anything other than <code>vercel</code>/<code>netlify</code> fails, instead of building without the requested output.</>,
    todo: <>Scripts using <code>--adapter=node</code> drop the flag: <code>devora build</code>, then <code>devora start</code>.</>,
  },
  {
    change: <>The Vercel runtime is no longer <code>nodejs20.x</code> (Vercel rejects it): <code>vercel.runtime</code>, else the running Node major, else <code>engines.node</code>, else <code>nodejs24.x</code>.</>,
    todo: <>Nothing, unless you need a specific runtime. An <code>engines.node</code> no supported runtime satisfies fails the build.</>,
  },
  {
    change: <><code>adapter-vercel</code> empties <code>.vercel/output</code> before writing it.</>,
    todo: <>Don't keep files of your own in that directory.</>,
  },
  {
    change: <>The generated Vercel and Netlify functions trust the platform's proxy headers (<code>trustProxy: true</code> unless the app sets <code>false</code>).</>,
    todo: <>Nothing, unless the function can be reached without going through the platform's edge.</>,
  },
  {
    change: <><code>devora build</code> only imports <code>ssg</code>/<code>isr</code> routes (and routes whose render mode isn't a string literal).</>,
    todo: <>Nothing, unless a build relied on a request-time route running at build time.</>,
  },
  {
    change: <>Unsupported <code>island()</code> calls (<code>island(loader)</code>, a computed path, a path that doesn't resolve) fail the build and dev server with the file and line.</>,
    todo: <>Fix the reported call to <code>island(() =&gt; import("./path"))</code>.</>,
  },
  {
    change: <>Session config that used to be ignored is an error: session settings on an <code>auth: "none"</code> app, a <code>cookie.domain</code> that doesn't cover the app, per-app lifetimes on a shared app.</>,
    todo: <>Fix or remove the setting the error names.</>,
  },
  {
    change: <><code>devora dev</code>'s boot output has a new layout: every app's URLs first, then routes per app; more than 10 API routes per app are counted.</>,
    todo: <>Anything that parsed the old output should use <code>--routes</code> and match the new lines.</>,
  },
];

export default function Upgrading() {
  return (
    <PageShell nav={DOCS_NAV} footer={<SiteFooter />}>
      <DocsLayout active="upgrading">
      <h1>Upgrading to 0.3.2</h1>
      <p>
        0.3.2 is a large release for a patch number: request access in loaders, actions that
        return data, error pages, a <code>&lt;head&gt;</code> API, uploads, cookie and proxy
        settings, CORS, <code>.env</code> loading and a fixed Vercel runtime. Most of it is new
        options; the list below is what can change how an existing app behaves.
      </p>

      <h2 id="steps">Steps</h2>
      <ol>
        <li>
          Upgrade <code>@devorajs/core</code> and <code>@devorajs/cli</code> together, in the root{" "}
          <code>package.json</code> and every app's: <code>"^0.3.2"</code>. API routes run on the
          CLI's bundled copy of core and pages on the app's installed one, so mixing 0.3.1 and
          0.3.2 gives one project two behaviors.
        </li>
        <li>
          If you import an adapter directly, use <code>@devorajs/adapter-node</code> 0.2.1 or{" "}
          <code>@devorajs/adapter-vercel</code>/<code>adapter-netlify</code> 0.2.3. adapter-node
          0.2.0 and the 0.2.2 adapters were published without their build output and are
          deprecated. (<code>devora</code> bundles the adapters, so most projects don't depend on
          them at all.)
        </li>
        <li>Install, then run <code>npm run typecheck</code>, <code>npm run dev</code> and <code>npm run build</code>.</li>
        <li>Go through the table below and change what applies to your app.</li>
        <li>
          Before deploying to Vercel, check the preflight output of{" "}
          <code>devora build --adapter=vercel</code> (runtime, a top-level <code>api/</code>{" "}
          folder, session secret and store), and see <a href="/deployment">Deployment</a>.
        </li>
      </ol>
      <p>React 19 and Vite 6 are now allowed (<code>^18.3.0 || ^19.0.0</code>, <code>^5.4.0 || ^6.0.0</code>); nothing requires you to move.</p>

      <h2 id="changes">Behavior changes and what to do</h2>
      <div className="docs-table-wrap">
        <table>
          <thead><tr><th>What changed</th><th>What to do</th></tr></thead>
          <tbody>
            {CHANGES.map((c, i) => (
              <tr key={i}>
                <td>{c.change}</td>
                <td>{c.todo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Callout kind="tip" title="Worth adopting while you're here">
        <p>
          Move API routes out of a top-level <code>api/</code> folder if you deploy to Vercel (
          <code>apiDir: "endpoints"</code>), set <code>trustProxy</code> behind nginx/Caddy, and
          replace hand-rolled query-string parsing with <code>ctx.url</code>. See{" "}
          <a href="/pages-forms-errors">Pages, forms and errors</a> and{" "}
          <a href="/backend">Backend</a>.
        </p>
      </Callout>
      <p>
        The complete list per package is in the{" "}
        <a href="https://github.com/hassanalsa3aka/devora.js/blob/main/CHANGELOG.md">CHANGELOG</a>.
      </p>
      </DocsLayout>
    </PageShell>
  );
}
