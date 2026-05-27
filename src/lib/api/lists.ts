/**
 * Phase 17 — list CRUD + item management + follow.
 *
 * All functions assume the supplied client carries a valid auth session;
 * RLS enforces per-user scoping on writes and visibility-based reads.
 *
 * Surface organized around two consumers:
 *   - `useFavorites` (existing) only needs the **default list** ops:
 *     `fetchDefaultListItems`, `addItemToDefault`, `removeItemFromDefault`,
 *     `bulkImportToDefaultList`. The mental model stays "one bucket of
 *     starred things" for backwards-compat.
 *   - `useLists` (new in Phase 17) needs the **full multi-list** ops:
 *     list create/update/delete, follow/unfollow, per-list item management.
 *
 * Collaborator and comment CRUD is deferred to Session 2 — UI doesn't
 * surface them yet.
 */
import type { AppSupabaseClient } from '@/lib/supabase/client';

export type ListVisibility = 'private' | 'unlisted' | 'public';

export interface List {
  id: string;
  ownerUserId: string;
  name: string;
  visibility: ListVisibility;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  /**
   * Relationship of the *current viewer* to this list. Populated by
   * `fetchListsForUser`; absent on row-level fetches.
   */
  relationship?: 'owner' | 'follower' | 'collaborator';
  /** Role on the list if `relationship === 'collaborator'`. */
  role?: 'editor' | 'viewer';
}

export interface ListItem {
  listId: string;
  projectId: number;
  /** null = whole project; non-null = a specific unit */
  unitId: string | null;
  position: number;
  note: string | null;
  addedAt: string;
}

type ListRow = {
  id: string;
  owner_user_id: string;
  name: string;
  visibility: ListVisibility;
  is_default: boolean;
  created_at: string;
  updated_at: string;
};

type ItemRow = {
  list_id: string;
  project_id: number;
  unit_id: string | null;
  position: number;
  note: string | null;
  added_at: string;
};

