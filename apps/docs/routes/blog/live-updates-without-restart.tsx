import { BlogPost, Code, Note, postMeta } from "../../blog-post.js";

export const renderMode = "ssg";
const SLUG = "live-updates-without-restart";

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
        A dev server earns its keep on the edit loop. This post lists what happens to a running <code>devora dev</code> when you change
        a file with the experimental Sekhem engine, and which changes still restart it.
      </p>
      <h2>Applied without a restart</h2>
      <p>
        Each of these is covered by a test that edits a file in a running server and fetches the page again: editing a route in ssr, csr,
        ssg, isr or streaming mode; adding a route file and removing it; changing a route's render mode; editing an island (the module the
        browser loads and the server-rendered page); editing, adding and removing an API route; and editing a module outside the app, such
        as a shared package. Hot updates reach the browser over a WebSocket on 127.0.0.1 with an Origin check and a per-launch token, and a
        component change showed in the page after 32 to 33 ms in our measurements, the same as Vite with its file watcher tuned and about
        five times faster than Vite's default settings (about 160 ms).
      </p>
      <h2>Restarts itself, and says why</h2>
      <p>
        Changes to <code>devora.config.ts</code>, <code>app.config.ts</code> and the <code>.env</code> files restart the dev server by itself and print
        the reason, because those files are read once at start. The same is true with the Vite engine.
      </p>
      <Note title="What was not verified">
        <ul>
          <li>Middleware and backend package edits go through the same module invalidation but have no test of their own.</li>
          <li>Measured on one Mac with a small app; a 1000-module app applied a server-side edit in 17 ms, the same as tuned Vite 8 within the run-to-run spread.</li>
          <li>The browser side of hot updates was checked by a script driving Chrome, not on other browsers.</li>
        </ul>
      </Note>

    </BlogPost>
  );
}
