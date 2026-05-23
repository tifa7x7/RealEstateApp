'use client';

import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  createProperty,
  deleteProperty,
  updateProperty,
} from '@/lib/api/portfolio';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { RentalProperty } from '@/lib/types';
import { useAppStore } from '@/store/app-store';

export interface PortfolioTotals {
  count: number;
  totalValue: number;
  totalPurchase: number;
  monthlyRent: number;
  monthlyExpenses: number;
  monthlyNOI: number;
  appreciation: number;
}

export interface UsePortfolioResult {
  properties: RentalProperty[];
  totals: PortfolioTotals;
  add: () => RentalProperty;
  update: (id: number | string, patch: Partial<RentalProperty>) => void;
  remove: (id: number | string) => void;
}

function emptyProperty(): RentalProperty {
  return {
    id: Date.now(),
    name: '',
    type: '1К',
    currentValue: 0,
    purchasePrice: 0,
    monthlyRent: 0,
    monthlyExpenses: 0,
  };
}

function logSyncError(err: unknown): void {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[usePortfolio] sync failed:', err);
  }
}

export function usePortfolio(): UsePortfolioResult {
  const properties = useAppStore((s) => s.rentalProperties);
  const addStore = useAppStore((s) => s.addRentalProperty);
  const updateStore = useAppStore((s) => s.updateRentalProperty);
  const removeStore = useAppStore((s) => s.removeRentalProperty);
  const { supabaseEnabled, user } = useAuth();

  const totals = useMemo<PortfolioTotals>(() => {
    let totalValue = 0;
    let totalPurchase = 0;
    let monthlyRent = 0;
    let monthlyExpenses = 0;
    for (const p of properties) {
      totalValue += p.currentValue ?? 0;
      totalPurchase += p.purchasePrice ?? 0;
      monthlyRent += p.monthlyRent ?? 0;
      monthlyExpenses += p.monthlyExpenses ?? 0;
    }
    return {
      count: properties.length,
      totalValue,
      totalPurchase,
      monthlyRent,
      monthlyExpenses,
      monthlyNOI: monthlyRent - monthlyExpenses,
      appreciation: totalValue - totalPurchase,
    };
  }, [properties]);

  const add = (): RentalProperty => {
    const next = emptyProperty();
    addStore(next);

    if (supabaseEnabled && user) {
      const client = getSupabaseBrowserClient();
      if (client) {
        const localId = next.id;
        void createProperty(client, user.id, next)
          .then((remote) => {
            useAppStore.setState((s) => ({
              rentalProperties: s.rentalProperties.map((p) =>
                p.id === localId ? remote : p,
              ),
            }));
          })
          .catch(logSyncError);
      }
    }

    return next;
  };

  const update = (id: number | string, patch: Partial<RentalProperty>) => {
    updateStore(id, patch);
    if (!supabaseEnabled || !user) return;
    const client = getSupabaseBrowserClient();
    if (!client) return;
    // Only mirror to Supabase when the id looks like a server-issued uuid
    // (local ids are numbers from Date.now()). The create() flow above swaps
    // local→server id, so by the time edits happen the row is persisted.
    if (typeof id !== 'string') return;
    void updateProperty(client, user.id, id, patch).catch(logSyncError);
  };

  const remove = (id: number | string) => {
    removeStore(id);
    if (!supabaseEnabled || !user) return;
    const client = getSupabaseBrowserClient();
    if (!client) return;
    if (typeof id !== 'string') return;
    void deleteProperty(client, user.id, id).catch(logSyncError);
  };

  return {
    properties,
    totals,
    add,
    update,
    remove,
  };
}
