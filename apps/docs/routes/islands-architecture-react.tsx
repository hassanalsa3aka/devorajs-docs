import { PageShell } from "@devorajs/core";
import { DOCS_NAV } from "../nav.js";
import { SiteFooter } from "../site-footer.js";
import { DocsLayout, Callout } from "../docs-layout.js";
import { pageMeta } from "../seo.js";

export const renderMode = "ssg";

export function meta() {
  return pageMeta("/islands-architecture-react", {
    title: "Islands architecture in React",
    fullTitle: "Islands architecture in React with Devora.js",
    description:
      "How islands work in Devora.js: pages are server-rendered HTML and only components marked with island() hydrate in the browser. Syntax, rules, limits.",
  });
}

export async function loader() {
  return {};
}

export default function IslandsArchitectureReact() {
  return (
    <PageShell nav={DOCS_NAV} footer={<SiteFooter />}>
      <DocsLayout active="islands-architecture-react">
        <h1>Islands architecture in React</h1>
        <p>
          In an islands architecture the page is mostly plain HTML, and small interactive
          components, the islands, are the only parts that run JavaScript in the browser. In
          Devora.js the rest of a page is rendered on the server (or at build time) and, in every render mode except
          <code>csr</code>, is never hydrated; you choose the islands one by one.
        </p>

        <h2>Marking an island</h2>
        <div className="devora-card">
          <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
{`import { island, Island } from "@devorajs/core";

const LikeButton = island(() => import("../components/LikeButton"));

export default function Post({ data }) {
  return (
    <article>
      <h1>{data.title}</h1>
      <p>{data.body}</p>
      <Island component={LikeButton} props={{ postId: data.id, initial: data.likes }} />
    </article>
  );
}`}
          </pre>
        </div>
        <p>
          <code>LikeButton</code> is an ordinary React component with a default export. It is
          rendered to HTML on the server, so the page has real content before any script runs.
          The server wraps that HTML in an element carrying the island's props, and a small script
          then calls React's <code>hydrateRoot</code> on it.
        </p>

        <h2>The rules</h2>
        <ul>
          <li>
            <strong>Literal call shape.</strong> Only <code>island(() =&gt; import("./path"))</code>{" "}
            is recognized, because the build has to know which file to ship to the browser. A
            computed path or <code>island(loader)</code> stops <code>devora dev</code> and{" "}
            <code>devora build</code> with the file and line, rather than shipping an island that
            never hydrates.
          </li>
          <li>
            <strong>Serializable props.</strong> Props are written into the HTML as JSON, so pass
            plain data, not functions, class instances or React elements.
          </li>
          <li>
            <strong>Islands can live anywhere the app imports</strong>, including shared components
            and workspace packages.
          </li>
          <li>
            <strong>No script without islands.</strong> The hydration script is only added to a
            page that rendered at least one island. The JavaScript each framework sends for the same pages is measured on <a href="/performance">Performance</a>.
          </li>
          <li>
            <strong>Each island is its own React root.</strong> Islands do not share React state or
            context with each other or with the server-rendered page. Share state through props,
            the URL, or your own client-side store.
          </li>
          <li>
            <strong>Hydration starts when the page loads.</strong> There is no "hydrate when
            visible" or "when idle" option today.
          </li>
        </ul>

        <h2>Islands, client-only and streaming</h2>
        <p>
          <code>clientOnly(() =&gt; import("./Widget"))</code> is for a component that must never
          run on the server (it touches <code>window</code> at import time, say): it renders
          nothing server-side. With <code>renderMode = "streaming"</code>, an island's content is
          patched into the page when its import resolves, so a slow island does not hold the
          page back. Both are covered on <a href="/render-modes">Render modes</a>.
        </p>

        <Callout kind="info" title="Scope">
          <p>
            Islands are a React-only feature of Devora.js, working with its own render modes. They
            are not a drop-in for Astro's island directives or for React Server Components, which
            Devora.js does not implement. Compare the approaches on <a href="/compare">Compare</a>.
          </p>
        </Callout>

        <p>
          Reference: <a href="/api-reference">API reference → Islands &amp; client-only</a>.
        </p>
      </DocsLayout>
    </PageShell>
  );
}
