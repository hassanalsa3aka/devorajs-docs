# Fact check, release/0.4.0-final (2026-11-05)

Every new or changed sentence on both integration branches, checked against code, tests or a measured run.
Paths starting with `devora.js/` are in the framework repository (branch `release/0.4.0-final`); others are in this
repository. "Evidence" names the file or the run; the red-team runs are in `devora.js/work-notes/redteam/`.
Verdicts: **True** (matches the evidence), **Fixed** (was wrong, corrected in this pass), **Needs local check**.

## Docs site (this repository)

| Claim | File:line | Evidence | Verdict |
|---|---|---|---|
| In the next release a cookie-authenticated write, any method but GET, HEAD and OPTIONS, is CSRF-checked before `action`/`handler` | apps/docs/routes/security.tsx:53 | devora.js/packages/core/src/csrf.ts (`CSRF_SAFE_METHODS`, `verifyCsrfByDefault`), called from apiDispatch.ts and renderRoute.ts; redteamFindings.test.ts H26 | True |
| `ctx.url` takes its host from `Host` (or trusted `X-Forwarded-Host`) only; a target like `http://other.example/x` no longer names an unchecked host | security.tsx:73 | devora.js/packages/core/src/trustProxy.ts (`describeRequest`, `targetPathAndQuery`, `requestHost`); redteamFindings.test.ts H27; fuzz.mts "ctx.url keeps the Host header's host" | True |
| A malformed cookie is kept as sent; the first of two cookies with one name wins | security.tsx:74 | devora.js/packages/core/src/session.ts `parseCookieHeader`; redteamFindings.test.ts H24, H25 | True |
| `devora dev` refuses cross-site requests to Vite's `/__open-in-editor` | security.tsx:75 | devora.js/packages/cli/src/server/apiMiddleware.ts `createOpenInEditorGuardPlugin`, wired in commands/dev.ts; openInEditorGuard.integration.test.ts; attack-dev run: 403 with `Sec-Fetch-Site: cross-site` | True |
| create-devora and devora new accept only plain app names and host names | security.tsx:76, :98 | devora.js/packages/scaffold/src/names.ts; create-devora/src/index.ts; packages/cli/src/commands/new.ts; names.test.ts | True |
| "Existing projects are not affected" (app-name rule) | security.tsx:98 | The check runs only in the scaffolders (`scaffoldAppFiles`, `scaffoldProjectFiles`, `devora new`); `devora dev/build/start` read devora.config.ts without it (grep: no `appNameProblem` outside scaffold, create-devora and new.ts) | True |
| Cookies can be set across subdomains of one domain | security.tsx:88; devora.js/docs/guides/SECURITY-MODEL.md:56 | RFC 6265 §5.3 (Domain attribute); browsers' behaviour | True |
| An API route without `methods` called with an unusual method and the session cookie needs the CSRF token and counts toward `rateLimit` | security.tsx:97 | csrf.ts, rateLimit.ts (`UNCOUNTED_METHODS`); redteamFindings.test.ts H26 (PURGE 403 then 200 with the header; rateLimit counts PURGE, PROPPATCH, LINK); attack-prod run: 403 for five methods | True |
| The integration branch was attacked on localhost by the project itself, not a third party, in the listed categories | security.tsx:100-106 | devora.js/work-notes/redteam/REDTEAM.md; scripts attack-prod.mjs, attack-dev.mjs, fuzz.mts, redos.mts | True |
| Six problems were found and fixed, each with a regression test: the last four rows of the table and the method change | security.tsx:107-108 | REDTEAM.md findings H24 to H29 (the cookie row covers H24 and H25); each test checked failing with the fix stashed | True |
| The CSRF token of a signed-in browser is tied to the session (HMAC of the session ID); rateLimit counts IPv6 by /64; one item (Netlify body read, accepted) stays open | security.tsx (CSRF section, Next release list, Red-team pass) | devora.js CHANGELOG 0.4.0, `csrfSessionBinding.test.ts`, `rateLimit.test.ts` (H31), ROADMAP H30/H31 Fixed, H32 Open | True |
| Mobile and Metro-class tooling come later than desktop; nothing for them exists in the code | apps/docs/routes/roadmap.tsx:282, :357 | `grep -ri "metro\|react-native\|expo" devora.js/packages devora.js/adapters devora.js/create-devora --include=*.ts` returns nothing | True |
| Release-day template: CSRF checked for a write, any method but GET/HEAD/OPTIONS | scripts/release-day/upgrading-040.changes.tsx:12; scripts/release-day.mjs:251 | csrf.ts | True |
| Release-day template: the first value of a duplicated cookie name is used (it was the last); a malformed escape is kept | upgrading-040.changes.tsx:24 | session.ts; on main `parseCookieHeader` assigned every value in order (last wins) and called `decodeURIComponent` unguarded | True |
| Release-day template: app names lowercase letters, digits, `-`, `_`, at most 50; domains host names | upgrading-040.changes.tsx:28 | names.ts (`/^[a-z0-9][a-z0-9_-]{0,49}$/`, DOMAIN regex) | True |
| Release-day step 7 removes "once it is published" | scripts/release-day.mjs:258-262 | Dry run with the drafts from git history (06bbf28): step 7 no longer prints "already applied"; before the fix the replacement text was contained in the original, so it was skipped | Fixed |

