/**
 * Phase 17 — price-alert CRUD, list-scoped.
 *
 * An alert is a `(user_id, list_id, threshold_pct)` row. When any item in
 * the list moves price by `>= threshold_pct`, the dispatch edge function
 * emails the user. There's at most one alert per (user, list) — toggling
 * the alert is equivalent to insert-or-delete on that pair.
 *
 * The unsubscribe path uses the service-role key from a server route
 * (not these functions).
 */
import type { AppSupabaseClient } from '@/lib/supabase/client';

export interface PriceAlert {
  id: string;
  /** The list this alert watches. Triggers on any item in that list. */
  listId: string;
  /** Trigger when |delta_pct| >= thresholdPct. */
  thresholdPct: number;
  active: boolean;
  lastNotifiedAt: string | null;
  unsubscribeToken: string;
  createdAt: string;
}

export interface CreateAlertInput {
  listId: string;
  thresholdPct?: number;
}

type AlertRow = {
  id: string;
  list_id: string;
  threshold_pct: number;
  active: boolean;
  last_notified_at: string | null;
  unsubscribe_token: string;
  created_at: string;
};

function toAlert(row: AlertRow): PriceAlert {
  return {
    id: row.id,
    listId: row.list_id,
    thresholdPct: Number(row.threshold_pct),
    active: row.active,
    lastNotifiedAt: row.last_notified_at,
    unsubscribeToken: row.unsubscribe_token,
    createdAt: row.created_at,
  };
}

export async function fetchAlerts(client: AppSupabaseClient): Promise<PriceAlert[]> {
  const { data, error } = await client
    .from('price_alerts')
    .select(
      'id, list_id, threshold_pct, active, last_notified_at, unsubscribe_token, created_at',
    )
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(toAlert);
}

export async function createAlert(
  client: AppSupabaseClient,
  userId: string,
  input: CreateAlertInput,
): Promise<PriceAlert> {
  const { data, error } = await client
    .from('price_alerts')
    .upsert(
      {
        user_id: userId,
        list_id: input.listId,
        threshold_pct: input.thresholdPct ?? 5,
        active: true,
      },
      { onConflict: 'user_id,list_id' },
    )
    .select(
      'id, list_id, threshold_pct, active, last_notified_at, unsubscribe_token, created_at',
    )
    .single();
  if (error) throw error;
  return toAlert(data as AlertRow);
}

export async function updateAlert(
  client: AppSupabaseClient,
  alertId: string,
  patch: { thresholdPct?: number; active?: boolean },
): Promise<void> {
  const row: { threshold_pct?: number; active?: boolean } = {};
  if (patch.thresholdPct !== undefined) row.threshold_pct = patch.thresholdPct;
  if (patch.active !== undefined) row.active = patch.active;
  if (Object.keys(row).length === 0) return;
  const { error } = await client.from('price_alerts').update(row).eq('id', alertId);
  if (error) throw error;
}

export async function deleteAlert(
  client: AppSupabaseClient,
  alertId: string,
): Promise<void> {
  const { error } = await client.from('price_alerts').delete().eq('id', alertId);
  if (error) throw error;
}

/**
 * Bulk-create alerts on a set of list ids. Used by the onboarding nudge
 * (now: "enable alerts on every list you own"). Idempotent via the unique
 * (user_id, list_id) constraint.
 */
export async function bulkCreateAlerts(
  client: AppSupabaseClient,
  userId: string,
  listIds: string[],
  thresholdPct = 5,
): Promise<void> {
  if (listIds.length === 0) return;
  const { error } = await client.from('price_alerts').upsert(
    listIds.map((listId) => ({
      user_id: userId,
      list_id: listId,
      threshold_pct: thresholdPct,
      active: true,
    })),
    { onConflict: 'user_id,list_id', ignoreDuplicates: true },
  );
  if (error) throw error;
}
