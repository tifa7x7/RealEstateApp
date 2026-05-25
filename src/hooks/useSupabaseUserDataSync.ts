'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { fetchAlerts } from '@/lib/api/alerts';
import {
  bulkImportFavorites,
  fetchFavorites,
} from '@/lib/api/favorites';
import { fetchPortfolio, bulkImportPortfolio } from '@/lib/api/portfolio';
import { fetchProfile } from '@/lib/api/profile';
import { bulkImportSavedCalcs, fetchSavedCalcs } from '@/lib/api/saved-calcs';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useAppStore } from '@/store/app-store';

const MIGRATION_FLAG_PREFIX = 'real-estate-app:migrated:';

function hasMigrated(userId: string): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return window.localStorage.getItem(MIGRATION_FLAG_PREFIX + userId) === '1';
  } catch {
    return true;
  }
}

function markMigrated(userId: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(MIGRATION_FLAG_PREFIX + userId, '1');
  } catch {
    // best-effort
  }
}

/**
 * Side-effecting hook that, when Supabase is configured AND the user is
 * authenticated, performs:
 *
 *   1. A one-time per-user/per-device import of localStorage favorites,
 *      saved calculations, and portfolio rows into Supabase (only on the
 *      first sign-in on this device — re-signs are no-ops).
 *   2. A hydration of the Zustand store from the authoritative Supabase
 *      state, replacing whatever was loaded from localStorage.
 *
 * Subsequent mutations are mirrored to Supabase by the individual hooks
 * (useFavorites, useSavedCalcs, usePortfolio).
 */
export function useSupabaseUserDataSync(): void {
  const { supabaseEnabled, user, loading } = useAuth();
  const lastSyncedUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!supabaseEnabled || loading || !user) return;
    if (lastSyncedUserId.current === user.id) return;
    lastSyncedUserId.current = user.id;

    const client = getSupabaseBrowserClient();
    if (!client) return;

    const userId = user.id;
    const state = useAppStore.getState();

    async function run() {
      try {
        // Step 1: one-time localStorage → Supabase import.
        if (!hasMigrated(userId)) {
          if (state.favorites.length > 0 || state.favUnits.length > 0) {
            await bulkImportFavorites(
              client!,
              userId,
              state.favorites,
              state.favUnits,
            );
          }
          if (state.savedCalcs.length > 0) {
            await bulkImportSavedCalcs(client!, userId, state.savedCalcs);
          }
          if (state.rentalProperties.length > 0) {
            await bulkImportPortfolio(client!, userId, state.rentalProperties);
          }
          markMigrated(userId);
        }

        // Step 2: hydrate store from Supabase (source of truth).
        const [favs, calcs, portfolio, profile, alerts] = await Promise.all([
          fetchFavorites(client!),
          fetchSavedCalcs(client!),
          fetchPortfolio(client!),
          fetchProfile(client!, userId),
          fetchAlerts(client!),
        ]);
        useAppStore.setState({
          favorites: favs.projectIds,
          favUnits: favs.favUnitKeys,
          savedCalcs: calcs,
          rentalProperties: portfolio,
          priceAlerts: alerts,
          // Server-side tier is canonical (Phase 15). When the profile fetch
          // returned data, write it through; otherwise leave the store's
          // previous value (which defaults to 'free' for fresh sessions).
          ...(profile ? { currentTier: profile.tier } : {}),
        });
      } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[useSupabaseUserDataSync] sync failed:', err);
        }
      }
    }

    void run();
  }, [supabaseEnabled, user, loading]);
}
