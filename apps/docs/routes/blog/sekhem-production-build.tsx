import { BlogPost, Code, Note, postMeta } from "../../blog-post.js";

export const renderMode = "ssg";
const SLUG = "sekhem-production-build";

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
        Sekhem started as a dev server. <code>devora build --engine=own</code> makes it a build too: two esbuild builds per app and then the same
        steps as the Vite build. This post is what those builds do and how we checked that the result is the same app. The full guide is on the{" "}
        <a href="/sekhem">Sekhem page</a>.
      </p>
      <h2>What the build does</h2>
      <ul>
        <li>
          <strong>Server bundle.</strong> Every route, API route, the error page and the entry are named entries with code splitting. Packages
          installed in <code>node_modules</code> stay external when the built server can load them at run time; a linked workspace package whose
          source is TypeScript is bundled. CSS gets content-hashed names and a manifest lists the stylesheets each route needs, islands included.
        </li>
        <li>
          <strong>Islands.</strong> An <code>island(() =&gt; import("./X"))</code> call gets a placeholder in the server bundle; after the browser
          bundle is built the placeholder becomes the island's hashed URL. A call in any other shape fails the build with a message.
        </li>
        <li>
          <strong>Browser bundle.</strong> The island client, client-rendered routes and each island are minified entries with hashed names; the
          public folder is copied. Dotfiles in <code>public/</code> are not published, for either engine.
        </li>
      </ul>
      <h2>The same output</h2>
      <p>
        Both engines write the same layout, so <code>devora start</code> and every adapter serve a Sekhem build and a Vite build with the same code. On
        the four example apps every route answered with the same status, headers and normalised page under both builds (41 of 41 routes), on Node 22,
        24 and 26 and with Vite 6, 7 and 8. A script of 74 request-level attacks on the built output gives the same result for both.
      </p>
      <h2>Numbers</h2>
      <p>
        Four apps built in 0.57 s with Sekhem against 0.73 s with Vite 8, in 232 MB of peak memory against 395 MB, and the output was 9.4 MB against
        18.5 MB (Mac, Node 26.13.0, medians of five runs). On the pages-suite app, 342 against 426 ms.
      </p>
      <Note title="What Sekhem's build does not do">
        <ul>
          <li>No source maps, no <code>VITE_</code> variables in browser code, no PostCSS, Sass or Less, and no Vite plugins; Sekhem does not read <code>vite.config.ts</code> beyond a literal <code>publicDir</code> and warns about what it ignores.</li>
          <li>It needs Node 22.15 or later, and until <code>@devorajs/sekhem</code> is published it runs from a checkout of the repository.</li>
          <li>Built islands have not been checked in a browser by a script of their own, and Windows and Linux are untested.</li>
        </ul>
      </Note>
    </BlogPost>
  );
}
