/**
 * User-scoped data access for saved calculator runs.
 */
import type { AppSupabaseClient } from '@/lib/supabase/client';
import type { CalcObject, SavedCalc } from '@/lib/types';

interface SavedCalcRow {
  id: string;
  user_id: string;
  label: string | null;
  objects: CalcObject[];
  created_at: string;
  updated_at: string;
}

function rowToSavedCalc(row: SavedCalcRow): SavedCalc {
  return {
    id: row.id as unknown as number, // stored as uuid in DB, kept as opaque ID in app
    date: row.created_at.slice(0, 10),
    objects: row.objects,
  };
}

export async function fetchSavedCalcs(
  client: AppSupabaseClient,
): Promise<SavedCalc[]> {
  const { data, error } = await client
    .from('saved_calculations')
    .select('id, user_id, label, objects, created_at, updated_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as SavedCalcRow[]).map(rowToSavedCalc);
}

export async function createSavedCalc(
  client: AppSupabaseClient,
  userId: string,
  objects: CalcObject[],
  label?: string,
): Promise<SavedCalc> {
  const { data, error } = await client
    .from('saved_calculations')
    .insert({ user_id: userId, objects, label: label ?? null })
    .select('id, user_id, label, objects, created_at, updated_at')
    .single();
  if (error) throw error;
  return rowToSavedCalc(data as SavedCalcRow);
}

export async function deleteSavedCalc(
  client: AppSupabaseClient,
  userId: string,
  id: string | number,
): Promise<void> {
  const { error } = await client
    .from('saved_calculations')
    .delete()
    .eq('user_id', userId)
    .eq('id', String(id));
  if (error) throw error;
}

export async function bulkImportSavedCalcs(
  client: AppSupabaseClient,
  userId: string,
  entries: SavedCalc[],
): Promise<void> {
  if (entries.length === 0) return;
  const { error } = await client.from('saved_calculations').insert(
    entries.map((e) => ({
      user_id: userId,
      label: null,
      objects: e.objects,
    })),
  );
  if (error) throw error;
}
