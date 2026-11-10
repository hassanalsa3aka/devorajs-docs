import { BlogPost, Code, Note, postMeta } from "../../blog-post.js";

export const renderMode = "ssg";
const SLUG = "vite-or-sekhem";

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
        Devora.js 0.4.0 has two engines for <code>devora dev</code> and <code>devora build</code>. Vite 8 is the default and stays stable. Sekhem is ours,
        experimental and opt-in. This is how to choose, and how to switch.
      </p>
      <h2>Choosing</h2>
      <div className="post-table-wrap" role="region" aria-label="Vite or Sekhem" tabIndex={0}>
        <table className="post-table">
          <thead><tr><th scope="col">You need</th><th scope="col">Use</th></tr></thead>
          <tbody>
            <tr><td>Vite plugins, <code>resolve.alias</code>, <code>define</code>, a dev proxy</td><td>Vite</td></tr>
            <tr><td>PostCSS, Tailwind, Sass or Less</td><td>Vite</td></tr>
            <tr><td><code>VITE_</code> variables in browser code, or source maps in the production build</td><td>Vite</td></tr>
            <tr><td><code>--host</code> or HTTPS in dev, or Windows and Linux</td><td>Vite</td></tr>
            <tr><td>A project with no Vite dependency, a shorter dev start and a smaller build</td><td>Sekhem</td></tr>
          </tbody>
        </table>
      </div>
      <h2>Switching</h2>
      <Code label="devora.config.ts">{`export default defineProject({
  engine: "own", // "vite" (default) or "own" (Sekhem)
  apps: [/* ... */],
  shared: { /* ... */ },
});`}</Code>
      <Code label="Per command, and for a new project">{`devora dev --engine=own
devora build --engine=own
npx create-devora my-app --engine=own`}</Code>
      <p>
        The flag wins over the file, and an unknown engine name is an error: Devora.js never falls back to the other engine silently. Sekhem needs
        Node 22.15 or later and says so on older Node; the Vite engine is not affected.
      </p>
      <h2>What you get</h2>
      <p>
        On the Mac with Node 26.13.0, Sekhem's dev server was ready in 289 ms against 499 ms for Vite 8, showed a component edit after 33 ms (Vite with
        its file watcher tuned also took 33 ms; with its default settings 133 ms), and used 125 MB against 271 MB. A server-side edit applied in 6 ms
        against 7 ms, which is a tie. The production build was faster and smaller (see <a href="/blog/sekhem-production-build">the build post</a>).
      </p>
      <Note title="What was not verified">
        <ul>
          <li>One Mac, small apps. The Oracle ARM server has run the build and request scenarios, not every measurement above.</li>
          <li>Sekhem is not audited by anyone outside the project. It binds to the loopback address only and checks Host, Origin and a per-launch token.</li>
        </ul>
      </Note>
    </BlogPost>
  );
}
