#!/usr/bin/env node
/**
 * Copies the devora.js repo's benchmarks/results/latest.json (written by its
 * `npm run report`) to apps/docs/data/benchmarks.json, which /performance and
 * the home page read. Run after a new benchmark run, then rebuild.
 * Usage: node scripts/sync-benchmarks.mjs [path/to/latest.json]
 *   (default: ../devora.js/benchmarks/results/latest.json, a sibling checkout)
 */
import { copyFileSync, readFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const from = path.resolve(process.argv[2] ?? path.join(root, "../devora.js/benchmarks/results/latest.json"));
const data = JSON.parse(readFileSync(from, "utf-8"));
if (!data.frameworks?.devora) throw new Error(`${from} has no Devora.js results`);
copyFileSync(from, path.join(root, "apps/docs/data/benchmarks.json"));
const backend = path.join(path.dirname(from), "backend-latest.json");
copyFileSync(backend, path.join(root, "apps/docs/data/backend-benchmarks.json"));
const b = JSON.parse(readFileSync(backend, "utf-8"));
if (b.frameworks["devora-api"].version !== data.frameworks.devora.version) throw new Error(`pages run (${data.frameworks.devora.version}) and backend run (${b.frameworks["devora-api"].version}) are different Devora.js versions`);
console.log(`apps/docs/data/backend-benchmarks.json ← ${backend}`);
console.log(`apps/docs/data/benchmarks.json ← ${from} (${data.date.slice(0, 10)}, ${Object.keys(data.frameworks).length} frameworks)`);
