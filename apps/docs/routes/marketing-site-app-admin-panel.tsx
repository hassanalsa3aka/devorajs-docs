import { PageShell } from "@devorajs/core";
import { DOCS_NAV } from "../nav.js";
import { SiteFooter } from "../site-footer.js";
import { DocsLayout, Callout, Tag } from "../docs-layout.js";
import { pageMeta } from "../seo.js";

export const renderMode = "ssg";

export function meta() {
  return pageMeta("/marketing-site-app-admin-panel", {
    title: "Marketing site, app and admin panel",
    fullTitle: "React framework for a marketing site, app and admin panel",
    description:
      "One Devora.js project holds a marketing site, a product app and an admin panel as separate apps that share a backend and a login, and deploy on their own.",
  });
}

export async function loader() {
  return {};
}

export default function MarketingSiteAppAdminPanel() {
  return (
    <PageShell nav={DOCS_NAV} footer={<SiteFooter />}>
      <DocsLayout active="marketing-site-app-admin-panel">
        <h1>Marketing site, app and admin panel</h1>
        <p>
          Most products end up as three programs: a public marketing site, the product people log in
          to, and an internal admin panel. They have different traffic, different release schedules
          and different risk, but they talk to the same data and (mostly) the same users. Devora.js
          is a React framework built around that shape: one project declares all three as{" "}
          <em>apps</em>, they share one backend, and each one builds and deploys on its own.
        </p>

        <h2>The shape of the project</h2>
        <p>
          <code>npm create devora@latest</code> asks for the app names and, per app, its auth mode.
          The defaults are <code>marketing,dashboard,admin</code>. The result is one folder with a
          single <code>devora.config.ts</code>, a shared <code>packages/backend</code>, and an{" "}
          <code>apps/</code> folder with one directory per app, each with its own{" "}
          <code>routes/</code> and <code>app.config.ts</code>:
        </p>
        <div className="devora-card">
          <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
{`my-devora-app/
├── devora.config.ts      # every app, and the project-wide defaults
├── packages/backend/     # server functions and your database client
└── apps/
    ├── marketing/routes/ # public pages
    ├── dashboard/routes/ # the product, behind a login
    └── admin/routes/     # internal panel`}
          </pre>
        </div>
        <div className="devora-card">
          <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
{`// devora.config.ts
import { defineProject } from "@devorajs/core/config";

export default defineProject({
  apps: [
    { name: "marketing", dir: "apps/marketing", domain: "example.com", auth: "none" },
    { name: "dashboard", dir: "apps/dashboard", domain: "app.example.com" },
    { name: "admin", dir: "apps/admin", domain: "admin.example.com", auth: "isolated" },
  ],
  shared: { core: "packages/core", backend: "packages/backend", auth: "shared" },
});`}
          </pre>
        </div>

        <h2>What each app gets</h2>
        <ul>
          <li>
            <Tag color="gray">marketing</Tag> <code>auth: "none"</code>: no sessions, no CSRF, no
            session secret to configure. Pages can be <code>ssg</code> (built once) or{" "}
            <code>isr</code> (rebuilt on a schedule); see <a href="/render-modes">Render modes</a>.
          </li>
          <li>
            <Tag color="blue">dashboard</Tag> the default, <code>auth: "shared"</code>: logged in
            through the project's common session.
          </li>
          <li>
            <Tag color="purple">admin</Tag> <code>auth: "isolated"</code>: its own session scope,
            its own cookie name and optionally its own secret, so a login to the dashboard is never
            accepted by the admin panel. See <a href="/core-concepts">Core concepts</a>.
          </li>
        </ul>
        <p>
          Code that more than one app needs lives once in <code>packages/backend</code> and is
          imported by each app. The tutorial{" "}
          <a href="/multi-app-tutorial">Build a multi-app project</a> writes one such function and
          calls it from a page and a JSON route.
        </p>

        <h2>Building and deploying separately</h2>
        <p>
          <code>devora dev --app=marketing</code> runs one app; <code>devora build --app=admin</code>{" "}
          builds one, so the marketing site can ship without touching the admin panel. On Vercel
          each app becomes its own project; the settings and the traps are in{" "}
          <a href="/deployment">Deployment</a> and the post{" "}
          <a href="/blog/deploying-multi-app-to-vercel">One repo, several Vercel projects</a>.
        </p>

        <Callout kind="info" title="What this does not do">
          <p>
            Navigating between apps is a full page load, because they are separate apps. Devora.js
            is pre-1.0 with a small community, and it ships no ORM, auth provider or file storage:
            you bring your own database and decide who someone is. If you only have one app, a
            single-app framework is a simpler choice; see <a href="/compare">Compare</a> for where
            the others are ahead.
          </p>
        </Callout>

        <p>
          Next: <a href="/share-login-across-apps">share one login across the apps</a>, or{" "}
          <a href="/getting-started">start a project</a>.
        </p>
      </DocsLayout>
    </PageShell>
  );
}
