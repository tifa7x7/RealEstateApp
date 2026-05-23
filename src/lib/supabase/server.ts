import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient as createPlainClient } from '@supabase/supabase-js';
import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  getServiceRoleKey,
  isSupabaseConfigured,
} from './env';
import type { AppSupabaseClient } from './client';
import type { Database } from './database.types';

/**
 * Server-side Supabase client. Reads/writes auth cookies so Server Components
 * and Route Handlers see the same session as the browser.
 *
 * Returns `null` when env vars are missing — callers must fall back.
 */
export async function getSupabaseServerClient(): Promise<AppSupabaseClient | null> {
  if (!isSupabaseConfigured()) return null;
  const cookieStore = await cookies();
  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        // Server Components can't mutate cookies; this only succeeds inside
        // Route Handlers and Server Actions. Middleware refreshes sessions.
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // ignore — Server Component context
        }
      },
    },
  });
}

/**
 * Service-role client. Bypasses RLS — only use in server code (Route Handlers,
 * scripts) for admin operations like seeding. Returns `null` if the key is
 * missing.
 */
export function getSupabaseAdminClient(): AppSupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  const serviceKey = getServiceRoleKey();
  if (!serviceKey) return null;
  return createPlainClient<Database>(SUPABASE_URL, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Anon client without cookie integration. Safe to call from `generateMetadata`
 * and `generateStaticParams` at build time; RLS still applies. Use this for
 * public reads (projects, units) when no user session is involved.
 */
export function getSupabaseStaticClient(): AppSupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  return createPlainClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
