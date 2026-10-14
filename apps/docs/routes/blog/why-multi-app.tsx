import { BlogPost, postMeta } from "../../blog-post.js";

export const renderMode = "ssg";
const SLUG = "why-multi-app";

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
        A product that has customers usually has more than one front door: a marketing site that
        should be fast and public, an app people log in to, an admin panel only staff should see,
        and more and more often an API for a mobile client. These share almost everything
        underneath — the same users, the same data, the same business rules — and almost nothing
        on top.
      </p>
      <p>
        The usual answers are one big app with route groups, or several repos stitched together
        with a monorepo tool. The first couples things that should be separate (the marketing
        site redeploys when the admin panel changes; one CSP for everything). The second leaves
        the shared part — the backend and the login — for you to build.
      </p>

      <h2>What Devora.js does instead</h2>
      <p>One config file lists the apps. This is the whole project in the multi-app example:</p>
      <div className="devora-card">
        <pre style={{ margin: 0 }}>
{`export default defineProject({
  apps: [
    { name: "site", dir: "apps/site", domain: "site.example.com", auth: "none" },
    { name: "app",  dir: "apps/app",  domain: "app.example.com",  auth: "shared" },
    { name: "api",  dir: "apps/api",  domain: "api.example.com",  auth: "shared" },
  ],
  shared: { core: "packages/core", backend: "packages/backend", auth: "shared", sessions: { store: "memory" } },
});`}
        </pre>
      </div>
      <ul>
        <li>
          <strong>Separate where it matters.</strong> Each app has its own routes, render modes,
          security headers and domain, and builds and deploys on its own: one Vercel project or
          Netlify site per app.
        </li>
        <li>
          <strong>Shared where it matters.</strong> One backend package every app imports
          directly — a dashboard form and a mobile API call the same function — and one session
          system. <code>shared</code> apps accept the same login, whether it arrived as a cookie
          or a Bearer token; an <code>isolated</code> app (an admin panel) has its own; a{" "}
          <code>none</code> app has no sessions and needs no secret.
        </li>
        <li>
          <strong>One command per job.</strong> <code>devora dev</code> runs every app;{" "}
          <code>devora add &lt;name&gt;</code> adds one; <code>devora build --app=admin</code>{" "}
          builds one.
        </li>
      </ul>

      <h2>What it costs</h2>
      <ul>
        <li>
          Moving between apps is a full page load. They're separate apps; Next.js's Multi-Zones
          has the same trade-off.
        </li>
        <li>
          A browser only sends a cookie to the host that set it, so one login across{" "}
          <code>app.example.com</code> and <code>admin.example.com</code> needs{" "}
          <code>shared.sessions.cookie.domain</code>.
        </li>
        <li>
          Devora.js isn't a build orchestrator. A large or polyglot repo still wants Turborepo or
          Nx for caching and task graphs; they can sit alongside it.
        </li>
        <li>
          It's pre-1.0 with a small community. Next.js has more answers online and more
          libraries; Astro is a strong choice for content sites. The{" "}
          <a href="/compare">comparison page</a> goes through where each one is ahead.
        </li>
      </ul>

      <h2>Why it's in the framework</h2>
      <p>
        Because the shared part is where the security mistakes happen. If every app wires its own
        session handling, CSRF checks and headers, one of them gets it wrong. Here sessions are
        server-side and revocable, CSRF is checked for cookie requests, and CSP and HSTS are on
        for every app by default — the same code for every app in the project.
      </p>
      <p>
        The <a href="/multi-app-tutorial">tutorial</a> builds a three-app project like the one
        above, step by step.
      </p>
    </BlogPost>
  );
}
