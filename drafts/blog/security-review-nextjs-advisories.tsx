import { BlogPost, Note, postMeta } from "../../blog-post.js";

export const renderMode = "ssg";
const SLUG = "security-review-nextjs-advisories";
const GH = "https://github.com/vercel/next.js/security/advisories";

export function meta() {
  return postMeta(SLUG);
}

export async function loader() {
  return {};
}

const ADVISORIES: Array<{ date: string; id: string; cve?: string; title: string; sev: string; cls: string }> = [
  { date: "Oct 14", id: "GHSA-673q-mjm6-r5xr", title: "Remote code execution in use cache functions returning typed arrays", sev: "Critical", cls: "use cache" },
  { date: "Oct 14", id: "GHSA-2464-fhr4-w9xw", cve: "CVE-2026-96889", title: "Remote code execution in the Image Optimization API when SVG files are used", sev: "Critical", cls: "Image optimization" },
  { date: "Oct 14", id: "GHSA-p3m5-59mp-jv5r", title: "Denial of service in the App Router using Server Actions", sev: "High", cls: "Server Actions" },
  { date: "Sep 30", id: "GHSA-cjq9-62q9-8jv4", cve: "CVE-2026-94483", title: "Server-side request forgery in Image Optimization", sev: "High", cls: "Image optimization" },
  { date: "Sep 30", id: "GHSA-4jqv-mc3x-m676", cve: "CVE-2026-94543", title: "Cache poisoning of SSG and ISR pages in self-hosted applications", sev: "Medium", cls: "Static and ISR caches" },
  { date: "Sep 30", id: "GHSA-mcj8-r9mp-w47p", cve: "CVE-2026-94484", title: "Cache poisoning in SSG/ISR rendering (root-level catch-all page)", sev: "Medium", cls: "Static and ISR caches" },
  { date: "Sep 30", id: "GHSA-f87g-xv8r-7p7x", cve: "CVE-2026-94485", title: "Information disclosure in metadata image routes via a dynamicParams bypass", sev: "Medium", cls: "Metadata image routes" },
  { date: "Sep 30", id: "GHSA-h694-7cp9-m8p3", title: "Cache leak across root param values in nested use cache functions", sev: "Medium", cls: "use cache" },
  { date: "Sep 30", id: "GHSA-3w37-wq28-93x7", cve: "CVE-2026-94544", title: "A pending use cache fill can leak Draft Mode content", sev: "Medium", cls: "use cache and Draft Mode" },
  { date: "Sep 30", id: "GHSA-39w2-rjm5-chcv", cve: "CVE-2026-94486", title: "Information disclosure in the development server's Model Context Protocol endpoint", sev: "Low", cls: "Dev server" },
  { date: "Sep 22", id: "GHSA-vcvr-r3jv-pc5j", cve: "CVE-2026-94545", title: "Remote code execution in next/og ImageResponse", sev: "Critical", cls: "Image generation" },
];

