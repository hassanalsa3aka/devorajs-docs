      <h1>Upgrading to 0.4.0</h1>
      <p>
        0.4.0 is a security hardening release. Three changes can make an existing app's requests fail until you act
        (<code>redirect()</code> to another origin, CSRF on cookie-authenticated writes, and a <code>Cache-Control</code>
        you relied on for logged-in responses), and the CLI now requires vite 6.4.4 or later. Everything else is
        additive or only tightens a default. The <a href="/blog/devora-0-4-0">release post</a> has the short version,
        and <a href="/security">Security model</a> says what the defaults do and what they leave to you. If you are on
        0.3.4 or older, the 0.3.5, 0.3.4 and 0.3.2 changes are listed below too.
      </p>

      <h2 id="steps">Steps</h2>
      <ol>
        <li>
          Upgrade <code>@devorajs/core</code> and <code>@devorajs/cli</code> together, in the root{" "}
          <code>package.json</code> and every app's: <code>"^0.4.0"</code>, and set <code>vite</code> to{" "}
          <code>"^6.4.4"</code>. API routes run on the CLI's bundled copy of core and pages on the app's installed
          one, so mixing versions gives one project two behaviors.
        </li>
        <li>
          If you import an adapter directly, use <code>@devorajs/adapter-node</code>, <code>@devorajs/adapter-vercel</code>{" "}
          or <code>@devorajs/adapter-netlify</code> <code>0.3.0</code>: they depend on <code>@devorajs/core</code>{" "} {/* version-ok */}
          <code>^0.4.0</code> (<code>devora</code> bundles the adapters, so most projects don't depend on them at all).
        </li>
        <li>Install, then run <code>npm run typecheck</code>, <code>npm run dev</code> and <code>npm run build</code>.</li>
        <li>
          Go through the table below. The quickest test is to run <code>devora dev</code>, sign in, submit each form and
          call each write route from the browser once: a missing CSRF token shows up as a 403 right away.
        </li>
        <li>
          Optional, and worth doing: set <code>allowedHosts</code> in <code>app.config.ts</code>, add a{" "}
          <code>rateLimit</code> to login routes, and read the <a href="/security#new-in-0-4-0">new defaults</a>.
        </li>
      </ol>
      <p>
        A project made by <code>create-devora</code> 0.3.x keeps working. To use pnpm 11 or later, or Yarn 4, with it,
        add the files described on <a href="/getting-started#package-managers">Getting started</a>.
      </p>

      <h2 id="changes-040">From 0.3.5 to 0.4.0</h2>
      <div className="docs-table-wrap">
        <table>
          <thead><tr><th>What changed</th><th>What to do</th></tr></thead>
          <tbody>
            {CHANGES_040.map((c, i) => (
              <tr key={i}>
                <td>{c.change}</td>
                <td>{c.todo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p>
        TypeScript (0.3.4 and later): <code>ctx.params</code> keeps its type (<code>Record&lt;string, string&gt;</code>), {/* version-ok */}
        so existing code compiles unchanged. A catch-all's segments are joined with <code>/</code>{" "}
        there, and <code>ctx.catchAll.slug</code> (or <code>req.catchAll.slug</code> in an API
        route) is the <code>string[]</code>.
      </p>

