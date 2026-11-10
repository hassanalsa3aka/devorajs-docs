import { BlogPost, Code, Note, postMeta } from "../../blog-post.js";

export const renderMode = "ssg";
const SLUG = "sekhem-experimental-engine";

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
        Devora.js has always run its dev server and its build on Vite. This week we added a second engine, called Sekhem, that does
        not use Vite at all. Vite is still the default and nothing changes unless you ask for Sekhem. This post says what Sekhem is,
        how to try it, what was measured and what does not work yet.
      </p>

      <h2>What Sekhem is</h2>
      <p>
        An engine built on esbuild and our own code: a dev server with React Fast Refresh and hot updates, and a production build with
        code splitting, CSS, assets, islands and the server bundle. It is one package, <code>@devorajs/sekhem</code>, which builds and
        passes the pack check but is not published yet, so for now it runs from a checkout of the repository. It needs Node 22.15 or
        later and refuses older Node with a message.
      </p>
      <Code label="Turning it on">{`// devora.config.ts
export default defineProject({ engine: "own", /* apps, shared */ });

devora dev --engine=own
devora build --engine=own
npx create-devora my-app --engine=own`}</Code>

      <h2>Does it build the same thing?</h2>
      <p>
        We built the four example apps of the repository with Vite and with Sekhem, served each with <code>devora start</code>, and
        compared every route: status, selected headers, cookie names, redirect targets and the HTML once script tags, nonces and
        tokens were removed. 41 of 41 routes were identical, and every asset a page refers to answered 200. The same result held with
        Vite 6, 7 and 8 as the Vite side, on Node 22, 24 and 26. Sekhem also builds with the Vite packages blocked: a script runs dev,
        build and start with any attempt to load Vite throwing, and it passes.
      </p>

      <h2>How long does it take?</h2>
      <p>
        Build time for the four apps together, median of five runs on one Mac (Apple M5), Node 22.23.4: Sekhem 0.62 s, Vite 8 1.11 s,
        Vite 6 1.64 s, Vite 7 1.84 s. Peak memory of the whole build process tree was 218 MB for Sekhem and 478 to 511 MB for the Vite
        builds. On a small ARM server (2 CPUs) the same build took 1.44 s with Sekhem and 4.87 s with Vite 6. In the dev server, a small
        app's first interactive page took about 170 ms warm with Sekhem against about 370 ms with Vite 6, and a change to a component
        showed after 32 ms with both Sekhem and Vite with its file watcher tuned (about 160 ms with Vite's default settings). The
        output of Sekhem's build is about half the size of Vite's (9.7 MB against 18.9 MB for the four apps); we have not yet looked into
        why. The tables, hardware and method are on the <a href="/performance#build-by-node">performance page</a>.
      </p>
      <p>
        Two things we first read as losses were not. The idle CPU of the dev server looked higher than Vite's until we noticed the
        measurement window opened right after the last edit; once the server settles, both idle at 0.1%. And the time to apply a server
        edit in a 1000-module app was 17 ms for Sekhem against 17 ms for Vite 8 with its watcher tuned: a tie.
      </p>

      <h2>Changes that apply without a restart</h2>
      <p>
        With Sekhem these show up in the next request, each with a test: editing a route in ssr, csr, ssg, isr or streaming mode, adding
        or removing a route, changing a route's render mode, editing an island, editing, adding or removing an API route, and editing a
        module outside the app. Editing <code>devora.config.ts</code>, <code>app.config.ts</code> or <code>.env</code> restarts{" "}
        <code>devora dev</code> by itself and prints the reason.
      </p>

      <Note title="What does not work, and what was not verified">
        <ul>
          <li>No Vite plugins, PostCSS or Sass, no <code>VITE_</code> variables in browser code, no source maps in the build, no HTTPS or <code>--host</code> in dev.</li>
          <li>Small images are not inlined as data URIs the way Vite inlines them.</li>
          <li>The built islands were not checked hydrating in a browser. Request-level attacks against the built output were not run. Nobody outside the project has reviewed it.</li>
          <li>Node 20 and the Vite 7 and 8 combinations on Node 20 were not run for Sekhem (it needs 22.15).</li>
        </ul>
      </Note>

      <p>
        The engine page, <a href="/engines">Engines: Vite and Sekhem</a>, keeps the current list of what is supported and tested. If you
        try it, the roadmap says where to report what broke.
      </p>

    </BlogPost>
  );
}
