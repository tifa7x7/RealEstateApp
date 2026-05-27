'use client';

import { useCallback, useMemo } from 'react';
import { useToast } from '@/components/providers/ToastProvider';
import {
  addItem as apiAddItem,
  createList as apiCreateList,
  deleteList as apiDeleteList,
  followList as apiFollowList,
  removeItem as apiRemoveItem,
  setFollowerAlerts as apiSetFollowerAlerts,
  unfollowList as apiUnfollowList,
  updateList as apiUpdateList,
  type List,
  type ListVisibility,
} from '@/lib/api/lists';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { usePaywall } from '@/hooks/usePaywall';
import { useTranslations } from '@/hooks/useTranslations';
import { useAppStore } from '@/store/app-store';

export type CreateListResult =
  | { ok: true; list: List }
  | { ok: false; reason: 'multi-list-pro-only' }
  | { ok: false; reason: 'not-authenticated' }
  | { ok: false; reason: 'save-failed' };

export interface UseListsResult {
  /** Every list the current user owns + follows + collaborates on. */
  lists: List[];
  /** Lists this user owns (excludes followed + collaborator-only). */
  ownedLists: List[];
  /** Lists this user follows. */
  followedLists: List[];
  /** The user's default `Избранное` list (always owned). */
  defaultList: List | null;
  /** Create a new named list. Free tier: returns `multi-list-pro-only`. */
  createList: (input: { name: string; visibility?: ListVisibility }) => Promise<CreateListResult>;
  renameList: (listId: string, name: string) => Promise<void>;
  setListVisibility: (listId: string, visibility: ListVisibility) => Promise<void>;
  /** Delete a non-default list. Default lists are protected server-side. */
  deleteList: (listId: string) => Promise<void>;
  /** Add a project or unit to a specific list. */
  addToList: (
    listId: string,
    input: { projectId: number; unitId?: string | null; note?: string | null },
  ) => Promise<void>;
  /** Remove a project or unit from a specific list. */
  removeFromList: (
    listId: string,
    projectId: number,
    unitId?: string | null,
  ) => Promise<void>;
  /** Start following a public list. */
  followList: (listId: string, alertsEnabled?: boolean) => Promise<void>;
  unfollowList: (listId: string) => Promise<void>;
  setFollowerAlerts: (listId: string, alertsEnabled: boolean) => Promise<void>;
  isPro: boolean;
}

function logSyncError(label: string, err: unknown): void {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(`[useLists.${label}] failed:`, err);
  }
}

/**
 * Phase 17 — full multi-list API. CRUD on the user's named lists, item
 * management on any list they can write to (owner + editor), and follow
 * relationships on public lists.
 *
 * Tier policy (CLAUDE.md → Freemium boundaries):
 *   - Free: exactly 1 list (the default `Избранное`), 25 items, no sharing.
 *   - Pro:  unlimited lists, unlimited items, public/unlisted visibility,
 *           follow other public lists, comment + collaborate.
 *
 * `useFavorites` continues to wrap default-list operations for the "I just
 * want to star things" use case.
 */