function toList(row: ListRow): List {
  return {
    id: row.id,
    ownerUserId: row.owner_user_id,
    name: row.name,
    visibility: row.visibility,
    isDefault: row.is_default,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toItem(row: ItemRow): ListItem {
  return {
    listId: row.list_id,
    projectId: row.project_id,
    unitId: row.unit_id,
    position: row.position,
    note: row.note,
    addedAt: row.added_at,
  };
}

// ---------------------------------------------------------------------------
// List CRUD
// ---------------------------------------------------------------------------

/**
 * Fetch every list the user is involved with — owned, collaborating on, or
 * following. Returns them tagged with their relationship so the UI can sort
 * "My lists" vs "Following" vs "Collaborating on."
 */
export async function fetchListsForUser(
  client: AppSupabaseClient,
  userId: string,
): Promise<List[]> {
  // RLS already filters to readable lists. We tag relationships client-side
  // by union-ing owned + collaborator + follower IDs.
  const [ownedRes, collabRes, followRes] = await Promise.all([
    client
      .from('lists')
      .select('id, owner_user_id, name, visibility, is_default, created_at, updated_at')
      .eq('owner_user_id', userId),
    client.from('list_collaborators').select('list_id, role').eq('user_id', userId),
    client
      .from('list_followers')
      .select('list_id')
      .eq('follower_user_id', userId),
  ]);
  if (ownedRes.error) throw ownedRes.error;
  if (collabRes.error) throw collabRes.error;
  if (followRes.error) throw followRes.error;

  const owned = (ownedRes.data ?? []).map(toList).map((l) => ({
    ...l,
    relationship: 'owner' as const,
  }));

  const collabIds = (collabRes.data ?? []).map((c) => c.list_id);
  const followIds = (followRes.data ?? []).map((f) => f.list_id);
  const otherIds = [...new Set([...collabIds, ...followIds])].filter(
    (id) => !owned.some((l) => l.id === id),
  );

  let others: List[] = [];
  if (otherIds.length > 0) {
    const { data, error } = await client
      .from('lists')
      .select('id, owner_user_id, name, visibility, is_default, created_at, updated_at')
      .in('id', otherIds);
    if (error) throw error;
    const collabRoleByListId = new Map(
      (collabRes.data ?? []).map((c) => [c.list_id, c.role]),
    );
    others = (data ?? []).map((row) => {
      const base = toList(row);
      if (collabIds.includes(row.id)) {
        return {
          ...base,
          relationship: 'collaborator' as const,
          role: collabRoleByListId.get(row.id) as 'editor' | 'viewer',
        };
      }
      return { ...base, relationship: 'follower' as const };
    });
  }

  return [...owned, ...others];
}

export async function fetchList(
  client: AppSupabaseClient,
  listId: string,
): Promise<List | null> {
  const { data, error } = await client
    .from('lists')
    .select('id, owner_user_id, name, visibility, is_default, created_at, updated_at')
    .eq('id', listId)
    .maybeSingle();
  if (error) throw error;
  return data ? toList(data as ListRow) : null;
}

export async function createList(
  client: AppSupabaseClient,
  userId: string,
  input: { name: string; visibility?: ListVisibility },
): Promise<List> {
  const { data, error } = await client
    .from('lists')
    .insert({
      owner_user_id: userId,
      name: input.name,
      visibility: input.visibility ?? 'private',
      is_default: false,
    })
    .select('id, owner_user_id, name, visibility, is_default, created_at, updated_at')
    .single();
  if (error) throw error;
  return toList(data as ListRow);
}

export async function updateList(
  client: AppSupabaseClient,
  listId: string,
  patch: { name?: string; visibility?: ListVisibility },
): Promise<void> {
  const row: { name?: string; visibility?: ListVisibility } = {};
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.visibility !== undefined) row.visibility = patch.visibility;
  if (Object.keys(row).length === 0) return;
  const { error } = await client.from('lists').update(row).eq('id', listId);
  if (error) throw error;
}

/**
 * Delete a list. RLS blocks deletion of the user's default list — server
 * returns 0 rows affected silently in that case.
 */
export async function deleteList(
  client: AppSupabaseClient,
  listId: string,
): Promise<void> {
  const { error } = await client.from('lists').delete().eq('id', listId);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Default-list shortcuts (used by useFavorites for backwards-compat)
// ---------------------------------------------------------------------------

/**
 * Resolve the user's default `Избранное` list. The signup trigger guarantees
 * one exists; this returns null only if Supabase isn't configured or the
 * trigger hasn't fired yet (race on first auth state change).
 */
export async function fetchDefaultListId(
  client: AppSupabaseClient,
  userId: string,
): Promise<string | null> {
  const { data, error } = await client
    .from('lists')
    .select('id')
    .eq('owner_user_id', userId)
    .eq('is_default', true)
    .maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}

export async function fetchListItems(
  client: AppSupabaseClient,
  listId: string,
): Promise<ListItem[]> {
  const { data, error } = await client
    .from('list_items')
    .select('list_id, project_id, unit_id, position, note, added_at')
    .eq('list_id', listId)
    .order('added_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(toItem);
}

export async function addItem(
  client: AppSupabaseClient,
  listId: string,
  input: { projectId: number; unitId?: string | null; note?: string | null },
): Promise<void> {
  const { error } = await client.from('list_items').upsert(
    {
      list_id: listId,
      project_id: input.projectId,
      unit_id: input.unitId ?? null,
      note: input.note ?? null,
    },
    {
      onConflict: input.unitId
        ? 'list_id,project_id,unit_id'
        : 'list_id,project_id',
      ignoreDuplicates: true,
    },
  );
  if (error) throw error;
}

export async function removeItem(
  client: AppSupabaseClient,
  listId: string,
  projectId: number,
  unitId: string | null = null,
): Promise<void> {
  let query = client
    .from('list_items')
    .delete()
    .eq('list_id', listId)
    .eq('project_id', projectId);
  // `.eq` with null doesn't work in PostgREST; use .is for the null case.
  query = unitId === null ? query.is('unit_id', null) : query.eq('unit_id', unitId);
  const { error } = await query;
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Follow / unfollow
// ---------------------------------------------------------------------------

export async function followList(
  client: AppSupabaseClient,
  userId: string,
  listId: string,
  alertsEnabled = false,
): Promise<void> {
  const { error } = await client.from('list_followers').upsert(
    { list_id: listId, follower_user_id: userId, alerts_enabled: alertsEnabled },
    { onConflict: 'list_id,follower_user_id' },
  );
  if (error) throw error;
}

export async function unfollowList(
  client: AppSupabaseClient,
  userId: string,
  listId: string,
): Promise<void> {
  const { error } = await client
    .from('list_followers')
    .delete()
    .eq('list_id', listId)
    .eq('follower_user_id', userId);
  if (error) throw error;
}

export async function setFollowerAlerts(
  client: AppSupabaseClient,
  userId: string,
  listId: string,
  alertsEnabled: boolean,
): Promise<void> {
  const { error } = await client
    .from('list_followers')
    .update({ alerts_enabled: alertsEnabled })
    .eq('list_id', listId)
    .eq('follower_user_id', userId);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Bulk migration (localStorage → Supabase)
// ---------------------------------------------------------------------------

/**
 * One-time import path used by `useSupabaseUserDataSync`. Takes the legacy
 * `{ projectIds, favUnitKeys }` shape (key = `${projectId}__${unitId}`) and
 * inserts them as items in the user's default list. Idempotent via
 * `ignoreDuplicates`. Caller is responsible for resolving the default-list
 * id first.
 */
export async function bulkImportToDefaultList(
  client: AppSupabaseClient,
  defaultListId: string,
  projectIds: number[],
  favUnitKeys: string[],
): Promise<void> {
  if (projectIds.length > 0) {
    const { error } = await client
      .from('list_items')
      .upsert(
        projectIds.map((pid) => ({
          list_id: defaultListId,
          project_id: pid,
          unit_id: null as string | null,
        })),
        { onConflict: 'list_id,project_id', ignoreDuplicates: true },
      );
    if (error) throw error;
  }

  if (favUnitKeys.length > 0) {
    const rows = favUnitKeys
      .map((key) => {
        const sep = key.indexOf('__');
        if (sep < 0) return null;
        return {
          list_id: defaultListId,
          project_id: Number(key.slice(0, sep)),
          unit_id: key.slice(sep + 2),
        };
      })
      .filter(
        (r): r is { list_id: string; project_id: number; unit_id: string } =>
          r !== null,
      );

    if (rows.length > 0) {
      const { error } = await client
        .from('list_items')
        .upsert(rows, {
          onConflict: 'list_id,project_id,unit_id',
          ignoreDuplicates: true,
        });
      if (error) throw error;
    }
  }
}
