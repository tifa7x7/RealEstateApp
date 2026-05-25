/**
 * Single source of truth for Supabase env vars. All other code should check
 * `isSupabaseConfigured()` before attempting to construct a client; when
 * unconfigured in dev the app falls back to seed data + localStorage. In
 * production the configuration is REQUIRED — boot-time assertion below.
 *
 * NEXT_PUBLIC_* vars are inlined by Next.js at build time on both server and
 * client. The service-role key is read only on the server.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export function isSupabaseConfigured(): boolean {
  return SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;
}

export function getServiceRoleKey(): string | null {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return key && key.length > 0 ? key : null;
}

/**
 * Phase 15 production gate. The stub-auth + seed-fallback paths are dev-only
 * conveniences; shipping a production deploy without Supabase would mean
 * shipping anonymous-as-any-user auth and read-only-from-bundled-JSON data.
 * That's not a valid production posture, and CLAUDE.md's "Prototype
 * boundaries" section commits to closing this gate at Phase 15.
 *
 * Throws at module load so an unconfigured production build crashes early
 * and obviously instead of silently downgrading to stub mode.
 */
if (process.env.NODE_ENV === 'production' && !isSupabaseConfigured()) {
  throw new Error(
    '[supabase/env] NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY ' +
      'are required in production. Configure them in your deploy environment ' +
      'before going live. See README.md for setup.',
  );
}
