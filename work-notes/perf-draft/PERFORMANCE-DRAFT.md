# DRAFT, NOT PUBLISHED: performance table for 0.4.0

> **Measured in a cloud container; re-measure on local hardware before publishing.** This file is not routed, not
> linked from the site, and not read by the /performance page (which still reads `apps/docs/data/benchmarks.json`
> and `backend-benchmarks.json`, the published 0.3.5 run). Numbers below come only from the runs listed under
> "Raw data"; nothing was typed by hand except the labels.

Run: 2026-11-05. Machine: Intel Xeon @ 2.10 GHz, 4 cores, 16 GB, Linux (x64), Node 22.23.4; the load tool on the
same machine. Devora.js: the release/0.4.0-final build (before its two phase 3B optimizations), laid over the
published 0.3.5 packages. Security defaults on (CSRF, headers, body limits, timeouts, sessions).

## Methodology

Each framework is built and served with its own documented production setup and defaults; same Node; autocannon
with 50 connections, 5 s warm-up, then 5 runs of 10 s; the median with the min–max of the runs. When two ranges
overlap, the difference is a tie. Frameworks ran one after another; on this machine, runs minutes apart drifted by
10% or more, so read close ranks as ties. Contract and fairness rules: `benchmarks/README.md` and
`benchmarks/backend/CONTRACT.md` in the framework repository.

## Where Devora.js is slower, and why

- JSON API scenarios: 4th of 10 (3rd on the invalid POST, level with NestJS on Fastify), behind Fastify, Hono and
  NestJS on Fastify. Devora.js builds a request context with session and CSRF methods and sends security headers on
  every response; the bare backend frameworks do not.
- Authenticated GET: about 18,000 against 47,000 requests/s for Fastify. Devora.js runs its real session lookup.
- Memory after load (API app): 248 MB, more than Hono, Fastify, NestJS on Fastify and Express (156 to 197 MB).
- Pages: SvelteKit starts faster, uses less idle memory and sends less JavaScript on the server-rendered page.

In this run Devora.js had the highest requests/second on the pre-rendered page, the server-rendered page and the
form POST, and the shortest cold build of the five page frameworks. These are results of this one run on this one
machine.

## Results

### A. Pre-rendered page

| # | Framework | Requests/s, median (min–max) |
|---|---|---|
| 1 | Devora.js (release/0.4.0-final build) | 28,799 (27,291–29,414) |
| 2 | Astro 7.3.8 | 6,739 (6,618–6,764) |
| 3 | SvelteKit 3.0.1 | 6,513 (6,334–6,856) |
| 4 | React Router 8.4.0 | 3,628 (3,534–3,704) |
| 5 | Next.js 16.4.1 | 1,578 (1,437–1,700) |

### B. Server-rendered page (100 items)

| # | Framework | Requests/s, median (min–max) |
|---|---|---|
| 1 | Devora.js (release/0.4.0-final build) | 3,778 (3,567–3,952) |
| 2 | SvelteKit 3.0.1 | 1,314 (1,263–1,334) |
| 3 | Astro 7.3.8 | 1,291 (1,228–1,294) |
| 4 | React Router 8.4.0 | 543 (527–570) |
| 5 | Next.js 16.4.1 | 318 (298–324) |

### C. Form POST

| # | Framework | Requests/s, median (min–max) |
|---|---|---|
| 1 | Devora.js (release/0.4.0-final build) | 15,618 (15,198–17,422) |
| 2 | SvelteKit 3.0.1 | 5,583 (5,460–5,716) |
| 3 | Astro 7.3.8 | 2,440 (2,210–2,606) |
| 4 | React Router 8.4.0 | 1,862 (1,752–1,994) |
| 5 | Next.js 16.4.1 | 758 (706–787) |

### Pages apps: build, start, memory, JavaScript sent

| Framework | Build cold ms | Start ms | Idle MB | After load MB | JS sent /items, gzip B | Hydration ms |
|---|---|---|---|---|---|---|
| Devora.js (release/0.4.0-final build) | 1,228 | 333 | 161 | 247 | 46,657 | 79 |
| Astro 7.3.8 | 2,165 | 350 | 158 | 676 | 69,060 | 78 |
| Next.js 16.4.1 | 5,239 | 538 | 156 | 352 | 135,218 | 123 |
| React Router 8.4.0 | 1,381 | 334 | 147 | 273 | 111,241 | 110 |
| SvelteKit 3.0.1 | 3,211 | 226 | 132 | 265 | 34,209 | 84 |

### D. JSON list

