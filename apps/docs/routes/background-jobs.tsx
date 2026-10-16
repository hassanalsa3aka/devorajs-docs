import { PageShell } from "@devorajs/core";
import { DOCS_NAV } from "../nav.js";
import { SiteFooter } from "../site-footer.js";
import { DocsLayout, Callout } from "../docs-layout.js";
import { pageMeta } from "../seo.js";
import snippets from "../data/jobs-snippets.json";

export const renderMode = "ssg";

export function meta() {
  return pageMeta("/background-jobs", {
    title: "Background jobs",
    description:
      "Devora.js has no job runner. Three tested ways to run work outside a request on one Node server: BullMQ with Redis and a worker, a SQLite queue with a worker, and node-cron.",
    image: "/og/background-jobs.png",
  });
}

export async function loader() {
  return {};
}

const Code = ({ children }: { children: string }) => (
  <div className="devora-card">
    <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{children}</pre>
  </div>
);

const BULLMQ_RUN = `npm install bullmq ioredis        # bullmq needs ioredis installed next to it
redis-server --port 6390          # or any Redis you already run; set REDIS_PORT to match
npx devora build --app=lab
PORT=4501 REDIS_PORT=6390 npx devora start --app=lab     # terminal 1: the app
REDIS_PORT=6390 node lab-scripts/worker-bullmq.mjs        # terminal 2: the worker

TOKEN=$(curl -s -X POST localhost:4501/api/session -d '{"username":"ann"}' | node -pe 'JSON.parse(require("fs").readFileSync(0)).token')
curl -s -X POST localhost:4501/api/jobs-bullmq -H "authorization: Bearer $TOKEN" -d '{"n":12}'
# {"id":"1"}
curl -s "localhost:4501/api/jobs-bullmq?id=1" -H "authorization: Bearer $TOKEN"
# {"id":"1","state":"completed","result":{"square":144,"by":"ann","worker":...}}`;

const SQLITE_RUN = `npx devora build --app=lab
PORT=4501 npx devora start --app=lab        # terminal 1: the app
node lab-scripts/worker-sqlite.mjs          # terminal 2: the worker (same folder, same jobs.db)

curl -s -X POST localhost:4501/api/jobs-sqlite -H "authorization: Bearer $TOKEN" -d '{"n":12}'
# {"id":1}
curl -s "localhost:4501/api/jobs-sqlite?id=1" -H "authorization: Bearer $TOKEN"
# {"id":1,"state":"completed","result":{"square":144,"worker":...}}`;

const CRON_RUN = `npx devora build --app=lab && PORT=4501 npx devora start --app=lab
ls lab-data/cron.log                        # not there yet: nothing has imported the route
curl -s localhost:4501/api/cron-status      # first request: the schedule is registered now
sleep 4; curl -s localhost:4501/api/cron-status
# {"registeredMsAgo":3528,"ticksSoFar":4,"pid":...}`;

