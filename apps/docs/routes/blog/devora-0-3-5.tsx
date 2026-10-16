import { BlogPost, Code, Note, postMeta } from "../../blog-post.js";

export const renderMode = "ssg";
const SLUG = "devora-0-3-5";

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
        0.3.5 is a performance and housekeeping release. <code>@devorajs/core</code> and{" "}
        <code>@devorajs/cli</code> are 0.3.5 and <code>create-devora</code> is 0.3.3 (new projects pin{" "}
        <code>^0.3.5</code>). The three adapters are unchanged. The complete list is the{" "}
        <a href="https://github.com/hassanalsa3aka/devora.js/blob/main/CHANGELOG.md#035--2026-10-16">0.3.5
        section of the CHANGELOG</a>; this post is the short version, with the numbers and their limits.
      </p>

      <h2>What an existing app has to do</h2>
      <p>Nothing in a typical app. The CHANGELOG lists four behavior changes; each is small:</p>
      <ul>
        <li>
          A missing session store, or (in production) a missing <code>DEVORA_SESSION_SECRET</code>,
          stops <code>devora start</code> with one clear line and exit status 1 instead of a stack
          trace. It refused to start before and still does.
        </li>
        <li>
          <code>ctx.url</code> and <code>ctx.headers</code> are built the first time a handler reads
          them. Reading them is unchanged. They are now getters, so a handler that assigns to them
          throws in strict mode; nothing in the framework does.
        </li>
        <li>A rebuilt island or client-route manifest is picked up within a second.</li>
        <li>
          The header's brand link has the accessible name <code>devora.js home</code> (it was{" "}
          <code>Home</code>, which did not contain its visible text). A test that selects it by{" "}
          <code>aria-label="Home"</code> needs the new name.
        </li>
      </ul>

      <h2>The five performance changes</h2>
      <p>
        Each came from a CPU profile of a running <code>devora start</code> (<code>node --cpu-prof</code>),
        not from a guess, and each has a test. In short, work that never changes was being redone on every
        request:
      </p>
      <ul>
        <li><code>ctx.url</code> and <code>ctx.headers</code> were built even when no handler read them.</li>
        <li>
          Build keys, module lookups and the paths of pre-rendered pages were recomputed per request, and
          the request path went through the URL parser even when it was plain. A plain path is now read
          straight from the request line; anything unusual still goes through the parser, and a test
          compares both on thousands of generated paths.
        </li>
        <li>
          The store key for a session ID (an HMAC) is remembered per secret, cookie name and ID, in a memory
          bounded to 5,000 entries. The value is the same, so existing sessions keep working and an isolated
          app still cannot read a shared app's sessions.
        </li>
        <li>
          The island and client-route manifests were read from disk on every server-rendered request; they
          are now read at most once a second. On a form POST this was about a third of the profile (file
          system calls were 33.7% of samples in 0.3.4 and 0.1% after).
        </li>
        <li>The absolute request URL behind <code>ctx.url</code> is parsed when first read.</li>
      </ul>
      <p>
        No security default was changed. The tests that cover the paths these changes touch: a remembered
        session key never outlives a session (revoked, deleted, expired, after the memory is flooded, in
        another app's scope); the remembered page paths stay bounded and keep refusing traversal; and a page
        form POST gets a 403 without, with a missing or with a wrong CSRF token and a 303 with a valid one,
        with the 0.3.4 values for the security headers and cookie flags.
      </p>

      <h2>What it measured</h2>
      <p>
        The benchmark harness (the same pages and the same JSON API in several frameworks, one machine, the
        load tool on that machine, 5 runs of 10 s per scenario) was run on the published 0.3.4 packages and
        again on the published 0.3.5 packages. Medians, with the lowest and highest run in brackets:
      </p>
      <div className="post-table-wrap" role="region" aria-label="Devora.js on 0.3.4 and on 0.3.5" tabIndex={0}>
        <table className="post-table">
          <thead>
            <tr><th scope="col">Scenario</th><th scope="col">0.3.4, req/s</th><th scope="col">0.3.5, req/s</th></tr>
          </thead>
          <tbody>
            <tr><th scope="row">Pre-rendered page</th><td>71,479 (68,049–73,376)</td><td>101,891 (97,155–105,289)</td></tr>
            <tr><th scope="row">Server-rendered page</th><td>9,475 (9,159–9,484)</td><td>11,736 (11,611–11,921)</td></tr>
            <tr><th scope="row">Form POST</th><td>31,988 (28,631–32,094)</td><td>79,136 (78,271–81,871)</td></tr>
            <tr><th scope="row">JSON list (API route)</th><td>30,524 (26,001–37,802)</td><td>49,529 (49,258–51,050)</td></tr>
            <tr><th scope="row">Authenticated GET (API route)</th><td>43,169 (42,768–43,347)</td><td>77,228 (76,431–77,635)</td></tr>
          </tbody>
        </table>
      </div>
      <p>
        The 0.3.4 API runs were noisy (the JSON list ranged from 26,001 to 37,802), so the gap there is
        overstated. A second measurement is steadier: an interleaved A/B of the 0.3.4 packages against the same
        code before it was published, alternating builds on the same machine over 3 rounds, gave about +15% on
        the JSON list, +32% on the authenticated GET, +21% on a valid POST, +41% on the pre-rendered page and
        +23% on the server-rendered page (<code>benchmarks/results/ab-published-vs-final.txt</code>). Take
        the A/B figures as the better estimate of the change, and both as one machine's numbers.
      </p>

      <h2>Where it is still behind</h2>
      <p>
        The performance page and the repository's reports call a difference smaller than a framework's own
        run-to-run spread a tie. By that rule, on 0.3.5:
      </p>
      <ul>
        <li>
          <strong>Ahead of the other four frameworks</strong> on the pre-rendered page, the
          server-rendered page and the form POST (Next.js, Astro, SvelteKit, React Router).
        </li>
        <li>
          <strong>Behind</strong> Fastify, Hono and NestJS on its Fastify platform on every JSON API
          scenario; on the authenticated GET also behind Express and NestJS on its Express platform. On the
          JSON list, Fastify reached 66,678 req/s against 49,529; on the authenticated GET, 134,383 against
          77,228.
        </li>
        <li>
          <strong>Level</strong> on the scenario with one awaited 2 ms step, where five results overlap: the
          timer, not the framework, sets the rate.
        </li>
      </ul>
      <p>
        Part of that gap is work the bare frameworks do not do: Devora.js sends CSP, HSTS and X-Frame-Options
        on every response and runs a real session layer for the authenticated scenario, and these numbers
        keep both. Memory is higher too: 285 MB after the API scenarios against 167 to 258 MB for Express,
        Fastify, Hono and both NestJS platforms (and lower than Next.js, SvelteKit, React Router and Astro). A
        faster server also keeps more heap, so that is not proof of a leak; a 10-minute mixed-load run on the
        code that became 0.3.5 held steady at about 314 MB.
      </p>

      <Note title="What was not verified">
        <ul>
          <li>
            The only live deployment of 0.3.5 checked for this post is this documentation site on Vercel. The
            multi-app demos on Vercel and Netlify were not checked on 0.3.5, and the Netlify demos could not be
            reached from the test machine.
          </li>
          <li>One machine, with the load tool on it, and tiny pages. Run the harness on your own hardware before relying on a number.</li>
          <li>The 0.3.4 and 0.3.5 runs were made on the same day on the same machine, not under controlled conditions.</li>
        </ul>
      </Note>

      <h2>Upgrade</h2>
      <Code label="Upgrade command">{`npm install @devorajs/core@^0.3.5 @devorajs/cli@^0.3.5`}</Code>
      <p>
        Upgrade core and cli together, in the root and every app's <code>package.json</code>. The steps and the
        earlier tables are on <a href="/upgrading">Upgrading to 0.3.5</a>; the numbers are on{" "}
        <a href="/performance">Performance</a>.
      </p>
    </BlogPost>
  );
}
