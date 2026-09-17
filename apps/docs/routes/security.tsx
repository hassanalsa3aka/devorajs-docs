import { PageShell } from "@devorajs/core";
import { DOCS_NAV } from "../nav.js";
import { SiteFooter } from "../site-footer.js";
import { DocsLayout } from "../docs-layout.js";

export const renderMode = "ssg";

export function meta() {
  return {
    title: "Security model",
    description: "CSP/HSTS defaults, the session/CSRF system, and what's bring-your-own.",
  };
}

export async function loader() {
  return {};
}

export default function Security() {
  return (
    <PageShell nav={DOCS_NAV} footer={<SiteFooter />}>
      <DocsLayout active="security">
      <h1>Security model</h1>
      <p>
        Devora.js treats security as a default, not an opt-in plugin — every app gets a set of
        protections whether or not its <code>app.config.ts</code> declares a{" "}
        <code>security</code> block at all.
      </p>

      <h2>CSP, HSTS, and frame options</h2>
      <p>Every response carries these headers by default:</p>
      <ul>
        <li>
          <code>Content-Security-Policy: default-src 'self'; style-src 'self' 'unsafe-inline'; object-src 'none'; base-uri 'self'</code>{" "}
          — locks scripts, connections, and images to same-origin, blocking injected, inline, or
          eval'd script execution. <code>style-src</code> additionally allows{" "}
          <code>'unsafe-inline'</code> as a deliberate, documented tradeoff: React's{" "}
          <code>style={"{{...}}"}</code> prop compiles to an inline <code>style</code> attribute,
          which a strict default would otherwise silently break for every app.
        </li>
        <li><code>X-Frame-Options: DENY</code> — blocks the app from being framed by another site.</li>
        <li>
          <code>Strict-Transport-Security: max-age=63072000; includeSubDomains</code> — a two-year
          HSTS policy. This header is a no-op over plain HTTP (browsers only honor it on responses
          received over HTTPS), so it's safe to always send, including in dev.
        </li>
      </ul>
      <p>
        Each of these is overridable per app (<code>security.csp</code>, <code>security.frameOptions</code>,{" "}
        <code>security.hsts</code> in <code>app.config.ts</code>) — the point is that you have to
        opt out, not opt in.
      </p>

      <h2>Sessions and CSRF</h2>
      <p>
        The session system is a <em>carrier</em>, not an identity provider — it doesn't check
        credentials, it just makes a session survive across requests tamper-evidently once your own
        code decides someone is logged in. The request context's <code>setSession(data)</code> signs
        an HMAC cookie using Node's built-in <code>crypto</code> (no external dependency); its{" "}
        <code>requireAuth()</code> throws if there's no valid session, and rejects a tampered cookie
        rather than trusting it.
        A shared app gets one project-wide cookie; an isolated app gets its own cookie name and can
        use its own secret.
      </p>
      <p>
        CSRF protection follows the same ad hoc, explicit-call shape rather than framework-injected
        middleware — a route that mutates state calls the context's <code>verifyCsrf(formData)</code>{" "}
        itself, the same way it calls <code>requireAuth()</code>. It's a double-submit-cookie pattern with
        one difference from the textbook version: the token is embedded server-side into the
        rendered form rather than read from the cookie by client JS, which means the cookie can
        stay <code>HttpOnly</code> with no downside. Session and CSRF cookies both get the{" "}
        <code>Secure</code> attribute in production (conditional on environment, so plain HTTP
        still works in dev).
      </p>
      <p>
        In production, an app with <code>auth: "shared"</code> or <code>"isolated"</code> requires
        its session secret to be set (<code>DEVORA_SESSION_SECRET</code> or{" "}
        <code>DEVORA_SESSION_SECRET_&lt;APPNAME&gt;</code>) — the framework throws rather than
        falling back to an insecure default. An app with <code>auth: "none"</code> never reads or
        requires any session-related variable at all.
      </p>

      <h2>Hardening pass (v2)</h2>
      <p>
        <strong>Not yet in the published <code>^0.1.0</code> package</strong> — see{" "}
        <a href="/backend">Backend (v2)</a> for the rest of that release. Once v2's surface
        (backend modules, API routes, middleware, repo-splitting, streaming) stabilized, it went
        through a real internal audit — every finding below was independently reproduced (a real
        forged cookie, a real crafted <code>.gitmodules</code> path, a real oversized request body)
        before being fixed, not assumed from a description. Not a substitute for the formal
        third-party audit still planned once the package is published — but real, verified
        hardening in its own right:
      </p>
      <ul>
        <li>
          <strong>Cross-app session isolation is now cryptographically real, not just
          cookie-name-based.</strong> Before this, an <code>"isolated"</code> app that happened to
          share its session secret with the project's shared app (a supported, documented
          configuration) produced signatures indistinguishable from the shared app's own cookie —
          a valid session from one app could be replayed verbatim against the other. The cookie
          name is now bound into the signed input itself, so isolation holds even when two apps'
          secrets collide.
        </li>
        <li>
          <strong>Request bodies are capped</strong> (10MB default) across every API route and form
          action, dev and production — previously unbounded, letting a single request force
          unbounded memory buffering.
        </li>
        <li>
          <strong>Streaming connections time out</strong> (30s default) rather than holding a
          connection open indefinitely if a Suspense boundary never resolves — previously
          unbounded on self-hosted/Docker deployments.
        </li>
        <li>
          <strong>Path traversal closed in two places</strong>: the repo-splitting CLI (
          <code>devora split</code>/<code>sync</code>/<code>status</code>) now refuses to run git
          commands or delete a directory outside the project root, even from a crafted{" "}
          <code>.gitmodules</code> entry or <code>devora.config.ts</code> path; the ISR disk cache
          now refuses to write or delete outside its own static output directory, even from a
          tainted <code>getStaticParams()</code> value.
        </li>
        <li>
          <strong><code>devora start</code></strong> (the self-hosted production entrypoint) now
          sets <code>NODE_ENV=production</code> itself, matching <code>devora build</code>/
          <code>deploy</code> — previously relying on the invoking shell to have set it, silently
          falling back to an insecure default session secret otherwise.
        </li>
      </ul>

      <h2>What's bring-your-own, and why</h2>
      <p>
        Devora.js deliberately does not ship an ORM, an auth/identity provider, or file storage in
        v1. Checking <em>who</em> a request actually comes from — verifying a password, validating
        a token against an identity provider like Clerk or Lucia — is left to you, plugged into the
        session carrier described above via your own DB client (Prisma, Drizzle, or anything else).
        This is deliberate scope control: the framework's job is to make the plumbing (signed
        cookies, CSRF, security headers) secure and boring by default, not to compete with
        dedicated auth or database tooling that already does that job well. The same reasoning
        applies to a formal third-party security audit — not done yet, planned once the package is
        published and the API surface has real external users, since auditing a moving target
        wastes the audit.
      </p>
      </DocsLayout>
    </PageShell>
  );
}
