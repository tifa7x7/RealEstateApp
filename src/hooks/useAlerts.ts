'use client';

import { useCallback, useMemo } from 'react';
import { useToast } from '@/components/providers/ToastProvider';
import {
  bulkCreateAlerts,
  createAlert,
  deleteAlert,
  updateAlert,
  type CreateAlertInput,
  type PriceAlert,
} from '@/lib/api/alerts';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ALERTS_LIMIT_FREE, usePaywall } from '@/hooks/usePaywall';
import { useTranslations } from '@/hooks/useTranslations';
import { useAppStore } from '@/store/app-store';

export type AlertToggleResult =
  | { ok: true; alert: PriceAlert | null }
  | { ok: false; reason: 'limit-reached'; limit: number }
  | { ok: false; reason: 'not-authenticated' };

export interface UseAlertsResult {
  alerts: PriceAlert[];
  /** True when this scope already has an active alert. */
  hasAlert: (projectId: number, unitId?: string | null) => boolean;
  /** Add an alert (idempotent). Returns the typed failure modes. */
  add: (input: CreateAlertInput) => Promise<AlertToggleResult>;
  /** Toggle an alert for a scope. Removes when one exists, adds otherwise. */
  toggle: (input: CreateAlertInput) => Promise<AlertToggleResult>;
  remove: (alertId: string) => Promise<void>;
  setThreshold: (alertId: string, thresholdPct: number) => Promise<void>;
  setActive: (alertId: string, active: boolean) => Promise<void>;
  bulkAdd: (targets: CreateAlertInput[]) => Promise<AlertToggleResult>;
  /** Active free-tier limit (Pro returns Infinity). */
  limit: number;
  isPro: boolean;
}

function findAlert(
  alerts: PriceAlert[],
  projectId: number,
  unitId: string | null | undefined,
): PriceAlert | undefined {
  const u = unitId ?? null;
  return alerts.find((a) => a.projectId === projectId && a.unitId === u);
}

/**
 * Wraps the `price_alerts` table with tier-aware limits, optimistic store
 * updates, and toast feedback. The Zustand store mirrors the server state
 * for fast UI reads; this hook is the only writer.
 *
 * No localStorage write-through — alerts are server-only. When Supabase is
 * unconfigured the hook short-circuits with `not-authenticated`.
 */
