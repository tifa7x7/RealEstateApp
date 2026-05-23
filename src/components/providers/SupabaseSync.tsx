'use client';

import { useSupabaseUserDataSync } from '@/hooks/useSupabaseUserDataSync';

/**
 * Renders nothing — mounted once at the layout level so that the user-data
 * sync runs as soon as a Supabase session is detected. The work is gated
 * inside the hook: it's a no-op when Supabase isn't configured.
 */
export function SupabaseSync(): null {
  useSupabaseUserDataSync();
  return null;
}
