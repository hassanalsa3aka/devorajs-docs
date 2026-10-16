# How Devora.js compares — DRAFT for review (not published)

Devora.js is a full-stack React framework built around one idea: a single project can hold several
apps — a marketing site, a product app, an admin panel — that share one backend and one login
system, yet build and deploy independently. This page compares it with the frameworks people
most often weigh it against. Where another framework is the better choice, we say so.

## Scale, honestly

Devora.js is pre-1.0 (`@devorajs/core` 0.3.0) and small. For context, npm downloads for the week
of Sep 15–21, 2026:

| Package | Weekly downloads |
|---|---|
| `express` | 101.5M |
| `next` | 42.7M |
| `react-router` ¹ | 40.3M |
| `@nestjs/core` | 10.3M |
| `fastify` | 9.6M |
| `astro` | 4.2M |
| `@sveltejs/kit` | 1.9M |
| `@devorajs/core` | 539 |

¹ Includes every React Router user, not only its framework mode (the successor to Remix since
React Router v7). Download counts also include CI installs and transitive dependencies, so treat
them as a rough gauge of adoption, not a count of teams.

In the [State of JavaScript 2025](https://2025.stateofjs.com/en-US/libraries/meta-frameworks/)
survey, Next.js is the most-used meta-framework but losing satisfaction, while Astro ranks highest
on satisfaction. For back-end frameworks,
[Express still leads usage with NestJS growing](https://2025.stateofjs.com/en-US/libraries/back-end-frameworks/),
and the satisfaction leaders are newer entrants (Hono, Nitro, ElysiaJS).

What that means for you: every framework on this page has more users, more third-party
integrations, more answered questions online, and more production mileage than Devora.js. Pick
Devora.js for what it does differently, not for maturity.

## vs. frontend frameworks: Next.js, React Router (Remix), SvelteKit, Astro

|  | Next.js | React Router v7 (Remix) | SvelteKit | Astro | Devora.js |
|---|---|---|---|---|---|
| **Several apps in one project** | Multi-Zones: separate Next.js apps under one domain, deployed independently; moving between zones is a full page load | One app per project; use a monorepo tool for more | One app per project | One app per project | Built in: every app declared in one `devora.config.ts`, each built and deployed on its own, sharing one backend and one login system by default. `devora add <name>` adds one |
| **Choosing how a page renders** | Per route segment. Since Next.js 16, caching is opt-in (`"use cache"`, behind the `cacheComponents` flag); earlier App Router versions cached `fetch` and GET handlers by default | Per route; server-rendered or pre-rendered | Per route (`prerender`, `ssr`, `csr` page options) | Static by default; opt pages into on-demand rendering | Per route: `renderMode` is `ssr`, `ssg`, `csr`, `isr` or `streaming`, and `isr`'s refresh interval is written in the route file. No framework data cache |
| **Client JavaScript** | Server Components ship none; each `"use client"` subtree hydrates | Hydrates the whole page | Hydrates the whole page by default | None by default; opt components in as islands, from several UI frameworks | None by default; `island()` opts in single components (React only) |
| **Sessions** | Not built in — use a library such as Auth.js | Built-in session storage API, carried in a cookie | Not built in — cookies API plus a library | Built-in sessions (stable since 5.7), carried in a cookie | Built in: one opaque, server-side, revocable session reached by an HttpOnly cookie (browsers) or an `Authorization: Bearer` header (mobile/API clients) through the same lookup |
| **UI library** | React 19 | React | Svelte | Any (React, Vue, Svelte, Solid, …) | React 18 only |

**Where Devora.js stands out**

- **Multi-app is the design, not an add-on.** One config declares every app; the shared backend,
  auth modes (`shared`, `isolated`, or `none` per app) and deploy commands all understand it. The
  others can get there with a monorepo tool, but you assemble it yourself. Note that Devora's
  apps are separate apps, so moving between them is a full page load — the same as Next.js
  Multi-Zones.
- **One session model for web and mobile.** A browser login and a mobile app's token are the
  same session, stored server-side, revocable everywhere with one call. CSRF checks apply to
  cookie requests only, since a Bearer header can't be forged cross-site. In the others, token
  auth for a mobile client is a separate library or custom code.
- **Security defaults.** CSP, HSTS and X-Frame-Options headers on every response, request-body
  size caps, and API routes that always answer in JSON — all without configuration.

**Where they're ahead**

- **Next.js:** the largest ecosystem in this space, React Server Components, React 19, and
  first-class hosting on Vercel. Much more battle-tested at scale.
- **React Router (Remix):** a mature router with nested routes, and actions whose return data
  reaches the page. Devora.js discards an action's return value unless it's a redirect, and its
  loaders don't receive the URL's query string yet.
- **SvelteKit and Astro:** catch-all routes (`[...slug]`), which Devora.js doesn't support yet.
  Astro pioneered islands, and lets you mix UI frameworks.
- **All four:** full control of the page `<head>`. Devora.js's `meta()` covers the title and
  description only, for now.

## vs. backend frameworks: Express, Fastify, NestJS

Devora.js is not a replacement for a dedicated API server. Its backend — file-based API routes,
server functions, modules and middleware — exists to serve the apps in the same project. If all
you need is an API, the frameworks below are more complete.

|  | Express | Fastify | NestJS | Devora.js |
|---|---|---|---|---|
| **What it is** | Minimal HTTP framework | HTTP framework built around plugins | Structured framework with dependency injection; runs on Express or Fastify | Full-stack framework: pages and API routes in the same project |
| **Pages / server rendering** | View templates | View templates via a plugin | View templates | React SSR, islands, and five render modes, built in |
| **Sessions and auth** | `express-session` middleware | `@fastify/session` and related plugins | Passport-based guides | Built-in session (cookie or Bearer), revocable; checking passwords stays your code |
| **Request validation** | Not built in | Built in (JSON Schema) | Validation pipes | Not built in — [guide](/backend-capabilities) |
| **Architecture** | Middleware chain | Plugins with encapsulation | Modules, dependency injection, decorators | Explicit modules and middleware as plain functions; no dependency injection, by design |
| **Ecosystem** | Very large | Large | Large | Small; Express middleware and Fastify plugins can be adapted (routing only for Fastify) |

**Where Devora.js stands out**

- **The API and the pages share one backend and one login.** An API route and a server-rendered
  page read the same session, whether it came from a browser cookie or a mobile app's Bearer
  token — no separate auth setup for each.
- **API errors are always JSON.** A thrown error becomes `{ "message": ... }` with the right
  status, and an unknown `/api/*` path is a JSON 404 — never an HTML error page.

**Where they're ahead**

- **Fastify:** built-in schema validation and serialization, and a large plugin ecosystem.
- **NestJS:** a full application architecture for large teams, with first-party support for
  things like OpenAPI docs, WebSockets and microservices.
- **Express:** the largest middleware ecosystem in Node.js, and the most documentation.
- **All three:** years of production use behind them. Devora.js has no built-in WebSockets,
  background jobs or request validation yet, and still makes breaking changes between minor
  versions (0.3.0 changed how sessions work).

## When to choose which

- **Choose Devora.js** when you're building several related apps — say a public site, a product
  and an admin panel — with one backend, shared logins, and perhaps a mobile app on the same
  sessions, and you can live with a young framework.
- **Choose Next.js, React Router, SvelteKit or Astro** for a single web app, a content site, or
  when ecosystem size and long-term stability matter most.
- **Choose Express, Fastify or NestJS** for an API with no pages, or a backend that needs
  WebSockets, background jobs or built-in validation today.

---
Sources: npm registry download API (api.npmjs.org, week of 2026-09-15..21);
State of JavaScript 2025 — meta-frameworks and back-end frameworks pages; Next.js 16 release
notes and `cacheComponents` docs; Next.js Multi-Zones guide; React Router v7 announcement and
sessions docs; Astro 5.7 release notes and sessions guide. Devora.js limitations checked against the
published `@devorajs/core@0.3.0` package.
