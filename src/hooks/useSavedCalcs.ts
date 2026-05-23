'use client';

import { useAuth } from '@/hooks/useAuth';
import {
  createSavedCalc,
  deleteSavedCalc as deleteRemote,
} from '@/lib/api/saved-calcs';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { SavedCalc } from '@/lib/types';
import { useAppStore } from '@/store/app-store';

const FREE_LIMIT = 1;

export type SaveResult =
  | { ok: true; id: number | string }
  | { ok: false; reason: 'limit-reached' };

export interface UseSavedCalcsResult {
  saved: SavedCalc[];
  limit: number;
  canSave: boolean;
  save: () => Promise<SaveResult>;
  remove: (id: number | string) => void;
  load: (id: number | string) => void;
}

function logSyncError(err: unknown): void {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[useSavedCalcs] sync failed:', err);
  }
}

export function useSavedCalcs(): UseSavedCalcsResult {
  const saved = useAppStore((s) => s.savedCalcs);
  const tier = useAppStore((s) => s.currentTier);
  const calcObjects = useAppStore((s) => s.calcObjects);
  const saveCalcStore = useAppStore((s) => s.saveCalc);
  const deleteSavedCalcStore = useAppStore((s) => s.deleteSavedCalc);
  const loadSavedCalcStore = useAppStore((s) => s.loadSavedCalc);
  const { supabaseEnabled, user } = useAuth();

  const limit = tier === 'pro' ? Number.POSITIVE_INFINITY : FREE_LIMIT;
  const canSave = saved.length < limit;

  const save = async (): Promise<SaveResult> => {
    if (!canSave) return { ok: false, reason: 'limit-reached' };

    // Optimistic local entry. Replaced with the server-issued row below when
    // Supabase persists successfully.
    const localId = Date.now();
    const localEntry: SavedCalc = {
      id: localId,
      date: new Date().toISOString().slice(0, 10),
      objects: [...calcObjects],
    };
    saveCalcStore(localEntry);

    if (!supabaseEnabled || !user) return { ok: true, id: localId };
    const client = getSupabaseBrowserClient();
    if (!client) return { ok: true, id: localId };

    try {
      const remote = await createSavedCalc(client, user.id, [...calcObjects]);
      // Swap the optimistic row for the server row (uuid id).
      useAppStore.setState((s) => ({
        savedCalcs: s.savedCalcs.map((c) => (c.id === localId ? remote : c)),
      }));
      return { ok: true, id: remote.id };
    } catch (err) {
      logSyncError(err);
      return { ok: true, id: localId };
    }
  };

  const remove = (id: number | string) => {
    deleteSavedCalcStore(id);
    if (!supabaseEnabled || !user) return;
    const client = getSupabaseBrowserClient();
    if (!client) return;
    void deleteRemote(client, user.id, id).catch(logSyncError);
  };

  const load = (id: number | string) => {
    loadSavedCalcStore(id);
  };

  return {
    saved,
    limit,
    canSave,
    save,
    remove,
    load,
  };
}
