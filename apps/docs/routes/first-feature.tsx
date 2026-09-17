import { PageShell } from "@devorajs/core";
import { DOCS_NAV } from "../nav.js";
import { SiteFooter } from "../site-footer.js";
import { DocsLayout, Callout } from "../docs-layout.js";

export const renderMode = "ssg";

export function meta() {
  return {
    title: "Build your first feature",
    description:
      "A hands-on walkthrough: a guestbook route with a loader, a serverFn, a CSRF-protected form action, and requireAuth — the whole request lifecycle in one example.",
  };
}

export async function loader() {
  return {};
}

export default function FirstFeature() {
  return (
    <PageShell nav={DOCS_NAV} footer={<SiteFooter />}>
      <DocsLayout active="first-feature">
      <h1>Build your first feature</h1>
      <p>
        <a href="/getting-started">Getting started</a> scaffolds a project; the{" "}
        <a href="/api-reference">API reference</a> lists every function. Neither shows how they
        fit together on a real request. This page builds one small, complete feature — a
        guestbook — touching every piece: a <code>loader</code>, a <code>serverFn</code>, a
        CSRF-protected form <code>action</code>, and <code>requireAuth()</code>. Assumes a
        project already scaffolded with <code>shared</code> or <code>isolated</code> auth (see{" "}
        <a href="/getting-started">Getting started</a>) so a session exists to protect the form
        with.
      </p>

      <h2>1. The shared function</h2>
      <p>
        Following the <a href="/core-concepts">ownership rule</a>: logic other apps might reuse
        goes in <code>packages/backend</code>, not inside the route file itself.
      </p>
      <div className="devora-card">
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
{`// packages/backend/functions/guestbook.ts
import { serverFn } from "@devorajs/core";

const messages: { author: string; text: string }[] = [];

export const listMessages = serverFn(async () => {
  return messages;
});

export const addMessage = serverFn(async (input: { author: string; text: string }, ctx) => {
  ctx${""}.requireAuth(); // only a logged-in visitor can post
  messages.push(input);
  return { ok: true };
});`}
        </pre>
      </div>
      <p>
        A real app swaps the in-memory array for a DB call (Prisma, Drizzle, whichever) — the
        shape of <code>serverFn</code> itself doesn't change either way; see{" "}
        <a href="/core-concepts">The shared backend pattern</a>.
      </p>

      <h2>2. The route: loader + form</h2>
      <p>
        A route's <code>loader</code> runs server-side before the page renders — this is how{" "}
        <code>listMessages</code> gets called. The form below embeds the request's{" "}
        <code>csrfToken</code>, passed automatically as a prop on every GET render.
      </p>
      <div className="devora-card">
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
{`// apps/dashboard/routes/guestbook.tsx
import { CsrfField } from "@devorajs/core";
import { listMessages } from "@devorajs/backend/guestbook";

export const renderMode = "ssr"; // fresh data every request — see /render-modes

export async function loader() {
  return { messages: await listMessages() };
}

export default function Guestbook({ data, csrfToken }) {
  return (
    <>
      <h1>Guestbook</h1>
      <ul>
        {data.messages.map((m, i) => (
          <li key={i}><strong>{m.author}</strong>: {m.text}</li>
        ))}
      </ul>
      <form method="post">
        <CsrfField token={csrfToken} />
        <label>Name <input name="author" required /></label>
        <label>Message <textarea name="text" required /></label>
        <button type="submit">Post</button>
      </form>
    </>
  );
}`}
        </pre>
      </div>

      <h2>3. The action: verify, call, redirect</h2>
      <p>
        A form POST to the same route runs its <code>action</code> export instead of{" "}
        <code>loader</code>. Three steps, in order: check the CSRF token actually matches this
        browser's cookie, call the shared function (which itself checks{" "}
        <code>requireAuth()</code>), then redirect — so a page refresh after submitting doesn't
        re-post the form.
      </p>
      <div className="devora-card">
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
{`// same file, apps/dashboard/routes/guestbook.tsx
import { redirect } from "@devorajs/core";
import { addMessage } from "@devorajs/backend/guestbook";

export async function action(formData, ctx) {
  ctx${""}.verifyCsrf(formData);
  await addMessage({
    author: String(formData.get("author")),
    text: String(formData.get("text")),
  }, ctx);
  return redirect("/guestbook");
}`}
        </pre>
      </div>
      <Callout kind="tip" title="Where each check actually lives">
        <p>
          <code>ctx{"."}verifyCsrf(formData)</code> in the <code>action</code> confirms this POST came
          from a real form this app rendered, not a forged cross-site request.{" "}
          <code>ctx{"."}requireAuth()</code> inside <code>addMessage</code> confirms the visitor is
          actually logged in. They check different things and both matter — CSRF alone doesn't
          prove who's asking, and an auth check alone doesn't prove the request wasn't forged from
          another origin using the visitor's own valid cookies.
        </p>
      </Callout>

      <h2>4. Run it</h2>
      <p>
        <code>devora dev</code>, then log in (a <code>shared</code>/<code>isolated</code>-auth
        scaffold already generated a <code>login.tsx</code> route) and visit{" "}
        <code>/guestbook</code>. Submitting without logging in first throws from{" "}
        <code>requireAuth()</code>; submitting with a stale/missing CSRF field throws from{" "}
        <code>verifyCsrf</code>. Both are real errors, not silent no-ops — see{" "}
        <a href="/security">Security model</a> for why.
      </p>
      <p>
        From here: swap the array for a real DB client, move validation into{" "}
        <code>addMessage</code> itself, or expose the same data over{" "}
        <code>apiRoute()</code> for a mobile client — see{" "}
        <a href="/backend">Backend (v2)</a> and the <a href="/api-reference">API reference</a>.
      </p>
      </DocsLayout>
    </PageShell>
  );
}
