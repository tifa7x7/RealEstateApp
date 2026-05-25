import { type NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, getServiceRoleKey } from '@/lib/supabase/env';

/**
 * Billing webhook receiver. The selected provider POSTs payment events here:
 *
 *   - `subscription.created`     → upgrade `profiles.tier` to 'pro'
 *   - `subscription.renewed`     → no-op (already Pro), but stamp activity
 *   - `subscription.cancelled`   → downgrade to 'free' at end of period
 *   - `subscription.payment_failed` → notify user; keep tier until cancel
 *
 * Phase 15 ships the routing + signature-verification skeleton. Each
 * provider needs:
 *   - `BILLING_WEBHOOK_SECRET` env to verify signatures (HMAC or similar)
 *   - Provider-specific event schema in `parseEvent()` below
 *   - Mapping from provider customer/subscription ids to our `auth.users.id`
 *     (typically stored in a `billing_customers` table — Phase 16 candidate)
 *
 * Uses the service-role Supabase client to bypass RLS for `profiles.tier`
 * writes — these are server-side, signature-verified mutations and the
 * `profiles_update_own` policy wouldn't admit them otherwise.
 */
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface NormalizedEvent {
  type:
    | 'subscription.created'
    | 'subscription.renewed'
    | 'subscription.cancelled'
    | 'subscription.payment_failed'
    | 'unknown';
  /** Supabase auth.users.id this event refers to. */
  userId: string | null;
}

function verifySignature(_payload: string, _signature: string | null): boolean {
  const secret = process.env.BILLING_WEBHOOK_SECRET;
  if (!secret) return false;
  // TODO: provider-specific HMAC verification. Until implemented every
  // request fails verification and the handler 401s.
  return false;
}

function parseEvent(_body: unknown): NormalizedEvent {
  // TODO: provider-specific shape parsing. Each provider posts a different
  // JSON; this normalizer must map their schema to `NormalizedEvent` so the
  // switch below stays provider-agnostic.
  return { type: 'unknown', userId: null };
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-billing-signature');

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json(
      {
        data: null,
        error:
          'Webhook signature verification failed. Configure BILLING_WEBHOOK_SECRET and implement verifySignature() for your chosen provider.',
      },
      { status: 401 },
    );
  }

  const serviceKey = getServiceRoleKey();
  if (!SUPABASE_URL || !serviceKey) {
    return NextResponse.json(
      {
        data: null,
        error:
          'Webhook handler requires SUPABASE_SERVICE_ROLE_KEY to write to profiles.tier.',
      },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { data: null, error: 'Invalid JSON body' },
      { status: 400 },
    );
  }

  const event = parseEvent(body);
  if (!event.userId) {
    return NextResponse.json(
      { data: null, error: 'Event missing user mapping' },
      { status: 400 },
    );
  }

  const admin = createClient(SUPABASE_URL, serviceKey, {
    auth: { persistSession: false },
  });

  if (event.type === 'subscription.created') {
    await admin.from('profiles').update({ tier: 'pro' }).eq('id', event.userId);
  } else if (event.type === 'subscription.cancelled') {
    await admin.from('profiles').update({ tier: 'free' }).eq('id', event.userId);
  }
  // 'renewed' and 'payment_failed' don't change tier in this flow.

  // Invalidate any SSR/ISR pages that read the tier (account settings etc.).
  revalidatePath('/account/settings');
  revalidatePath('/account');

  return NextResponse.json({ data: { received: true, type: event.type }, error: null });
}
