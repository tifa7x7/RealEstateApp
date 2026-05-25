import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, getServiceRoleKey } from '@/lib/supabase/env';

/**
 * Phase 16 — one-shot unsubscribe link.
 *
 * The dispatch edge function embeds `?token=<unsubscribe_token>` in every
 * email. Clicking flips `active = false` on the matching alert. No auth
 * required — the random 24-byte token IS the authorization. The same row
 * keeps its token after deactivation so re-clicks are idempotent.
 *
 * Uses the service-role client because the recipient won't have an
 * authenticated session when clicking from their inbox.
 */
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const SUCCESS_HTML = (msg: string) => `<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><title>RealEstateApp — Уведомления</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0d0f12; color: #e6e8eb; margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 24px; }
  .card { max-width: 480px; background: #161a20; border-radius: 16px; padding: 32px; text-align: center; }
  h1 { font-size: 20px; margin: 0 0 12px; }
  p { font-size: 14px; line-height: 1.55; color: #a0a4ab; margin: 0 0 20px; }
  a { color: #0fb5a8; text-decoration: none; font-weight: 600; }
</style></head>
<body><div class="card"><h1>${msg}</h1><p>Вы можете в любой момент включить уведомления снова в настройках аккаунта.</p><a href="/account/settings">Открыть настройки →</a></div></body></html>`;

const ERROR_HTML = (msg: string) => `<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><title>RealEstateApp — Ошибка</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0d0f12; color: #e6e8eb; margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 24px; }
  .card { max-width: 480px; background: #161a20; border-radius: 16px; padding: 32px; text-align: center; }
  h1 { font-size: 20px; margin: 0 0 12px; color: #f87171; }
  p { font-size: 14px; line-height: 1.55; color: #a0a4ab; margin: 0; }
</style></head>
<body><div class="card"><h1>Не удалось отписаться</h1><p>${msg}</p></div></body></html>`;

function htmlResponse(body: string, status: number): Response {
  return new Response(body, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token || token.length < 16) {
    return htmlResponse(ERROR_HTML('Ссылка устарела или повреждена.'), 400);
  }

  const serviceKey = getServiceRoleKey();
  if (!SUPABASE_URL || !serviceKey) {
    return NextResponse.json(
      { data: null, error: 'Service role key not configured' },
      { status: 503 },
    );
  }

  const admin = createClient(SUPABASE_URL, serviceKey, {
    auth: { persistSession: false },
  });

  const { data, error } = await admin
    .from('price_alerts')
    .update({ active: false })
    .eq('unsubscribe_token', token)
    .select('id')
    .maybeSingle();

  if (error) {
    return htmlResponse(ERROR_HTML('Попробуйте позже.'), 500);
  }
  if (!data) {
    // Token didn't match — already deactivated, deleted, or never existed.
    // We treat it as success to avoid leaking whether tokens exist.
    return htmlResponse(SUCCESS_HTML('Уведомление отключено'), 200);
  }

  return htmlResponse(SUCCESS_HTML('Уведомление отключено'), 200);
}
