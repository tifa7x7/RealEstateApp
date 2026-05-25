import { type NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

/**
 * Billing checkout endpoint. Triggered by `UpgradePrompt`'s "Перейти на Pro"
 * CTA. Verifies the user is authenticated, then redirects to the configured
 * billing provider's hosted checkout (YooKassa / CloudPayments / ProductBoard
 * — TBD before launch).
 *
 * Phase 15 ships the contract; the provider integration itself needs:
 *   - `BILLING_PROVIDER` env (one of: 'yookassa', 'cloudpayments', 'productboard')
 *   - Provider API key(s) in env
 *   - A `prices` table in Supabase (or hardcoded plan map) mapping
 *     `'pro-monthly' | 'pro-yearly'` → provider-side price ids
 *
 * Until those are in place the route returns 501 with a structured error
 * the client can show to the user.
 */
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface CheckoutBody {
  plan: 'pro-monthly' | 'pro-yearly';
  /** Where to send the user after success. Falls back to /account/settings. */
  successPath?: string;
}

export async function POST(req: NextRequest) {
  const provider = process.env.BILLING_PROVIDER ?? '';
  if (!provider) {
    return NextResponse.json(
      {
        data: null,
        error:
          'Billing provider not configured. Set BILLING_PROVIDER env and run the corresponding provider setup. See README.md → Phase 15 setup.',
      },
      { status: 501 },
    );
  }

  // Auth check — only signed-in users can start a checkout.
  const client = await getSupabaseServerClient();
  if (!client) {
    return NextResponse.json(
      { data: null, error: 'Supabase not configured' },
      { status: 503 },
    );
  }
  const { data: auth } = await client.auth.getUser();
  if (!auth.user) {
    return NextResponse.json(
      { data: null, error: 'Not authenticated' },
      { status: 401 },
    );
  }

  let body: CheckoutBody;
  try {
    body = (await req.json()) as CheckoutBody;
  } catch {
    return NextResponse.json(
      { data: null, error: 'Invalid JSON body' },
      { status: 400 },
    );
  }

  if (body.plan !== 'pro-monthly' && body.plan !== 'pro-yearly') {
    return NextResponse.json(
      { data: null, error: `Unknown plan: ${body.plan}` },
      { status: 400 },
    );
  }

  // Provider integration goes here. Each provider has its own SDK + request
  // shape; this stub returns 501 until the chosen provider is wired up.
  return NextResponse.json(
    {
      data: null,
      error:
        `Provider '${provider}' integration not yet implemented. ` +
        `Wire up the SDK call here and return { data: { checkoutUrl } }.`,
    },
    { status: 501 },
  );
}
