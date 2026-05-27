// Phase 16 + Phase 17 — Daily snapshot + alert dispatch.
//
// Phase 17 changed `compute_pending_alerts` to return list-scoped rows:
// each row now carries a `list_id` in addition to the per-unit price data,
// and a user can have multiple list-scoped alerts (one per list they care
// about). Grouping for the email digest is still per-user; the email body
// names the affected list so recipients know which one fired.
//
// Deno-style Supabase Edge Function. Deploy with:
//   supabase functions deploy dispatch-price-alerts --no-verify-jwt
// then schedule from the dashboard (Cron tab) at e.g. `15 3 * * *` UTC.
//
// Flow:
//   1. Invoke `capture_price_snapshots()` (idempotent for today).
//   2. Call `compute_pending_alerts()` and group rows by user.
//   3. Look up each user's tier from `profiles`.
//        - free: only deliver when last_notified_at is >7 days old or null
//        - pro:  deliver on every trigger
//   4. Send one email per user (digest if multiple units triggered).
//   5. POST to `mark_alerts_notified` with the delivered alert ids.
//
// Required env (configured via `supabase secrets set ...`):
//   SUPABASE_URL                 (auto-injected)
//   SUPABASE_SERVICE_ROLE_KEY    (auto-injected)
//   RESEND_API_KEY               (or replace renderEmail() with your provider)
//   ALERT_FROM_EMAIL             — sender (e.g. "alerts@yourdomain.ru")
//   SITE_URL                     — used for unsubscribe links + email CTAs

// @ts-nocheck — this file targets Deno; Node's tsc shouldn't typecheck it.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { renderAlertEmail, type AlertEmailRow } from '../_shared/email-templates.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
const FROM_EMAIL = Deno.env.get('ALERT_FROM_EMAIL') ?? 'alerts@example.com';
const SITE_URL = Deno.env.get('SITE_URL') ?? 'https://example.com';
const FREE_DIGEST_DAYS = 7;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

interface PendingAlert {
  alert_id: string;
  user_id: string;
  list_id: string;
  project_id: number;
  unit_id: string | null;
  previous_price: number;
  current_price: number;
  delta_pct: number;
  threshold_pct: number;
  last_notified_at: string | null;
  unsubscribe_token: string;
}

interface ProfileRow {
  id: string;
  locale: 'ru' | 'en';
  tier: 'free' | 'pro';
}

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.warn('[dispatch-price-alerts] RESEND_API_KEY missing; dry-run only');
    console.log(`-> would email ${to}: ${subject}`);
    return false;
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
  });
  if (!res.ok) {
    console.error('[dispatch-price-alerts] send failed:', res.status, await res.text());
    return false;
  }
  return true;
}

function shouldDeliver(tier: 'free' | 'pro', lastNotifiedAt: string | null): boolean {
  if (tier === 'pro') return true;
  if (!lastNotifiedAt) return true;
  const last = new Date(lastNotifiedAt).getTime();
  return Date.now() - last >= FREE_DIGEST_DAYS * ONE_DAY_MS;
}

Deno.serve(async () => {
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false },
  });

  // 1. Snapshot today.
  const { error: snapErr } = await admin.rpc('capture_price_snapshots');
  if (snapErr) {
    return new Response(JSON.stringify({ ok: false, error: snapErr.message }), {
      status: 500,
    });
  }

  // 2. Compute pending.
  const { data: pending, error: pendErr } = await admin.rpc('compute_pending_alerts');
  if (pendErr) {
    return new Response(JSON.stringify({ ok: false, error: pendErr.message }), {
      status: 500,
    });
  }

  const rows = (pending ?? []) as PendingAlert[];
  if (rows.length === 0) {
    return new Response(JSON.stringify({ ok: true, sent: 0, skipped: 0 }), {
      status: 200,
    });
  }

  // 3. Group by user.
  const byUser = new Map<string, PendingAlert[]>();
  for (const row of rows) {
    if (!byUser.has(row.user_id)) byUser.set(row.user_id, []);
    byUser.get(row.user_id)!.push(row);
  }

  // 4. Load profiles + auth.users emails for these users.
  const userIds = [...byUser.keys()];
  const { data: profiles } = await admin
    .from('profiles')
    .select('id, locale, tier')
    .in('id', userIds);
  const profileById = new Map<string, ProfileRow>(
    (profiles ?? []).map((p: ProfileRow) => [p.id, p]),
  );

  // auth.admin.listUsers() paginates; we only need a handful here so the
  // first page (default 50) is fine for the typical send size.
  const { data: usersPage } = await admin.auth.admin.listUsers({ perPage: 200 });
  const emailById = new Map<string, string>();
  for (const u of usersPage?.users ?? []) {
    if (u.email) emailById.set(u.id, u.email);
  }

  // 5. Project + list lookups (so the email can name what changed).
  const projectIds = [...new Set(rows.map((r) => r.project_id))];
  const { data: projects } = await admin
    .from('projects')
    .select('id, name, city')
    .in('id', projectIds);
  const projectById = new Map<number, { id: number; name: string; city: string }>(
    (projects ?? []).map((p) => [p.id, p]),
  );

  const listIds = [...new Set(rows.map((r) => r.list_id))];
  const { data: listsData } = await admin
    .from('lists')
    .select('id, name')
    .in('id', listIds);
  const listNameById = new Map<string, string>(
    (listsData ?? []).map((l: { id: string; name: string }) => [l.id, l.name]),
  );

  let sent = 0;
  let skipped = 0;
  const deliveredAlertIds: string[] = [];

  for (const [userId, userRows] of byUser) {
    const profile = profileById.get(userId);
    const email = emailById.get(userId);
    if (!profile || !email) {
      skipped += userRows.length;
      continue;
    }

    // Free tier sees only rows whose alert is old enough to digest.
    const eligible = userRows.filter((r) => shouldDeliver(profile.tier, r.last_notified_at));
    if (eligible.length === 0) {
      skipped += userRows.length;
      continue;
    }

    const items: AlertEmailRow[] = eligible.map((r) => ({
      listName: listNameById.get(r.list_id) ?? 'Избранное',
      projectName: projectById.get(r.project_id)?.name ?? `ЖК #${r.project_id}`,
      city: projectById.get(r.project_id)?.city ?? '',
      unitId: r.unit_id,
      previousPrice: r.previous_price,
      currentPrice: r.current_price,
      deltaPct: r.delta_pct,
      projectUrl: `${SITE_URL}/projects/${r.project_id}${r.unit_id ? `/units/${encodeURIComponent(r.unit_id)}` : ''}`,
      unsubscribeUrl: `${SITE_URL}/api/alerts/unsubscribe?token=${r.unsubscribe_token}`,
    }));

    const { subject, html } = renderAlertEmail(profile.locale, items, profile.tier);
    const ok = await sendEmail(email, subject, html);
    if (ok) {
      sent += eligible.length;
      for (const r of eligible) deliveredAlertIds.push(r.alert_id);
    } else {
      skipped += eligible.length;
    }
  }

  if (deliveredAlertIds.length > 0) {
    await admin.rpc('mark_alerts_notified', { alert_ids: deliveredAlertIds });
  }

  return new Response(JSON.stringify({ ok: true, sent, skipped }), { status: 200 });
});
