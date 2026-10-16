import { BlogPost, Code, Note, postMeta } from "../../blog-post.js";

export const renderMode = "ssg";
const SLUG = "devora-0-3-4";

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
        0.3.4 is the release after 0.3.2. There is no 0.3.3 on npm: it was prepared and never published, and
        its changes are part of 0.3.4 (the{" "}
        <a href="https://github.com/hassanalsa3aka/devora.js/blob/main/CHANGELOG.md#034--2026-10-16">CHANGELOG</a>{" "}
        says so). <code>@devorajs/core</code> and <code>@devorajs/cli</code> are 0.3.4,{" "}
        <code>@devorajs/adapter-netlify</code> is 0.2.4, and <code>create-devora</code> stayed at 0.3.2 but now
        pins <code>^0.3.4</code>.
      </p>

      <h2>Catch-all routes</h2>
      <p>
        A file named <code>[...slug].tsx</code> matches one or more segments; <code>[[...slug]].tsx</code> also
        matches none. Both work for pages and for API routes. <code>ctx.params.slug</code> is the segments
        joined with <code>/</code> and is still a <code>string</code>, so code written for <code>[id]</code>{" "}
        routes compiles unchanged; <code>ctx.catchAll.slug</code> (or <code>req.catchAll.slug</code> in an API
        route) is the <code>string[]</code>.
      </p>
      <Code label="A catch-all page route">{`// apps/marketing/routes/docs/[...slug].tsx
import type { RequestContext } from "@devorajs/core";
import { PageShell } from "@devorajs/core";

export const renderMode = "ssg";

export function getStaticParams() {
  return [{ slug: ["intro"] }, { slug: ["guide", "setup"] }];
}

export function loader(ctx: RequestContext) {
  return { path: ctx.params.slug, segments: ctx.catchAll.slug };
}

export default function Docs({ data }: { data?: { path: string; segments: string[] } }) {
  return (
    <PageShell appName="marketing">
      <h1>/docs/{data?.path}</h1>
      <p>{data?.segments.length} segment(s): {data?.segments.join(" > ")}</p>
    </PageShell>
  );
}`}</Code>
      <Code label="A catch-all API route">{`// apps/marketing/endpoints/files/[...path].ts
import { apiRoute } from "@devorajs/core";

export const methods = ["GET"];
export const handler = apiRoute((req) => ({
  status: 200,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ path: req.params.path, segments: req.catchAll.path }),
}));`}</Code>
      <p>
        Both files were built and served with <code>devora build</code> and <code>devora start</code> on the
        published 0.3.5 packages (catch-all routes have been there since 0.3.4; this was not re-run on 0.3.4
        itself), with <code>sitemap: true</code> in the app's <code>app.config.ts</code>. The build printed{" "}
        <code>pre-rendered (ssg/isr): /docs/intro, /docs/guide/setup</code>. Requests returned:
      </p>
      <Code label="Requests and answers">{`GET /docs/intro          200
GET /docs/guide/setup    200   <h1>/docs/guide/setup</h1>  2 segment(s): guide > setup
GET /docs                404   (a catch-all needs at least one segment; [[...slug]] would match)
GET /docs/other/page     404   (not in getStaticParams(), so never rendered)
GET /api/files/a/b/c     200   {"path":"a/b/c","segments":["a","b","c"]}
GET /api/files           404   (JSON)
sitemap.xml lists        /docs/guide/setup and /docs/intro`}</Code>
      <p>
        The rules, from the <a href="https://github.com/hassanalsa3aka/devora.js/blob/main/docs/guides/PAGES.md">pages
        guide</a>: a static file wins over <code>[param]</code>, which wins over <code>[...slug]</code>; the
        catch-all must be the last segment; each segment is URL-decoded once, and a segment that is empty,{" "}
        <code>.</code>, <code>..</code>, or contains <code>/</code>, <code>\</code> or NUL (including as{" "}
        <code>%2F</code>, <code>%5C</code>, <code>%00</code>) never matches. A dot in a URL is no longer taken for
        a file: <code>/docs/v1.2/intro</code> reaches the catch-all unless a real file exists at that path.
      </p>

      <h2>A faster static path</h2>
      <p>
        <code>devora start</code> and the adapters now keep pre-rendered pages and built files in memory (64 MB
        in total, 2 MB per file; larger files are streamed from disk), check them against the disk at most once a
        second so a rebuild shows up without a restart, and send strong ETags (a repeat visit gets a 304),{" "}
        <code>HEAD</code>, <code>Content-Length</code>, and brotli or gzip for text types. The route table and the
        module imports are memoized instead of being worked out on every request. Content types are correct for
        <code> .xml</code>, <code>.webmanifest</code>, fonts, <code>.avif</code>, <code>.pdf</code>,{" "}
        <code>.wasm</code> and more.
      </p>
      <p>
        On the benchmark's tiny pre-rendered page, on one machine, that took the page from about 14,700 requests
        per second on 0.3.2 to between 71,000 and 82,000 in two full runs on 0.3.4. Astro, SvelteKit and React
        Router measured about 36,000 to 38,000 on the same page. The page is a few hundred bytes and the load tool
        runs on the same machine, so this mostly measures the HTTP layer.
      </p>

      <h2>What an existing app has to check</h2>
      <p>The CHANGELOG lists these as behavior changes, with what to do:</p>
      <ul>
        <li>A file named <code>[...name].tsx</code> used to be a single <code>[param]</code> whose name started with dots; it is now a catch-all. Rename it if you did not mean that.</li>
        <li><code>getStaticParams()</code> values are percent-encoded in the output path. Nothing to do unless you read <code>dist/static</code> by hand.</li>
        <li><code>sitemap.xml</code> lists the URLs of dynamic routes that export <code>getStaticParams()</code>.</li>
        <li>
          <code>devora start</code> answers any method other than GET and HEAD to a public file, a built asset
          or a pre-rendered page with 405 and <code>Allow: GET, HEAD</code>. A form that posted to a
          pre-rendered page never ran an action there; post to an <code>ssr</code> route.
        </li>
        <li>With <code>sitemap</code> off, a hand-written <code>public/sitemap.xml</code> is now served; it used to 404 in production.</li>
      </ul>
      <p>The full table is on <a href="/upgrading">Upgrading</a>.</p>

      <Note title="What was not verified">
        <ul>
          <li>No live Vercel or Netlify deployment of 0.3.4. The generated functions were run outside the monorepo only.</li>
          <li>The 0.3.4 benchmark figures are from one machine; <a href="/blog/devora-0-3-5">the 0.3.5 post</a> has the newer numbers and their spread.</li>
        </ul>
      </Note>
    </BlogPost>
  );
}
