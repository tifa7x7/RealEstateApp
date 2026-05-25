'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PROJECTS } from '@/data/projects';
import {
  COMPARE_LIMIT_FREE,
  COMPARE_LIMIT_PRO,
  usePaywall,
} from '@/hooks/usePaywall';
import type { Project } from '@/lib/types';
import { useAppStore } from '@/store/app-store';

export type CompareToggleResult =
  | { ok: true }
  | { ok: false; reason: 'limit-reached'; limit: number };

export interface UseCompareResult {
  /** Ids currently in the comparison. */
  ids: number[];
  /** Resolved projects in the same order as `ids`. */
  projects: Project[];
  /** Effective cap for this user (2 free, 5 pro). */
  limit: number;
  isPro: boolean;
  /**
   * Add or remove a project. Returns `{ ok: true }` if the toggle landed,
   * `{ ok: false, reason: 'limit-reached' }` if the user tried to add past
   * their cap — caller should open the `UpgradePrompt` in that case.
   */
  toggle: (id: number) => CompareToggleResult;
  isInCompare: (id: number) => boolean;
  clear: () => void;
  remove: (id: number) => void;
}

/**
 * Tier-aware wrapper around the Zustand `compareIds` slice. The store-level
 * `toggleCompare` only enforces the hard 5-cap; this hook layers the soft
 * free-tier limit (2) and surfaces a paywall-friendly failure mode.
 *
 * The store stays the source of truth — `useCompare` is a policy layer, not
 * a parallel state.
 */
export function useCompare(): UseCompareResult {
  const ids = useAppStore((s) => s.compareIds);
  const toggleInStore = useAppStore((s) => s.toggleCompare);
  const clearInStore = useAppStore((s) => s.clearCompare);
  const { isPro } = usePaywall('compare-multi');

  const limit = isPro ? COMPARE_LIMIT_PRO : COMPARE_LIMIT_FREE;

  // Resolve via React Query's projects cache (populated by useProjects)
  // so we get DB-sourced data when Supabase is live. Seed fallback for the
  // initial-paint window before the cache is hot.
  const { data: allProjects = PROJECTS } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => PROJECTS as Project[],
    initialData: PROJECTS as Project[],
    enabled: false,
  });

  const projects = useMemo(
    () =>
      ids
        .map((id) => allProjects.find((p) => p.id === id))
        .filter((p): p is Project => Boolean(p)),
    [ids, allProjects],
  );

  const toggle = (id: number): CompareToggleResult => {
    const present = ids.includes(id);
    if (!present && ids.length >= limit) {
      return { ok: false, reason: 'limit-reached', limit };
    }
    toggleInStore(id);
    return { ok: true };
  };

  return {
    ids,
    projects,
    limit,
    isPro,
    toggle,
    isInCompare: (id) => ids.includes(id),
    clear: clearInStore,
    remove: (id) => {
      if (ids.includes(id)) toggleInStore(id);
    },
  };
}
