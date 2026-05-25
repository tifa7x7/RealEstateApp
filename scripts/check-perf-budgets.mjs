#!/usr/bin/env node
/**
 * Parses the output of `next build` and asserts per-route First Load JS
 * budgets defined in CLAUDE.md (`Conventions → Performance budgets`).
 *
 * Reads from stdin so it can be piped:
 *   npm run build | node scripts/check-perf-budgets.mjs
 *
 * Exit 0 if every route is within budget, 1 if any route is over (so CI
 * fails the PR). The script is intentionally lenient about unknown / new
 * routes — they pass through with a warning but don't break the build until
 * the budget map is updated.
 */

// First-Load-JS ceilings in kB. Mirror CLAUDE.md.
const BUDGETS = {
  '/': 180,
  '/_not-found': 180,
  '/account': 180,
  '/account/favorites': 180,
  '/account/portfolio': 180,
  '/account/saved': 180,
  '/account/settings': 180,
  '/blog': 180,
  '/blog/[slug]': 180,
  '/manifest.webmanifest': 180,
  '/projects/[id]': 180,
  '/projects/[id]/units/[unitId]': 180,
  '/robots.txt': 180,
  '/sitemap.xml': 180,

  // Heavy routes — chart / map / calculator. 240 per CLAUDE.md.
  '/map': 240,
  '/analytics': 240,
  '/calculator': 240,
};

const ACCOUNT_HEADROOM_NOTE =
  'All routes on canonical CLAUDE.md budgets (Phase 15 tightened /account/* from 200 → 180).';

function parseSizeKb(token) {
  if (!token) return null;
  const match = token.match(/^([\d.]+)\s*(k|m)?b$/i);
  if (!match) return null;
  const value = parseFloat(match[1]);
  const unit = (match[2] ?? '').toLowerCase();
  if (unit === 'm') return value * 1024;
  return value;
}

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}

async function main() {
  const text = await readStdin();
  if (!text.includes('First Load JS')) {
    console.error('[perf-budgets] No `First Load JS` column in input — was `next build` actually run?');
    process.exit(2);
  }

  // Each route line looks like:
  //   ┌ ○ /                                    9.44 kB         142 kB
  // We split on whitespace runs and take the last column (First Load JS).
  const lines = text.split('\n');
  const offenders = [];
  const passed = [];
  const unknown = [];

  for (const line of lines) {
    // Skip non-route lines.
    if (!/^[┌├└│]/.test(line) && !line.trim().startsWith('├') && !line.trim().startsWith('└')) continue;
    if (line.includes('First Load JS')) continue;

    // Strip the leading tree characters.
    const cleaned = line.replace(/^[┌├└│\s]+/, '').replace(/^[○ƒ●λ]\s+/, '');
    const cols = cleaned.split(/\s{2,}/).filter(Boolean);
    if (cols.length < 3) continue;

    const route = cols[0].trim();
    const firstLoad = parseSizeKb(cols[cols.length - 1]);
    if (firstLoad === null) continue;

    const budget = BUDGETS[route];
    if (budget === undefined) {
      unknown.push({ route, firstLoad });
      continue;
    }
    if (firstLoad > budget) {
      offenders.push({ route, firstLoad, budget });
    } else {
      passed.push({ route, firstLoad, budget });
    }
  }

  console.log('Performance budgets — per-route First Load JS\n');
  for (const p of passed) {
    console.log(
      `  ok      ${p.route.padEnd(40)} ${p.firstLoad.toFixed(0).padStart(4)} kB  (budget ${p.budget})`,
    );
  }
  for (const u of unknown) {
    console.warn(
      `  ?       ${u.route.padEnd(40)} ${u.firstLoad.toFixed(0).padStart(4)} kB  (no budget set — add to scripts/check-perf-budgets.mjs)`,
    );
  }
  for (const o of offenders) {
    console.error(
      `  FAIL    ${o.route.padEnd(40)} ${o.firstLoad.toFixed(0).padStart(4)} kB  (over ${o.budget})`,
    );
  }

  console.log(`\n${ACCOUNT_HEADROOM_NOTE}`);

  if (offenders.length > 0) {
    console.error(`\n${offenders.length} route(s) over budget. Failing build.`);
    process.exit(1);
  }
  console.log('\nAll routes within budget.');
}

main().catch((err) => {
  console.error('[perf-budgets] script error:', err);
  process.exit(2);
});
