import { PageShell } from "@devorajs/core";
import { DOCS_NAV } from "../nav.js";

export const renderMode = "ssg";

export function meta() {
  return {
    title: "Render modes",
    description: "ssr, ssg, csr, and isr explained with code examples — streaming is deferred to v2.",
  };
}

export async function loader() {
  return {};
}

export default function RenderModes() {
  return (
    <PageShell nav={DOCS_NAV}>
      <h1>Render modes</h1>
      <p>
        Every route declares how it renders, explicitly, with a <code>renderMode</code> export. A
        route that exports nothing inherits its app's <code>defaultRenderMode</code> from{" "}
        <code>app.config.ts</code> (which itself defaults to <code>ssr</code>). Nothing is chosen
        for you based on file location or data-fetching patterns.
      </p>

      <h2>ssr — server-rendered per request</h2>
      <p>The default. The route's <code>loader</code> runs on every request, and the page is rendered fresh each time.</p>
      <div className="devora-card">
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
{`export const renderMode = "ssr";

export async function loader() {
  return { renderedAt: new Date().toISOString() };
}

export default function Page({ data }) {
  return <p>Rendered at: {data.renderedAt}</p>;
}`}
        </pre>
      </div>

      <h2>ssg — pre-rendered at build time</h2>
      <p>
        The route is rendered once during <code>devora build</code> and served as static HTML from
        then on. Good for content that doesn't change per request — this docs site itself uses{" "}
        <code>ssg</code> for every page, since there's no login and content only needs to render
        once to be cached.
      </p>
      <div className="devora-card">
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
{`export const renderMode = "ssg";

export async function loader() {
  return {};
}

export default function AboutPage() {
  return <p>This page was rendered once, at build time.</p>;
}`}
        </pre>
      </div>
      <p>In dev, <code>ssg</code> (and <code>isr</code>) routes still render live per request, for a faster edit loop — the build-time pre-render only applies to <code>devora build</code> output.</p>

      <h2>csr — client-only</h2>
      <p>
        The server sends a minimal shell with no content; the route's actual component only mounts
        once a small client bootstrap script imports and renders it in the browser. No{" "}
        <code>loader</code> ever runs for a <code>csr</code> route.
      </p>
      <div className="devora-card">
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
{`import { PageShell } from "@devorajs/core/client";
// note the /client subpath — a csr route is bundled for the browser too,
// and the main @devorajs/core entry pulls in server-only code (node:crypto,
// node:fs) that can't bundle for a browser target.

export const renderMode = ${'"'}csr${'"'};

export default function CsrDemo() {
  return <p>Mounted client-side at: {new Date().toISOString()}</p>;
}`}
        </pre>
      </div>

      <h2>isr — static with scheduled revalidation</h2>
      <p>
        Like <code>ssg</code>, but the pre-rendered page is regenerated once a{" "}
        <code>revalidate</code> window passes (or on a manual <code>revalidatePath()</code> call).
        The revalidation trigger is explicit and declared in the route file, not a hidden
        multi-layer cache.
      </p>
      <div className="devora-card">
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
{`export const renderMode = "isr";
export const revalidate = { seconds: 3600 };

export async function loader() {
  return { renderedAt: new Date().toISOString() };
}

export default function IsrPage({ data }) {
  return <p>Rendered at: {data.renderedAt}</p>;
}`}
        </pre>
      </div>
      <p>
        Ongoing revalidation is fully reliable under a long-lived Node process (self-hosted or
        Docker). On a serverless platform (Vercel/Netlify), a function's filesystem isn't
        guaranteed to persist or be shared across invocations, so the initial build's static
        content still serves correctly but ongoing regeneration there is comparatively less
        battle-tested — worth confirming for your own workload if you lean heavily on <code>isr</code>{" "}
        in a serverless deployment.
      </p>

      <h2>streaming — deferred to v2</h2>
      <p>
        A <code>streaming</code> mode (chunked SSR that doesn't block on slow data) is part of the
        design but not implemented in v1 — routes that declare it don't currently render. It's
        deferred rather than dropped: the island hydration mechanism v1 does ship assumes a
        synchronous render pass, which is incompatible with React's streaming APIs, and needs a
        Suspense-boundary-based rewrite first.
      </p>

      <h2>Islands and client-only components</h2>
      <p>
        Independent of render mode, an individual component can opt into island hydration —{" "}
        <code>island(() =&gt; import("./ThreeScene"))</code> — so only that component hydrates on
        the client while the rest of an SSR/SSG/ISR page stays static HTML. A component that must
        never run on the server at all (touches <code>window</code> at module scope, say) uses{" "}
        <code>clientOnly(() =&gt; import("./Widget"))</code> instead, which renders nothing
        server-side and only resolves in a real browser.
      </p>
    </PageShell>
  );
}
