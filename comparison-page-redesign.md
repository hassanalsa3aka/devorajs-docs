# Devora.js vs. other frameworks

*Draft structure for review — every number and claim below is pulled from the verified research pass (npm downloads, State of JS 2025, direct checks against @devorajs/core@0.3.0). Nothing new invented here; this is a re-layout of the same facts into focused tables instead of one big one.*

---

## Scale, honestly

We're not going to pretend otherwise — Devora.js is new and small. Here's where things actually stand (npm weekly downloads, week of Sep 15–21, 2026):

| Package | Weekly downloads |
|---|---|
| express | 101.5M |
| next | 42.7M |
| react-router | 40.3M |
| @nestjs/core | 10.3M |
| fastify | 9.6M |
| astro | 4.2M |
| @sveltejs/kit | 1.9M |
| **@devorajs/core** | **539** |

*(react-router's number includes every React Router user, not just framework mode. Download counts include CI runs and transitive installs — Express's number is inflated the most by this.)*

Per State of JS 2025: Next.js leads meta-framework usage but is losing satisfaction; Astro ranks highest on satisfaction. On the backend side, Express leads usage with NestJS growing; Hono tops satisfaction (outside our comparison scope below, but worth knowing it exists).

**Pick Devora.js for what it does differently, not for maturity.** That's the honest framing for everything below.

---

## vs. Frontend frameworks (Next.js, Remix/React Router v7, SvelteKit, Astro)

### Table 1 — Rendering model

| | Devora.js | Next.js 16 | Remix / React Router v7 | SvelteKit | Astro |
|---|---|---|---|---|---|
| Render mode selection | Explicit, per-route (`ssr`/`ssg`/`csr`/`isr`/`streaming`) | Explicit as of 16 (`"use cache"`, opt-in) — implicit on 15 and earlier | Loader-based, explicit | Explicit, per-route | Explicit, per-route (this is Astro's whole pitch too) |
| Catch-all routes (`[...slug]`) | Not supported yet | Yes | Yes | Yes | Yes |
| Query string in data-loading | Not available in `loader` yet | Yes | Yes | Yes | Yes |

**Honest note:** explicit render-mode selection is *not* unique to Devora.js — SvelteKit and Astro already do this, and Next.js 16 closed most of the gap that made this a strong differentiator against Next.js specifically. This is now a "we do it too, cleanly" point, not a "only we do this" point.

### Table 2 — Multi-app architecture

| | Devora.js | Next.js (Multi-Zones) | Turborepo / Nx | Others |
|---|---|---|---|---|
| Multiple apps, one repo | Native — one `devora.config.ts` | Supported, same pattern (separate deployable apps) | Yes — this is their core purpose | Not a first-class concept |
| Navigation between apps | Full page load (separate apps) | Full page load (same limitation) | N/A — not a routing tool | N/A |
| Shared backend across apps | Yes, one shared backend by default | No — each zone is independent | Not built in — you still hand-wire this yourself (e.g. with Express) | N/A |
| Shared login across apps | Yes, one session works across all apps | No — each zone auths separately | Not built in — same, you build this yourself | N/A |
| Build caching / task orchestration | Not Devora.js's job | N/A | Yes, this is their real strength | N/A |

**Honest note:** Turborepo and Nx aren't really the same category of tool — they're monorepo build/task orchestrators, not application frameworks. A fairer way to put it: Turborepo/Nx solve "build this repo full of apps fast," while Devora.js solves "these apps share a backend and a login out of the box." You could reasonably use Turborepo *and* Devora.js together — they're not mutually exclusive, and pretending otherwise would be a strawman.

### Table 3 — Sessions & auth

| | Devora.js | React Router v7 | Astro |
|---|---|---|---|
| Built-in server-side sessions | Yes | Yes (added recently) | Yes (added recently) |
| Same session works as cookie AND Bearer token | Yes, one primitive, revocable everywhere with one call | Not built-in | Not built-in |

**Honest note:** built-in sessions themselves aren't unique anymore either — React Router and Astro both added this. The narrow, still-true claim: **one session object that works identically as a browser cookie or a mobile Bearer token, revocable instantly across both, with no separate systems to maintain.**

---

## vs. Backend frameworks (Express, Fastify, NestJS)

### Table 1 — API error handling

| | Devora.js | Express | Fastify | NestJS |
|---|---|---|---|---|
| Uncaught errors → JSON by default | Yes (as of 0.3.0) | No — needs manual error middleware | Yes, built-in | Yes, built-in exception filters |
| Unmatched routes → JSON 404 | Yes | No — needs manual middleware | Yes | Yes |
| Per-route method enforcement | Yes, declared explicitly | Manual | Manual (or via plugin) | Yes, via decorators |

### Table 2 — What's built in vs. bring-your-own

| | Devora.js | Express | Fastify | NestJS |
|---|---|---|---|---|
| Validation | Bring your own (documented Zod pattern) | Bring your own | Built-in (JSON Schema) | Built-in (class-validator, common) |
| WebSockets | Not built in | Bring your own | Plugin | Built-in module |
| Background jobs | Not built in | Bring your own | Bring your own | Bring your own (common pattern) |
| Rate limiting | Not built in | Bring your own | Plugin | Bring your own |
| Dependency injection | No | No | No | Yes, core feature |

**Honest note:** NestJS and Fastify are simply more complete "batteries included" backend frameworks today. Devora.js's backend story is closer to Express's minimalism, but with the JSON-error-contract and route-matching guarantees Express doesn't give you by default.

---

## Known limitations (as of @devorajs/core@0.3.0) — checked directly, not assumed

- React 18 only — the peer dependency excludes React 19
- No catch-all routes (`[...slug]`)
- An `action`'s return value is discarded unless it's a redirect
- `loader`s don't receive the query string
- `meta()` covers only `title` and `description`
- No built-in WebSockets, background jobs, or validation
- Breaking changes still happen between minor versions (pre-1.0)

No performance section — there are no benchmarks in either repo, and we're not going to publish numbers we haven't measured.

---

## When to choose which

- **Choose Next.js** if you want the largest ecosystem, the most Stack Overflow answers, and don't need multiple apps sharing one backend/login.
- **Choose Astro** if content-heavy, performance-first sites are your priority and you value the framework with the highest reported satisfaction.
- **Choose NestJS or Fastify** if you want a mature, fully-featured backend today — dependency injection, built-in validation, a large plugin ecosystem.
- **Choose Devora.js** if you're specifically building a product with multiple apps (marketing site + dashboard + admin) that need to share a backend and a login, and you're comfortable being an early adopter of a pre-1.0 framework in exchange for that specific architecture being handled natively instead of hand-rolled.
