import { PageShell } from "@devorajs/core";
import { DOCS_NAV } from "../nav.js";
import { SiteFooter } from "../site-footer.js";
import { DocsLayout, Callout, Tag } from "../docs-layout.js";
import { pageMeta } from "../seo.js";

export const renderMode = "ssg";

export function meta() {
  return pageMeta("/share-login-across-apps", {
    title: "One login across several apps",
    fullTitle: "Share one login across multiple apps — Devora.js",
    description:
      "How apps in one Devora.js project share a single session: one secret, one session store, a cookie domain for subdomains, and Bearer tokens for API clients.",
  });
}

export async function loader() {
  return {};
}

export default function ShareLoginAcrossApps() {
  return (
    <PageShell nav={DOCS_NAV} footer={<SiteFooter />}>
      <DocsLayout active="share-login-across-apps">
        <h1>One login across several apps</h1>
        <p>
          When a product is split into separate apps, say a dashboard and a billing app, people
          expect to sign in once. In Devora.js that is the default for every app with{" "}
          <code>auth: "shared"</code>: they are one session scope, so a session created by any of
          them is accepted by all of them. What you configure is small, and one part of it, the
          browser cookie, depends on how your domains are laid out.
        </p>

        <h2>What is shared</h2>
        <ul>
          <li>
            <strong>One secret.</strong> <code>DEVORA_SESSION_SECRET</code> is the same for every{" "}
            <code>shared</code> app.
          </li>
          <li>
            <strong>One session store.</strong> A session is a random opaque ID; its record lives in
            the store you point <code>shared.sessions.store</code> at. In production that store is
            required and has to be a database every app can reach, not memory.
          </li>
          <li>
            <strong>One revocation.</strong> Ending a session deletes the record, so it stops
            working in every app on the next request.
          </li>
        </ul>
        <div className="devora-card">
          <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
{`// devora.config.ts
shared: {
  core: "packages/core",
  backend: "packages/backend",
  auth: "shared",
  sessions: {
    // your database, read by every app
    store: "packages/backend/sessionStore.ts",
    // only for apps on separate subdomains
    cookie: { domain: "example.com" },
  },
},`}
          </pre>
        </div>
        <p>
          Your login code checks the password (Devora.js does not) and then calls{" "}
          <code>ctx{"."}setSession(data)</code>. Any other <code>shared</code> app can then call{" "}
          <code>ctx{"."}requireAuth()</code> and read <code>ctx.session</code>. The full model is on{" "}
          <a href="/security#sessions">Security model → Sessions</a>.
        </p>

        <h2>Browsers: when the cookie reaches the other app</h2>
        <p>
          The session cookie is <code>HttpOnly</code> and, by default, host-only: a browser sends it
          back only to the host that set it.
        </p>
        <ul>
          <li>
            <strong>Same host.</strong> In <code>devora dev</code> every app is on{" "}
            <code>localhost</code>, so the browser login is shared with no setting.
          </li>
          <li>
            <strong>Separate subdomains</strong> (<code>app.example.com</code>,{" "}
            <code>billing.example.com</code>): set <code>shared.sessions.cookie.domain</code> to{" "}
            <code>"example.com"</code>. Every shared app must be served from that domain or a
            subdomain of it; the build and the dev server check this and fail with a message if not.
            Only the session cookie is shared; the CSRF cookie stays host-only.
          </li>
          <li>
            <strong>Unrelated domains</strong> (<code>example.com</code> and <code>example.io</code>):
            a cookie cannot cross them, and Devora.js does not do single sign-on between them. Use
            Bearer tokens or put your own login redirect in front.
          </li>
        </ul>

        <h2>API and mobile clients</h2>
        <p>
          The same session works as <code>Authorization: Bearer &lt;id&gt;</code>. A login that asks
          for <code>{`{ transport: "bearer" }`}</code> sets no cookie and returns the ID for you to
          send back. Bearer clients are not affected by the cookie domain, and one session
          revoked on the server is dead on both transports.
        </p>

        <h2>Keeping one app out</h2>
        <p>
          An app that needs a separate identity, an admin panel for example, sets{" "}
          <code>auth: "isolated"</code>: its own cookie name and optionally its own secret{" "}
          <code>DEVORA_SESSION_SECRET_&lt;APPNAME&gt;</code>. A shared session is not found there, on
          either transport, and the reverse holds too. <Tag color="gray">none</Tag> turns sessions
          off for an app entirely (a marketing site).
        </p>

        <Callout kind="warning" title="Check before relying on it">
          <p>
            The shared login is covered by the framework's automated tests. Live deployments of the
            demo apps were made with releases before 0.3.2; the current release has not been
            verified on a live multi-app deployment yet, and the status is on the{" "}
            <a href="/roadmap">Roadmap</a>. Production also refuses to start without a session
            secret and a store, which is deliberate; see <a href="/deployment#session-store">Deployment</a>.
          </p>
        </Callout>

        <p>
          Related: <a href="/marketing-site-app-admin-panel">a site, an app and an admin panel</a>,{" "}
          <a href="/multi-app-tutorial">Build a multi-app project</a>.
        </p>
      </DocsLayout>
    </PageShell>
  );
}
