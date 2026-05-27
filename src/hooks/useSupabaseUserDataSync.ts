'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { fetchAlerts } from '@/lib/api/alerts';
import {
  bulkImportToDefaultList,
  fetchDefaultListId,
  fetchListItems,
  fetchListsForUser,
} from '@/lib/api/lists';
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
 *      saved calculations, and portfolio rows into Supabase. Phase 17:
 *      favorites + fav_units now flow into the user's default `Избранное`
 *      list (`list_items`).
 *   2. A hydration of the Zustand store from the authoritative Supabase
 *      state, replacing whatever was loaded from localStorage.
 *
 * Subsequent mutations are mirrored to Supabase by the individual hooks
 * (useFavorites, useLists, useSavedCalcs, usePortfolio, useAlerts).
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
        // Step 1: resolve / create the default list, then run one-time
        // localStorage → Supabase import targeted at it.
        const defaultListId = await fetchDefaultListId(client!, userId);
        if (!defaultListId) {
          // The handle_new_user trigger should have created this; if it
          // didn't (e.g., signup predates the Phase-17 trigger update),
          // there's nothing more to do until next sign-in. Bail safely.
          if (process.env.NODE_ENV !== 'production') {
            console.warn(
              '[useSupabaseUserDataSync] no default list for user; ' +
                'skipping favorites hydration',
            );
          }
        }

        if (!hasMigrated(userId)) {
          if (defaultListId &&
              (state.favorites.length > 0 || state.favUnits.length > 0)) {
            await bulkImportToDefaultList(
              client!,
              defaultListId,
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
        const [defaultItems, allLists, calcs, portfolio, profile, alerts] =
          await Promise.all([
            defaultListId
              ? fetchListItems(client!, defaultListId)
              : Promise.resolve([]),
            fetchListsForUser(client!, userId),
            fetchSavedCalcs(client!),
            fetchPortfolio(client!),
            fetchProfile(client!, userId),
            fetchAlerts(client!),
          ]);

        // Project favorites = default-list items where unit_id is null.
        // Unit favorites = items where unit_id is set, key shape preserved
        // ("${projectId}__${unitId}") for backwards-compat with consumers.
        const favorites = defaultItems
          .filter((i) => i.unitId === null)
          .map((i) => i.projectId);
        const favUnits = defaultItems
          .filter((i) => i.unitId !== null)
          .map((i) => `${i.projectId}__${i.unitId}`);

        useAppStore.setState({
          favorites,
          favUnits,
          savedCalcs: calcs,
          rentalProperties: portfolio,
          priceAlerts: alerts,
          defaultListId: defaultListId ?? null,
          userLists: allLists,
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
