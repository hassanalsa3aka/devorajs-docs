import { BlogPost, Code, Note, postMeta } from "../../blog-post.js";

export const renderMode = "ssg";
const SLUG = "devora-performance-measured";

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
        We measured Devora.js next to other frameworks on two machines and four versions of Node. This post is about what we did and what
        the numbers do and do not say. Every table, the hardware and the raw files are on the{" "}
        <a href="/performance">performance page</a> and in <code>benchmarks/results/</code> in the repository. The numbers below are the first run, on Node 22; the pages, builds and memory were measured again on Node 26.13.0 and are in{" "}
        <a href="/blog/pages-suite-node-26">Pages, builds and memory on Node 26.13.0</a>.
      </p>

      <h2>What we ran</h2>
      <ul>
        <li>
          <strong>Request scenarios</strong>: one API in eleven apps (Devora.js with Vite, Devora.js with our own engine Sekhem,
          Express, Fastify, Hono, two NestJS setups, Next.js, SvelteKit, React Router, Astro): a JSON list of 100 items, an authenticated
          GET, a valid POST, an invalid POST and one async step. Production builds, a fresh server per round, 50 connections,
          five rounds of 10 seconds after a 5 second warm-up, rounds alternating between the apps, medians with the minimum and maximum.
        </li>
        <li>
          <strong>Build time and memory</strong> of the four example apps with Vite 6, 7 and 8 and with Sekhem, on Node 20, 22, 24 and 26.
        </li>
        <li>
          <strong>Dev server</strong>: start, first page, interactive page, hot update and idle CPU, for Sekhem and for Vite with default
          and tuned file watching.
        </li>
        <li>
          <strong>Two machines</strong>, reported separately: a Mac (Apple M5, 10 cores, 16 GB) and a small ARM cloud server
          (Neoverse-N1, 2 CPUs, 12 GB, Ubuntu 24.04), where the load generator shares the two CPUs with the server.
        </li>
      </ul>

      <h2>What the numbers say</h2>
      <p>
        On the Mac with Node 22 the JSON list ran at 27,208 requests a second in Devora.js, against 12,204 for Express, 5,095 for Next.js,
        16,661 for SvelteKit, 34,250 for Fastify and 33,399 for Hono. So Devora.js is ahead of Express, Next.js, SvelteKit, Astro and
        React Router on that page, and behind Fastify and Hono, whose ranges lie above its own. On the authenticated GET Fastify and Hono
        answered about 70,000 requests a second against 41,098. For the one async step the ranges of Devora.js, Fastify and Hono overlap,
        which we call a tie. A likely reason for the gap to the two lightest servers is the work Devora.js does by default on every
        request (host check, security headers, sessions, CSRF); we did not measure it switched off, so that is a guess.
      </p>
      <p>
        The Node version moves the ranking. With Node 24 on the same Mac Express reached 28,500 requests a second on the JSON list and
        51,431 on the authenticated GET, level with or ahead of Devora.js there (28,652 and 44,900). On the small ARM server Devora.js
        answered 6,091 on the JSON list on Node 22, against 3,232 for Express and 1,037 for Next.js; the numbers on the two machines are
        not comparable with each other. The two Devora.js rows, one for each engine, are equal within the run-to-run spread, because they
        serve the same production code; only the build differs.
      </p>
      <p>
        A newer Node was faster for builds in our runs: Node 24 and 26 built the four apps 12% and 14% faster than Node 22 with Vite 6
        (the five-run ranges overlap slightly) and 7% and 10% faster with Sekhem (they do not overlap).
      </p>

      <h2>Where the measurement was wrong, and how we found out</h2>
      <p>
        Two results changed when we looked at them again. The dev server's idle CPU first read 0.8 to 1.0% for Sekhem against 0.0 to 0.8% for Vite on
        some Node versions; the window had opened right after the last edit and counted recompilation. With a 15 second settle both are
        0.1%. And the first memory number for the build of Sekhem (103 MB against 411 MB for Vite 6) left out the native esbuild process; we
        now sample the whole process tree, and the gap is smaller (218 MB against 511 MB). A harness problem cost us a rerun on the
        small server too: Next.js kept its port for over a minute after being asked to stop, so the harness now ends a server that has
        not let go after three seconds.
      </p>

      <Note title="What this does not show">
        <ul>
          <li>The Mac's one-minute load average was 5.25 when the Node 22 run started, from earlier work. The server had an idle Ollama service running and a load average of 0.5 to 1.7 during its runs.</li>
          <li>One machine of each kind, one day, small pages and a small API. Real apps spend their time in their own data access.</li>
          <li>Not measured: Nuxt (we have no app for this API), Bun, Node 20 for the request scenarios, SSR pages, static files, streaming, ISR hits, CRUD and WebSocket scenarios, install times.</li>
        </ul>
      </Note>

      <p>
        To run it yourself: <code>node benchmarks/setup-devora-local.mjs</code>, then <code>node benchmarks/run-backend.mjs</code> in the
        repository, and <code>node benchmarks/report-engines.mjs</code> for the tables.
      </p>

    </BlogPost>
  );
}
