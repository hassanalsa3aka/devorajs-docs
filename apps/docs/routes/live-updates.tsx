import { PageShell } from "@devorajs/core";
import { DOCS_NAV } from "../nav.js";
import { SiteFooter } from "../site-footer.js";
import { DocsLayout, Callout } from "../docs-layout.js";
import { pageMeta } from "../seo.js";

export const renderMode = "ssg";

export function meta() {
  return pageMeta("/live-updates", {
    title: "Live updates",
    description:
      "Devora.js has no built-in WebSockets. Poll, or run a small separate realtime server: the token flow, the CSP setting and a runnable example.",
    image: "/og/live-updates.png",
  });
}

export async function loader() {
  return {};
}

const TOKEN_ROUTE = `// apps/app/endpoints/realtime-token.ts
import { apiRoute } from "@devorajs/core";
import { issueRealtimeToken } from "@devorajs/backend/realtimeToken";

export const methods = ["GET"];

export const handler = apiRoute((_req, ctx) => {
  ctx${""}.requireAuth(); // 401 without a login
  const user = (ctx.session as { username: string }).username;
  const { token, expiresIn } = issueRealtimeToken(user); // 60 seconds
  return {
    status: 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    body: JSON.stringify({ token, expiresIn, url: process.env.REALTIME_URL }),
  };
});`;

const PUBLISH = `// packages/backend/orders.ts — after the data changed
await fetch(\`\${process.env.REALTIME_URL}/publish\`, {
  method: "POST",
  headers: {
    "content-type": "application/json",
    authorization: \`Bearer \${process.env.REALTIME_PUBLISH_SECRET}\`,
  },
  body: JSON.stringify({ userId: user, event: "order", data: order }),
});`;

const SERVER = `// realtime/server.mjs (the part that matters)
io.use((socket, next) => {
  const claims = verifyToken(socket.handshake.auth?.token, tokenSecret); // HMAC + expiry
  if (!claims) return next(new Error("unauthorized"));
  socket.data.userId = claims.sub;
  next();
});
io.on("connection", (socket) => socket.join(\`user:\${socket.data.userId}\`));
// POST /publish: check the shared secret, then
io.to(\`user:\${message.userId}\`).emit(message.event, message.data);`;

const CSP = `// apps/app/app.config.ts
export default defineApp({
  security: {
    // Replaces the default policy, so repeat its directives and add connect-src.
    csp:
      "default-src 'self'; style-src 'self' 'unsafe-inline'; object-src 'none'; base-uri 'self'; " +
      "connect-src 'self' https://realtime.example.com wss://realtime.example.com",
  },
});`;

const CLIENT = `// the island: a fresh token on every (re)connect, polling if it can't connect
const socket = io(url, {
  auth: (cb) => fetch("/api/realtime-token").then((r) => r.json()).then((b) => cb({ token: b.token })),
  reconnectionAttempts: 3,
});
socket.on("connect", () => { stopPolling(); setStatus("live"); });
socket.on("order", (order) => setOrders((list) => [...list, order]));
socket.on("connect_error", startPolling);
socket.on("disconnect", startPolling);`;

