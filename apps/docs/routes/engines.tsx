import { PageShell } from "@devorajs/core";
import { DOCS_NAV } from "../nav.js";
import { SiteFooter } from "../site-footer.js";
import { DocsLayout, Callout } from "../docs-layout.js";
import { pageMeta } from "../seo.js";

export const renderMode = "ssg";

export function meta() {
  return pageMeta("/engines", {
    title: "Engines: Vite and Sekhem",
    description:
      "Vite is the default engine. Sekhem is an experimental engine on esbuild, without Vite: how to turn it on, what it supports, what was tested.",
  });
}

export async function loader() {
  return {};
}

const CONFIG = `// devora.config.ts
export default defineProject({
  engine: "own", // "vite" (default) or "own" (Sekhem, experimental)
  apps: [/* ... */],
  shared: { /* ... */ },
});

// or per command, which wins over the file:
//   devora dev --engine=own
//   devora build --engine=own
//   npx create-devora my-app --engine=own`;

export default function Engines() {
  return (
    <PageShell nav={DOCS_NAV} footer={<SiteFooter />}>
      <DocsLayout active="engines">
        <h1>Engines: Vite and Sekhem</h1>
        <p className="devora-lead">
          <code>devora dev</code> and <code>devora build</code> run on Vite by default, and that does not change in 0.4.0.
          Sekhem is a second engine of our own, built on esbuild, that does not use Vite at all. It is experimental and off
          unless you ask for it.
        </p>

        <h2>Turning it on</h2>
        <pre><code>{CONFIG}</code></pre>
        <p>
          The flag wins over <code>devora.config.ts</code>; an unknown value is an error, never a silent fall-back to the other
          engine. <code>create-devora</code> asks "Dev and build engine: 1) Vite (stable, default) 2) Sekhem (experimental)"; without
          a terminal the answer is Vite. A project created for Sekhem has no <code>vite.config.ts</code> and no <code>vite</code> or{" "}
          <code>@vitejs/plugin-react</code> dependency in its apps.
        </p>
        <Callout kind="warning" title="Requirements">
          Sekhem needs Node 22.15 or later (it uses <code>module.registerHooks</code>) and says so on older Node. It is the separate package
          <code>@devorajs/sekhem</code>: <code>npm install --save-dev @devorajs/sekhem</code> (<code>create-devora</code> adds it to a project that chooses it).
        </Callout>

        <h2>What it does</h2>
        <ul>
          <li>
            <strong>Dev server:</strong> esbuild transforms, React Fast Refresh, CSS and assets, hot updates over a WebSocket on
            127.0.0.1 with an Origin check and a per-launch token, tsconfig path aliases, CSS modules and{" "}
            <code>import.meta.glob</code> with literal patterns. It refuses to run in production.
          </li>
          <li>
            <strong>Build:</strong> <code>devora build --engine=own</code> bundles every route, the API routes and the error page for
            the server with code splitting, and the island and client-rendered entries for the browser with hashed names, then the
            same pre-rendering and adapter steps as the Vite build.
          </li>
          <li>
            <strong>Live updates without a restart:</strong> editing a route in any render mode (ssr, csr, ssg, isr, streaming),
            adding or removing a route, changing its render mode, editing an island, editing, adding or removing an API route, and
            editing a module outside the app all show in the next request, each covered by a test. Changes to{" "}
            <code>devora.config.ts</code>, <code>app.config.ts</code> and <code>.env</code> restart <code>devora dev</code> by itself and
            print why.
          </li>
          <li>
            <strong>Independent of Vite:</strong> the CLI loads Vite only when the Vite engine runs. A script in the repository builds,
            serves and runs dev on Sekhem while any attempt to load Vite throws, and passes.
          </li>
        </ul>

        <h2>What it does not do</h2>
        <ul>
          <li>No Vite plugins, no PostCSS or Sass, no <code>VITE_</code> environment variables in browser code, no source maps in the build.</li>
          <li>Small images and fonts are not inlined as data URIs (Vite inlines those under 4 kB).</li>
          <li>No <code>--host</code> and no HTTPS in dev.</li>
          <li>The built islands have not been checked hydrating in a browser; the build tests check their output and their URLs.</li>
        </ul>

        <h2>What was tested</h2>
        <p>
          Run on 9 November 2026, on one Mac (Apple M5) with Node 20.20.2, 22.23.4, 24.22.2 and 26.13.0, and Vite 6.4.5, 7.3.7 and 8.3.6.
          A cell is "pass" when the whole check passed.
        </p>
        <div className="docs-table-wrap">
          <table>
            <thead>
              <tr><th>Check</th><th>Node 20</th><th>Node 22</th><th>Node 24</th><th>Node 26</th></tr>
            </thead>
            <tbody>
              <tr><td>Full test suite</td><td>pass (Sekhem's loader tests are skipped)</td><td>pass</td><td>pass</td><td>pass</td></tr>
              <tr><td>Four example apps, Vite 6 build and serve</td><td>pass (41 of 41 routes answer)</td><td>pass</td><td>pass</td><td>pass</td></tr>
              <tr><td>Same apps, Sekhem build: same status, headers and page as Vite</td><td>refuses (needs 22.15)</td><td>41 of 41</td><td>41 of 41</td><td>41 of 41</td></tr>
              <tr><td>Vite 7 and Vite 8, build and dev</td><td>not run</td><td>pass</td><td>pass</td><td>pass</td></tr>
              <tr><td>Dev attack comparison, fuzzing, browser checks</td><td>not run</td><td>pass</td><td>pass</td><td>pass</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          The "same page" check compares status, selected headers, cookie names, redirect targets and the HTML after removing
          script and style tags, nonces and tokens, and requires every asset the pages refer to to answer 200. Both builds were
          served with <code>devora start</code>.
        </p>

        <h2>Security checks so far</h2>
        <ul>
          <li>Fuzzing: about 99,000 request paths and 35,000 damaged cache entries sent to the dev server, no problems found.</li>
          <li>Host and Origin checks, WebSocket token, request limits, path escape and cache attacks: the same comparison script passes against Vite and Sekhem.</li>
          <li>Both builds succeed with outbound network blocked. The lockfile has an integrity hash for every package and no package asks to run an install script. The audit of shipped dependencies reports nothing; the full audit reports 14 issues, all in the test runner used for development (listed in the roadmap).</li>
          <li>Not done yet: request-level attacks against the built output, and a review by someone outside the project. There has been no third-party audit.</li>
        </ul>

        <h2>Numbers</h2>
        <p>
          Build time, memory and request throughput for both engines, on this Mac and on a small ARM server, are on the{" "}
          <a href="/performance#build-by-node">performance page</a>, with the method and what was not measured.
        </p>
      </DocsLayout>
    </PageShell>
  );
}
