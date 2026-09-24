import { PageShell } from "@devorajs/core";
import { DOCS_NAV } from "../nav.js";
import { SiteFooter } from "../site-footer.js";
import { pageMeta } from "../seo.js";

export const renderMode = "ssg";

export function meta() {
  return pageMeta("/privacy", {
    title: "Privacy",
    description:
      "What the Devora.js docs site measures with Vercel Web Analytics and Google Analytics, what it never collects, and how to change your cookie choice.",
  });
}

export async function loader() {
  return {};
}

// Keep in sync with what assets/js/analytics.js actually does — this page
// is the public description of that file.
export default function Privacy() {
  return (
    <PageShell nav={DOCS_NAV} footer={<SiteFooter />}>
      <h1>Privacy</h1>
      <p>
        This documentation site measures how it's used so we can tell which pages help, what people
        search for and don't find, and where the docs fall short. There are no ads, and nothing is
        sold or shared for advertising.
      </p>

      <h2>Vercel Web Analytics — always on, no cookies</h2>
      <p>
        Counts page views, referrers, countries, browsers, and devices, plus a few interactions
        (searches, button and link clicks, code copies, theme changes, video plays). It sets no
        cookies and doesn't identify you across sites or visits, which is why it doesn't need your
        consent.
      </p>

      <h2>Google Analytics — only with your consent</h2>
      <p>
        Until you click <strong>Accept</strong> in the cookie banner, Google Analytics runs in
        Google's Consent Mode with storage denied: it sets no cookies and only receives anonymous,
        cookieless signals. After you accept, it uses first-party cookies to measure visits and the
        interactions listed above, plus how far you scroll, which sections you reach, and on-page
        errors. Advertising features are always off.
      </p>
      <p>
        If your browser sends a Global Privacy Control signal, we treat it as Decline and don't
        show the banner.
      </p>

      <h2>What we never collect</h2>
      <ul>
        <li>Your name, email, or any account details — the site has no accounts</li>
        <li>What you copy from code examples (only that a copy happened, and in which section)</li>
        <li>Anything you type, except search terms in the docs search box, trimmed to 100 characters</li>
        <li>Your IP address — Google Analytics 4 doesn't log or store IP addresses</li>
      </ul>

      <h2>Changing your choice</h2>
      <p>
        Use <a href="#cookie-settings">Cookie settings</a> (also in the footer of every page) to
        reopen the banner and accept or decline at any time. Your choice is stored in your
        browser's local storage, not in a cookie, and clearing site data resets it.
      </p>

      <h2>Questions</h2>
      <p>
        Open an issue on{" "}
        <a href="https://github.com/hassanalsa3aka/devorajs-docs/issues">GitHub</a>.
      </p>
    </PageShell>
  );
}
