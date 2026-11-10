import { BlogPost, Code, Note, postMeta } from "../../blog-post.js";

export const renderMode = "ssg";
const SLUG = "node-matrix-0-4-0";

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
        Devora.js 0.4.0 was checked on four Node.js lines, with three Vite majors and the new Sekhem engine. This post is the matrix, what it
        found, and what we recommend. The matrix ran on one Mac (Apple M5) on 9 November 2026 and the numbers were measured again with Node 26.13.0 on 10 November; nothing here is a claim about other machines.
      </p>
      <h2>The matrix</h2>
      <div className="post-table-wrap" role="region" aria-label="Node and engine matrix" tabIndex={0}>
        <table className="post-table">
          <thead><tr><th scope="col">Check</th><th scope="col">Node 20.20</th><th scope="col">Node 22.23</th><th scope="col">Node 24.22</th><th scope="col">Node 26.13</th></tr></thead>
          <tbody>
            <tr><th scope="row">Full test suite</th><td>pass (Sekhem's loader tests skipped)</td><td>pass</td><td>pass</td><td>pass</td></tr>
            <tr><th scope="row">Four apps, Vite 6, build and serve</th><td>pass</td><td>pass</td><td>pass</td><td>pass</td></tr>
            <tr><th scope="row">Vite 7 and 8, build and dev</th><td>not run</td><td>pass</td><td>pass</td><td>pass</td></tr>
            <tr><th scope="row">Sekhem, same pages as Vite</th><td>refuses (needs 22.15)</td><td>41 of 41 routes</td><td>41 of 41</td><td>41 of 41</td></tr>
          </tbody>
        </table>
      </div>
      <h2>Does a newer Node help?</h2>
      <p>
        Builds were faster on newer Node. Four apps with Vite 6 took 1.64 s on Node 22, 1.44 s on Node 24 and 1.42 s on Node 26 (medians of
        five runs; the Node 22 and 24 ranges overlap slightly). Sekhem took 0.62, 0.58 and 0.56 s. Request throughput moved more: with Node 24
        Express reached 28,500 requests a second on the JSON list on this Mac where it reached 12,204 with Node 22, so a ranking of
        frameworks can change with the Node version alone.
      </p>
      <h2>What we recommend</h2>
      <ul>
        <li>Use Node 22 or later. Node 20 is end of life upstream; it still ran the Vite engine in our checks, but we will stop promising it.</li>
        <li>Sekhem needs Node 22.15 or later and says so on older Node.</li>
        <li>The Dockerfile and the CI jobs now use Node 26 (<code>node:26-slim</code>, pnpm installed with <code>npm install --global pnpm@9.9.0</code> because Node 26 no longer ships corepack). No image has been built from it yet.</li>
      </ul>
      <Note title="What was not verified">
        <ul>
          <li>Vite 8.3.7 is now the declared Vite. Vite 6 and 7 were checked through a folder or a loader override, not as the declared dependency.</li>
          <li>Node 20 with Vite 7 and 8; Windows and Linux; npm and Yarn on Node 24 and 26.</li>
          <li>A Node.js security release is announced for 11 November 2026; the matrix has to be run again after it.</li>
        </ul>
      </Note>

    </BlogPost>
  );
}