export function useLists(): UseListsResult {
  const lists = useAppStore((s) => s.userLists);
  const upsertList = useAppStore((s) => s.upsertUserList);
  const removeListStore = useAppStore((s) => s.removeUserList);
  const { supabaseEnabled, user } = useAuth();
  const { isPro } = usePaywall('multi-list');
  const toast = useToast();
  const t = useTranslations();

  const requireClient = useCallback(() => {
    if (!supabaseEnabled || !user) return null;
    return getSupabaseBrowserClient();
  }, [supabaseEnabled, user]);

  const ownedLists = useMemo(
    () => lists.filter((l) => l.relationship === 'owner'),
    [lists],
  );

  const followedLists = useMemo(
    () => lists.filter((l) => l.relationship === 'follower'),
    [lists],
  );

  const defaultList = useMemo(
    () => ownedLists.find((l) => l.isDefault) ?? null,
    [ownedLists],
  );

  const createList = useCallback<UseListsResult['createList']>(
    async (input) => {
      const client = requireClient();
      if (!client || !user) {
        toast.info(t.alerts.signInRequired);
        return { ok: false, reason: 'not-authenticated' };
      }
      // Free tier: hard cap at the default list — refuse second-list creation.
      if (!isPro && ownedLists.length >= 1) {
        return { ok: false, reason: 'multi-list-pro-only' };
      }
      try {
        const row = await apiCreateList(client, user.id, input);
        upsertList({ ...row, relationship: 'owner' });
        return { ok: true, list: row };
      } catch (err) {
        logSyncError('createList', err);
        return { ok: false, reason: 'save-failed' };
      }
    },
    [isPro, ownedLists.length, requireClient, t, toast, upsertList, user],
  );

  const renameList = useCallback<UseListsResult['renameList']>(
    async (listId, name) => {
      const existing = lists.find((l) => l.id === listId);
      if (!existing) return;
      upsertList({ ...existing, name });
      const client = requireClient();
      if (!client) return;
      try {
        await apiUpdateList(client, listId, { name });
      } catch (err) {
        logSyncError('renameList', err);
      }
    },
    [lists, requireClient, upsertList],
  );

  const setListVisibility = useCallback<UseListsResult['setListVisibility']>(
    async (listId, visibility) => {
      const existing = lists.find((l) => l.id === listId);
      if (!existing) return;
      upsertList({ ...existing, visibility });
      const client = requireClient();
      if (!client) return;
      try {
        await apiUpdateList(client, listId, { visibility });
      } catch (err) {
        logSyncError('setListVisibility', err);
      }
    },
    [lists, requireClient, upsertList],
  );

  const deleteList = useCallback<UseListsResult['deleteList']>(
    async (listId) => {
      const client = requireClient();
      removeListStore(listId);
      if (!client) return;
      try {
        await apiDeleteList(client, listId);
      } catch (err) {
        logSyncError('deleteList', err);
      }
    },
    [removeListStore, requireClient],
  );

  const addToList = useCallback<UseListsResult['addToList']>(
    async (listId, input) => {
      const client = requireClient();
      if (!client) return;
      try {
        await apiAddItem(client, listId, input);
      } catch (err) {
        logSyncError('addToList', err);
      }
    },
    [requireClient],
  );

  const removeFromList = useCallback<UseListsResult['removeFromList']>(
    async (listId, projectId, unitId = null) => {
      const client = requireClient();
      if (!client) return;
      try {
        await apiRemoveItem(client, listId, projectId, unitId);
      } catch (err) {
        logSyncError('removeFromList', err);
      }
    },
    [requireClient],
  );

  const followList = useCallback<UseListsResult['followList']>(
    async (listId, alertsEnabled = false) => {
      const client = requireClient();
      if (!client || !user) {
        toast.info(t.alerts.signInRequired);
        return;
      }
      try {
        await apiFollowList(client, user.id, listId, alertsEnabled);
      } catch (err) {
        logSyncError('followList', err);
      }
    },
    [requireClient, t, toast, user],
  );

  const unfollowList = useCallback<UseListsResult['unfollowList']>(
    async (listId) => {
      const client = requireClient();
      if (!client || !user) return;
      removeListStore(listId);
      try {
        await apiUnfollowList(client, user.id, listId);
      } catch (err) {
        logSyncError('unfollowList', err);
      }
    },
    [removeListStore, requireClient, user],
  );

  const setFollowerAlerts = useCallback<UseListsResult['setFollowerAlerts']>(
    async (listId, alertsEnabled) => {
      const client = requireClient();
      if (!client || !user) return;
      try {
        await apiSetFollowerAlerts(client, user.id, listId, alertsEnabled);
      } catch (err) {
        logSyncError('setFollowerAlerts', err);
      }
    },
    [requireClient, user],
  );

  return useMemo(
    () => ({
      lists,
      ownedLists,
      followedLists,
      defaultList,
      createList,
      renameList,
      setListVisibility,
      deleteList,
      addToList,
      removeFromList,
      followList,
      unfollowList,
      setFollowerAlerts,
      isPro,
    }),
    [
      lists,
      ownedLists,
      followedLists,
      defaultList,
      createList,
      renameList,
      setListVisibility,
      deleteList,
      addToList,
      removeFromList,
      followList,
      unfollowList,
      setFollowerAlerts,
      isPro,
    ],
  );
}