export default function LiveUpdates() {
  return (
    <PageShell nav={DOCS_NAV} footer={<SiteFooter />}>
      <DocsLayout active="live-updates">
        <h1>Live updates</h1>
        <p className="devora-lead">
          Devora.js has no built-in WebSockets or server-sent events. An API route returns one whole
          response, and Vercel and Netlify functions cannot hold a connection open. Two things
          work: poll, or run a small separate realtime server next to your app.
        </p>

        <h2>Polling or a realtime server?</h2>
        <div className="devora-grid">
          <div className="devora-card">
            <h3>Polling</h3>
            <p>
              The page calls an API route every few seconds. Updates arrive up to one interval
              late. No extra process, and it works on every host the app does. Start here.
            </p>
          </div>
          <div className="devora-card">
            <h3>A realtime server</h3>
            <p>
              A separate Node process keeps a connection open to each browser and pushes events
              the moment they happen. It needs a host that stays on, and one more thing to deploy.
            </p>
          </div>
        </div>
        <p>
          Reach for the realtime server when a few seconds of delay is not acceptable: chat,
          presence, a dashboard people watch. Keep the polling fallback either way.
        </p>

        <h2>How the pieces fit</h2>
        <ol>
          <li>
            A logged-in browser asks a Devora API route for a token. The route requires a session,
            so without a login it answers 401. The token holds the user id and lives 60 seconds.
          </li>
          <li>
            The browser connects to the realtime server with that token. The server checks the
            signature and expiry once, at connect time, and puts the socket in a room for that user.
          </li>
          <li>
            When data changes, your Devora code calls <code>POST /publish</code> on the realtime
            server with a secret only the two servers know.
          </li>
          <li>The realtime server emits the event to that user's room: every open tab receives it.</li>
        </ol>
        <p>
          The token is an HMAC-SHA256 over <code>{"{ sub, exp }"}</code> made with{" "}
          <code>node:crypto</code>; no JWT library. The session cookie never leaves the app.
        </p>

        <h2>The token route</h2>
        <div className="devora-card">
          <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{TOKEN_ROUTE}</pre>
        </div>

        <h2>The realtime server</h2>
        <p>
          A plain Node file with <code>socket.io</code>. It verifies the token on connect and
          emits to one room per user.
        </p>
        <div className="devora-card">
          <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{SERVER}</pre>
        </div>

        <h2>Publishing from the app</h2>
        <div className="devora-card">
          <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{PUBLISH}</pre>
        </div>
        <p>
          If the publish fails the data is still saved; a client that missed the push catches up on
          its next poll or reconnect.
        </p>

        <h2>The browser, with a polling fallback</h2>
        <div className="devora-card">
          <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{CLIENT}</pre>
        </div>

        <h2>The CSP setting</h2>
        <p>
          The default Content-Security-Policy is{" "}
          <code>default-src 'self'; style-src 'self' 'unsafe-inline'; object-src 'none'; base-uri 'self'</code>.
          <code> default-src</code> also covers <code>connect-src</code>, so the browser refuses a
          connection to another origin. Set <code>security.csp</code> in the app's{" "}
          <code>app.config.ts</code>; it replaces the whole default, so repeat the default
          directives and add <code>connect-src</code> with both the <code>https:</code> origin
          (Socket.IO's polling transport) and the <code>wss:</code> origin.
        </p>
        <div className="devora-card">
          <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{CSP}</pre>
        </div>
        <p>
          Without it the console shows{" "}
          <code>Connecting to 'http://…/socket.io/…' violates the following Content Security Policy directive: "default-src 'self'"</code>{" "}
          and, with the fallback in place, the page keeps working by polling.
        </p>

        <h2>Deploying it</h2>
        <ul>
          <li>
            <strong>The realtime server needs an always-on host</strong>: a VPS, a container
            platform, or an instance that does not sleep. A free tier that spins down drops every
            connection.
          </li>
          <li>
            Behind nginx, forward the upgrade headers (<code>Upgrade</code> and{" "}
            <code>Connection "upgrade"</code>); <code>devora generate:proxy</code> writes them for the apps it
            proxies, and the realtime server's <code>location</code> needs the same two lines.
          </li>
          <li>
            One instance is fine to start. Several need a shared adapter (
            <code>@socket.io/redis-adapter</code>) so a publish that lands on one instance reaches
            sockets connected to another.
          </li>
          <li>Keep the token secret and the publish secret separate, and out of the browser.</li>
        </ul>

        <Callout kind="info" title="What was verified">
          <p>
            The runnable example is in the repository under <code>examples/realtime</code>. In CI
            and locally: the token route answers 401 without a login; the realtime server rejects
            a missing, tampered, wrongly signed and expired token; a publish with the wrong secret
            is a 401, and with the right one reaches only that user; an order placed through the
            API reaches the connected client. In Chromium against a local production build the page
            went live and received a pushed order in about 35 ms, and with the default CSP it
            logged the violation above and fell back to polling.
          </p>
          <p>
            Not verified: a deployment to a cloud host, a reverse proxy in front of the realtime
            server, several instances with a Redis adapter, or behavior under load.
          </p>
        </Callout>
      </DocsLayout>
    </PageShell>
  );
}
