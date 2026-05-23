/**
 * Single source of truth for Supabase env vars. All other code should check
 * `isSupabaseConfigured()` before attempting to construct a client; when
 * unconfigured the app falls back to seed data + localStorage (Phases 1-7
 * behavior).
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
