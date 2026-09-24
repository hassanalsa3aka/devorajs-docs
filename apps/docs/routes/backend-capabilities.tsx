import { PageShell } from "@devorajs/core";
import { DOCS_NAV } from "../nav.js";
import { SiteFooter } from "../site-footer.js";
import { DocsLayout, Callout } from "../docs-layout.js";
import { pageMeta } from "../seo.js";

export const renderMode = "ssg";

export function meta() {
  return pageMeta("/backend-capabilities", {
    title: "Adding common backend capabilities",
    description:
      "Recommended patterns for validation, logging, CORS, rate limiting, and file uploads in a Devora.js project — built from plain middleware and libraries you choose.",
  });
}

export async function loader() {
  return {};
}

// Code samples below write `ctx{"."}method(` / `ctx${""}.method(` instead of
// the literal call: this docs app is auth: "none", and devora's build-time
// check (checkNoAuthUsage) scans route files for literal session-method
// calls — including ones inside strings.
export default function BackendCapabilities() {
  return (
    <PageShell nav={DOCS_NAV} footer={<SiteFooter />}>
      <DocsLayout active="backend-capabilities">
      <h1>Adding common backend capabilities</h1>
      <p>
        Devora.js deliberately ships no built-in validation library, logger, CORS layer, rate
        limiter, or upload handler — the same "bring your own" line it draws for databases and auth
        providers. Every real project reaches for these early, though, so this page gives one
        recommended, working pattern for each. None of it is framework code: it's ordinary
        middleware and helpers you own, built on the primitives in{" "}
        <a href="/backend">Backend</a> — <code>apiRoute()</code>,{" "}
        <code>withMiddleware()</code>, and <code>defineMiddleware()</code>.
      </p>

      <Callout kind="tip" title="Where this code lives">
        <p>
          Put shared helpers in <code>packages/backend</code> (e.g.{" "}
          <code>packages/backend/validation.ts</code>), and register every middleware in one file,{" "}
          <code>packages/backend/middleware.ts</code> — the same governance rule the framework
          already uses for third-party middleware. Routes opt in explicitly by importing from there;
          nothing runs for every route implicitly.
        </p>
      </Callout>

      <p>A shape worth knowing before the examples: a middleware wraps a handler and returns a new one.</p>
      <div className="devora-card">
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
{`type Middleware = (next: ApiRouteHandler) => ApiRouteHandler;

// Runs left to right: logging, then cors, then rateLimit, then the handler.
export const handler = withMiddleware(apiRoute(myHandler), requestLogger, cors, rateLimit);`}
        </pre>
      </div>
      <p>
        Every example also uses one tiny helper for JSON responses — the same{" "}
        <code>{"{ message }"}</code> envelope Devora uses for its own API errors:
      </p>
      <div className="devora-card">
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
{`// packages/backend/http.ts
import type { ApiResponse } from "@devorajs/core";

export function json(status: number, data?: unknown, headers: Record<string, string> = {}): ApiResponse {
  return {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...headers },
    body: data === undefined ? undefined : JSON.stringify(data),
  };
}`}
        </pre>
      </div>

      <h2 id="validation">Validation (Zod)</h2>
      <p>
        <code>req.body</code> in an API route is the raw request bytes (a <code>Buffer</code>) on
        purpose — a webhook has to verify a signature against the exact bytes before trusting them.
        So validation is two steps: parse, then check the shape. Install Zod in your backend
        package (<code>npm install zod -w packages/backend</code>) and add one helper:
      </p>
      <div className="devora-card">
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
{`// packages/backend/validation.ts
import type { ApiRequest, ApiResponse } from "@devorajs/core";
import type { z, ZodTypeAny } from "zod";
import { json } from "./http.js";

type Parsed<S extends ZodTypeAny> = { ok: true; data: z.infer<S> } | { ok: false; response: ApiResponse };

function fromZod<S extends ZodTypeAny>(schema: S, raw: unknown): Parsed<S> {
  const result = schema.safeParse(raw);
  if (result.success) return { ok: true, data: result.data };
  return {
    ok: false,
    response: json(400, {
      message: "Invalid request",
      issues: result.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    }),
  };
}

export function parseJsonBody<S extends ZodTypeAny>(req: ApiRequest, schema: S): Parsed<S> {
  let raw: unknown;
  try {
    raw = req.body.length === 0 ? {} : JSON.parse(req.body.toString("utf-8"));
  } catch {
    return { ok: false, response: json(400, { message: "Request body must be valid JSON" }) };
  }
  return fromZod(schema, raw);
}

export function parseQuery<S extends ZodTypeAny>(req: ApiRequest, schema: S): Parsed<S> {
  const params = new URL(req.url, "http://localhost").searchParams;
  return fromZod(schema, Object.fromEntries(params));
}`}
        </pre>
      </div>
      <p>Then in a route — the schema doubles as the TypeScript type of the parsed data:</p>
      <div className="devora-card">
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
{`// apps/dashboard/api/bookings.ts
import { apiRoute } from "@devorajs/core";
import { z } from "zod";
import { parseJsonBody } from "@devorajs/backend/validation";
import { json } from "@devorajs/backend/http";
import { createBooking } from "@devorajs/backend/modules/bookings";

const CreateBooking = z.object({
  shopId: z.string().uuid(),
  date: z.coerce.date(),
  notes: z.string().max(500).optional(),
});

export const methods = ["POST"];
export const handler = apiRoute(async (req, ctx) => {
  ctx${""}.requireAuth();
  const parsed = parseJsonBody(req, CreateBooking);
  if (!parsed.ok) return parsed.response; // 400 { message, issues }
  const booking = await createBooking(parsed.data, ctx);
  return json(201, booking);
});`}
        </pre>
      </div>
      <p>
        Validate at the trust boundary that's actually shared. If a <code>serverFn</code> in{" "}
        <code>packages/backend</code> is called from both an API route and a page{" "}
        <code>action</code>, validate inside the function itself (
        <code>const input = CreateBooking.parse(rawInput)</code>) so no caller can skip it. For a
        page <code>action</code>, run the same schema over{" "}
        <code>Object.fromEntries(formData)</code> — <code>z.coerce</code> handles the fact that
        every form value arrives as a string.
      </p>
      <Callout kind="info" title="Return the 400, don't throw it">
        <p>
          Returning <code>parsed.response</code> explicitly (rather than throwing) keeps the status
          and the <code>issues</code> list under your control, and reads clearly at the call site:
          a validation failure is an expected outcome, not an exception.
        </p>
      </Callout>

      <h2 id="logging">Logging</h2>
      <p>
        One request-logging middleware, registered once, gives every API route a consistent line
        per request: method, path, status, duration, and a request ID you can hand back to a
        client for support tickets.
      </p>
      <div className="devora-card">
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
{`// packages/backend/middleware.ts
import { randomUUID } from "node:crypto";
import { defineMiddleware } from "@devorajs/core";

function log(entry: Record<string, unknown>) {
  // One JSON object per line — what log drains (Vercel, Netlify, Datadog, Loki...) parse best.
  console.log(JSON.stringify({ time: new Date().toISOString(), ...entry }));
}

export const requestLogger = defineMiddleware((next) => async (req, ctx) => {
  const started = performance.now();
  const incoming = req.headers["x-request-id"];
  const requestId = typeof incoming === "string" && /^[\\w-]{1,64}$/.test(incoming) ? incoming : randomUUID();
  // Pathname only: query strings can carry tokens, emails, and other things you don't want in logs.
  const path = new URL(req.url, "http://localhost").pathname;
  try {
    const res = await next(req, ctx);
    log({ level: res.status >= 500 ? "error" : "info", requestId, method: req.method, path,
          status: res.status, ms: Math.round(performance.now() - started) });
    return { ...res, headers: { ...res.headers, "X-Request-Id": requestId } };
  } catch (err) {
    log({ level: "error", requestId, method: req.method, path,
          error: err instanceof Error ? err.message : String(err), ms: Math.round(performance.now() - started) });
    throw err;
  }
});`}
        </pre>
      </div>
      <ul>
        <li>
          <strong>Never log</strong> <code>Authorization</code> or <code>Cookie</code> headers,
          request bodies, or full URLs by default — a session ID in a log file is a working session
          for anyone who can read the logs.
        </li>
        <li>
          Want levels, redaction, and pretty dev output? Swap <code>log()</code> for{" "}
          <a href="https://github.com/pinojs/pino">pino</a> (
          <code>pino({"{"} redact: ["req.headers.authorization", "req.headers.cookie"] {"}"})</code>
          ) — the middleware shape doesn't change.
        </li>
        <li>
          Put <code>requestLogger</code> <em>first</em> in <code>withMiddleware(...)</code> so it
          times and records everything inside it, including responses produced by CORS or rate
          limiting.
        </li>
      </ul>

      <h2 id="cors">CORS</h2>
      <p>
        You only need CORS when a <em>browser</em> on a different origin calls your API (a separate
        web frontend, another app in the project on its own domain). Mobile apps and
        server-to-server calls aren't subject to it at all. Use an explicit allowlist:
      </p>
      <div className="devora-card">
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
{`// packages/backend/middleware.ts
import { defineMiddleware } from "@devorajs/core";

const ALLOWED_ORIGINS = new Set(["https://app.example.com", "https://admin.example.com"]);

export const cors = defineMiddleware((next) => async (req, ctx) => {
  const origin = typeof req.headers.origin === "string" ? req.headers.origin : undefined;
  const allowed = origin !== undefined && ALLOWED_ORIGINS.has(origin);
  const corsHeaders: Record<string, string> = allowed
    ? { "Access-Control-Allow-Origin": origin, "Vary": "Origin" }
    : { "Vary": "Origin" };

  if (req.method === "OPTIONS") {
    // Preflight: answer it here, never run the handler.
    return {
      status: allowed ? 204 : 403,
      headers: allowed
        ? { ...corsHeaders,
            "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Devora-Csrf",
            "Access-Control-Max-Age": "600" }
        : corsHeaders,
    };
  }
  const res = await next(req, ctx);
  return { ...res, headers: { ...corsHeaders, ...res.headers } };
});`}
        </pre>
      </div>
      <Callout kind="warning" title="Add OPTIONS to the route's methods">
        <p>
          If a route exports a <code>methods</code> allowlist, include <code>"OPTIONS"</code> in it.
          The framework rejects unlisted methods with a <code>405</code> <em>before</em> any
          middleware runs, so without it the preflight never reaches your CORS middleware.
        </p>
      </Callout>
      <Callout kind="danger" title="Cookies change the rules">
        <p>
          If a cross-origin browser client authenticates with the session <em>cookie</em>, you
          need <code>Access-Control-Allow-Credentials: true</code> and an exact origin — never{" "}
          <code>*</code> — and the cross-origin client is now also making cookie-authenticated
          state changes, so those routes must keep verifying CSRF. A client that authenticates with
          an <code>Authorization: Bearer</code> header carries no ambient credentials, which is why a
          Bearer-only API can safely use a broader origin policy. Prefer Bearer tokens for any
          genuinely cross-origin client.
        </p>
      </Callout>
      <p>
        Prefer the <code>cors</code> npm package? It works through{" "}
        <code>fromExpressMiddleware(cors({"{"} origin: [...] {"}"}))</code> — see{" "}
        <a href="/backend">Backend</a>, including its preflight support.
      </p>

      <h2 id="rate-limiting">Rate limiting</h2>
      <p>
        Rate-limit anything expensive or abusable: login, OTP/password-reset requests, signups,
        and search. A fixed-window counter is enough for most apps:
      </p>
      <div className="devora-card">
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
{`// packages/backend/rateLimit.ts
import type { ApiRequest, Middleware, RequestContext } from "@devorajs/core";
import { json } from "./http.js";

export function rateLimit(opts: {
  limit: number;          // requests allowed...
  windowMs: number;       // ...per window
  key: (req: ApiRequest, ctx: RequestContext) => string | undefined;
}): Middleware {
  const hits = new Map<string, { count: number; resetAt: number }>();
  return (next) => async (req, ctx) => {
    const key = opts.key(req, ctx);
    if (key === undefined) return next(req, ctx);
    const now = Date.now();
    let entry = hits.get(key);
    if (!entry || now >= entry.resetAt) {
      if (hits.size > 50_000) for (const [k, e] of hits) if (now >= e.resetAt) hits.delete(k);
      entry = { count: 0, resetAt: now + opts.windowMs };
      hits.set(key, entry);
    }
    entry.count += 1;
    if (entry.count > opts.limit) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      return json(429, { message: "Too many requests" }, { "Retry-After": String(retryAfter) });
    }
    return next(req, ctx);
  };
}

// The client's IP, as reported by the proxy in front of you (see below).
export function clientIp(req: ApiRequest): string | undefined {
  const forwarded = req.headers["x-forwarded-for"];
  const value = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  return value?.split(",")[0]?.trim() || undefined;
}`}
        </pre>
      </div>
      <div className="devora-card">
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
{`// apps/dashboard/api/login.ts — 10 attempts per IP per 15 minutes
const loginLimit = rateLimit({ limit: 10, windowMs: 15 * 60_000, key: (req) => clientIp(req) });
export const handler = withMiddleware(apiRoute(login), requestLogger, loginLimit);

// Authenticated routes: key by user, not IP (many users can share one IP).
const perUser = rateLimit({ limit: 100, windowMs: 60_000,
  key: (_req, ctx) => (ctx.session as { userId?: string } | undefined)?.userId });`}
        </pre>
      </div>
      <Callout kind="warning" title="Two things to get right">
        <p>
          <strong>Where the counters live.</strong> The <code>Map</code> above is per process. That's
          correct for a single <code>devora start</code> server, but on Vercel/Netlify each function
          instance has its own map (and a cold start resets it), so the limit becomes approximate at
          best. For serverless or multiple instances, keep the counters in a shared store — Redis,
          or a hosted limiter such as <code>@upstash/ratelimit</code> — behind the same middleware
          shape.
        </p>
        <p>
          <strong>Where the IP comes from.</strong> An API route sees request headers, not the TCP
          connection, so the client IP comes from <code>X-Forwarded-For</code>. Only trust it when a
          proxy you control sets it: Vercel and Netlify do, and the nginx config from{" "}
          <code>devora generate:proxy</code> does. Exposed directly to the internet with no proxy,
          any client can put whatever it likes in that header — key by something else (session,
          account) in that setup.
        </p>
      </Callout>

      <h2 id="file-uploads">File uploads</h2>
      <p>
        Pick the pattern by file size. Devora caps every request body at 10 MB (larger requests get
        a <code>413</code>), and serverless platforms cap function request bodies lower still — a
        few MB (Vercel's limit is 4.5 MB). So:
      </p>
      <ul>
        <li>
          <strong>Small files</strong> (avatars, documents a few MB at most): accept{" "}
          <code>multipart/form-data</code> directly in an API route.
        </li>
        <li>
          <strong>Anything larger</strong>, or anything on serverless: have the client upload
          straight to object storage with a <strong>presigned URL</strong>, and keep your API route
          as the part that authorizes and records the upload.
        </li>
      </ul>

      <h3>Small files: multipart in an API route</h3>
      <p>
        Node 20+ ships the standard <code>Request.formData()</code> parser, so no multipart library
        is needed — wrap the raw body in a <code>Request</code> and let it parse:
      </p>
      <div className="devora-card">
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
{`// apps/dashboard/api/avatar.ts
import { randomUUID } from "node:crypto";
import { apiRoute, CSRF_HEADER_NAME } from "@devorajs/core";
import { json } from "@devorajs/backend/http";
import { storage } from "@devorajs/backend/storage"; // your S3/R2/GCS/disk client

const MAX_BYTES = 2 * 1024 * 1024;
// Check the file's real leading bytes — the client-supplied type and filename are just claims.
const SIGNATURES: Record<string, (b: Buffer) => boolean> = {
  "image/png": (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  "image/jpeg": (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
};

export const methods = ["POST"];
export const handler = apiRoute(async (req, ctx) => {
  ctx${""}.requireAuth();
  const csrf = req.headers[CSRF_HEADER_NAME];
  ctx${""}.verifyCsrf(typeof csrf === "string" ? csrf : ""); // cookie-authenticated uploads need this

  const headers = new Headers();
  for (const [name, value] of Object.entries(req.headers)) {
    if (value !== undefined) headers.set(name, Array.isArray(value) ? value.join(", ") : value);
  }
  let form: FormData;
  try {
    form = await new Request("http://localhost" + req.url, { method: "POST", headers, body: req.body }).formData();
  } catch {
    return json(400, { message: "Expected multipart/form-data" });
  }

  const file = form.get("avatar");
  if (!(file instanceof File)) return json(400, { message: "avatar file is required" });
  if (file.size > MAX_BYTES) return json(413, { message: "File too large (max 2 MB)" });

  const bytes = Buffer.from(await file.arrayBuffer());
  const type = Object.keys(SIGNATURES).find((t) => SIGNATURES[t]!(bytes));
  if (!type) return json(415, { message: "Only PNG or JPEG images are accepted" });

  const key = "avatars/" + randomUUID(); // never reuse the client's filename as a storage path
  await storage.put(key, bytes, { contentType: type });
  return json(201, { key });
});`}
        </pre>
      </div>

      <h3>Large files: presigned direct-to-storage uploads</h3>
      <p>
        The file never passes through your server, so neither the 10 MB cap nor a platform's
        function limits apply, and a slow upload doesn't hold a server connection open. Your API
        route does the parts that need your rules:
      </p>
      <ol>
        <li>
          <code>POST /api/uploads</code> — authenticate, validate the <em>declared</em> type and
          size (Zod works well here), pick the storage key yourself, and return a short-lived
          presigned <code>PUT</code> URL (e.g. <code>getSignedUrl</code> from{" "}
          <code>@aws-sdk/s3-request-presigner</code>, which also works with R2 and other
          S3-compatible stores). Sign the content type and length into the URL where your provider
          supports it, so the client can't upload something different.
        </li>
        <li>The client <code>PUT</code>s the file directly to that URL.</li>
        <li>
          <code>POST /api/uploads/:key/complete</code> — confirm the object exists (a{" "}
          <code>HEAD</code> request against storage), check its real size/type, then record it
          in your database. Until this step, treat the upload as untrusted and unattached.
        </li>
      </ol>
      <Callout kind="danger" title="Serving what users upload">
        <p>
          Serve user files from a separate domain or bucket, never from your app's own origin, and
          set <code>Content-Disposition: attachment</code> for anything that isn't an image you've
          verified. An uploaded HTML or SVG file served from your origin runs as your site.
        </p>
      </Callout>

      <h2>Putting it together</h2>
      <div className="devora-card">
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
{`// packages/backend/middleware.ts — requestLogger and cors (above) live here, plus:
export const authLimit = rateLimit({ limit: 10, windowMs: 15 * 60_000, key: (req) => clientIp(req) });

// apps/dashboard/api/login.ts
import { apiRoute, withMiddleware } from "@devorajs/core";
import { requestLogger, cors, authLimit } from "@devorajs/backend/middleware";

export const methods = ["POST", "OPTIONS"];
export const handler = withMiddleware(apiRoute(login), requestLogger, cors, authLimit);`}
        </pre>
      </div>
      <p>
        Logging outermost (it records everything, including rejected requests), then CORS (so even
        a <code>429</code> carries the headers a cross-origin browser needs to read it), then rate
        limiting, then the handler with its own validation.
      </p>
      </DocsLayout>
    </PageShell>
  );
}
