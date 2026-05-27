'use client';

import type { UserTier } from '@/lib/types';
import { useAppStore } from '@/store/app-store';

export type ProFeature =
  | 'multi-object'
  | 'comparison'
  | 'rankings'
  | 'forecast'
  | 'portfolio'
  | 'unlimited-favorites'
  | 'exports'
  | 'compare-multi'
  | 'realtime-alerts'
  | 'multi-list';

const PRO_FEATURES: ReadonlySet<string> = new Set<ProFeature>([
  'multi-object',
  'comparison',
  'rankings',
  'forecast',
  'portfolio',
  'unlimited-favorites',
  'exports',
  'compare-multi',
  'realtime-alerts',
  'multi-list',
]);

/** Soft caps surfaced by `useCompare`. Free tier sees the 'compare-multi' Pro feature when trying to exceed. */
export const COMPARE_LIMIT_FREE = 2;
export const COMPARE_LIMIT_PRO = 5;

/** Free-tier cap on favorites (project-level). Pro is unlimited. Per CLAUDE.md. */
export const FAVORITES_LIMIT_FREE = 25;

/**
 * Free-tier cap on price alerts. Free users see a weekly digest of any
 * triggered alerts; Pro users get real-time emails per change with no cap.
 * Per CLAUDE.md "Pro must include at least one non-investor benefit."
 */
export const ALERTS_LIMIT_FREE = 5;
export const ALERTS_DEFAULT_THRESHOLD_PCT = 5;

export interface PaywallResult {
  allowed: boolean;
  tier: UserTier;
  isPro: boolean;
}

export function usePaywall(feature: ProFeature): PaywallResult {
  const tier = useAppStore((s) => s.currentTier);
  const isPro = tier === 'pro';
  const allowed = isPro || !PRO_FEATURES.has(feature);
  return { allowed, tier, isPro };
}
