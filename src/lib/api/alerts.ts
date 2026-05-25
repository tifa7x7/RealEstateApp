/**
 * Phase 16 — price-alert CRUD. All functions assume the supplied client
 * carries a valid auth session; RLS on `price_alerts` enforces per-user
 * scoping. The unsubscribe path uses the service-role key from a server
 * route (not these functions).
 */
import type { AppSupabaseClient } from '@/lib/supabase/client';

export interface PriceAlert {
  id: string;
  projectId: number;
  /** null = whole project (any unit price drop triggers). */
  unitId: string | null;
  /** Trigger when |delta_pct| >= thresholdPct. */
  thresholdPct: number;
  active: boolean;
  lastNotifiedAt: string | null;
  unsubscribeToken: string;
  createdAt: string;
}

export interface CreateAlertInput {
  projectId: number;
  unitId?: string | null;
  thresholdPct?: number;
}

type AlertRow = {
  id: string;
  project_id: number;
  unit_id: string | null;
  threshold_pct: number;
  active: boolean;
  last_notified_at: string | null;
  unsubscribe_token: string;
  created_at: string;
};

function toAlert(row: AlertRow): PriceAlert {
  return {
    id: row.id,
    projectId: row.project_id,
    unitId: row.unit_id,
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
      'id, project_id, unit_id, threshold_pct, active, last_notified_at, unsubscribe_token, created_at',
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
        project_id: input.projectId,
        unit_id: input.unitId ?? null,
        threshold_pct: input.thresholdPct ?? 5,
        active: true,
      },
      {
        // Partial-unique on (user_id, project_id, unit_id) — but the
        // unit_id IS NULL branch needs onConflict naming the columns.
        // Supabase translates this to ON CONFLICT (...) DO UPDATE.
        onConflict: input.unitId ? 'user_id,project_id,unit_id' : 'user_id,project_id',
      },
    )
    .select(
      'id, project_id, unit_id, threshold_pct, active, last_notified_at, unsubscribe_token, created_at',
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
 * Bulk-create alerts for a list of (projectId, unitId?) targets. Used by the
 * onboarding nudge to enable alerts on every favorite in one tap. Idempotent
 * thanks to the unique partial indexes.
 */
export async function bulkCreateAlerts(
  client: AppSupabaseClient,
  userId: string,
  targets: CreateAlertInput[],
): Promise<void> {
  if (targets.length === 0) return;
  // Two passes because the partial unique indexes use different conflict
  // targets (one for unit-scoped, one for project-scoped).
  const unitScoped = targets.filter((t) => t.unitId);
  const projectScoped = targets.filter((t) => !t.unitId);

  if (unitScoped.length > 0) {
    const { error } = await client.from('price_alerts').upsert(
      unitScoped.map((t) => ({
        user_id: userId,
        project_id: t.projectId,
        unit_id: t.unitId!,
        threshold_pct: t.thresholdPct ?? 5,
        active: true,
      })),
      { onConflict: 'user_id,project_id,unit_id', ignoreDuplicates: true },
    );
    if (error) throw error;
  }

  if (projectScoped.length > 0) {
    const { error } = await client.from('price_alerts').upsert(
      projectScoped.map((t) => ({
        user_id: userId,
        project_id: t.projectId,
        unit_id: null,
        threshold_pct: t.thresholdPct ?? 5,
        active: true,
      })),
      { onConflict: 'user_id,project_id', ignoreDuplicates: true },
    );
    if (error) throw error;
  }
}
