---
title: "Attacking our own release before shipping it"
description: "What an internal red-team pass on Devora.js 0.4.0 tried, the six problems it found and fixed, and the two design items still open."
date: PUBLISH-DATE (fill in the day this post is published)
status: draft, not routed, not linked from the site, the feed or the sitemap
---

# Attacking our own release before shipping it

Devora.js 0.4.0 is a security hardening release. Before calling it done, we attacked the integration branch the way
an outsider would, on localhost, against the framework's own example apps: a site with no login, a dashboard with
sessions, CSRF and API routes, an admin app with its own login, and an API-only app. This post says what we tried,
what broke, and what is still open. It was an internal pass, not a third-party audit, and nobody outside the project
has reviewed it.

## What we tried

- Path traversal in 22 encodings (`../`, `%2e%2e`, double encoding, backslashes, overlong UTF-8, NUL bytes) against
  two apps.
- Malformed and ambiguous requests: line breaks in the target and in headers, two `Content-Length` headers, both
  `Content-Length` and `Transfer-Encoding`, odd transfer encodings.
- Forged `Host`, `X-Forwarded-Host` and `Origin` headers.
- CSRF bypass attempts: no token, an empty or wrong token, other content types, other methods, a second CSRF
  cookie.
- Session fixation and cookie flags.
- Huge and slow requests, thousands of form fields and file parts, headers over the size limit.
- Prototype pollution through form names, JSON and cookie names.
- Slow regular expressions, with worst-case inputs of up to 10 MB.
- HTML and `</script>` in route parameters.
- The development server: foreign host names, reading files outside the project, the hot-reload WebSocket.
- The project scaffolders, and the dependency tree.

We also ran a bounded random fuzzer over the path, host, cookie, redirect and body parsers. Each parser had one rule
it must never break, for example "a redirect target that is accepted stays on the app's origin" or "a form never
carries more files than the limit". It ran about 95 million inputs.

## What broke, and what changed

Six problems, all fixed in 0.4.0, each with a test that fails without the fix:

1. **One bad cookie could break every page.** A cookie with a malformed percent-escape made the cookie parser
   throw, so each page answered 500 for that browser. Any app on the same domain could set such a cookie. Now the
   value is kept as it was sent.
2. **A duplicated cookie name used the last value.** Browsers send an app's own cookie first, so a cookie set later
   from a sibling subdomain could replace it. Now the first value is used.
3. **Unusual HTTP methods skipped the CSRF check.** The default covered `POST`, `PUT`, `PATCH` and `DELETE`. An API
   route that does not list its methods runs for any method, so `PURGE` or `PROPPATCH` with the session cookie
   reached the handler with no token. Now every method except `GET`, `HEAD` and `OPTIONS` is checked, and counted by
   `rateLimit`.
4. **`ctx.url` could name a host nobody checked.** A request written as `GET http://other.example/x` made `ctx.url`
   use that host, even with `allowedHosts` set. Now the host always comes from the `Host` header. The fuzzer found a
   gap in the first version of this fix, and the second version closed it.
5. **The dev server's "open in editor" endpoint answered any web page.** A page you visited could make `devora dev`
   open files in your editor. Cross-site requests to it now get a 403.
6. **App names went unchecked into generated code.** `create-devora` and `devora new` wrote the app name into
   `devora.config.ts`, into folder paths and into the Netlify build command. Names are now limited to lowercase
   letters, digits, `-` and `_`.

## What held

Everything else on the list. Traversal attempts got a 404 or a normal page. Malformed requests got a 400 from Node's
parser. Writes without a valid token got a 403. Login always issued a new session ID. Oversized bodies, too many
fields or files, and headers over the size limit were refused. A client that sent its headers slowly was closed after
15 seconds. No input to the parsers took more than about a tenth of a second. `pnpm audit --prod` on the framework
repository reports no known vulnerabilities. The test runner's own advisories (development only, never installed
by users) are a separate roadmap item.

## What is still open

Two design questions are on the roadmap rather than in this release, because each changes how existing apps
behave:

- tying the CSRF token to the session, instead of comparing it only with a cookie;
- how `rateLimit` groups IPv6 addresses.

If you run several apps on subdomains of one domain, do not give a subdomain to anyone you do not trust: cookies can
be set across subdomains. The [security model](/security) page lists what the defaults cover and what stays your
job.

The full list of findings, with the evidence for each, is in the framework's ROADMAP (findings H24 to H32).
