'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/components/providers/ToastProvider';
import { PROJECTS } from '@/data/projects';
import { addItem, removeItem } from '@/lib/api/lists';
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
 * Phase 17 — `useFavorites` is now a backwards-compat shim over the
 * **default list** (`Избранное`). The public API is unchanged; the server
 * write goes through `addItem`/`removeItem` on `list_items` instead of the
 * old `favorites`/`fav_units` tables.
 *
 * Components that want multi-list capabilities should use `useLists`
 * directly. This hook stays simple for the "I just want to star things"
 * use case that's the majority of interactions.
 */
export function useFavorites(): UseFavoritesResult {
  const favorites = useAppStore((s) => s.favorites);
  const favUnits = useAppStore((s) => s.favUnits);
  const toggleFavoriteStore = useAppStore((s) => s.toggleFavorite);
  const toggleFavUnitStore = useAppStore((s) => s.toggleFavUnit);
  const defaultListId = useAppStore((s) => s.defaultListId);
  const { supabaseEnabled, user } = useAuth();
  const { isPro } = usePaywall('unlimited-favorites');
  const toast = useToast();

  const limit = isPro ? Number.POSITIVE_INFINITY : FAVORITES_LIMIT_FREE;

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

    if (!wasFav && favorites.length >= limit) {
      toast.info(
        `Лимит ${FAVORITES_LIMIT_FREE} избранных на Free. Pro снимает ограничение.`,
      );
      return { ok: false, reason: 'limit-reached', limit: FAVORITES_LIMIT_FREE };
    }

    toggleFavoriteStore(id);
    if (!supabaseEnabled || !user || !defaultListId) return { ok: true };
    const client = getSupabaseBrowserClient();
    if (!client) return { ok: true };
    const op = wasFav
      ? removeItem(client, defaultListId, id, null)
      : addItem(client, defaultListId, { projectId: id });
    void op.catch(logSyncError);
    return { ok: true };
  };

  const toggleFavUnit = (projectId: number, unitId: string) => {
    const wasFav = favUnits.includes(`${projectId}__${unitId}`);
    toggleFavUnitStore(projectId, unitId);
    if (!supabaseEnabled || !user || !defaultListId) return;
    const client = getSupabaseBrowserClient();
    if (!client) return;
    const op = wasFav
      ? removeItem(client, defaultListId, projectId, unitId)
      : addItem(client, defaultListId, { projectId, unitId });
    void op.catch(logSyncError);
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
