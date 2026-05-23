/**
 * User-scoped data access for favorites + unit favorites. All functions
 * assume the supplied client carries a valid auth session.
 */
import type { AppSupabaseClient } from '@/lib/supabase/client';

export interface FavoritesPayload {
  projectIds: number[];
  favUnitKeys: string[]; // `${projectId}__${unitId}` to match the store shape
}

export async function fetchFavorites(
  client: AppSupabaseClient,
): Promise<FavoritesPayload> {
  const [favRes, favUnitRes] = await Promise.all([
    client.from('favorites').select('project_id'),
    client.from('fav_units').select('project_id, unit_id'),
  ]);

  if (favRes.error) throw favRes.error;
  if (favUnitRes.error) throw favUnitRes.error;

  return {
    projectIds: favRes.data.map((r) => r.project_id),
    favUnitKeys: favUnitRes.data.map((r) => `${r.project_id}__${r.unit_id}`),
  };
}

export async function addFavorite(
  client: AppSupabaseClient,
  userId: string,
  projectId: number,
): Promise<void> {
  const { error } = await client
    .from('favorites')
    .upsert({ user_id: userId, project_id: projectId }, { onConflict: 'user_id,project_id' });
  if (error) throw error;
}

export async function removeFavorite(
  client: AppSupabaseClient,
  userId: string,
  projectId: number,
): Promise<void> {
  const { error } = await client
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('project_id', projectId);
  if (error) throw error;
}

export async function addFavUnit(
  client: AppSupabaseClient,
  userId: string,
  projectId: number,
  unitId: string,
): Promise<void> {
  const { error } = await client.from('fav_units').upsert(
    { user_id: userId, project_id: projectId, unit_id: unitId },
    { onConflict: 'user_id,project_id,unit_id' },
  );
  if (error) throw error;
}

export async function removeFavUnit(
  client: AppSupabaseClient,
  userId: string,
  projectId: number,
  unitId: string,
): Promise<void> {
  const { error } = await client
    .from('fav_units')
    .delete()
    .eq('user_id', userId)
    .eq('project_id', projectId)
    .eq('unit_id', unitId);
  if (error) throw error;
}

/**
 * Bulk insert (used by the localStorage → Supabase migration). Inserts are
 * idempotent thanks to `ON CONFLICT DO NOTHING` upserts.
 */
export async function bulkImportFavorites(
  client: AppSupabaseClient,
  userId: string,
  projectIds: number[],
  favUnitKeys: string[],
): Promise<void> {
  if (projectIds.length > 0) {
    const { error } = await client
      .from('favorites')
      .upsert(
        projectIds.map((pid) => ({ user_id: userId, project_id: pid })),
        { onConflict: 'user_id,project_id', ignoreDuplicates: true },
      );
    if (error) throw error;
  }

  if (favUnitKeys.length > 0) {
    const rows = favUnitKeys
      .map((key) => {
        const sep = key.indexOf('__');
        if (sep < 0) return null;
        return {
          user_id: userId,
          project_id: Number(key.slice(0, sep)),
          unit_id: key.slice(sep + 2),
        };
      })
      .filter((r): r is { user_id: string; project_id: number; unit_id: string } => r !== null);

    if (rows.length > 0) {
      const { error } = await client
        .from('fav_units')
        .upsert(rows, {
          onConflict: 'user_id,project_id,unit_id',
          ignoreDuplicates: true,
        });
      if (error) throw error;
    }
  }
}
