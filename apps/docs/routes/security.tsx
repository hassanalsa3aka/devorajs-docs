import { PageShell } from "@devorajs/core";
import { DOCS_NAV } from "../nav.js";
import { SiteFooter } from "../site-footer.js";
import { DocsLayout, Tag, Callout } from "../docs-layout.js";
import { pageMeta } from "../seo.js";

export const renderMode = "ssg";

export function meta() {
  return pageMeta("/security", {
    title: "Security model",
    description:
      "The Devora.js security model: CSP and HSTS defaults, revocable server-side sessions, CSRF protection, and what stays bring-your-own.",
  });
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
      <div className="devora-card" style={{ borderTopColor: "#3b82f6" }}>
        <p style={{ marginTop: 0 }}>
          <Tag color="blue">CSP</Tag>
        </p>
        <p>
          <code>Content-Security-Policy: default-src 'self'; style-src 'self' 'unsafe-inline'; object-src 'none'; base-uri 'self'</code>{" "}
          — locks scripts, connections, and images to same-origin, blocking injected, inline, or
          eval'd script execution. <code>style-src</code> additionally allows{" "}
          <code>'unsafe-inline'</code> as a deliberate, documented tradeoff: React's{" "}
          <code>style={"{{...}}"}</code> prop compiles to an inline <code>style</code> attribute,
          which a strict default would otherwise silently break for every app.
        </p>
      </div>
      <div className="devora-card" style={{ borderTopColor: "#a855f7", marginTop: "0.85rem" }}>
        <p style={{ marginTop: 0 }}>
          <Tag color="purple">X-Frame-Options</Tag>
        </p>
        <p style={{ marginBottom: 0 }}>
          <code>X-Frame-Options: DENY</code> — blocks the app from being framed by another site.
        </p>
      </div>
      <div className="devora-card" style={{ borderTopColor: "#10b981", marginTop: "0.85rem" }}>
        <p style={{ marginTop: 0 }}>
          <Tag color="emerald">HSTS</Tag>
        </p>
        <p style={{ marginBottom: 0 }}>
          <code>Strict-Transport-Security: max-age=63072000; includeSubDomains</code> — a two-year
          HSTS policy. This header is a no-op over plain HTTP (browsers only honor it on responses
          received over HTTPS), so it's safe to always send, including in dev.
        </p>
      </div>
      <p>
        Each of these is overridable per app (<code>security.csp</code>, <code>security.frameOptions</code>,{" "}
        <code>security.hsts</code> in <code>app.config.ts</code>) — the point is that you have to
        opt out, not opt in.
      </p>

      <h2 id="sessions">Sessions</h2>
      <Callout kind="warning" title="Changed in @devorajs/core 0.3.0 — breaking">
        <p>
          Before 0.3.0 a session <em>was</em> its cookie: your session data, signed with an HMAC
          and stored in the browser. That design couldn't revoke a session short of rotating the
          secret, and API/mobile clients had to build their own Bearer-token scheme alongside it.
          Since 0.3.0:
        </p>
        <ul>
          <li>
            <strong>Production needs a session store.</strong> A production server for any app with{" "}
            <code>auth: "shared"</code> or <code>"isolated"</code> refuses to start until{" "}
            <code>shared.sessions.store</code> is set in <code>devora.config.ts</code> (see below).
            In dev an in-memory store is used, with a warning.
          </li>
          <li>
            <strong>Upgrading logs everyone out once.</strong> Old signed cookies are not valid
            session IDs; they're treated as dead and cleared, so every existing user signs in again.
          </li>
        </ul>
      </Callout>
      <p>
        The session system is not an identity provider — it doesn't check passwords. Your code
        decides who someone is, then calls <code>ctx{"."}setSession(data)</code>; the framework
        makes that result persist across requests, and makes it revocable.
      </p>
      <ul>
        <li>
          <strong>A session is a random, opaque ID.</strong> 256 random bits — not a JWT, not a
          signed cookie value. The client holds only the ID. The record (whatever you passed to{" "}
          <code>setSession</code>, plus two expiry times) lives server-side, in a session store
          your project supplies.
        </li>
        <li>
          <strong>One lookup, two transports.</strong> Browsers carry the ID in an{" "}
          <code>HttpOnly</code> cookie; mobile and API clients send{" "}
          <code>Authorization: Bearer &lt;sessionId&gt;</code>. Both go through the same lookup,
          and the Bearer header is checked first. A request that sends a Bearer header is never
          authenticated by a cookie, even if its token turns out to be invalid.
        </li>
        <li>
          <strong>Active → idle → dead.</strong> A new session is <em>active</em> for{" "}
          <code>activeSeconds</code> (default 1 day), then <em>idle</em> for{" "}
          <code>idleSeconds</code> more (default 14 days). Using an idle session silently extends
          both windows, keeping the same ID — so clients never need a refresh-token flow. After
          that it's <em>dead</em> and the user signs in again.
        </li>
        <li>
          <strong>Real revocation.</strong> <code>ctx{"."}revokeSession()</code> deletes the record,
          so the session stops working on both transports on the very next request.{" "}
          <code>ctx{"."}revokeSession(otherId)</code> revokes a different session you recorded (e.g.
          "sign out my other devices" after a password change). <code>clearSession()</code> still
          exists as an alias, so existing logout code revokes server-side without changes.
        </li>
        <li>
          <strong>Leaked store, no usable tokens.</strong> The store is keyed by an HMAC of the ID
          (keyed with the session secret), never the raw ID. The app's auth scope is part of that
          HMAC too, so a session from a <code>shared</code> app is simply not found by an{" "}
          <code>isolated</code> app — on the cookie and on the Bearer transport — even if the two
          share a secret and a store.
        </li>
      </ul>

      <h3 style={{ fontSize: "1.05rem", margin: "1.75rem 0 0.5rem" }}>Configuring the store</h3>
      <p>
        <code>"memory"</code> is fine for dev and a single long-lived <code>devora start</code>{" "}
        process. For Vercel/Netlify or more than one server, point <code>store</code> at a module
        whose default export is a store backed by your own database — it's three methods:
      </p>
      <div className="devora-card">
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
{`// devora.config.ts
import { defineProject } from "@devorajs/core/config";

export default defineProject({
  apps: [{ name: "web", dir: "apps/web", domain: "web.example.com" }],
  shared: {
    core: "packages/core",
    backend: "packages/backend",
    auth: "shared",
    sessions: {
      store: "packages/backend/sessionStore.ts", // or "memory"
      activeSeconds: 60 * 60 * 24,               // optional, default 1 day
      idleSeconds: 60 * 60 * 24 * 14,            // optional, default 14 days
    },
  },
});`}
        </pre>
      </div>
      <div className="devora-card">
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
{`// packages/backend/sessionStore.ts — a working example on SQLite via node:sqlite
// (built into Node 22.5+). Swap the three queries for your own database/driver.
import { DatabaseSync } from "node:sqlite";
import { defineSessionStore } from "@devorajs/core";

const db = new DatabaseSync(process.env.SESSION_DB_PATH ?? "sessions.db");
db.exec(\`CREATE TABLE IF NOT EXISTS sessions (
  key TEXT PRIMARY KEY, data TEXT NOT NULL,
  active_expires_at INTEGER NOT NULL, expires_at INTEGER NOT NULL)\`);

const getRow = db.prepare("SELECT data, active_expires_at, expires_at FROM sessions WHERE key = ?");
const upsert = db.prepare(
  "INSERT INTO sessions (key, data, active_expires_at, expires_at) VALUES (?, ?, ?, ?) " +
  "ON CONFLICT(key) DO UPDATE SET data = excluded.data, " +
  "active_expires_at = excluded.active_expires_at, expires_at = excluded.expires_at"
);
const remove = db.prepare("DELETE FROM sessions WHERE key = ?");

export default defineSessionStore({
  get(key) {
    const row = getRow.get(key) as { data: string; active_expires_at: number; expires_at: number } | undefined;
    return row
      ? { data: JSON.parse(row.data), activeExpiresAt: row.active_expires_at, expiresAt: row.expires_at }
      : undefined;
  },
  set(key, record) {
    upsert.run(key, JSON.stringify(record.data), record.activeExpiresAt, record.expiresAt);
  },
  delete(key) {
    remove.run(key);
  },
});`}
        </pre>
      </div>
      <p>
        The framework deletes an expired record when someone presents it. Records nobody ever
        presents again stay until you clean them up — a periodic{" "}
        <code>DELETE FROM sessions WHERE expires_at &lt; ?</code> with the current time is enough.
      </p>

      <h3 style={{ fontSize: "1.05rem", margin: "1.75rem 0 0.5rem" }}>Browser and API/mobile login</h3>
      <p>
        Same primitive, different transport. A browser login sets the cookie (the default); an
        API/mobile login asks for <code>transport: "bearer"</code>, which sets no cookie and
        returns the ID for your response body:
      </p>
      <div className="devora-card">
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
{`// apps/web/api/session.ts — token login and logout for mobile/API clients
import { apiRoute, HttpError } from "@devorajs/core";

export const methods = ["POST", "DELETE"];

export const handler = apiRoute(async (req, ctx) => {
  if (req.method === "DELETE") {
    ctx${""}.requireAuth();
    await ctx${""}.revokeSession(); // dead on every transport from the next request on
    return { status: 204 };
  }

  const { username } = JSON.parse(req.body.toString("utf-8") || "{}");
  if (typeof username !== "string" || !username) throw new HttpError(400, "username required");
  // Check the password/OTP against your own database here, before this line.
  const token = await ctx${""}.setSession({ username }, { transport: "bearer" });
  return {
    status: 201,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }), // the client sends: Authorization: Bearer <token>
  };
});`}
        </pre>
      </div>
      <p>
        Anywhere else in the app, <code>ctx{"."}requireAuth()</code> and <code>ctx.session</code>{" "}
        accept that token or the browser's cookie with no extra code, and{" "}
        <code>ctx.sessionTransport</code> tells you which one it was. On the client, keep the token
        in secure storage (the iOS Keychain / Android Keystore, e.g. via{" "}
        <code>expo-secure-store</code>), not plain app storage.
      </p>

      <h2 id="csrf">CSRF</h2>
      <p>
        CSRF protection is an explicit call, not framework-injected middleware — a route that
        changes state calls <code>ctx{"."}verifyCsrf(...)</code> itself, the same way it calls{" "}
        <code>requireAuth()</code>. It's a double-submit-cookie pattern, with one difference from
        the textbook version: the token is embedded server-side into the rendered form rather than
        read from the cookie by client JS, so the CSRF cookie stays <code>HttpOnly</code>. A page
        gets its token as the <code>csrfToken</code> prop; a <code>&lt;form&gt;</code> posts it
        via <code>CsrfField</code>, and a same-origin API call sends it on the{" "}
        <code>x-devora-csrf</code> header.
      </p>
      <p>
        <strong>It applies to cookie-authenticated requests only.</strong> A cross-site page can
        make a browser send its cookies automatically, but it can't make it attach an{" "}
        <code>Authorization</code> header — so for a request that successfully authenticated with a
        Bearer token, <code>verifyCsrf()</code> passes without a token. Cookie-authenticated and
        unauthenticated requests (a login form, say) are always checked. A failed check throws a{" "}
        <code>403</code>; a failed <code>requireAuth()</code> throws a <code>401</code>.
      </p>
      <div className="devora-card">
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
{`// apps/web/api/transfer.ts — one route, safe for both browsers and mobile clients
import { apiRoute, CSRF_HEADER_NAME } from "@devorajs/core";

export const methods = ["POST"];

export const handler = apiRoute((req, ctx) => {
  ctx${""}.requireAuth();
  const token = req.headers[CSRF_HEADER_NAME];
  // Enforced for a cookie session; skipped for a Bearer session.
  ctx${""}.verifyCsrf(typeof token === "string" ? token : "");
  return { status: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ok: true }) };
});`}
        </pre>
      </div>
      <p>
        Session and CSRF cookies get <code>Secure</code> in production (conditional on the
        environment, so plain HTTP still works in dev), plus <code>HttpOnly</code> and{" "}
        <code>SameSite=Lax</code> always.
      </p>

      <h3 style={{ fontSize: "1.05rem", margin: "1.75rem 0 0.5rem" }}>What production requires</h3>
      <p>
        For an app with <code>auth: "shared"</code> or <code>"isolated"</code>, a production server
        refuses to start without both a session secret and a session store — it throws rather than
        falling back to an insecure default or to in-memory sessions. An app with{" "}
        <code>auth: "none"</code> needs neither.
      </p>
      <table>
        <thead><tr><th>Setting</th><th>Required when</th><th>Set to</th></tr></thead>
        <tbody>
          <tr>
            <td><code>shared.sessions.store</code> in <code>devora.config.ts</code></td>
            <td>Any <code>shared</code>/<code>isolated</code>-auth app, in production</td>
            <td>A path to your store module, or <code>"memory"</code> for a single long-lived server (never serverless)</td>
          </tr>
          <tr>
            <td><code>DEVORA_SESSION_SECRET</code></td>
            <td>A <code>shared</code>-auth app, in production</td>
            <td>A random value — <code>openssl rand -base64 32</code> works well. Keys the HMAC that turns session IDs into store keys; rotating it signs everyone out</td>
          </tr>
          <tr>
            <td><code>DEVORA_SESSION_SECRET_&lt;APPNAME&gt;</code></td>
            <td>An <code>isolated</code>-auth app, in production (uppercase app name)</td>
            <td>Same — a distinct value per isolated app is recommended but not load-bearing for isolation, since the app's scope is part of the HMAC too</td>
          </tr>
          <tr>
            <td><code>NODE_ENV</code></td>
            <td>Always, in production</td>
            <td><code>production</code> — <code>devora build</code>/<code>start</code>/<code>deploy</code> set this themselves; only matters if you invoke the built output another way</td>
          </tr>
        </tbody>
      </table>
      <p>
        See <a href="/deployment">Deployment</a> for where to set environment variables on
        Vercel/Netlify/Docker.
      </p>

      <h2>Security hardening pass</h2>
      <p>
        Available since <code>@devorajs/core@0.2.2</code>. Once the backend surface (backend
        modules, API routes, middleware, repo-splitting, streaming — see{" "}
        <a href="/backend">Backend</a>) stabilized, it went
        through a real internal audit — every finding below was independently reproduced (a real
        forged cookie, a real crafted <code>.gitmodules</code> path, a real oversized request
        body) before being fixed, not assumed from a description. Not a substitute for a formal
        third-party audit — but real, verified hardening in its own right:
      </p>
      <ul className="check-list" style={{ "--check-content": "'✓'" }}>
        <li>
          <strong>Cross-app session isolation is now cryptographically real, not just
          cookie-name-based.</strong> Before this, an <code>"isolated"</code> app that happened to
          share its session secret with the project's shared app (a supported, documented
          configuration) produced signatures indistinguishable from the shared app's own cookie —
          a valid session from one app could be replayed verbatim against the other. The cookie
          name is now bound into the signed input itself, so isolation holds even when two apps'
          secrets collide. (0.3.0 keeps this guarantee in the new session model: the app's scope is
          part of the HMAC that derives each session's store key — see{" "}
          <a href="#sessions">Sessions</a>.)
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
        Devora.js deliberately does not ship an ORM, an auth/identity provider, or file storage.
        Checking <em>who</em> a request actually comes from — verifying a password, validating
        a token against an identity provider like Clerk or Lucia — is left to you, plugged into the
        sessions described above via your own DB client (Prisma, Drizzle, or anything else) — and
        so is where session records are stored (the session store is three methods over your own
        database). This is deliberate scope control: the framework's job is to make the plumbing
        (sessions, CSRF, security headers) secure and boring by default, not to compete with
        dedicated auth or database tooling that already does that job well. The same reasoning
        applies to a formal third-party security audit — not done yet, planned once the package is
        published and the API surface has real external users, since auditing a moving target
        wastes the audit.
      </p>
      </DocsLayout>
    </PageShell>
  );
}