export function useAlerts(): UseAlertsResult {
  const alerts = useAppStore((s) => s.priceAlerts);
  const upsertPriceAlertStore = useAppStore((s) => s.upsertPriceAlert);
  const removePriceAlertStore = useAppStore((s) => s.removePriceAlert);
  const setPriceAlertsStore = useAppStore((s) => s.setPriceAlerts);
  const { supabaseEnabled, user } = useAuth();
  const { isPro } = usePaywall('realtime-alerts');
  const toast = useToast();
  const t = useTranslations();

  const limit = isPro ? Number.POSITIVE_INFINITY : ALERTS_LIMIT_FREE;

  const hasAlert = useCallback(
    (projectId: number, unitId?: string | null) =>
      !!findAlert(alerts, projectId, unitId)?.active,
    [alerts],
  );

  const requireClient = useCallback(() => {
    if (!supabaseEnabled || !user) return null;
    return getSupabaseBrowserClient();
  }, [supabaseEnabled, user]);

  const add = useCallback<UseAlertsResult['add']>(
    async (input) => {
      const client = requireClient();
      if (!client || !user) {
        toast.info(t.alerts.signInRequired);
        return { ok: false, reason: 'not-authenticated' };
      }
      const existing = findAlert(alerts, input.projectId, input.unitId);
      const activeCount = alerts.filter((a) => a.active).length;
      if (!existing && activeCount >= limit) {
        toast.info(t.alerts.limitReachedFree);
        return { ok: false, reason: 'limit-reached', limit: ALERTS_LIMIT_FREE };
      }
      try {
        const row = await createAlert(client, user.id, input);
        upsertPriceAlertStore(row);
        return { ok: true, alert: row };
      } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[useAlerts.add] failed:', err);
        }
        toast.error(t.alerts.saveFailed);
        return { ok: true, alert: null };
      }
    },
    [alerts, limit, requireClient, toast, t, upsertPriceAlertStore, user],
  );

  const remove = useCallback<UseAlertsResult['remove']>(
    async (alertId) => {
      const client = requireClient();
      // Optimistic remove regardless — keeps UI snappy on dev path.
      removePriceAlertStore(alertId);
      if (!client) return;
      try {
        await deleteAlert(client, alertId);
      } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[useAlerts.remove] failed:', err);
        }
      }
    },
    [removePriceAlertStore, requireClient],
  );

  const toggle = useCallback<UseAlertsResult['toggle']>(
    async (input) => {
      const existing = findAlert(alerts, input.projectId, input.unitId);
      if (existing) {
        await remove(existing.id);
        return { ok: true, alert: null };
      }
      return add(input);
    },
    [add, alerts, remove],
  );

  const setThreshold = useCallback<UseAlertsResult['setThreshold']>(
    async (alertId, thresholdPct) => {
      const existing = alerts.find((a) => a.id === alertId);
      if (!existing) return;
      upsertPriceAlertStore({ ...existing, thresholdPct });
      const client = requireClient();
      if (!client) return;
      try {
        await updateAlert(client, alertId, { thresholdPct });
      } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[useAlerts.setThreshold] failed:', err);
        }
      }
    },
    [alerts, requireClient, upsertPriceAlertStore],
  );

  const setActive = useCallback<UseAlertsResult['setActive']>(
    async (alertId, active) => {
      const existing = alerts.find((a) => a.id === alertId);
      if (!existing) return;
      upsertPriceAlertStore({ ...existing, active });
      const client = requireClient();
      if (!client) return;
      try {
        await updateAlert(client, alertId, { active });
      } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[useAlerts.setActive] failed:', err);
        }
      }
    },
    [alerts, requireClient, upsertPriceAlertStore],
  );

  const bulkAdd = useCallback<UseAlertsResult['bulkAdd']>(
    async (targets) => {
      if (targets.length === 0) return { ok: true, alert: null };
      const client = requireClient();
      if (!client || !user) {
        toast.info(t.alerts.signInRequired);
        return { ok: false, reason: 'not-authenticated' };
      }
      // Honor the free-tier cap on the slice we're adding.
      const newOnes = targets.filter(
        (t) => !findAlert(alerts, t.projectId, t.unitId),
      );
      const activeCount = alerts.filter((a) => a.active).length;
      const room = Math.max(0, limit - activeCount);
      const slice = Number.isFinite(room) ? newOnes.slice(0, room) : newOnes;
      try {
        await bulkCreateAlerts(client, user.id, slice);
        // Re-hydrate the store from the server (cheap, < 100 rows).
        // The fetcher lives in useSupabaseUserDataSync; here we just
        // optimistically merge — the next sync will reconcile any drift.
        const optimistic: PriceAlert[] = slice.map((t) => ({
          id: `optimistic-${t.projectId}-${t.unitId ?? 'all'}`,
          projectId: t.projectId,
          unitId: t.unitId ?? null,
          thresholdPct: t.thresholdPct ?? 5,
          active: true,
          lastNotifiedAt: null,
          unsubscribeToken: '',
          createdAt: new Date().toISOString(),
        }));
        setPriceAlertsStore([...optimistic, ...alerts]);
        if (newOnes.length > slice.length) {
          toast.info(t.alerts.limitReachedFree);
          return { ok: false, reason: 'limit-reached', limit: ALERTS_LIMIT_FREE };
        }
        return { ok: true, alert: null };
      } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[useAlerts.bulkAdd] failed:', err);
        }
        toast.error(t.alerts.saveFailed);
        return { ok: true, alert: null };
      }
    },
    [alerts, limit, requireClient, setPriceAlertsStore, toast, t, user],
  );

  return useMemo(
    () => ({
      alerts,
      hasAlert,
      add,
      toggle,
      remove,
      setThreshold,
      setActive,
      bulkAdd,
      limit,
      isPro,
    }),
    [alerts, hasAlert, add, toggle, remove, setThreshold, setActive, bulkAdd, limit, isPro],
  );
}
