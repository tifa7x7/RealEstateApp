'use client';

import { useMemo } from 'react';
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
import { useAppStore } from '@/store/app-store';

export interface FavUnitEntry {
  project: Project;
  unit: Unit;
}

export interface UseFavoritesResult {
  favoriteProjects: Project[];
  favoriteUnits: FavUnitEntry[];
  toggleFavorite: (id: number) => void;
  toggleFavUnit: (projectId: number, unitId: string) => void;
  isFavorite: (id: number) => boolean;
  isFavUnit: (projectId: number, unitId: string) => boolean;
  clear: () => void;
}

function logSyncError(err: unknown): void {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[useFavorites] sync failed:', err);
  }
}

export function useFavorites(): UseFavoritesResult {
  const favorites = useAppStore((s) => s.favorites);
  const favUnits = useAppStore((s) => s.favUnits);
  const toggleFavoriteStore = useAppStore((s) => s.toggleFavorite);
  const toggleFavUnitStore = useAppStore((s) => s.toggleFavUnit);
  const { supabaseEnabled, user } = useAuth();

  const favoriteProjects = useMemo<Project[]>(() => {
    const out: Project[] = [];
    for (const id of favorites) {
      const p = PROJECTS.find((proj) => proj.id === id);
      if (p) out.push(p);
    }
    return out;
  }, [favorites]);

  const favoriteUnits = useMemo<FavUnitEntry[]>(() => {
    const out: FavUnitEntry[] = [];
    for (const key of favUnits) {
      const sep = key.indexOf('__');
      if (sep < 0) continue;
      const projectId = Number(key.slice(0, sep));
      const unitId = key.slice(sep + 2);
      const project = PROJECTS.find((p) => p.id === projectId);
      const unit = project?.units.find((u) => u.id === unitId);
      if (project && unit) out.push({ project, unit });
    }
    return out;
  }, [favUnits]);

  const toggleFavorite = (id: number) => {
    const wasFav = favorites.includes(id);
    toggleFavoriteStore(id);
    if (!supabaseEnabled || !user) return;
    const client = getSupabaseBrowserClient();
    if (!client) return;
    const op = wasFav ? removeFavorite : addFavorite;
    void op(client, user.id, id).catch(logSyncError);
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
  };
}
