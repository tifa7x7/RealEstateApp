'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  isSupabaseConfigured,
} from './env';
import type { Database } from './database.types';

export type AppSupabaseClient = SupabaseClient<Database>;

let cached: AppSupabaseClient | null = null;

/**
 * Returns a singleton browser Supabase client, or `null` if env vars are
 * missing (the app should then fall back to the seed/localStorage path).
 */
export function getSupabaseBrowserClient(): AppSupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (cached) return cached;
  cached = createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
  return cached;
}
