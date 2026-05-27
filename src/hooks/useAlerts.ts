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
  /** True when this list already has an active alert. */
  hasAlert: (listId: string) => boolean;
  /** Add an alert (idempotent). Returns the typed failure modes. */
  add: (input: CreateAlertInput) => Promise<AlertToggleResult>;
  /** Toggle an alert on a list. Removes when one exists, adds otherwise. */
  toggle: (input: CreateAlertInput) => Promise<AlertToggleResult>;
  remove: (alertId: string) => Promise<void>;
  setThreshold: (alertId: string, thresholdPct: number) => Promise<void>;
  setActive: (alertId: string, active: boolean) => Promise<void>;
  /** Bulk-enable alerts on a set of list ids. */
  bulkAdd: (listIds: string[], thresholdPct?: number) => Promise<AlertToggleResult>;
  /** Active free-tier limit (Pro returns Infinity). */
  limit: number;
  isPro: boolean;
}

function findAlertByList(alerts: PriceAlert[], listId: string): PriceAlert | undefined {
  return alerts.find((a) => a.listId === listId);
}

/**
 * Phase 17 — list-scoped wrapper around the `price_alerts` table. One alert
 * per (user, list); triggering happens when any item in the list moves price
 * by ≥ threshold. Optimistic store updates + toast feedback live here.
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
    (listId: string) => !!findAlertByList(alerts, listId)?.active,
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
      const existing = findAlertByList(alerts, input.listId);
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
      const existing = findAlertByList(alerts, input.listId);
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
    async (listIds, thresholdPct = 5) => {
      if (listIds.length === 0) return { ok: true, alert: null };
      const client = requireClient();
      if (!client || !user) {
        toast.info(t.alerts.signInRequired);
        return { ok: false, reason: 'not-authenticated' };
      }
      const newListIds = listIds.filter((id) => !findAlertByList(alerts, id));
      const activeCount = alerts.filter((a) => a.active).length;
      const room = Math.max(0, limit - activeCount);
      const slice = Number.isFinite(room) ? newListIds.slice(0, room) : newListIds;
      try {
        await bulkCreateAlerts(client, user.id, slice, thresholdPct);
        const optimistic: PriceAlert[] = slice.map((listId) => ({
          id: `optimistic-${listId}`,
          listId,
          thresholdPct,
          active: true,
          lastNotifiedAt: null,
          unsubscribeToken: '',
          createdAt: new Date().toISOString(),
        }));
        setPriceAlertsStore([...optimistic, ...alerts]);
        if (newListIds.length > slice.length) {
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
