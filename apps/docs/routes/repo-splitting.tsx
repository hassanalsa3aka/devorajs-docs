import { PageShell } from "@devorajs/core";
import { DOCS_NAV } from "../nav.js";
import { SiteFooter } from "../site-footer.js";
import { DocsLayout } from "../docs-layout.js";

export const renderMode = "ssg";

export function meta() {
  return {
    title: "Repo-splitting (v2)",
    description: "Splitting an app or the shared backend into its own git repo — devora split/sync/status.",
  };
}

export async function loader() {
  return {};
}

export default function RepoSplitting() {
  return (
    <PageShell nav={DOCS_NAV} footer={<SiteFooter />}>
      <DocsLayout active="repo-splitting">
      <h1>Repo-splitting (v2)</h1>
      <p>
        <strong>Not yet in the published <code>^0.1.0</code> package.</strong> This page documents
        v2's repo-splitting tools ahead of release, the same way this site documents the rest of
        v2 (see <a href="/backend">Backend (v2)</a>).
      </p>
      <p>
        <code>devora split</code>/<code>sync</code>/<code>status</code> let you pull an app or{" "}
        <code>packages/backend</code> out of the main repo into its own, independently-clonable
        repo, while still building/deploying it from here. This is real Git underneath — a real{" "}
        <strong>submodule</strong> and a handful of fetch/merge/push commands, not a new
        devora-invented sync protocol. If you already know how Git submodules work, you already
        know most of what this does.
      </p>

      <h2>Two use cases</h2>
      <p>
        <strong>A solo dev wanting cleaner repo boundaries</strong> — maybe{" "}
        <code>packages/backend</code> has grown into something worth versioning and tagging on its
        own, independent of every app's release cadence. <strong>A real team where different
        people own different pieces independently</strong> — one person on{" "}
        <code>packages/backend</code>, one on <code>apps/admin</code>, one on the marketing site —
        each cloning and working in just their own piece, integrating back via explicit sync
        rather than one shared working tree.
      </p>

      <h2><code>devora split &lt;app-name|backend&gt; --repo=&lt;git-url&gt;</code></h2>
      <p>
        You create the empty remote repo yourself first — this tool doesn't create accounts or
        repos on your behalf, the same way <code>devora deploy</code> requires{" "}
        <code>vercel link</code>/<code>netlify link</code> to already exist. What actually happens,
        in order:
      </p>
      <ol>
        <li>The directory's current content is pushed to <code>--repo</code> as that repo's real initial commit.</li>
        <li>The directory is removed from the main repo's own tracked files.</li>
        <li>It's re-added at the same path via a real <code>git submodule add</code>.</li>
      </ol>
      <p>
        Nothing is committed in the main repo automatically — review with <code>git status</code>/
        <code>git diff --cached</code> and commit it yourself, the same pattern <code>devora
        new</code>/<code>remove</code> already use. After this, a fresh clone of the main project
        needs a real <code>git submodule update --init</code> to populate it — standard Git
        behavior this doesn't automate away.
      </p>

      <h2><code>devora sync &lt;name&gt; [--from-main | --to-main]</code></h2>
      <p>
        A thin wrapper around fetch/merge/push against a split-off piece's own remote, one
        direction at a time. <code>--from-main</code> merges the remote's latest into your local
        checkout and stages the updated reference in the main repo; <code>--to-main</code> pushes
        commits you made directly inside that checkout up to its own remote. Both show a real
        commit list and ask for confirmation before doing anything.
      </p>
      <p>
        <strong>A genuine same-line conflict between two contributors is a real Git conflict</strong>{" "}
        — surfaced exactly the way a plain <code>git merge</code> would (real conflict markers,{" "}
        <code>git status</code> showing "Unmerged paths"), naming the conflicting file(s). This
        tool does not attempt to auto-resolve it: fix it inside the submodule's own checkout the
        normal way, then re-sync if the resolution needs to go back to the remote.
      </p>

      <h2><code>devora status --all</code></h2>
      <p>
        One view across every split-off app/backend: up to date, local commits not yet pushed,
        remote commits not yet pulled, diverged, or a gitlink change not yet committed in the main
        repo.
      </p>

      <h2>What this doesn't do</h2>
      <ul>
        <li>Auto-resolve conflicts — a real conflict is real work; this tool's job is surfacing it clearly.</li>
        <li>Create remote repos or manage credentials — you create the empty repo and have push access before running <code>split</code>.</li>
        <li>Replace <code>git submodule update --init</code> on a fresh clone — standard Git behavior, unchanged.</li>
      </ul>

      <h2>Ownership rules that matter more once repos are split</h2>
      <p>
        Two conventions from <a href="/backend">Backend (v2)</a> matter most exactly when
        different people own different split-off pieces: shared backend logic still goes in{" "}
        <code>packages/backend</code> (an app's <code>api/</code> file just imports from{" "}
        <code>@devorajs/backend</code> normally — splitting only changes how that package's source
        is tracked, not where routes are declared), and every use of a middleware ecosystem
        adapter is still registered in one place, <code>packages/backend/middleware.ts</code> —
        now that repo's own owner's file to review, regardless of which app's contributor wanted
        to use it.
      </p>
      </DocsLayout>
    </PageShell>
  );
}
