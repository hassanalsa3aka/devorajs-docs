#!/usr/bin/env node
/**
 * Writes apps/docs/data/npm-downloads.json for the /compare page: one full
 * Monday–Sunday week of npm downloads per package, from npm's public API
 * (https://api.npmjs.org/downloads/range/<start>:<end>/<package>).
 *
 * npm's API sometimes reports 0 for every package on a day it's missing
 * data, so the script walks back week by week until it finds one with no
 * zero days for any package other than @devorajs/core (which can really
 * have a zero day), and records which week it used.
 *
 * Usage: node scripts/fetch-npm-downloads.mjs
 */
import { writeFileSync } from "node:fs";

const PACKAGES = ["express", "next", "react-router", "@nestjs/core", "fastify", "astro", "@sveltejs/kit", "@devorajs/core"];
const OWN = "@devorajs/core";

const iso = (d) => d.toISOString().slice(0, 10);

async function week(start) {
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 6);
  const rows = [];
  for (const pkg of PACKAGES) {
    const url = `https://api.npmjs.org/downloads/range/${iso(start)}:${iso(end)}/${pkg}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${url}: ${res.status}`);
    const body = await res.json();
    const days = body.downloads.map((d) => d.downloads);
    rows.push({ pkg, downloads: days.reduce((a, b) => a + b, 0), zeroDays: days.filter((n) => n === 0).length, days: days.length });
  }
  return { start: iso(start), end: iso(end), rows };
}

// The most recent Monday whose week has fully ended.
const today = new Date();
const monday = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7) - 7);

for (let tries = 0; tries < 8; tries++) {
  const w = await week(monday);
  const incomplete = w.rows.filter((r) => r.pkg !== OWN && (r.zeroDays > 0 || r.days !== 7));
  if (incomplete.length === 0) {
    const out = {
      source: "https://api.npmjs.org/downloads/range/",
      fetchedOn: iso(today),
      weekStart: w.start,
      weekEnd: w.end,
      packages: w.rows.map(({ pkg, downloads }) => ({ pkg, downloads })).sort((a, b) => b.downloads - a.downloads),
    };
    writeFileSync(new URL("../apps/docs/data/npm-downloads.json", import.meta.url), JSON.stringify(out, null, 2) + "\n");
    console.log(`week ${w.start} – ${w.end}:`, out.packages.map((p) => `${p.pkg} ${p.downloads}`).join(", "));
    process.exit(0);
  }
  console.log(`week ${w.start} has missing days for ${incomplete.map((r) => r.pkg).join(", ")}; trying the week before`);
  monday.setUTCDate(monday.getUTCDate() - 7);
}
throw new Error("no complete week in the last 8");
