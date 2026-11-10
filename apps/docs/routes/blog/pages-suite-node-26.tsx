import { BlogPost, Code, Note, postMeta } from "../../blog-post.js";

export const renderMode = "ssg";
const SLUG = "pages-suite-node-26";

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
        We ran the same three pages in Devora.js 0.4.0 and five other frameworks on Node.js 26.13.0, with Devora.js twice: once with its
        default engine, Vite 8, and once with Sekhem, our own experimental engine. This post is the result and what it does not say. The
        tables, the machine and the raw files are on the <a href="/performance">performance page</a>.
      </p>
      <h2>What was measured</h2>
      <p>
        A page that is built ahead of time, a page rendered on every request (100 items and one interactive counter), and a form that
        answers a valid post with a redirect and an empty one with an error. Every framework used its own documented production setup:
        Next.js 16.4.1, Astro 7.3.8, SvelteKit 3.0.1, React Router 8.4.0 and Nuxt 4.6.4. One Mac (Apple M5, 10 cores, 16 GB), 50 connections,
        five runs of ten seconds after a warm-up, medians. The browser steps used Google Chrome.
      </p>
      <h2>The numbers</h2>
      <div className="post-table-wrap" role="region" aria-label="Pages suite on Node 26.13.0" tabIndex={0}>
        <table className="post-table">
          <thead><tr><th scope="col">Framework</th><th scope="col">Pre-rendered, req/s</th><th scope="col">Server-rendered, req/s</th><th scope="col">Form POST, req/s</th><th scope="col">Build, cold</th><th scope="col">Idle memory</th><th scope="col">JavaScript, gzip</th></tr></thead>
          <tbody>
            <tr><th scope="row">Devora.js with Vite 8</th><td>63,126</td><td>7,599</td><td>47,428</td><td>426 ms</td><td>151 MB</td><td>45.7 kB</td></tr>
            <tr><th scope="row">Devora.js with Sekhem</th><td>63,044</td><td>7,575</td><td>47,597</td><td>342 ms</td><td>151 MB</td><td>46.5 kB</td></tr>
            <tr><th scope="row">Next.js</th><td>9,066</td><td>1,014</td><td>5,406</td><td>2.68 s</td><td>188 MB</td><td>135.2 kB</td></tr>
            <tr><th scope="row">Astro</th><td>20,167</td><td>6,381</td><td>11,515</td><td>998 ms</td><td>177 MB</td><td>69.1 kB</td></tr>
            <tr><th scope="row">SvelteKit</th><td>23,330</td><td>4,213</td><td>20,942</td><td>1.73 s</td><td>150 MB</td><td>34.2 kB</td></tr>
            <tr><th scope="row">React Router</th><td>21,505</td><td>2,339</td><td>14,419</td><td>734 ms</td><td>162 MB</td><td>111.2 kB</td></tr>
            <tr><th scope="row">Nuxt</th><td>32,107</td><td>2,169</td><td>33,340</td><td>3.50 s</td><td>158 MB</td><td>76.9 kB</td></tr>
          </tbody>
        </table>
      </div>
      <p>
        Devora.js was ahead on the three request scenarios and on build time, level with SvelteKit on idle memory (151 and 150 MB) and
        behind it on JavaScript sent to the browser (45.7 against 34.2 kB) and on start time (252 against 222 ms, both including{" "}
        <code>npm start</code>). The two Devora.js rows are equal within the run-to-run spread on requests, because both serve the same
        production code; only the build differs, and Sekhem's was faster.
      </p>
      <h2>Cold start and first byte</h2>
      <p>
        From <code>npm start</code> to the first byte of the first server-rendered page, Devora.js took 248 ms with Vite and 252 ms with Sekhem;
        SvelteKit took 241 ms. With the server warm, the median time to first byte of that page, one request at a time, was 0.55 to 0.57 ms in
        Devora.js against 0.84 to 1.90 ms for the others.
      </p>
      <Note title="What was not verified">
        <ul>
          <li>
            Opening 1,000 connections at once on this Mac makes every framework report tens of thousands of failed connections, because the
            system queue for new connections holds 128. Those columns are on the performance page with that warning; a Linux machine is the right place
            for this test and it has not been run.
          </li>
          <li>One machine. The Oracle ARM server has not run the pages suite yet.</li>
          <li>The apps are tiny, and Devora.js sends security headers on every response; the numbers include that work.</li>
          <li>Requests per second here is not the number of users an app can serve.</li>
        </ul>
      </Note>
    </BlogPost>
  );
}
