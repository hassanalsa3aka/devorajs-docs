import { BlogPost, Code, Note, postMeta } from "../../blog-post.js";

export const renderMode = "ssg";
const SLUG = "devora-0-4-0";
// RELEASE-DAY: this anchor is the CHANGELOG heading "0.4.0 — <date>" with the date you put there
// (lower-case, spaces and the dash turned into "-"): for "0.4.0 — 2026-11-20" it is "040--2026-11-20".
const CHANGELOG = "https://github.com/hassanalsa3aka/devora.js/blob/main/CHANGELOG.md#040--DATE-TO-FILL";

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
        0.4.0 is a security hardening release, and it is the first one that can make an existing app&apos;s
        requests fail until you act. <code>@devorajs/core</code> and <code>@devorajs/cli</code> are 0.4.0, the
        three adapters are 0.3.0 (they now depend on <code>@devorajs/core</code> <code>^0.4.0</code>), and{" "}
        <code>create-devora</code> is 0.4.0: new projects pin <code>^0.4.0</code> and{" "}
        <code>vite</code> <code>^6.4.4</code>. The complete list, with the migration step for each change, is the{" "}
        <a href={CHANGELOG}>0.4.0 section of the CHANGELOG</a>. This post is the short version.
      </p>
      <p>
        Everything in it came from an internal review of the framework. There has been no third-party audit.
        The companion post, <a href="/blog/security-review-nextjs-advisories">A security review of Devora.js after
        the recent Next.js advisories</a>, says what the review looked at, what it found and what it did not check.
      </p>

      <h2>Before you deploy: three breaking changes and one requirement</h2>
      <p>
        Each is a default that got stricter. If your app does none of the things below, nothing changes for it.
      </p>

      <h3>1. redirect() stays on your origin</h3>
      <p>
        <code>redirect()</code> used to send any string as the <code>Location</code> header, so{" "}
        <code>redirect(formData.get(&quot;next&quot;))</code> was an open redirect. It now throws a 400 for a
        target that leaves the app&apos;s origin: <code>https://evil.com</code>, <code>//evil.com</code>,{" "}
        <code>/\evil.com</code>, <code>javascript:</code> targets and their percent-encoded forms. The check runs
        again when the response is built, so a loader that returns a plain <code>{"{ redirect }"}</code> object is
        covered too. A path such as <code>/account</code> works as before.
      </p>
      <p>
        <strong>Migration.</strong> Search for <code>redirect(</code> with a full URL. For a site you trust, list its
        origin:
      </p>
      <Code label="redirect() to another origin">{`import { redirect } from "@devorajs/core";

export const renderMode = "ssr";

export async function action() {
  // Another site you trust: list its origin, or redirect() answers 400.
  return redirect("https://checkout.example.com/pay", {
    allowedOrigins: ["https://checkout.example.com"],
  });
}

export default function Pay() {
  return null;
}`}</Code>
      <p>A redirect built from user input needs no change, and an attacker&apos;s value now gets a 400:</p>
      <Code label="A redirect target from the query string">{`import type { RequestContext } from "@devorajs/core";
import { redirect } from "@devorajs/core";

export const renderMode = "ssr";

export async function loader(ctx: RequestContext) {
  // /go?next=//evil.com is a 400 now; /go?next=/account still redirects.
  throw redirect(ctx.url.searchParams.get("next") ?? "/");
}

export default function Go() {
  return null;
}`}</Code>

      <h3>2. Responses that touch the session cookie are private, no-store</h3>
      <p>
        A response to a request that sent the session cookie, or that sets or clears it (a login, a renewal, a
        logout), is now sent with <code>Cache-Control: private, no-store</code>, replacing whatever the handler set.
        It applies to pages, streaming pages, redirects, error pages and API routes. Bearer requests and requests
        without the session cookie are unchanged. The point is that a CDN or proxy in front of the app must not
        store one user&apos;s page or <code>Set-Cookie</code> and hand it to another.
      </p>
      <p>
        <strong>Migration.</strong> If an API route sets <code>Cache-Control: public</code> or <code>s-maxage</code>{" "}
        on responses to logged-in browsers, that header is dropped for them. Put the cacheable version on a route
        that does not read the session. Otherwise there is nothing to do.
      </p>

      <h3>3. CSRF is checked by default for cookie-authenticated writes</h3>
      <p>
        Until 0.3.5 a route checked CSRF only if it called <code>ctx.verifyCsrf()</code>, so a route that forgot
        accepted cross-site writes. In 0.4.0 a <code>POST</code>, <code>PUT</code>, <code>PATCH</code> or{" "}
        <code>DELETE</code> that arrives with a live session in the session cookie is checked before the page&apos;s{" "}
        <code>action</code> or the API route&apos;s <code>handler</code> runs. The token must be in the{" "}
        <code>_csrf</code> form field or the <code>x-devora-csrf</code> header; otherwise the response is a 403.
        Bearer requests, requests with no session cookie and reads are not checked by this default.
      </p>
      <p>
        <strong>Migration.</strong> Three cases:
      </p>
      <ul>
        <li>
          A page form with an <code>action</code> renders <code>{"<CsrfField token={csrfToken} />"}</code>. The
          scaffold&apos;s login and logout forms already do.
        </li>
        <li>
          A browser <code>fetch()</code> that writes to an API route sends the page&apos;s <code>csrfToken</code> in
          the <code>x-devora-csrf</code> header:
        </li>
      </ul>
      <Code label="fetch() with the CSRF header">{`import { useState } from "react";

// \`csrfToken\` is the prop your page already receives; this component posts to an API route.
export function OrderForm({ csrfToken }: { csrfToken: string }) {
  const [item, setItem] = useState("");
  async function add(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/orders", {
      method: "POST",
      headers: { "content-type": "application/json", "x-devora-csrf": csrfToken },
      body: JSON.stringify({ item }),
    });
  }
  return (
    <form onSubmit={add}>
      <input value={item} onChange={(e) => setItem(e.target.value)} />
      <button type="submit">Place order</button>
    </form>
  );
}`}</Code>
      <ul>
        <li>
          A route that another site calls while sending the session cookie opts out and verifies its caller itself.
          A webhook usually sends no session cookie and is not checked at all.
        </li>
      </ul>
      <Code label="Opting a route out">{`import { apiRoute } from "@devorajs/core";

export const methods = ["POST"];

// Called by another site, not by a page of this app: no CSRF token exists to check.
// Verify the caller yourself (a signature header) before trusting the body.
export const csrf = false;

export const handler = apiRoute((req) => {
  return { status: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ received: req.body.length }) };
});`}</Code>
      <p>
        An app with <code>csrf: false</code> in <code>app.config.ts</code> issues no CSRF cookie, so its
        cookie-authenticated writes get a 403 unless the route opts out. Keep calling{" "}
        <code>ctx.verifyCsrf()</code> yourself on anonymous writes such as a login form: the default does not cover
        them.
      </p>

      <h3>The requirement: vite 6.4.4 or later</h3>
      <p>
        <code>@devorajs/cli</code> now asks for <code>vite</code> <code>^6.4.4</code> (it accepted{" "}
        <code>^5.4.0 || ^6.0.0</code>), because older releases have known vulnerabilities. Set that range in each
        app&apos;s <code>package.json</code> and reinstall. <code>devora build</code> and <code>devora dev</code> were
        run on vite 6.4.5.
      </p>

      <h2>New settings</h2>
      <p>
        All of these are optional. The first three tighten <code>devora start</code>; the last two are guards you opt
        into.
      </p>
      <Code label="app.config.ts">{`import { defineApp } from "@devorajs/core/config";

export default defineApp({
  // A request for any other host is a 400. A leading dot covers a domain and its subdomains.
  allowedHosts: ["app.example.com", ".example.com"],
  // devora start: headers within 15 s, the whole request within 60 s by default.
  server: { requestTimeoutMs: 300_000, keepAliveTimeoutMs: 65_000 },
  // A page form: at most 1000 fields and 20 files by default.
  maxFormFields: 1000,
  maxFormFiles: 20,
});`}</Code>
      <ul>
        <li>
          <strong><code>allowedHosts</code></strong>: when set, a request whose host is not listed gets a plain 400
          before any route runs. The host is the one <code>ctx.url</code> uses: <code>Host</code>, or the first{" "}
          <code>X-Forwarded-Host</code> when <code>trustProxy</code> is on. Ports are ignored, and{" "}
          <code>devora dev</code> also accepts localhost. Build password-reset links from a configured origin, never
          from the <code>Host</code> header.
        </li>
        <li>
          <strong><code>server</code></strong>: <code>devora start</code> now sets its own limits instead of
          Node&apos;s: headers within 15 s, the whole request within 60 s (Node&apos;s default is 5 minutes), idle
          keep-alive connections closed after 5 s, request headers up to 16 KB. A client that trickles its headers
          gets a 408; oversized headers get a 431. An app that accepts large uploads over slow links should raise{" "}
          <code>requestTimeoutMs</code>, and behind a load balancer <code>keepAliveTimeoutMs</code> should be longer
          than the balancer&apos;s idle timeout.
        </li>
        <li>
          <strong><code>maxFormFields</code> and <code>maxFormFiles</code></strong>: a page form may send at most
          1000 fields and 20 files by default; one more is a 413 before the body is parsed and before the action
          runs.
        </li>
        <li>
          <strong><code>rateLimit</code></strong>, exported from a route:
        </li>
      </ul>
      <Code label="A rate limit on a login route">{`// In a route that creates sessions (a login page, or an API route):
export const rateLimit = { max: 10, windowSeconds: 60 }; // 10 POSTs per client IP per minute, per process`}</Code>
      <p>
        The next request over the limit is a 429 (an API route also sends <code>Retry-After</code>) before the action
        or handler runs. It is a small in-memory counter per process and per client IP. It does not lock accounts,
        and on Vercel or Netlify each function instance counts on its own, so put the real limit in your proxy or
        platform as well; the <a href="https://github.com/hassanalsa3aka/devora.js/blob/main/packages/backend/AUTH.md#rate-limiting-logins">Auth guide</a>{" "}
        has nginx and platform examples. Behind a proxy it needs <code>trustProxy</code>, or every client shares the
        proxy&apos;s address.
      </p>
      <p>
        <strong>Dev auto-restart.</strong> <code>devora dev</code> now restarts its servers, and says why, when{" "}
        <code>devora.config.ts</code>, an app&apos;s <code>app.config.ts</code> or a root <code>.env</code> file
        changes, or when a route file is added, removed or renamed. Editing a route&apos;s contents is still
        hot-reloaded, not a restart. If a restart fails because a config is broken, it prints the error and tries
        again the next time you save. A change to a Prisma schema only prints a message (run{" "}
        <code>prisma generate</code>, then stop and start <code>devora dev</code>), because a restart cannot reload
        the generated client.
      </p>

      <h2>Smaller changes</h2>
      <ul>
        <li>Every response sends <code>X-Content-Type-Options: nosniff</code>, including static files, and the Vercel and Netlify adapters add it to files their CDNs serve directly.</li>
        <li><code>.svg</code> files are served with a sandboxing Content-Security-Policy, so an SVG opened directly cannot run script on your origin. Do not serve user-uploaded SVG or HTML from the app&apos;s origin; this header covers files you ship, not files your app stores and sends back.</li>
        <li><code>devora start</code> serves a file only if its real path, with symlinks followed, is inside the client folder.</li>
        <li>In development, a route that reads <code>ctx.session</code> but never calls <code>ctx.requireAuth()</code> gets one warning per path.</li>
        <li>A streaming page&apos;s failed island import that errored before the shell was ready is now reported instead of dropped.</li>
      </ul>

      <Note title="What was not verified">
        <ul>
          <li>
            No live Vercel or Netlify deployment of 0.4.0 was checked. The generated header rules and{" "}
            <code>allowedHosts</code> were checked as generated output, and the generated Vercel function was run
            locally, nothing more.
          </li>
          <li>
            The rate limit was tested on one process. Across several serverless instances it is a per-instance count.
          </li>
          <li>
            Performance was not re-measured for 0.4.0, so this post makes no claim about it. The CSRF check, the
            extra headers and the host check do add work to a request.
          </li>
          <li>There has been no third-party security audit.</li>
        </ul>
      </Note>

      <h2>Upgrade</h2>
      <Code label="Upgrade command">{`npm install @devorajs/core@^0.4.0 @devorajs/cli@^0.4.0 vite@^6.4.4`}</Code>
      <p>
        Upgrade core, cli and any adapter together, in the root and every app&apos;s <code>package.json</code>. Then
        run <code>devora dev</code>, sign in, submit each form and call each write route from the browser once: a
        missing CSRF token shows up as a 403 right away. If you find a security problem, report it privately as{" "}
        <a href="https://github.com/hassanalsa3aka/devora.js/blob/main/SECURITY.md">SECURITY.md</a> describes.
      </p>
    </BlogPost>
  );
}
