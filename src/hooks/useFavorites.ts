'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/components/providers/ToastProvider';
import { PROJECTS } from '@/data/projects';
import {
  addFavorite,
  addFavUnit,
  removeFavorite,
  removeFavUnit,
} from '@/lib/api/favorites';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { Project, Unit } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import { FAVORITES_LIMIT_FREE, usePaywall } from '@/hooks/usePaywall';
import { useAppStore } from '@/store/app-store';

export interface FavUnitEntry {
  project: Project;
  unit: Unit;
}

export type FavoriteToggleResult =
  | { ok: true }
  | { ok: false; reason: 'limit-reached'; limit: number };

export interface UseFavoritesResult {
  favoriteProjects: Project[];
  favoriteUnits: FavUnitEntry[];
  /** Returns `{ ok: false, reason: 'limit-reached' }` when a free-tier user tries to add a 26th favorite. Removing is always allowed. */
  toggleFavorite: (id: number) => FavoriteToggleResult;
  toggleFavUnit: (projectId: number, unitId: string) => void;
  isFavorite: (id: number) => boolean;
  isFavUnit: (projectId: number, unitId: string) => boolean;
  clear: () => void;
  /** Active free-tier limit (Pro returns +Infinity for unbounded). */
  limit: number;
  isPro: boolean;
}

function logSyncError(err: unknown): void {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[useFavorites] sync failed:', err);
  }
}

/**
 * Wraps the Zustand `favorites` + `favUnits` slices with tier-aware limits
 * and Supabase write-through (Phase 8 contract). Adding past the free-tier
 * cap emits an info toast — callers don't have to handle the result unless
 * they want to (e.g., open a richer UpgradePrompt).
 */
export function useFavorites(): UseFavoritesResult {
  const favorites = useAppStore((s) => s.favorites);
  const favUnits = useAppStore((s) => s.favUnits);
  const toggleFavoriteStore = useAppStore((s) => s.toggleFavorite);
  const toggleFavUnitStore = useAppStore((s) => s.toggleFavUnit);
  const { supabaseEnabled, user } = useAuth();
  const { isPro } = usePaywall('unlimited-favorites');
  const toast = useToast();

  const limit = isPro ? Number.POSITIVE_INFINITY : FAVORITES_LIMIT_FREE;

  // Resolve favorited project ids against the React Query cache populated
  // by `useProjects`. Falls through to the bundled seed when the cache is
  // empty (initial paint before useProjects has fired). When Supabase is
  // live, the cache holds DB-sourced projects; when not, the cache equals
  // the seed — same lookup works in both cases. Phase 15 carry-over from
  // Phase 8: stops `useFavorites` from reading PROJECTS as runtime truth.
  const { data: allProjects = PROJECTS } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => PROJECTS as Project[],
    initialData: PROJECTS as Project[],
    enabled: false,
  });

  const favoriteProjects = useMemo<Project[]>(() => {
    const out: Project[] = [];
    for (const id of favorites) {
      const p = allProjects.find((proj) => proj.id === id);
      if (p) out.push(p);
    }
    return out;
  }, [favorites, allProjects]);

  const favoriteUnits = useMemo<FavUnitEntry[]>(() => {
    const out: FavUnitEntry[] = [];
    for (const key of favUnits) {
      const sep = key.indexOf('__');
      if (sep < 0) continue;
      const projectId = Number(key.slice(0, sep));
      const unitId = key.slice(sep + 2);
      const project = allProjects.find((p) => p.id === projectId);
      const unit = project?.units.find((u) => u.id === unitId);
      if (project && unit) out.push({ project, unit });
    }
    return out;
  }, [favUnits, allProjects]);

  const toggleFavorite = (id: number): FavoriteToggleResult => {
    const wasFav = favorites.includes(id);

    // Removing is always allowed — cap only applies to adding.
    if (!wasFav && favorites.length >= limit) {
      toast.info(
        `Лимит ${FAVORITES_LIMIT_FREE} избранных на Free. Pro снимает ограничение.`,
      );
      return { ok: false, reason: 'limit-reached', limit: FAVORITES_LIMIT_FREE };
    }

    toggleFavoriteStore(id);
    if (!supabaseEnabled || !user) return { ok: true };
    const client = getSupabaseBrowserClient();
    if (!client) return { ok: true };
    const op = wasFav ? removeFavorite : addFavorite;
    void op(client, user.id, id).catch(logSyncError);
    return { ok: true };
  };

  const toggleFavUnit = (projectId: number, unitId: string) => {
    const wasFav = favUnits.includes(`${projectId}__${unitId}`);
    toggleFavUnitStore(projectId, unitId);
    if (!supabaseEnabled || !user) return;
    const client = getSupabaseBrowserClient();
    if (!client) return;
    const op = wasFav ? removeFavUnit : addFavUnit;
    void op(client, user.id, projectId, unitId).catch(logSyncError);
  };

  const clear = () => {
    for (const id of [...favorites]) toggleFavorite(id);
    for (const key of [...favUnits]) {
      const sep = key.indexOf('__');
      if (sep < 0) continue;
      toggleFavUnit(Number(key.slice(0, sep)), key.slice(sep + 2));
    }
  };

  return {
    favoriteProjects,
    favoriteUnits,
    toggleFavorite,
    toggleFavUnit,
    isFavorite: (id) => favorites.includes(id),
    isFavUnit: (projectId, unitId) => favUnits.includes(`${projectId}__${unitId}`),
    clear,
    limit,
    isPro,
  };
}