export default function Post() {
  return (
    <BlogPost slug={SLUG}>
      <p>
        This post goes through eleven recent Next.js security advisories, published between September 22 and October 14,
        2026. Reading a list like that is a cheap way to ask what kinds of mistakes a framework like yours could make. This post does that for
        Devora.js: which classes of bug in those advisories cannot happen here because the feature does not exist,
        which look similar to something Devora.js has and what was checked, what the review of Devora.js itself found
        and fixed in 0.4.0, and what is still unverified.
      </p>
      <p>
        Two limits first. <strong>This is not a claim that Devora.js has no vulnerabilities.</strong> The most it says
        is that Devora.js is not affected by these specific advisories, which describe Next.js code. And{" "}
        <strong>there has been no third-party security audit of Devora.js</strong>: everything here is the
        maintainer&apos;s own review.
      </p>

      <h2>The advisories</h2>
      <p>
        Each links to its official page on GitHub. Dates, ids, severities and conditions are as the advisories and
        Next.js&apos;s own posts (
        <a href="https://nextjs.org/blog/nextjs-security-update-october-14-2026">October 14</a>,{" "}
        <a href="https://nextjs.org/blog/september-2026-security-release">September 30</a>) give them; the class column
        is mine.
      </p>
      <div className="post-table-wrap" role="region" aria-label="Next.js advisories, September 22 to October 14, 2026" tabIndex={0}>
        <table className="post-table">
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Advisory</th>
              <th scope="col">Severity</th>
              <th scope="col">Class</th>
            </tr>
          </thead>
          <tbody>
            {ADVISORIES.map((a) => (
              <tr key={a.id}>
                <td>{a.date}</td>
                <th scope="row">
                  <a href={`${GH}/${a.id}`}>{a.id}</a>
                  {a.cve ? ` (${a.cve})` : ""}
                  <br />
                  <span style={{ fontWeight: 400 }}>{a.title}</span>
                </th>
                <td>{a.sev}</td>
                <td>{a.cls}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Classes that do not exist in Devora.js by design</h2>
      <p>
        These are not features Devora.js has and secured; they are features it does not have. Each one is a design
        decision, not an accident of timing.
      </p>
      <ul>
        <li>
          <strong>An image optimization or image generation endpoint</strong> (GHSA-2464-fhr4-w9xw, GHSA-cjq9-62q9-8jv4,
          GHSA-vcvr-r3jv-pc5j). Devora.js has no <code>/_next/image</code>-style URL that fetches or decodes images
          for you, no remote image allow-list and no OG image generator, and none of its packages depends on{" "}
          <code>sharp</code> (the lockfile has no entry for it). If your app adds one, its advisories are yours to
          track.
        </li>
        <li>
          <strong>A server-function wire protocol</strong> (GHSA-p3m5-59mp-jv5r, GHSA-673q-mjm6-r5xr). Devora.js has no
          React Server Components stream and no Server Actions protocol; a custom RSC-style serialization protocol is
          one of the things the project has said it will not build. A page&apos;s <code>action</code> is a function
          exported from the route file, called with the parsed form data of a <code>POST</code> to that route&apos;s own
          URL. The client cannot name a function to call, so the set of things a request can run is the set of route
          files. That is a smaller surface; it is not a claim of denial-of-service immunity. A request body is
          limited to 10 MB by default, and from 0.4.0 a form to 1000 fields and 20 files, and a slow client is cut
          off by the server timeouts.
        </li>
        <li>
          <strong>Per-function caching and Draft Mode</strong> (GHSA-h694-7cp9-m8p3, GHSA-3w37-wq28-93x7,
          GHSA-673q-mjm6-r5xr). There is no <code>use cache</code>, no cache keyed by a function&apos;s arguments and no
          Draft Mode. Server-rendered pages are not cached by the framework at all.
        </li>
        <li>
          <strong>Metadata image routes</strong> (GHSA-f87g-xv8r-7p7x). There are none.
        </li>
        <li>
          <strong>A framework-owned development endpoint for tools</strong> (GHSA-39w2-rjm5-chcv). Devora.js adds no
          such endpoint. <code>devora dev</code> is a Vite dev server, so Vite&apos;s own advisories apply to it, which
          is why 0.4.0 requires vite 6.4.4 or later. It listens on localhost unless you pass <code>--host</code>, and
          with <code>allowedHosts</code> set it answers other hosts with a 400.
        </li>
      </ul>

      <h2>A similar feature we did test: the static and ISR caches</h2>
      <p>
        Two of the advisories (GHSA-4jqv-mc3x-m676, GHSA-mcj8-r9mp-w47p) are about a static or ISR cache entry being
        replaced or keyed by something a request controls, in one case when the app has a root-level catch-all page.
        Devora.js has pre-rendered pages (<code>ssg</code>) and <code>isr</code>, and it has catch-all routes. An
        earlier internal pass had already fixed one such hole: <code>isr</code> used to render and write a cache entry
        for any parameter value matching the route&apos;s pattern, and it now only does so for the values{" "}
        <code>getStaticParams()</code> returns.
      </p>
      <p>
        For this post that behavior was tried again on a production build of a freshly scaffolded project, with two{" "}
        <code>isr</code> catch-all routes: <code>/docs/[...slug]</code> (declared values <code>a/b</code> and{" "}
        <code>c</code>) and a root-level <code>[...page]</code> (declared <code>x</code> and <code>y/z</code>). About
        forty request paths were sent: other case, double slashes, dot segments, encoded slashes, extra segments,
        trailing slashes, query strings. Declared paths, with or without a trailing slash or a query string, were
        served (200); a path with dot segments or a doubled leading slash was normalized to a declared page (for
        example <code>/./x</code> to <code>/x</code>); every other undeclared or altered path was a 404 (for example{" "}
        <code>/X</code>, <code>/y</code>, <code>/y/z/w</code>, <code>/docs/a//b</code> and encoded slashes); and <strong>no new file appeared in the cache folder</strong>.
      </p>
      <p>
        That is one project shape and a few dozen paths. It is evidence that the declared-values rule holds for those
        shapes, not a proof that no cache-key confusion exists.
      </p>

      <h2>What the review found in Devora.js, fixed in 0.4.0</h2>
      <p>
        These are gaps in defaults, found by reading the code and trying requests against it. There are no known
        outside production users of Devora.js, so none was reported to us as exploited; that is an absence of
        evidence, not evidence of absence.
      </p>
      <ul>
        <li><strong>CSRF depended on each route remembering to check.</strong> It is now checked for cookie-authenticated writes by default, with a per-route opt-out.</li>
        <li><strong><code>redirect()</code> accepted any target</strong>, so a redirect built from user input was an open redirect. It now stays on the app&apos;s origin unless you list another.</li>
        <li><strong>Responses that read or set the session cookie could be cached</strong> by a CDN or proxy that was set up to cache. They are now <code>private, no-store</code>.</li>
        <li><strong>An <code>.svg</code> file was served with the page policy</strong>, so one opened directly could run its own script on your origin. It now has a sandboxing policy, in <code>devora start</code>, in the dev server and in the files the Vercel and Netlify adapters leave to the CDN. The browser run caught the dev server case, which the first fix had missed.</li>
        <li><strong>No <code>nosniff</code> header</strong> on any response. Added everywhere.</li>
        <li><strong>A symlink in the public folder</strong> could make <code>devora start</code> serve a file outside it. The real path must now be inside the client folder.</li>
        <li><strong>No way to say which hosts an app answers to.</strong> <code>allowedHosts</code> now exists, and the docs say reset links must not be built from the <code>Host</code> header.</li>
        <li><strong>Node&apos;s default server timeouts</strong> (5 minutes for a request) let slow clients hold connections. <code>devora start</code> now sets its own, and limits header size.</li>
        <li><strong>No limit on form fields or files</strong>, only on total bytes. Now 1000 and 20 by default.</li>
        <li><strong>Old vite releases and a vulnerable <code>source-map-js</code></strong> (a high-severity denial of service) were allowed by the dependency ranges and the lockfile. Both are now excluded.</li>
        <li>A streaming render dropped a failed island&apos;s error if it arrived before the shell was ready; it is now reported. This one is reliability, not security.</li>
      </ul>
      <p>
        Each change has a test, and the whole set was run in a browser against a project scaffolded from the local
        build: login, a form post with the token, a <code>fetch</code> with the header, a same-site cross-origin post
        without the token (403), redirects to <code>//evil.com</code> and <code>https://evil.com</code> (400), the SVG
        policy with a control showing the same SVG runs its script without it, a wrong host (400), a slow-header
        connection (408), 21 files (413) and the rate limit (429).
      </p>

      <Note title="What is not verified">
        <ul>
          <li>
            <strong>Live Vercel and Netlify.</strong> The generated output was inspected (header routes in Vercel&apos;s{" "}
            <code>config.json</code>, rules in Netlify&apos;s <code>_headers</code>, <code>allowedHosts</code> in the
            function) and the generated Vercel function was run locally. How the platforms apply those header rules to
            static files, and how <code>allowedHosts</code> behaves for preview domains, was not checked on a real
            deployment.
          </li>
          <li>
            <strong>The rate limit across serverless instances.</strong> It counts in memory, per process. On Vercel or
            Netlify each instance has its own count, so treat it as a brake on one client against one instance, not as
            a global limit.
          </li>
          <li>
            <strong>The test runner.</strong> The vitest version used for the repository&apos;s tests has open advisories
            in its own tooling. It is not installed by users, and the audit job in CI reports it without failing; an
            upgrade broke integration tests and is not done.
          </li>
          <li>
            <strong>No third-party audit</strong>, and no systematic fuzzing of the request parser, the router or the form
            parser (one test compares the fast path parser with the URL parser on thousands of generated paths).
          </li>
        </ul>
      </Note>

      <h2>If you find a problem</h2>
      <p>
        Please do not open a public issue. Use GitHub&apos;s{" "}
        <a href="https://github.com/hassanalsa3aka/devora.js/security/advisories/new">private vulnerability reporting</a>{" "}
        for the repository, or send the maintainer a direct message on{" "}
        <a href="https://discord.gg/wYFYmFxdS8">Discord</a> saying you have a security report, and share the details
        only there. Say which package and version, what an attacker can do and the smallest request that shows it. It
        is one person, so expect a first reply within a few days. The full policy is{" "}
        <a href="https://github.com/hassanalsa3aka/devora.js/blob/main/SECURITY.md">SECURITY.md</a>.
      </p>
      <p>
        What changed in 0.4.0, with the migration step for each breaking change, is in the{" "}
        <a href="/blog/devora-0-4-0">release post</a>.
      </p>
    </BlogPost>
  );
}
