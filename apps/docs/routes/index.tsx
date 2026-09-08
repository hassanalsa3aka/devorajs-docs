import { PageShell } from "@devorajs/core";
import { DOCS_NAV } from "../nav.js";

export const renderMode = "ssg";

export function meta() {
  return {
    title: "Devora.js — security-first, multi-app by default",
    description:
      "A lightweight, Vite-based web framework whose headline feature is native multi-app support — one project, multiple sites, sharing a core, deployable independently.",
  };
}

export async function loader() {
  return {};
}

export default function Home() {
  return (
    <PageShell nav={DOCS_NAV}>
      <h1>Devora.js</h1>
      <p>
        A lightweight, Vite-based, security-first web framework whose headline feature is{" "}
        <strong>native multi-app support</strong> — one project, multiple sites or panels
        (marketing site, main app, admin panel), sharing a core, deployable independently.
      </p>

      <div className="devora-card">
        <p style={{ margin: 0 }}>
          <code>npx create-devora@latest</code> to scaffold a new project — see{" "}
          <a href="/getting-started">Getting started</a>.
        </p>
      </div>

      <h2>Why it exists</h2>
      <p>
        Most teams building a marketing site, a product app, and an admin panel end up either
        bolting three separate repos together with a monorepo tool, or cramming all three into one
        Next.js app and fighting its App Router for the seams between them. Devora.js treats
        multi-app as a first-class concept: apps live side by side in one project, share one core
        and one backend by default, and each can still be deployed independently.
      </p>
      <p>
        The other half of the pitch is a direct reaction to Next.js: <strong>explicit over
        implicit</strong>. Caching, data flow, and server/client boundaries are visible in your
        route files, not inferred from file-naming conventions or hidden behind multiple layers of
        framework-managed revalidation. A route explicitly declares its render mode
        (<code>ssr</code>/<code>ssg</code>/<code>csr</code>/<code>isr</code>), explicitly exports a{" "}
        <code>loader</code> for its data and an <code>action</code> for its mutations, and
        explicitly opts components into island hydration. Nothing caches or revalidates on a
        schedule you didn't write down yourself.
      </p>
      <p>
        Security follows the same philosophy: it's a default, not a plugin. CSP and HSTS headers
        are on for every app out of the box, and there's no dynamic <code>eval</code>/
        <code>require</code> path anywhere reachable from user input.
      </p>

      <h2>Where to go next</h2>
      <p>
        <a href="/getting-started">Getting started</a> walks through scaffolding a project.{" "}
        <a href="/core-concepts">Core concepts</a> covers the multi-app architecture and auth
        model in more depth.
      </p>
    </PageShell>
  );
}