export default function BackgroundJobs() {
  return (
    <PageShell nav={DOCS_NAV} footer={<SiteFooter />}>
      <DocsLayout active="background-jobs">
        <h1>Background jobs</h1>
        <p className="devora-lead">
          Devora.js has no job runner. A request handler answers and returns; work that should
          happen later, or on a schedule, runs somewhere else. Three setups were tested on one Node
          server. None was deployed to Vercel or Netlify.
        </p>

        <h2>Do you need one?</h2>
        <p>
          If the work takes less than a second or two and the user can wait, do it in the request
          and answer when it is done. Reach for a job when the work is slow (a report, an image, a
          batch of emails), must be retried if it fails, or must run on a schedule with no request
          to start it.
        </p>

        <div className="devora-grid">
          <div className="devora-card">
            <h3>BullMQ with Redis</h3>
            <p>A queue in Redis and a worker process. Retries, delays, several workers. Needs Redis.</p>
          </div>
          <div className="devora-card">
            <h3>A SQLite queue</h3>
            <p>A table and a worker, no Redis. One server only: both processes read the same file.</p>
          </div>
          <div className="devora-card">
            <h3>node-cron</h3>
            <p>A schedule inside the server process. It starts at the first request to its route.</p>
          </div>
        </div>

        <Callout kind="warning" title="Where this works">
          <p>
            All three were run on one Node server with <code>devora start</code>. A worker is a
            separate process that must stay on, so it needs an always-on host (a VPS, a container).
            A Vercel or Netlify function cannot run a worker, hold a timer, or share a file between
            invocations. Not verified on either platform: nothing was deployed.
          </p>
        </Callout>

        <h2>1. BullMQ with Redis and a worker</h2>
        <p>
          The API route enqueues the job and returns its id at once (202). A separate worker takes
          it from Redis. <code>bullmq</code> needs <code>ioredis</code> installed separately; without
          it the first request fails with a BullMQ message saying so.
        </p>
        <h3>The API route</h3>
        <Code>{snippets.bullmqEndpoint}</Code>
        <h3>The worker</h3>
        <Code>{snippets.bullmqWorker}</Code>
        <h3>Run it</h3>
        <p>From the project folder; replace <code>lab</code> with your app's name.</p>
        <Code>{BULLMQ_RUN}</Code>

        <h2>2. A SQLite queue and a worker (no Redis)</h2>
        <p>
          Node 24 ships <code>node:sqlite</code>, so there is nothing to install. The route inserts a
          row; the worker claims one waiting row with a single <code>UPDATE ... RETURNING</code>,
          runs it and writes the result back. WAL mode and a busy timeout let the app and the worker
          share the file.
        </p>
        <h3>The API route</h3>
        <Code>{snippets.sqliteEndpoint}</Code>
        <h3>The worker</h3>
        <Code>{snippets.sqliteWorker}</Code>
        <h3>Run it</h3>
        <Code>{SQLITE_RUN}</Code>

        <h2>3. node-cron inside the server</h2>
        <p>
          <code>node-cron</code> runs a function on a schedule inside the same process. There is no
          start-up hook in <code>devora start</code>, so the schedule is registered when the module
          that contains it is first imported: for a built route that is the first request to it. If
          the schedule must run from boot, hit the route once at start-up, or run the scheduler as
          its own process.
        </p>
        <Code>{snippets.cronEndpoint}</Code>
        <Code>{CRON_RUN}</Code>
        <p>
          A schedule inside the server runs once per server process. Two instances run it twice; use
          a lock, or the queue patterns above, if that matters.
        </p>

        <h2>What was verified, and what was not</h2>
        <Callout kind="info" title="Checked on 0.3.4, one local Node server">
          <ul>
            <li>
              Enqueueing without a login answers 401; with a Bearer token it answers 202 and an id.
            </li>
            <li>
              BullMQ: the worker ran the job and the route returned <code>completed</code> with the
              result (about 330 ms). The Redis was a local <code>redis-server</code>.
            </li>
            <li>SQLite: the same, about 100 to 220 ms.</li>
            <li>
              node-cron: no <code>cron.log</code> before the first request; four ticks in the next
              3.5 seconds.
            </li>
          </ul>
        </Callout>
        <Callout kind="warning" title="Not verified">
          <ul>
            <li>Vercel and Netlify: nothing was deployed. The enqueue side can reach a hosted Redis over the network; the worker needs another host. A SQLite file on a function's disk is not shared or durable. Use the platform's own scheduled functions instead of node-cron.</li>
            <li>Retries, failure handling, several workers and many jobs were not tested.</li>
            <li>A production Redis, and memory use of a worker over time.</li>
          </ul>
        </Callout>

        <p>
          For pushing a result to the browser when a job finishes, see <a href="/live-updates">Live updates</a>.
        </p>
      </DocsLayout>
    </PageShell>
  );
}
