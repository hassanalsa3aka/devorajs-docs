// From the 0.4.0 section of devora.js/CHANGELOG.md ("Breaking changes" and "Another change to check").
const CHANGES_040: { change: ReactNode; todo: ReactNode }[] = [
  {
    change: <><code>redirect()</code> refuses a target that leaves the app's origin: <code>https://evil.com</code>, <code>//evil.com</code>, <code>/\evil.com</code>, <code>javascript:</code> targets and their percent-encoded forms are a <strong>400</strong> (the error page renders; no <code>Location</code> is sent). A loader that returns a plain <code>{"{ redirect }"}</code> object is covered too.</>,
    todo: <>Search your routes for <code>redirect(</code> with a full URL. For a site you trust, list its origin: <code>redirect(url, {"{ allowedOrigins: [\"https://checkout.example.com\"] }"})</code>. A path such as <code>redirect("/account")</code> works as before, and a redirect built from user input needs no change.</>,
  },
  {
    change: <>A response that reads or sets the session cookie is sent with <strong><code>Cache-Control: private, no-store</code></strong>, replacing any <code>Cache-Control</code> the handler set. It covers pages, streaming pages, redirects, error pages and API routes. Bearer requests and requests without the session cookie are unchanged.</>,
    todo: <>If an API route sets <code>Cache-Control: public</code> or <code>s-maxage</code> on responses to logged-in browsers, that header is dropped for them. Put the cacheable version on a route that does not read the session. Otherwise nothing to do.</>,
  },
  {
    change: <>CSRF is checked by default for a write (any method but <code>GET</code>, <code>HEAD</code> and <code>OPTIONS</code>) that arrives with a live session in the session cookie. The token must be in the <code>_csrf</code> form field or the <code>x-devora-csrf</code> header, or the response is a <strong>403</strong>. Bearer requests, requests with no session cookie and reads are not checked by this default. For a signed-in browser the token is tied to the session, so a token from another session is refused.</>,
    todo: <>(1) Every page form with an <code>action</code> renders <code>{"<CsrfField token={csrfToken} />"}</code>. (2) A browser <code>fetch()</code> that writes to an API route sends the page's <code>csrfToken</code> in the <code>x-devora-csrf</code> header. (3) A webhook or other cross-site caller that sends the session cookie exports <code>export const csrf = false</code> from its route and verifies its caller itself. (4) A script that logs in and then posts a form must load the page again after login: a token read before login is not valid for the new session. (5) An app with <code>csrf: false</code> in <code>app.config.ts</code> has no CSRF cookie: its cookie-authenticated writes get a 403 unless the route opts out. Keep calling <code>ctx{"."}verifyCsrf()</code> yourself on anonymous writes such as a login form.</>,
  },
  {
    change: <><code>@devorajs/cli</code> requires <strong>vite <code>^6.4.4</code></strong> (it accepted <code>^5.4.0 || ^6.0.0</code>); older releases have known vulnerabilities.</>,
    todo: <>Set <code>"vite": "^6.4.4"</code> in each app's <code>package.json</code> and reinstall. A lockfile pinning 5.x, or 6.0 to 6.4.3, must move.</>,
  },
  {
    change: <><code>devora start</code> sets its own server limits, and a page form is limited: the whole request must arrive within <strong>60 seconds</strong> (Node's default was 5 minutes), the headers within 15 seconds; a form may carry <strong>1000</strong> non-file fields and <strong>20</strong> files.</>,
    todo: <>An app that accepts big uploads over slow links sets <code>server: {"{ requestTimeoutMs: 300000 }"}</code> in <code>app.config.ts</code>; one that really posts more than 20 files raises <code>maxFormFiles</code>. Behind a load balancer, set <code>server.keepAliveTimeoutMs</code> above its idle timeout.</>,
  },
  {
    change: <>When a cookie name is sent twice, the <strong>first</strong> value is used (it was the last). Browsers send an app's own cookie first, so a cookie set later from a sibling subdomain no longer replaces it. A cookie with a malformed percent-escape is kept as sent instead of failing the request.</>,
    todo: <>Nothing, unless your app relied on a duplicated cookie name: give the cookies distinct names.</>,
  },
  {
    change: <><code>rateLimit</code> counts an IPv6 client by its <strong>/64 prefix</strong> (the first four groups), so every address in one /64 shares a count. IPv4 clients are unchanged.</>,
    todo: <>Nothing, unless many real users share one /64 and one limit: raise <code>max</code> on that route.</>,
  },
  {
    change: <><code>create-devora</code> and <code>devora new</code> accept an app name only of lowercase letters, digits, <code>-</code> and <code>_</code> (at most 50 characters), and a domain only as a host name.</>,
    todo: <>Nothing for existing projects. Pick a lowercase name for new apps.</>,
  },
];