## Blog draft (work-notes/drafts/red-team-before-0-4-0.md, not routed or linked)

| Claim | Line | Evidence | Verdict |
|---|---|---|---|
| Internal pass, not a third-party audit, nobody outside the project reviewed it | 13 | REDTEAM.md; devora.js/ROADMAP.md "Later: a third-party security audit" | True |
| Path traversal in 22 encodings against two apps | 18 | attack-prod.mjs `pathTraversal()`: 22 targets × marketing and dashboard, plus an absolute-form target | True |
| About 95 million fuzz inputs | 35 | fuzz.mts run, 20 s per target, seed 7: 10.56M + 4.76M + 41.41M + 3.19M + 17.82M + 2.29M + 1.21M + 2.02M + 11.31M = 94.6M | True |
| Six problems, all fixed in 0.4.0, each with a test that fails without the fix | 39 | H24 to H29; 0.4.0 is not published yet: true once it ships from this branch | True (on release) |
| Problem 1 to 6 descriptions | 41-62 | REDTEAM.md findings table; commits 89014cd, 84e9ebc, 9ce504a, 8ac6469, 7487bdf on devora.js release/0.4.0-final | True |
| The fuzzer found a gap in the first version of the ctx.url fix | 52 | fuzz.mts first run: `targetPathAndQuery` returned `//` for `https://comh//`; second version and the test "H27 (fuzz)" | True |
| A slow-header client was closed after 15 seconds | 64 | attack-prod run: 408 after 15125 ms | True |
| No parser input took more than about a tenth of a second | 64 | redos.mts slowest 117 ms (10 MB inputs); fuzz slowest single input 52.6 ms | True ("about") |
| `pnpm audit --prod` on the framework repository reports no known vulnerabilities; the test runner's advisories are dev-only and on the roadmap | 64-66 | Run 2026-11-05: "No known vulnerabilities found"; full audit: 14 advisories, all via vitest (finding H18) | True |
| One open item on the roadmap (H32, accepted) | Red-team pass | ROADMAP H32 | True |
| Findings H24 to H32 are in the framework's ROADMAP | 80 | devora.js/ROADMAP.md | True |
| No "fastest" claim, no tool or assistant named, date left for the publishing day | whole file | grep | True |

## Framework repository (devora.js release/0.4.0-final)

