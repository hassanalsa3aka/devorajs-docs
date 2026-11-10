// Writes apps/docs/data/benchmarks.json (the pages suite panel on /performance and the home page) and
// apps/docs/data/backend-benchmarks.json (the API routes on /performance) from the devora.js repository's
// current run (benchmarks/results/engines-2026-11-09-node26/). Devora.js appears twice: key "devora" /
// "devora-api" is the default engine (Vite 8); "devora-sekhem" is Sekhem, the experimental engine of our own.
// Usage: node scripts/sync-current-bench.mjs <node26-pages.json> <node26-mac-backend.json>
import fs from "node:fs";
import path from "node:path";

const [pagesFile, backendFile] = process.argv.slice(2);
if (!pagesFile || !backendFile) throw new Error("usage: node scripts/sync-current-bench.mjs <pages.json> <backend.json>");
const data = path.join(path.dirname(new URL(import.meta.url).pathname), "..", "apps/docs/data");
const rename = (f, name) => ({ ...f, name, version: f.coreVersion ?? f.version });

const pages = JSON.parse(fs.readFileSync(pagesFile, "utf-8"));
const pf = pages.frameworks;
const pagesOut = {
  date: pages.date,
  machine: pages.machine,
  config: pages.config,
  frameworks: {
    devora: rename(pf["devora-pages-vite"], "Devora.js (Vite 8)"),
    "devora-sekhem": rename(pf["devora-pages-sekhem"], "Devora.js (Sekhem)"),
    next: pf.next,
    astro: pf.astro,
    sveltekit: pf.sveltekit,
    "react-router": pf["react-router"],
    nuxt: pf.nuxt,
  },
};
fs.writeFileSync(path.join(data, "benchmarks.json"), JSON.stringify(pagesOut, null, 2) + "\n");

const backend = JSON.parse(fs.readFileSync(backendFile, "utf-8"));
const bf = backend.frameworks;
const backendOut = {
  source: path.basename(backendFile),
  date: backend.date,
  machine: backend.machine,
  config: backend.config,
  frameworks: {
    "devora-api": rename(bf["devora-vite"], "Devora.js (Vite 8)"),
    "devora-sekhem": rename(bf["devora-sekhem"], "Devora.js (Sekhem)"),
    express: bf.express,
    fastify: bf.fastify,
    hono: bf.hono,
    "nest-express": bf["nest-express"],
    "nest-fastify": bf["nest-fastify"],
    next: bf.next,
    sveltekit: bf.sveltekit,
    "react-router": bf["react-router"],
    astro: bf.astro,
  },
};
fs.writeFileSync(path.join(data, "backend-benchmarks.json"), JSON.stringify(backendOut, null, 2) + "\n");
console.log(`pages: ${Object.keys(pagesOut.frameworks).length} frameworks, backend: ${Object.keys(backendOut.frameworks).length} frameworks`);
