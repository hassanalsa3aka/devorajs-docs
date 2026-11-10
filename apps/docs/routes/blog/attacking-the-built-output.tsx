import { BlogPost, Code, Note, postMeta } from "../../blog-post.js";

export const renderMode = "ssg";
const SLUG = "attacking-the-built-output";

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
        Before 0.4.0 we had attacks for the dev servers but none for what <code>devora start</code> serves. We wrote them:{" "}
        <code>pnpm run compare:built-security</code> builds a fixture app with Vite and with Sekhem, serves each, and runs 74 checks, each sending requests that
        should be refused or answered safely. Both builds pass. Along the way it found two problems, both fixed. There has been no third-party audit; this was
        us testing our own work.
      </p>
      <h2>What the checks cover</h2>
      <ul>
        <li>Path traversal in plain, encoded, double-encoded, backslash and null-byte forms, and files that must not be served (<code>.env</code>, <code>.git</code>, the server bundle, the config).</li>
        <li>Error output: no secret, absolute path or stack trace in a 404, an API error or a throwing loader.</li>
        <li>HTTP methods, malformed requests (conflicting <code>Content-Length</code> and <code>Transfer-Encoding</code>, bad headers, bare line feeds, invalid chunk sizes), oversized headers, URLs and bodies, and 200 half-open connections.</li>
        <li>Open redirects, header injection, forwarded-host headers and CORS.</li>
      </ul>
      <h2>What it found</h2>
      <ul>
        <li>
          <strong>Dotfiles in <code>public/</code> were published.</strong> The build copies the public folder as it is, so a <code>.env</code> or a{" "}
          <code>.git</code> folder placed there ended up in <code>dist/client</code>, was served by <code>devora start</code> and would be served by any
          adapter that publishes that folder as static files. The build now removes names that start with a dot (<code>.well-known</code> is kept) and the
          static server refuses them too. Finding H37 on the roadmap.
        </li>
        <li>
          <strong>A page answered PUT, PATCH and DELETE with the page.</strong> It now answers 405 with an <code>Allow</code> header. Finding H38. The dev servers were not changed.
        </li>
      </ul>
      <Note title="What was not verified">
        <ul>
          <li>The checks run on one fixture app on a Mac, against a local server; deployments behind a CDN or a proxy are not covered.</li>
          <li>A review by someone outside the project has not happened.</li>
          <li>Two findings from earlier (H32 and H35) are accepted by design and listed on the <a href="/roadmap">roadmap</a>.</li>
        </ul>
      </Note>
    </BlogPost>
  );
}
