/**
 * Profile data access. The `profiles` table is created by the
 * `handle_new_user` trigger when a user signs up, so the row always exists
 * for an authenticated session. The columns we care about are `tier` and
 * `locale`; the rest (created_at, etc.) are metadata.
 */
import type { AppSupabaseClient } from '@/lib/supabase/client';
import type { Locale, UserTier } from '@/lib/types';

export interface UserProfile {
  id: string;
  userName: string;
  tier: UserTier;
  locale: Locale;
}

/**
 * Fetch the authenticated user's profile row. Returns null when:
 *   - `client` is null (Supabase unconfigured — dev path)
 *   - The query errors (network / RLS / row missing — also rare since the
 *     `handle_new_user` trigger upserts the row on signup)
 *
 * Callers should treat null as "no real-tier info available; keep store
 * default of 'free'."
 */
export async function fetchProfile(
  client: AppSupabaseClient | null,
  userId: string,
): Promise<UserProfile | null> {
  if (!client) return null;
  const { data, error } = await client
    .from('profiles')
    .select('id, user_name, tier, locale')
    .eq('id', userId)
    .maybeSingle();

  if (error || !data) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[fetchProfile] no profile row:', error);
    }
    return null;
  }

  return {
    id: data.id,
    userName: data.user_name,
    tier: data.tier,
    locale: data.locale,
  };
}