| # | Framework | Requests/s, median (min–max) |
|---|---|---|
| 1 | Hono | 19,204 (18,267–19,737) |
| 2 | Fastify 5 | 19,019 (18,403–19,287) |
| 3 | NestJS (Fastify platform) | 17,900 (16,139–18,083) |
| 4 | Devora.js (release/0.4.0-final build) | 13,372 (12,966–13,730) |
| 5 | SvelteKit | 7,350 (7,260–7,566) |
| 6 | Express 5 | 7,051 (6,820–7,598) |
| 7 | NestJS (Express platform) | 5,612 (5,305–5,712) |
| 8 | Astro | 3,633 (2,495–3,695) |
| 9 | React Router | 1,642 (1,626–1,682) |
| 10 | Next.js | 1,246 (1,196–1,274) |

### E. Authenticated GET

| # | Framework | Requests/s, median (min–max) |
|---|---|---|
| 1 | Fastify 5 | 47,408 (43,251–53,869) |
| 2 | Hono | 40,138 (39,034–41,001) |
| 3 | NestJS (Fastify platform) | 30,681 (29,377–32,202) |
| 4 | Devora.js (release/0.4.0-final build) | 17,995 (17,384–19,506) |
| 5 | Express 5 | 9,201 (8,888–9,366) |
| 6 | SvelteKit | 8,202 (5,194–8,810) |
| 7 | NestJS (Express platform) | 7,185 (7,103–7,561) |
| 8 | Astro | 4,044 (3,923–4,323) |
| 9 | React Router | 1,786 (1,395–1,817) |
| 10 | Next.js | 1,290 (1,270–1,317) |

### F1. POST, valid body

| # | Framework | Requests/s, median (min–max) |
|---|---|---|
| 1 | Fastify 5 | 26,706 (25,932–28,497) |
| 2 | Hono | 25,297 (24,450–26,405) |
| 3 | NestJS (Fastify platform) | 21,922 (21,075–22,734) |
| 4 | Devora.js (release/0.4.0-final build) | 16,425 (15,730–16,608) |
| 5 | Express 5 | 7,088 (6,812–7,369) |
| 6 | NestJS (Express platform) | 6,018 (5,844–6,342) |
| 7 | SvelteKit | 5,899 (5,684–6,185) |
| 8 | Astro | 2,826 (2,784–3,006) |
| 9 | React Router | 1,736 (1,679–1,823) |
| 10 | Next.js | 1,082 (911–1,103) |

### F2. POST, invalid body

| # | Framework | Requests/s, median (min–max) |
|---|---|---|
| 1 | Fastify 5 | 27,829 (26,233–28,929) |
| 2 | Hono | 26,103 (25,326–27,496) |
| 3 | Devora.js (release/0.4.0-final build) | 16,569 (15,831–17,381) |
| 4 | NestJS (Fastify platform) | 16,489 (16,385–17,287) |
| 5 | Express 5 | 7,319 (6,957–7,761) |
| 6 | SvelteKit | 5,864 (5,507–5,992) |
| 7 | NestJS (Express platform) | 4,967 (4,896–5,374) |
| 8 | Astro | 2,872 (2,701–2,989) |
| 9 | React Router | 1,733 (1,712–1,759) |
| 10 | Next.js | 1,085 (1,065–1,138) |

### G. One awaited 2 ms step

| # | Framework | Requests/s, median (min–max) |
|---|---|---|
| 1 | Fastify 5 | 16,533 (15,860–16,845) |
| 2 | NestJS (Fastify platform) | 15,177 (14,159–15,404) |
| 3 | Hono | 14,974 (14,654–15,252) |
| 4 | Devora.js (release/0.4.0-final build) | 13,591 (13,546–14,151) |
| 5 | SvelteKit | 8,663 (8,283–8,798) |
| 6 | Express 5 | 7,915 (7,634–8,330) |
| 7 | NestJS (Express platform) | 7,797 (7,393–7,903) |
| 8 | Astro | 4,785 (4,578–4,870) |
| 9 | React Router | 2,357 (2,273–2,521) |
| 10 | Next.js | 1,905 (1,782–1,982) |


## Raw data and how to reproduce

Raw JSON: `benchmarks/results/*-2026-11-05-container-*.json` on the framework's `release/0.4.0-final` branch.

```bash
git clone https://github.com/hassanalsa3aka/devora.js.git && cd devora.js/benchmarks
npm ci
for app in apps/*; do (cd "$app" && npm ci); done
CHROME_PATH=<a Chromium binary> node run.mjs --tag=local
node run-backend.mjs --tag=local
```

Until 0.4.0 is on npm, `apps/devora` and `apps/devora-api` pin a version npm does not have yet; measure them after
publishing, or lay a local build over 0.3.5 with `scripts/use-local-build.sh` and label the run as such.
