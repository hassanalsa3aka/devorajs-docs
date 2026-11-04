import { PageShell } from "@devorajs/core";
import { DOCS_NAV } from "../nav.js";
import { SiteFooter } from "../site-footer.js";
import { DocsLayout, Callout } from "../docs-layout.js";
import { pageMeta } from "../seo.js";

export const renderMode = "ssg";

export function meta() {
  return pageMeta("/nextjs-alternative-multi-app", {
    title: "Next.js alternative for multi-app projects",
    fullTitle: "Next.js alternative for multi-app projects — Devora.js",
    description:
      "When Devora.js fits better than Next.js for several apps that share a backend and a login, and when Next.js, Multi-Zones or Turborepo is the better choice.",
  });
}

export async function loader() {
  return {};
}

export default function NextjsAlternativeMultiApp() {
  return (
    <PageShell nav={DOCS_NAV} footer={<SiteFooter />}>
      <DocsLayout active="nextjs-alternative-multi-app">
        <h1>Next.js alternative for multi-app projects</h1>
        <p>
          Devora.js is not a general replacement for Next.js, and it does not try to be. It is
          worth a look for one situation: a product made of several apps (a marketing site, the
          product, an admin panel) that should share one backend and one login and still deploy
          separately. For a single app, or if you need the largest ecosystem, Next.js is the safer
          choice.
        </p>

        <h2>How the multi-app case is handled in each</h2>
        <p>
          The facts below were checked against each project's documentation and the installed
          Devora.js source on October 16, 2026; the full tables are on <a href="/compare#multi-app">Compare</a>.
        </p>
        <div className="docs-table-wrap">
          <table>
            <thead>
              <tr><th></th><th>Next.js (Multi-Zones)</th><th>Devora.js</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>Several apps</td>
                <td>Separately deployed apps served under one domain, routed by rewrites</td>
                <td>One <code>devora.config.ts</code> lists the apps; each deploys separately, on its own domain</td>
              </tr>
              <tr>
                <td>Shared backend</td>
                <td>Each zone has its own Route Handlers; you share code as a package</td>
                <td>One <code>packages/backend</code> by default, imported by every app</td>
              </tr>
              <tr>
                <td>One login</td>
                <td>No sessions built in; zones share a domain, so a cookie-based auth library carries across</td>
                <td>Every <code>shared</code> app accepts the same session; <code>cookie.domain</code> shares the browser login across subdomains</td>
              </tr>
              <tr>
                <td>Moving between apps</td>
                <td>Hard navigation between zones, soft within one</td>
                <td>Full page load (separate apps)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          One difference worth stating plainly: Multi-Zones puts everything under one domain, which
          gives you cookie sharing for free. Devora.js apps live on their own domains, and share the
          login across subdomains only when you set <code>shared.sessions.cookie.domain</code>. See{" "}
          <a href="/share-login-across-apps">One login across several apps</a>.
        </p>

        <h2>What you give up</h2>
        <ul>
          <li>Devora.js is pre-1.0, and its community and ecosystem are small next to Next.js.</li>
          <li>
            No React Server Components protocol, and no built-in ORM, auth provider or file storage.
            You bring your own.
          </li>
          <li>
            WebSockets and background jobs are documented patterns, not built-ins:{" "}
            <a href="/live-updates">Live updates</a>, <a href="/background-jobs">Background jobs</a>.
          </li>
          <li>The list of known limits is on <a href="/compare#limitations">Compare</a>.</li>
        </ul>

        <h2>When to stay on Next.js</h2>
        <ul>
          <li>You have one app, or the apps fit comfortably under one domain with rewrites.</li>
          <li>You rely on its ecosystem, hosting integrations or Server Components.</li>
          <li>
            You need build caching and task orchestration across many packages. That is Turborepo
            or Nx, and they can be used with Devora.js as well.
          </li>
        </ul>

        <Callout kind="tip" title="Try it without moving anything">
          <p>
            <a href="/multi-app-tutorial">Build a multi-app project</a> takes a few minutes and
            runs locally. Speed numbers against Next.js and others, with how they were measured and
            their limits, are on <a href="/performance">Performance</a>.
          </p>
        </Callout>
      </DocsLayout>
    </PageShell>
  );
}