| Claim | File:line | Evidence | Verdict |
|---|---|---|---|
| Streaming: two causes found and fixed, each with a test failing without the fix | devora.js/CHANGELOG.md:64 | renderStreaming.test.ts "a boundary error that arrives before the shell is ready" (H19, existing) and "a failed island import is reported by the request that saw it, whatever the timer order" (H23, failed 5/5 with the fix stashed) | True |
| React 18's server renderer re-renders a suspended component from setImmediate | CHANGELOG.md:64 | react-dom 18.3.1 `react-dom-server.node.development.js`: `scheduleWork` → `setImmediate`; `pingTask` → `scheduleWork` | True |
| 1 failure in 96 before the first fix, 2 in 96 after it | CHANGELOG.md:64 | Figures from the maintainer's brief; not re-measured here | Needs local check |
| 200 of 200 runs with three CPU-bound processes on four cores | CHANGELOG.md:64; ROADMAP H23 | flake200.sh: `pass=200 fail=0` | True |
| On devora dev the allowedHosts list is also given to Vite; a listed host reaches the app instead of Vite's 403 | CHANGELOG.md:53; ROADMAP H22 | commands/dev.ts; allowedHosts.integration.test.ts (failed with 403 before the change, on Vite 6.4.5) | True |
| The package-managers run listens on PM_TEST_PORT and the next port, default 11090, refused outside 11000 to 11099 | CHANGELOG.md:70 | scripts/ci-scaffold-pm.mjs; run with 4300, 11099, "abc": exit 2 | True |
| CSRF item 3 and rateLimit: every method except GET, HEAD, OPTIONS | CHANGELOG.md:36, :51; AUTH.md:180; README.md:176; SECURITY-MODEL.md:62; CLAUDE.md:24 | csrf.ts, rateLimit.ts | True |
| Red-team line (H24 to H29) | CHANGELOG.md:55 | as above | True |
| `pnpm audit --prod --audit-level high` clean; all lockfile packages carry sha512; only esbuild has an install script | work-notes/redteam/REDTEAM.md | Runs 2026-11-05: audit "No known vulnerabilities found"; 161 sha512, 0 sha1; pnpm "Automatically ignored builds: esbuild" | True |

## Added after the first pass (experimental features)

| Claim | File:line | Evidence | Verdict |
|---|---|---|---|
| `devora desktop` is in the framework repository for the next release, not on npm, does nothing without `--experimental` | apps/docs/routes/cli-reference.tsx (section `#desktop`) | devora.js packages/cli/src/commands/desktop.ts `resolveApp` exits with a message without `--experimental`; packages/cli/src/index.ts | True |
| Sidecar on 127.0.0.1, random port, token per launch; other host 400, no token 403 | cli-reference.tsx `#desktop`; roadmap.tsx `#experimental` | packages/desktop/src/server.ts, token.ts; desktop.test.ts ("listens on 127.0.0.1 only, on a random port", "refuses a request without the token...") | True (tests run in phase 3; see devora.js work-notes/final-progress.md) |
| No IPC command unless desktop.json lists it; app CSP; nothing remote; updater only when signed | cli-reference.tsx `#desktop` | packages/desktop/src/tauri.ts, policy.ts; desktop.test.ts "generated Tauri project" | True |
| The window has not been clicked through yet | roadmap.tsx `#experimental` | devora.js work-notes/desktop/MANUAL-CHECK.md (all steps "not run") | True |
| The dev-server core: 127.0.0.1 only, no production, DNS-rebinding host check, WebSocket Origin + token, listed folders only, symlinks checked, no dotfiles; does not render pages; not reachable from the CLI | roadmap.tsx `#experimental` | devora.js packages/dev-server/src/*; devServerCore.test.ts; no import of @devorajs/dev-server in packages/cli | True |

## Performance draft (work-notes/perf-draft/PERFORMANCE-DRAFT.md, unpublished)

Every number in the tables is generated by devora.js `work-notes/perf/scripts/tables.mjs` from
`benchmarks/results/{raw,backend-raw}-2026-11-05-container-branch.json`. Sentences:

| Claim | Evidence | Verdict |
|---|---|---|
| JSON scenarios 4th of 10, 3rd on the invalid POST level with NestJS-Fastify | backend-raw-...-branch.json: D 13,372 / E 17,995 / F1 16,425 / G 13,591 rank 4; F2 16,569 (15,831–17,381) rank 3, NestJS-Fastify 16,489 (16,385–17,287), ranges overlap | True |
| Authenticated GET about 18,000 against 47,000 for Fastify | 17,995 vs 47,408 | True |
| Memory after load 248 MB vs 156–197 MB for Hono, Fastify, NestJS-Fastify, Express | 248; 156, 159, 188, 197 | True |
| SvelteKit starts faster, less idle memory, less JS on /items | 226 vs 333 ms; 132 vs 161 MB; 34,209 vs 46,657 B gzip | True |
| Highest req/s on A, B, C and shortest cold build of the five, in this run | raw-...-branch.json: A 28,799, B 3,778, C 15,618 (next: 6,739, 1,314, 5,583); build 1,228 ms vs 1,381 | True (this run only, as the draft says) |
| Runs minutes apart drifted by 10% or more | devora.js work-notes/perf/RESULTS.md: D sequential −13% vs interleaved +0.1% | True |
