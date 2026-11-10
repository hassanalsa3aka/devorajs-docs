import { BlogPost, Code, Note, postMeta } from "../../blog-post.js";

export const renderMode = "ssg";
const SLUG = "desktop-experimental";

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
        Devora.js 0.4.0 adds an experimental desktop target: the same app you already have, in a native window. This post says how it
        works, what was checked, and what is missing. It is off unless you pass <code>--experimental</code>.
      </p>
      <h2>How it works</h2>
      <p>
        <code>devora desktop dev --experimental</code> builds the app, writes a Tauri 2 project next to it and runs it with Cargo. The
        shell picks a free port on 127.0.0.1, creates a token for this launch, starts the app's server as a child process (the token goes
        in the environment, never on a command line) and opens one window once the server answers. The window may load only that
        origin, every request carries the token, external links open in the system browser, no command from the page into the shell is
        allowed unless you list it, and the server stops when the window closes or when the shell dies.
      </p>
      <Code label="Try it">{`devora desktop dev --experimental
devora desktop build --experimental   # writes the Tauri project; building the window needs Rust`}</Code>
      <h2>What was checked</h2>
      <p>
        On a Mac with Rust installed, an automated check builds the shell, opens the real window and has the page report back to the
        script (<code>pnpm run check:desktop-window</code>). The logo is the app icon, and the window is titled Devora.js. Nobody has clicked
        through the ten-item checklist in <code>examples/desktop-app</code> by hand for this post.
      </p>
      <Note title="What is not there">
        <ul>
          <li>Windows and Linux were not tested; a test plan exists and nothing in it has been run.</li>
          <li>No signed builds, no installers and no update channel. The generated project has no updater on purpose.</li>
          <li>No audio, media keys, tray icon or offline storage support beyond what a web page already has.</li>
          <li>The Rust shell is generated code that has had no outside review.</li>
        </ul>
      </Note>

    </BlogPost>
  );
}
